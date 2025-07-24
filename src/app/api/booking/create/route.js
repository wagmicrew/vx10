import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/edge-logger';
import { getServerSession } from 'next-auth';
import { parseISO } from 'date-fns';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const {
      lessonId,
      date,
      startTime,
      endTime,
      gearType,
      paymentMethod,
      totalPrice
    } = await request.json();

    // Validate required fields
    if (!lessonId || !date || !startTime || !endTime || !gearType || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      );
    }

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Check if slot is still available
    const selectedDate = parseISO(date);
    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: selectedDate,
        startTime: startTime,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      );
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        lessonId,
        userId: session.user.id,
        date: selectedDate,
        startTime,
        endTime,
        gearType,
        status: 'PENDING',
        totalPrice: lesson.price,
        paymentMethod,
        paymentStatus: 'PENDING'
      },
      include: {
        lesson: true,
        user: true
      }
    });

    logger.info('Booking created successfully', { 
      bookingId: booking.id, 
      userId: session.user.id,
      lessonId,
      date,
      startTime 
    });

    // Generate payment URL based on method
    let paymentUrl = '';
    
    if (paymentMethod === 'QLIRO') {
      // Create Qliro order
      paymentUrl = await createQliroOrder(booking);
    } else if (paymentMethod === 'SWISH') {
      // For Swish, we'll redirect to our own payment page
      paymentUrl = `/payment/swish?bookingId=${booking.id}`;
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      paymentUrl,
      booking: {
        id: booking.id,
        lesson: booking.lesson.name,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        gearType: booking.gearType,
        totalPrice: booking.totalPrice,
        status: booking.status
      }
    });

  } catch (error) {
    logger.error('Failed to create booking', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function createQliroOrder(booking) {
  try {
    const qliroApiKey = process.env.QLIRO_API_KEY;
    
    if (!qliroApiKey) {
      throw new Error('Qliro API key not configured');
    }

    const orderData = {
      MerchantApiKey: qliroApiKey,
      MerchantReference: booking.id,
      Currency: "SEK",
      Country: "SE",
      Language: "sv-se",
      MerchantTermsUrl: `${process.env.NEXTAUTH_URL}/terms`,
      MerchantConfirmationUrl: `${process.env.NEXTAUTH_URL}/booking/confirmation?bookingId=${booking.id}`,
      OrderItems: [
        {
          MerchantReference: booking.lesson.id,
          Description: `${booking.lesson.name} - ${booking.gearType} transmission`,
          Type: "Product",
          Quantity: 1,
          PricePerItemIncVat: parseFloat(booking.totalPrice),
          PricePerItemExVat: parseFloat(booking.totalPrice) / 1.25, // Assuming 25% VAT
          VatRate: 0.25
        }
      ],
      CustomerInformation: {
        Email: booking.user.email,
        JuridicalType: "Physical"
      }
    };

    const response = await fetch('https://payment-api.qliro.com/checkout/merchantapi/Orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();
    
    if (response.ok && result.PaymentLink) {
      // Update booking with Qliro order ID
      await prisma.booking.update({
        where: { id: booking.id },
        data: { paymentId: result.OrderId.toString() }
      });
      
      return result.PaymentLink;
    } else {
      throw new Error('Failed to create Qliro order: ' + (result.ErrorMessage || 'Unknown error'));
    }
    
  } catch (error) {
    logger.error('Failed to create Qliro order', { 
      bookingId: booking.id, 
      error: error.message 
    });
    
    // Fallback to a manual payment confirmation page
    return `/payment/manual?bookingId=${booking.id}&method=qliro`;
  }
}
