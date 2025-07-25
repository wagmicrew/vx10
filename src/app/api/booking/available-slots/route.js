import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';
import { logger } from '@/utils/edge-logger';
import { format, parseISO, addMinutes, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

// Default working hours if not set in admin settings
const DEFAULT_START_TIME = "08:00";
const DEFAULT_END_TIME = "18:00";
const DEFAULT_BREAK_START = "12:00";
const DEFAULT_BREAK_END = "13:00";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const lessonId = searchParams.get('lessonId');

    if (!date || !lessonId) {
      return NextResponse.json(
        { error: 'Date and lessonId are required' },
        { status: 400 }
      );
    }

    // Get lesson details
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Get admin settings for working hours
    const settings = await prisma.settings.findMany();
    const settingsMap = {};
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value;
    });

    const workingStartTime = settingsMap['WORKING_START_TIME'] || DEFAULT_START_TIME;
    const workingEndTime = settingsMap['WORKING_END_TIME'] || DEFAULT_END_TIME;
    const breakStartTime = settingsMap['BREAK_START_TIME'] || DEFAULT_BREAK_START;
    const breakEndTime = settingsMap['BREAK_END_TIME'] || DEFAULT_BREAK_END;

    // Get existing bookings for the date
    const selectedDate = parseISO(date);
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);

    const existingBookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: dayStart,
          lte: dayEnd
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });

    // Get blocked slots for the date
    const blockedSlots = await prisma.blockedSlot.findMany({
      where: {
        date: {
          gte: dayStart,
          lte: dayEnd
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });

    // Generate available time slots
    const availableSlots = generateTimeSlots(
      workingStartTime,
      workingEndTime,
      breakStartTime,
      breakEndTime,
      lesson.duration,
      existingBookings,
      blockedSlots
    );

    logger.info('Available slots calculated', { 
      date, 
      lessonId, 
      slotsCount: availableSlots.length 
    });

    return NextResponse.json(availableSlots);
  } catch (error) {
    logger.error('Failed to calculate available slots', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to calculate available slots' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

function generateTimeSlots(
  workingStartTime,
  workingEndTime,
  breakStartTime,
  breakEndTime,
  lessonDuration,
  existingBookings,
  blockedSlots
) {
  const availableSlots = [];
  
  // Parse time strings to minutes for easier calculation
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const workStart = parseTime(workingStartTime);
  const workEnd = parseTime(workingEndTime);
  const breakStart = parseTime(breakStartTime);
  const breakEnd = parseTime(breakEndTime);

  // Generate all possible time slots
  let currentTime = workStart;
  
  while (currentTime + lessonDuration <= workEnd) {
    const slotStart = currentTime;
    const slotEnd = currentTime + lessonDuration;
    
    // Check if slot conflicts with break time
    const conflictWithBreak = (slotStart < breakEnd && slotEnd > breakStart);
    
    if (!conflictWithBreak) {
      const slotStartTime = formatTime(slotStart);
      const slotEndTime = formatTime(slotEnd);
      
      // Check if slot conflicts with existing bookings
      const conflictWithBooking = existingBookings.some(booking => {
        const bookingStart = parseTime(booking.startTime);
        const bookingEnd = parseTime(booking.endTime);
        return (slotStart < bookingEnd && slotEnd > bookingStart);
      });
      
      // Check if slot conflicts with blocked slots
      const conflictWithBlocked = blockedSlots.some(blocked => {
        const blockedStart = parseTime(blocked.startTime);
        const blockedEnd = parseTime(blocked.endTime);
        return (slotStart < blockedEnd && slotEnd > blockedStart);
      });
      
      if (!conflictWithBooking && !conflictWithBlocked) {
        availableSlots.push({
          startTime: slotStartTime,
          endTime: slotEndTime
        });
      }
    }
    
    // Move to next slot (15-minute intervals)
    currentTime += 15;
  }
  
  return availableSlots;
}
