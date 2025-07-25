import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { logger } from '@/utils/edge-logger';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const settings = await prisma.settings.findMany({
      orderBy: {
        key: 'asc'
      }
    });

    logger.info('Admin settings fetched successfully', { count: settings.length });

    return NextResponse.json(settings);
  } catch (error) {
    logger.error('Failed to fetch admin settings', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to fetch admin settings' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST method to create/update admin settings (admin only)
export async function POST(request) {
  try {
    const { category, key, value, description } = await request.json();

    // TODO: Add authentication check for admin role
    
    const setting = await prisma.settings.upsert({
      where: {
        category_key: {
          category: category,
          key: key
        }
      },
      update: {
        value,
        description
      },
      create: {
        category,
        key,
        value,
        description
      }
    });

    logger.info('Admin setting updated successfully', { category, key });

    return NextResponse.json(setting);
  } catch (error) {
    logger.error('Failed to update admin setting', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to update admin setting' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
