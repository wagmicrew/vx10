# Database Enhancements: Schedule Management & Payment/Invoice Management

This document outlines the new database models and enhancements added to support advanced Schedule Management and Payment/Invoice Management functionality.

## 🗓️ Schedule Management

### New Models

#### 1. Schedule
Enhanced scheduling system for instructors and lessons.

```prisma
model Schedule {
  id          String   @id @default(cuid())
  instructorId String
  date        DateTime
  startTime   String   // Format: "HH:MM"
  endTime     String   // Format: "HH:MM"
  isAvailable Boolean  @default(true)
  isRecurring Boolean  @default(false)
  recurringPattern String? // 'daily', 'weekly', 'monthly'
  recurringEndDate DateTime?
  maxBookings Int      @default(1)
  currentBookings Int  @default(0)
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Features:**
- Individual instructor schedules
- Recurring schedule patterns
- Multiple bookings per time slot
- Availability management

#### 2. WorkingHours
Configure business hours and instructor availability.

```prisma
model WorkingHours {
  id          String   @id @default(cuid())
  dayOfWeek   Int      // 0 = Sunday, 1 = Monday, etc.
  startTime   String   // Format: "HH:MM"
  endTime     String   // Format: "HH:MM"
  isActive    Boolean  @default(true)
  breakStart  String?  // Optional break start time
  breakEnd    String?  // Optional break end time
  instructorId String? // Null for general hours
}
```

**Features:**
- Weekly schedule configuration
- Break time management
- Instructor-specific hours
- General business hours

#### 3. Holiday
Manage holidays and special non-working days.

```prisma
model Holiday {
  id          String   @id @default(cuid())
  name        String
  date        DateTime
  isRecurring Boolean  @default(false)
  description String?
  affectsSchedule Boolean @default(true)
}
```

**Features:**
- Annual recurring holidays
- Custom holiday dates
- Schedule impact control

### Enhanced Booking Model
The existing Booking model now includes:
- `scheduleId` - Optional link to specific schedule slots
- Better integration with schedule management

## 💰 Payment/Invoice Management

### New Models

#### 1. Invoice
Comprehensive invoice management system.

```prisma
model Invoice {
  id            String        @id @default(cuid())
  invoiceNumber String        @unique
  userId        String
  totalAmount   Decimal       @db.Decimal(10, 2)
  taxAmount     Decimal       @db.Decimal(10, 2)
  discountAmount Decimal      @db.Decimal(10, 2)
  finalAmount   Decimal       @db.Decimal(10, 2)
  currency      String        @default("SEK")
  status        InvoiceStatus @default(DRAFT)
  dueDate       DateTime
  paidDate      DateTime?
  description   String?
  notes         String?
  billingAddress Json?
  companyInfo   Json?
  taxRate       Decimal       @db.Decimal(5, 2) @default(25.00)
}
```

**Features:**
- Unique invoice numbering
- Tax calculation (Swedish VAT)
- Discount support
- B2B company information
- Structured billing addresses

#### 2. InvoiceItem
Detailed line items for invoices.

```prisma
model InvoiceItem {
  id          String   @id @default(cuid())
  invoiceId   String
  description String
  quantity    Int      @default(1)
  unitPrice   Decimal  @db.Decimal(10, 2)
  totalPrice  Decimal  @db.Decimal(10, 2)
  taxRate     Decimal  @db.Decimal(5, 2) @default(25.00)
  lessonId    String?  // Optional link to lesson
  packageId   String?  // Optional link to package
  bookingId   String?  // Optional link to booking
}
```

**Features:**
- Flexible line item descriptions
- Links to lessons, packages, or bookings
- Individual tax rates per item
- Quantity and pricing calculations

#### 3. Payment
Enhanced payment tracking system.

```prisma
model Payment {
  id              String        @id @default(cuid())
  invoiceId       String?       // Can be null for direct payments
  userId          String
  amount          Decimal       @db.Decimal(10, 2)
  currency        String        @default("SEK")
  paymentMethod   PaymentMethod
  status          PaymentStatus @default(PENDING)
  externalId      String?       // Payment provider transaction ID
  providerName    String?       // 'stripe', 'swish', 'klarna', etc.
  providerResponse Json?        // Full response from payment provider
  paidAt          DateTime?
  failedAt        DateTime?
  refundedAt      DateTime?
  refundAmount    Decimal?      @db.Decimal(10, 2)
  failureReason   String?
  description     String?
  metadata        Json?
}
```

**Features:**
- Multiple payment provider support
- Refund management
- Payment metadata storage
- Direct payments (without invoices)
- Comprehensive payment status tracking

### Enhanced Enums

#### InvoiceStatus
```prisma
enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
  REFUNDED
}
```

#### Enhanced PaymentMethod
```prisma
enum PaymentMethod {
  CARD
  SWISH
  INVOICE
  CREDIT
  BANK_TRANSFER
  KLARNA
  PAYPAL
  CASH
}
```

## 🔄 Database Migration

To apply these changes to your database:

1. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

2. **Apply Schema Changes:**
   ```bash
   npm run prisma:push
   # OR for production
   npm run prisma:migrate
   ```

3. **Seed New Data:**
   ```bash
   npm run supabase:seed
   ```

## 📊 Sample Data

The seed file now includes:
- **Working Hours**: Monday-Friday, 8 AM - 6 PM with lunch break
- **Swedish Holidays**: Major Swedish holidays with recurring patterns
- **Schedule Templates**: Basic instructor availability patterns

## 🔗 Integration Points

### Frontend Integration
- Schedule calendar components
- Invoice generation forms
- Payment processing interfaces
- Working hours configuration

### API Endpoints
- `/api/schedules` - Schedule management
- `/api/invoices` - Invoice operations
- `/api/payments` - Payment processing
- `/api/working-hours` - Business hours configuration

### Business Logic
- Automatic invoice generation from bookings
- Schedule conflict detection
- Payment status synchronization
- Tax calculation automation

## 🚀 Next Steps

1. **Frontend Components**: Build UI components for the new functionality
2. **API Routes**: Implement API endpoints for CRUD operations
3. **Business Logic**: Add validation and business rules
4. **Testing**: Create comprehensive tests for new features
5. **Documentation**: Update API documentation

## 📝 Notes

- All monetary values use `Decimal` type for precision
- Swedish VAT (25%) is set as default tax rate
- Time formats use "HH:MM" string format for consistency
- JSON fields allow flexible metadata storage
- Foreign key relationships maintain data integrity
