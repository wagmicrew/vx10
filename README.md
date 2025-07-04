# VX10 Project - Full Stack Learning Platform

> 🚨 **Warning:** This setup includes PostgreSQL installation and database operations.

> 💡 **Tip:** Navigate to `/setup` page for a comprehensive setup interface.

> 📝 **Note:** Test accounts are created automatically during setup.

## Features

- **SSR with Next.js 15.2.2** and React 19
- **PostgreSQL Database** with Prisma ORM
- **NextAuth.js Authentication** with JWT and role-based access
- **Three User Roles**: Admin, Teacher, Student with separate dashboards
- **Glassmorphism UI** with MagicUI BorderBeam effects
- **Internationalization** with react-i18next
- **TypeScript 5** with strict type checking

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PostgreSQL Database

#### Option A: Automated Setup (Recommended)
```bash
npm run setup:postgres
```

#### Option B: Manual Setup
```bash
# Run the PowerShell script directly
powershell -ExecutionPolicy Bypass -File ./setup_postgres.ps1

# Or navigate to the setup page
# http://localhost:3000/setup
```

### 3. Environment Configuration

The `.env` file is already configured with default values:

```env
# Database
DATABASE_URL="postgresql://vx10user:vx10password@localhost:5432/vx10_db?schema=public"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production-vx10-secure-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

## Test Accounts

After running the setup, these accounts will be available:

| Role    | Email              | Password |
|---------|-------------------|----------|
| Admin   | admin@vx10.com    | admin    |
| Teacher | teacher@vx10.com  | teacher  |
| Student | student@vx10.com  | student  |

## Architecture

### Authentication Stack
- **NextAuth.js** with Prisma adapter
- **bcryptjs** for password hashing
- **JWT sessions** for stateless authentication
- **Role-based access control** (RBAC)

### Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          Role      @default(STUDENT)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
}

enum Role {
  ADMIN
  TEACHER
  STUDENT
}
```

### Tech Stack Requirements

- **Next.js 15.2.2** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **TailwindCSS 4** - Styling
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **NextAuth.js** - Authentication
- **Zustand** - State management
- **MagicUI** - UI components
- **react-i18next** - Internationalization

## Directory Structure

```
src/
├── app/
│   ├── admin/          # Admin dashboard
│   ├── teacher/        # Teacher dashboard  
│   ├── student/        # Student dashboard
│   ├── setup/          # Setup interface
│   └── api/auth/       # NextAuth API routes
├── components/
│   ├── auth/           # Authentication components
│   ├── ui/             # UI components
│   └── magicui/        # MagicUI components
├── lib/
│   ├── auth/           # Auth configuration
│   └── prisma.ts       # Prisma client
└── types/              # Type definitions
```

## Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run prisma:migrate  # Run database migrations
npm run prisma:generate # Generate Prisma client
npm run prisma:studio   # Open Prisma Studio
npm run prisma:push     # Push schema to database
npm run prisma:reset    # Reset database

# Setup
npm run setup:postgres  # Run PostgreSQL setup script
```

## Features

### 🔐 Authentication
- Login modal with glassmorphism design
- Role-based dashboard redirection
- Secure password hashing with bcryptjs
- JWT session management

### 👥 User Roles

#### Admin Dashboard (`/admin`)
- System overview and statistics
- User management capabilities
- Quick actions panel
- System information display

#### Teacher Dashboard (`/teacher`)
- Course management interface
- Student progress tracking
- Class scheduling tools
- Assignment grading system

#### Student Dashboard (`/student`)
- Course enrollment and progress
- Learning goals tracking
- Schedule management
- Grade viewing

### 🎨 UI Components
- **Glassmorphism Design** with backdrop blur effects
- **BorderBeam Effects** from MagicUI
- **Responsive Design** with Tailwind CSS
- **Loading States** and animations
- **Toast Notifications** with Sonner

### 🌐 Internationalization
- Swedish language support (default)
- Extensible for multiple languages
- Browser language detection
- HTTP backend for translations

## Development Guidelines

### Adding New Features

1. **Database Changes**: Update `prisma/schema.prisma`
2. **Migrations**: Run `npm run prisma:migrate`
3. **Types**: Generate with `npm run prisma:generate`
4. **Authentication**: Use NextAuth session hooks
5. **UI**: Follow glassmorphism design patterns

### Code Standards

- **ESM over CommonJS**: Use import/export
- **Type Safety**: Avoid `any`, use generics
- **Error Handling**: Throw Error instances
- **Async/Await**: Handle promises properly
- **Functional Programming**: Prefer over OOP

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Verify credentials in `.env`
3. Check database exists: `vx10_db`
4. Test connection: `npm run prisma:studio`

### Authentication Problems
1. Clear browser localStorage
2. Restart development server
3. Check NEXTAUTH_SECRET is set
4. Verify user exists in database

### Permission Errors
1. Run PowerShell as Administrator
2. Check execution policy
3. Verify user roles in database

## Production Deployment

1. **Environment Variables**: Update production values
2. **Database**: Deploy PostgreSQL instance
3. **Migrations**: Run `prisma migrate deploy`
4. **Build**: Execute `npm run build`
5. **Security**: Change all default passwords

## Support

For setup assistance, visit the `/setup` page in your application for:
- Interactive database setup
- Dependency management
- System status monitoring
- Quick navigation links

---

Built with ❤️ using the VX10 stack for modern web applications.
