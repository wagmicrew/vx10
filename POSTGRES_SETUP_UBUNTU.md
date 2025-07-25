# PostgreSQL Local Setup for Ubuntu - VX10 Project

This document explains how to use the `setup-postgres-ubuntu.sh` script to set up a local PostgreSQL database for the VX10 driving school management system.

## 🚀 Quick Start

```bash
# Make the script executable
chmod +x setup-postgres-ubuntu.sh

# Run the setup script
./setup-postgres-ubuntu.sh
```

## 📋 What the Script Does

### 1. **System Preparation**
- Updates Ubuntu packages
- Installs PostgreSQL and related packages
- Configures PostgreSQL service

### 2. **Database Setup**
- Creates database user: `vx10user`
- Creates database: `vx10_db`
- Sets up proper permissions and access controls
- Configures PostgreSQL for local connections

### 3. **Application Configuration**
- Backs up existing `.env` file
- Updates `.env` with local PostgreSQL connection strings
- Fixes file and folder permissions
- Installs Node.js dependencies if needed

### 4. **Prisma Integration**
- Generates Prisma client
- Applies database schema
- Runs database migrations
- Seeds initial data

### 5. **Verification**
- Tests database connection
- Validates Prisma setup
- Runs application build test

## 🔧 Configuration Details

### Database Credentials
- **Database Name**: `vx10_db`
- **Username**: `vx10user`
- **Password**: `vx10password`
- **Host**: `localhost`
- **Port**: `5432`

### Connection String
```
postgresql://vx10user:vx10password@localhost:5432/vx10_db
```

## 📁 Files Modified

### `.env` File
The script creates/updates your `.env` file with:
```env
DATABASE_URL="postgresql://vx10user:vx10password@localhost:5432/vx10_db"
DIRECT_URL="postgresql://vx10user:vx10password@localhost:5432/vx10_db"
NEXTAUTH_SECRET="auto-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### Backup Files
- Original `.env` is backed up as `.env.backup.YYYYMMDD_HHMMSS`
- PostgreSQL config files are backed up before modification

## 🛠️ Manual Steps (if needed)

### If the script fails, you can run these commands manually:

#### 1. Install PostgreSQL
```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib postgresql-client
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 2. Create Database and User
```bash
sudo -u postgres psql -c "CREATE USER vx10user WITH PASSWORD 'vx10password';"
sudo -u postgres psql -c "ALTER USER vx10user CREATEDB;"
sudo -u postgres psql -c "ALTER USER vx10user WITH SUPERUSER;"
sudo -u postgres psql -c "CREATE DATABASE vx10_db OWNER vx10user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE vx10_db TO vx10user;"
```

#### 3. Test Connection
```bash
PGPASSWORD="vx10password" psql -h localhost -U vx10user -d vx10_db -c "SELECT 1;"
```

#### 4. Run Prisma Commands
```bash
npm run prisma:generate
npm run prisma:push
node prisma/seed.js
```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. **Permission Denied Errors**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod 755 .
chmod 644 .env
```

#### 2. **PostgreSQL Connection Failed**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check if port 5432 is open
sudo netstat -tlnp | grep 5432
```

#### 3. **Prisma Schema Issues**
```bash
# Reset and reapply schema
npm run prisma:push --force-reset

# Or use migration approach
npm run prisma:migrate dev --name init
```

#### 4. **Node.js/npm Issues**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 5. **Database Access Issues**
Edit PostgreSQL configuration:
```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Change 'peer' to 'md5' for local connections
local   all             all                                     md5
```

## 🎯 Post-Setup Commands

### Start Development Server
```bash
npm run dev
```

### Access Prisma Studio
```bash
npm run prisma:studio
# Opens at http://localhost:5555
```

### Connect to Database Directly
```bash
psql -h localhost -U vx10user -d vx10_db
```

### Reset Database (if needed)
```bash
npm run prisma:push --force-reset
node prisma/seed.js
```

## 🔒 Security Notes

### For Production Use:
1. **Change default passwords**
2. **Use environment-specific secrets**
3. **Configure proper firewall rules**
4. **Enable SSL/TLS connections**
5. **Regular security updates**

### Development Security:
- The script uses simple passwords for development
- Database user has superuser privileges for Prisma operations
- Local connections only (not exposed externally)

## 📊 Verification Steps

After running the script, verify everything works:

1. **Database Connection**:
   ```bash
   PGPASSWORD="vx10password" psql -h localhost -U vx10user -d vx10_db -c "\dt"
   ```

2. **Prisma Connection**:
   ```bash
   npm run prisma:studio
   ```

3. **Application Start**:
   ```bash
   npm run dev
   ```

4. **Check Tables**:
   ```bash
   npm run prisma:studio
   # Should show all your tables with data
   ```

## 🆘 Getting Help

If you encounter issues:

1. **Check the script output** for specific error messages
2. **Review the log files** in `/var/log/postgresql/`
3. **Verify system requirements** (Ubuntu 18.04+ recommended)
4. **Check disk space** and permissions
5. **Ensure no other PostgreSQL instances** are running

## 📝 Script Features

### Error Handling
- Comprehensive error detection and recovery
- Automatic cleanup on failure
- Backup restoration if setup fails

### Permission Management
- Fixes file and folder permissions
- Handles PostgreSQL access controls
- Manages Node.js module permissions

### Flexibility
- Detects existing installations
- Handles various Ubuntu versions
- Adapts to different project structures

### Safety
- Creates backups before modifications
- Validates each step before proceeding
- Provides rollback options

---

**Note**: This script is designed for development environments. For production deployments, additional security hardening and configuration may be required.
