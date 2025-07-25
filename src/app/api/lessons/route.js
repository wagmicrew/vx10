import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const lessons = await prisma.lesson.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('Lessons fetched successfully', { count: lessons.length });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Failed to fetch lessons', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST method to create new lessons (admin only)
export async function POST(request) {
  try {
    const { name, description, duration, price } = await request.json();

    // TODO: Add authentication check for admin role
    
    const lesson = await prisma.lesson.create({
      data: {
        name,
        description,
        duration: parseInt(duration),
        price: parseFloat(price),
        isActive: true
      }
    });

    console.log('Lesson created successfully', { lessonId: lesson.id, name });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Failed to create lesson', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
