const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample lessons
  const lessons = await Promise.all([
    prisma.lesson.upsert({
      where: { name: 'Bedömningslektion' },
      update: {},
      create: {
        name: 'Bedömningslektion',
        description: 'En första lektion för att bedöma din nuvarande körnivå och planera din fortsatta utbildning.',
        duration: 60,
        price: 500.00,
        isActive: true
      }
    }),
    prisma.lesson.upsert({
      where: { name: 'Körlektion' },
      update: {},
      create: {
        name: 'Körlektion',
        description: 'Standard körlektion med instruktör för att utveckla dina körfärdigheter.',
        duration: 60,
        price: 580.00,
        isActive: true
      }
    }),
    prisma.lesson.upsert({
      where: { name: 'Intensivkurs' },
      update: {},
      create: {
        name: 'Intensivkurs',
        description: 'En längre körlektion för snabbare utveckling av dina färdigheter.',
        duration: 90,
        price: 850.00,
        isActive: true
      }
    }),
    prisma.lesson.upsert({
      where: { name: 'Motorvägslektion' },
      update: {},
      create: {
        name: 'Motorvägslektion',
        description: 'Specialiserad lektion för körning på motorväg och större vägar.',
        duration: 75,
        price: 720.00,
        isActive: true
      }
    }),
    prisma.lesson.upsert({
      where: { name: 'Parallellparkering' },
      update: {},
      create: {
        name: 'Parallellparkering',
        description: 'Fokus på parkeringsteknik och manövrering i trånga utrymmen.',
        duration: 45,
        price: 450.00,
        isActive: true
      }
    })
  ]);

  console.log(`✅ Created ${lessons.length} lessons`);

  // Create admin settings for working hours
  const adminSettings = await Promise.all([
    prisma.adminSettings.upsert({
      where: { settingKey: 'WORKING_START_TIME' },
      update: {},
      create: {
        settingKey: 'WORKING_START_TIME',
        settingValue: '08:00',
        description: 'Start time for daily lesson bookings'
      }
    }),
    prisma.adminSettings.upsert({
      where: { settingKey: 'WORKING_END_TIME' },
      update: {},
      create: {
        settingKey: 'WORKING_END_TIME',
        settingValue: '18:00',
        description: 'End time for daily lesson bookings'
      }
    }),
    prisma.adminSettings.upsert({
      where: { settingKey: 'BREAK_START_TIME' },
      update: {},
      create: {
        settingKey: 'BREAK_START_TIME',
        settingValue: '12:00',
        description: 'Start time for lunch break'
      }
    }),
    prisma.adminSettings.upsert({
      where: { settingKey: 'BREAK_END_TIME' },
      update: {},
      create: {
        settingKey: 'BREAK_END_TIME',
        settingValue: '13:00',
        description: 'End time for lunch break'
      }
    }),
    prisma.adminSettings.upsert({
      where: { settingKey: 'MAX_ADVANCE_BOOKING_DAYS' },
      update: {},
      create: {
        settingKey: 'MAX_ADVANCE_BOOKING_DAYS',
        settingValue: '30',
        description: 'Maximum number of days in advance that lessons can be booked'
      }
    }),
    prisma.adminSettings.upsert({
      where: { settingKey: 'MIN_ADVANCE_BOOKING_HOURS' },
      update: {},
      create: {
        settingKey: 'MIN_ADVANCE_BOOKING_HOURS',
        settingValue: '24',
        description: 'Minimum number of hours in advance that lessons can be booked'
      }
    })
  ]);

  console.log(`✅ Created ${adminSettings.length} admin settings`);

  // Create some sample blocked slots (e.g., for holidays or maintenance)
  const today = new Date();
  const christmas = new Date(today.getFullYear(), 11, 24); // December 24th
  const newYear = new Date(today.getFullYear() + 1, 0, 1); // January 1st

  // Note: We can't create blocked slots without a valid user ID
  // This would need to be done after users are created
  console.log('ℹ️  Blocked slots will need to be created by admin users after they are set up');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
