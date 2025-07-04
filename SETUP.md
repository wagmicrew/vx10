# VX10 Setup and Deployment Guide

This guide explains how to use the automated setup scripts for the VX10 project.

## Quick Start

### Windows (Recommended)

1. **Using the batch file:**
   ```cmd
   setup-vx10.bat
   ```

2. **Using npm scripts:**
   ```cmd
   npm run setup:complete
   ```

### Linux/macOS

```bash
./setup-vx10-complete.sh
```

## Available Scripts

### Setup Scripts

| Command | Description |
|---------|-------------|
| `npm run setup:complete` | Complete setup including git clone, dependencies, PostgreSQL, and build |
| `npm run setup:update` | Update existing installation |
| `npm run setup:postgres` | Setup PostgreSQL only (Windows PowerShell) |

### Git Operations

| Command | Description |
|---------|-------------|
| `npm run git:pull` | Pull latest changes from remote |
| `npm run git:push` | Add, commit, and push all changes |
| `npm run git:sync` | Full sync: pull → install → build → push |

### Deployment

| Command | Description |
|---------|-------------|
| `npm run deploy:dev` | Deploy for development (includes dev dependencies) |
| `npm run deploy:prod` | Deploy for production (production only) |

### Prisma Database

| Command | Description |
|---------|-------------|
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:push` | Push schema to database |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:reset` | Reset database and migrations |

## Complete Setup Process

The `setup-vx10-complete.sh` script performs the following steps:

1. **Prerequisites Installation**
   - Installs Node.js and npm (if not present)
   - Installs PostgreSQL (if not present)
   - Installs Git (if not present)

2. **Repository Setup**
   - Clones the repository or updates existing one
   - Handles git stashing for local changes

3. **Environment Configuration**
   - Creates `.env` file from template
   - Sets up database connection string

4. **Database Setup**
   - Creates PostgreSQL user and database
   - Runs Prisma migrations
   - Creates test users

5. **Application Build**
   - Installs dependencies
   - Generates Prisma client
   - Builds the Next.js application

6. **Git Operations**
   - Commits changes
   - Pushes to remote repository

## Manual Setup (Alternative)

If you prefer manual setup, follow these steps:

### 1. Clone Repository
```bash
git clone https://github.com/wagmicrew/vx10.git
cd vx10
```

### 2. Install Dependencies
```bash
npm ci
```

### 3. Setup Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Setup PostgreSQL

**Windows:**
```cmd
npm run setup:postgres
```

**Linux/macOS:**
```bash
sudo -u postgres createuser --createdb --pwprompt vx10user
sudo -u postgres createdb -O vx10user vx10_db
```

### 5. Run Migrations
```bash
npm run prisma:generate
npm run prisma:push
```

### 6. Build Application
```bash
npm run build
```

### 7. Start Application
```bash
npm run dev    # Development
npm start      # Production
```

## Test Accounts

After setup, these test accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vx10.com | admin |
| Teacher | teacher@vx10.com | teacher |
| Student | student@vx10.com | student |

## Troubleshooting

### Common Issues

1. **PostgreSQL Connection Failed**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify user permissions

2. **Build Failed**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

3. **Git Issues**
   - Ensure Git is installed and configured
   - Check repository permissions
   - Verify remote URL

### Environment Variables

Required environment variables in `.env`:

```env
DATABASE_URL="postgresql://vx10user:vx10password@localhost:5432/vx10_db"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

## Advanced Usage

### Custom Installation Directory

```bash
./setup-vx10-complete.sh my-custom-directory
```

### Force Reinstall

```bash
./setup-vx10-complete.sh --force
```

### Update Only

```bash
./setup-vx10-complete.sh --update
```

### Help

```bash
./setup-vx10-complete.sh --help
```

## Production Deployment

For production deployment:

1. Use `npm run deploy:prod`
2. Set `NODE_ENV=production` in `.env`
3. Use strong passwords and secrets
4. Configure proper database permissions
5. Set up reverse proxy (nginx)
6. Use PM2 for process management

## Support

If you encounter issues:

1. Check the console output for error messages
2. Verify all prerequisites are installed
3. Ensure database is running and accessible
4. Check file permissions
5. Review the logs in the project directory

For additional help, refer to the main project documentation or create an issue in the repository.
