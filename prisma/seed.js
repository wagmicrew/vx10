const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Supabase database seeding...');

  // Create default settings
  const settings = [
    // Supabase settings
    { category: 'supabase', key: 'url', value: process.env.NEXT_PUBLIC_SUPABASE_URL || '', description: 'Supabase project URL' },
    { category: 'supabase', key: 'anon_key', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', description: 'Supabase anonymous key' },
    
    // Email settings
    { category: 'email', key: 'smtp_host', value: 'smtp.gmail.com', description: 'SMTP server host' },
    { category: 'email', key: 'smtp_port', value: '587', description: 'SMTP server port' },
    { category: 'email', key: 'from_email', value: 'noreply@vx10.com', description: 'From email address' },
    { category: 'email', key: 'from_name', value: 'VX10 Driving School', description: 'From name' },
    
    // General settings
    { category: 'general', key: 'working_start_time', value: '08:00', description: 'Start time for daily lesson bookings' },
    { category: 'general', key: 'working_end_time', value: '18:00', description: 'End time for daily lesson bookings' },
    { category: 'general', key: 'break_start_time', value: '12:00', description: 'Start time for lunch break' },
    { category: 'general', key: 'break_end_time', value: '13:00', description: 'End time for lunch break' },
    { category: 'general', key: 'max_advance_booking_days', value: '30', description: 'Maximum days in advance for bookings' },
    { category: 'general', key: 'min_advance_booking_hours', value: '24', description: 'Minimum hours in advance for bookings' },
    
    // Payment settings
    { category: 'payment', key: 'qliro_enabled', value: 'true', description: 'Enable Qliro payments' },
    { category: 'payment', key: 'swish_enabled', value: 'true', description: 'Enable Swish payments' },
    { category: 'payment', key: 'credit_enabled', value: 'true', description: 'Enable credit payments' },
  ];

  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { category_key: { category: setting.category, key: setting.key } },
      update: {},
      create: setting
    });
  }

  console.log(`✅ Created ${settings.length} settings`);

  // Create sample lessons
  const lessons = [
    {
      name: 'Bedömningslektion',
      description: 'En första lektion för att bedöma din nuvarande körnivå och planera din fortsatta utbildning.',
      duration: 60,
      price: 500.00,
      category: 'assessment',
      gearType: null
    },
    {
      name: 'Körlektion - Automat',
      description: 'Standard körlektion med automatväxlad bil.',
      duration: 60,
      price: 580.00,
      category: 'practical',
      gearType: 'AUTOMATIC'
    },
    {
      name: 'Körlektion - Manuell',
      description: 'Standard körlektion med manuell växellåda.',
      duration: 60,
      price: 580.00,
      category: 'practical',
      gearType: 'MANUAL'
    },
    {
      name: 'Teorilektion',
      description: 'Teorilektion för att förbereda dig för teoriprov.',
      duration: 45,
      price: 400.00,
      category: 'theory',
      gearType: null
    },
    {
      name: 'Uppkörning',
      description: 'Praktiskt prov med trafikverket.',
      duration: 90,
      price: 800.00,
      category: 'test',
      gearType: null
    }
  ];

  for (const lesson of lessons) {
    await prisma.lesson.upsert({
      where: { name: lesson.name },
      update: {},
      create: lesson
    });
  }

  console.log(`✅ Created ${lessons.length} lessons`);

  // Create sample packages
  const packages = [
    {
      name: 'Startpaket - Automat',
      description: 'Perfekt för nybörjare med automatväxlad bil. Inkluderar bedömning och 10 körlektioner.',
      totalPrice: 6300.00,
      validityDays: 365
    },
    {
      name: 'Startpaket - Manuell',
      description: 'Perfekt för nybörjare med manuell växellåda. Inkluderar bedömning och 12 körlektioner.',
      totalPrice: 7460.00,
      validityDays: 365
    },
    {
      name: 'Intensivpaket',
      description: 'Intensiv utbildning med 20 körlektioner och teoristöd.',
      totalPrice: 12000.00,
      validityDays: 180
    }
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { name: pkg.name },
      update: {},
      create: pkg
    });
  }

  console.log(`✅ Created ${packages.length} packages`);

  // Create sample working hours (Monday to Friday, 8 AM to 6 PM)
  const workingHours = [];
  for (let day = 1; day <= 5; day++) { // Monday to Friday
    workingHours.push({
      dayOfWeek: day,
      startTime: '08:00',
      endTime: '18:00',
      breakStart: '12:00',
      breakEnd: '13:00',
      isActive: true
    });
  }

  for (const hours of workingHours) {
    await prisma.workingHours.create({
      data: hours
    }).catch(() => {
      // Ignore if already exists
    });
  }

  console.log(`✅ Created ${workingHours.length} working hour entries`);

  // Create sample holidays
  const currentYear = new Date().getFullYear();
  const holidays = [
    {
      name: 'Nyårsdagen',
      date: new Date(currentYear, 0, 1), // January 1st
      isRecurring: true,
      description: 'New Year\'s Day'
    },
    {
      name: 'Trettondedag jul',
      date: new Date(currentYear, 0, 6), // January 6th
      isRecurring: true,
      description: 'Epiphany'
    },
    {
      name: 'Första maj',
      date: new Date(currentYear, 4, 1), // May 1st
      isRecurring: true,
      description: 'Labour Day'
    },
    {
      name: 'Sveriges nationaldag',
      date: new Date(currentYear, 5, 6), // June 6th
      isRecurring: true,
      description: 'National Day of Sweden'
    },
    {
      name: 'Midsommarafton',
      date: new Date(currentYear, 5, 21), // Approximate date
      isRecurring: true,
      description: 'Midsummer Eve'
    },
    {
      name: 'Julafton',
      date: new Date(currentYear, 11, 24), // December 24th
      isRecurring: true,
      description: 'Christmas Eve'
    },
    {
      name: 'Juldagen',
      date: new Date(currentYear, 11, 25), // December 25th
      isRecurring: true,
      description: 'Christmas Day'
    },
    {
      name: 'Annandag jul',
      date: new Date(currentYear, 11, 26), // December 26th
      isRecurring: true,
      description: 'Boxing Day'
    }
  ];

  for (const holiday of holidays) {
    await prisma.holiday.create({
      data: holiday
    }).catch(() => {
      // Ignore if already exists
    });
  }

  console.log(`✅ Created ${holidays.length} holidays`);

  console.log('🎉 Supabase database seeding completed successfully!');
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
