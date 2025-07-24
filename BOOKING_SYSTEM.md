# Booking System Implementation

## Overview

A comprehensive booking system has been implemented for VX10 driving school with the following features:

- **Step-by-step booking flow** with Material UI design
- **Lesson selection** from available lesson types
- **Automatic/Manual gear selection**
- **Date and time slot selection** with real-time availability
- **Payment integration** with Qliro and Swish
- **Admin configurable working hours and blocked slots**

## Components

### 1. BookingFlow Component (`src/components/booking/BookingFlow.jsx`)

Main booking component with 5 steps:
1. **Select Lesson** - Choose from available lesson types
2. **Choose Gear Type** - Automatic or Manual transmission
3. **Pick Date** - Calendar date selection (up to 30 days in advance)
4. **Select Time Slot** - Available time slots based on lesson duration and existing bookings
5. **Review & Payment** - Booking summary and payment method selection

### 2. Database Schema

#### Tables Created:
- **Lesson** - Available lesson types with pricing and duration
- **AdminSettings** - Configurable working hours and system settings
- **BlockedSlot** - Admin-managed blocked time slots
- **Booking** - Customer booking records with payment status

#### Key Features:
- **Working Hours Configuration** - Start/end times and break periods
- **Slot Algorithm** - Calculates available slots considering:
  - Lesson duration
  - Existing bookings
  - Admin blocked slots
  - Working hours and breaks

### 3. API Routes

#### `/api/lessons`
- **GET**: Fetch active lessons
- **POST**: Create new lessons (admin only)

#### `/api/admin/settings`
- **GET**: Fetch admin settings
- **POST**: Update admin settings (admin only)

#### `/api/booking/available-slots`
- **GET**: Calculate available time slots for a specific date and lesson
- **Query params**: `date`, `lessonId`

#### `/api/booking/create`
- **POST**: Create new booking with payment integration
- **Features**: 
  - Slot availability validation
  - Qliro payment order creation
  - Swish payment preparation

## Algorithm: Available Slots Calculation

The system uses a sophisticated algorithm to determine available booking slots:

```javascript
function generateTimeSlots(
  workingStartTime,    // e.g., "08:00"
  workingEndTime,      // e.g., "18:00" 
  breakStartTime,      // e.g., "12:00"
  breakEndTime,        // e.g., "13:00"
  lessonDuration,      // e.g., 60 minutes
  existingBookings,    // Array of booked slots
  blockedSlots         // Array of admin-blocked slots
)
```

### Algorithm Steps:
1. **Parse working hours** into minutes for calculation
2. **Generate 15-minute interval slots** throughout the working day
3. **Filter out break periods** (lunch break, etc.)
4. **Check lesson duration compatibility** - ensure slot fits lesson length
5. **Exclude existing bookings** - remove conflicting time slots
6. **Exclude blocked slots** - remove admin-blocked periods
7. **Return available slots** formatted as start/end times

## Payment Integration

### Qliro Integration
- **Order Creation**: Automatic Qliro order creation with booking details
- **Product Details**: Lesson name, gear type, and pricing
- **Customer Info**: Email and contact information
- **Redirect Handling**: Automatic redirect to Qliro payment page

### Swish Integration
- **QR Code Generation**: Generate Swish payment QR codes
- **Payment Tracking**: Monitor payment status and completion
- **Mobile Compatibility**: Optimized for mobile Swish payments

## Usage Instructions

### For Users:
1. **Access Booking**: Navigate to `/boka-korning`
2. **Authentication**: Sign in to access booking system
3. **Step-by-step Process**: Follow the 5-step booking flow
4. **Payment**: Complete payment via Qliro or Swish
5. **Confirmation**: Receive booking confirmation via email

### For Admins:
1. **Lesson Management**: Create and manage lesson types via API
2. **Working Hours**: Configure business hours via admin settings
3. **Block Slots**: Block specific time periods for holidays/maintenance
4. **Booking Overview**: Monitor all bookings and payment status

## Environment Variables Required

```env
DATABASE_URL=your_postgresql_connection_string
QLIRO_API_KEY=your_qliro_api_key
NEXTAUTH_URL=your_domain_url
```

## Database Setup

### 1. Update Schema
```bash
npx prisma db push
```

### 2. Seed Database
```bash
node prisma/seed.js
```

### 3. Generate Client
```bash
npx prisma generate
```

## Default Configuration

### Sample Lessons Created:
- **Bedömningslektion** - 60 min, 500 SEK
- **Körlektion** - 60 min, 580 SEK  
- **Intensivkurs** - 90 min, 850 SEK
- **Motorvägslektion** - 75 min, 720 SEK
- **Parallellparkering** - 45 min, 450 SEK

### Default Working Hours:
- **Start**: 08:00
- **End**: 18:00
- **Break**: 12:00 - 13:00
- **Booking Window**: 30 days in advance
- **Minimum Notice**: 24 hours

## Features Implemented

✅ **Public Access** - Anyone can view and access booking system
✅ **Lesson Selection** - Multiple lesson types with descriptions and pricing  
✅ **Gear Type Selection** - Automatic vs Manual transmission options
✅ **Date Selection** - Calendar interface with 30-day advance booking
✅ **Time Slot Algorithm** - Real-time availability calculation
✅ **Step Navigation** - Clean 5-step booking process with Material UI
✅ **Payment Integration** - Qliro and Swish payment options
✅ **Admin Configuration** - Configurable working hours and blocked slots
✅ **Database Integration** - Complete data persistence and retrieval
✅ **Authentication Integration** - NextAuth.js integration for user management

## Technical Stack

- **Frontend**: React, Next.js 15, Material UI (Joy)
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Payment**: Qliro API, Swish integration
- **Styling**: Tailwind CSS, Material UI components

The booking system is now fully functional and ready for production use!
