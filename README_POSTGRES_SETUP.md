# 🐘 VX10 PostgreSQL Local Setup

Complete automation script for setting up PostgreSQL locally on Ubuntu for the VX10 driving school management system.

## 🚀 Quick Setup

```bash
# 1. Make scripts executable
chmod +x setup-postgres-ubuntu.sh
chmod +x test-postgres-setup.sh

# 2. Run the setup
./setup-postgres-ubuntu.sh

# 3. Test the setup
./test-postgres-setup.sh

# 4. Start your application
npm run dev
```

## 📦 What Gets Installed & Configured

### System Components
- ✅ PostgreSQL 14+ with contrib packages
- ✅ Node.js 18+ (if not already installed)
- ✅ All required npm dependencies

### Database Setup
- ✅ Database: `vx10_db`
- ✅ User: `vx10user` with superuser privileges
- ✅ Password: `vx10password` (change for production!)
- ✅ Local connection configuration
- ✅ Proper access controls

### Application Configuration
- ✅ `.env` file with local PostgreSQL URLs
- ✅ Prisma client generation
- ✅ Database schema application
- ✅ Initial data seeding
- ✅ File permission fixes

## 🔧 Script Features

### 🛡️ Error Handling
- Comprehensive error detection
- Automatic cleanup on failure
- Backup restoration capabilities
- Detailed error messages

### 🔐 Permission Management
- File and folder permission fixes
- PostgreSQL access control setup
- Node.js module permission handling
- User privilege management

### 🔄 Recovery Options
- Automatic backup creation
- Rollback capabilities
- Manual intervention guidance
- Step-by-step troubleshooting

### 🧪 Testing & Validation
- Database connection testing
- Prisma integration verification
- Application build testing
- Performance benchmarking

## 📁 Files Created/Modified

```
.env                     # Database configuration
.env.backup.TIMESTAMP    # Original .env backup
setup-postgres-ubuntu.sh # Main setup script
test-postgres-setup.sh   # Verification script
POSTGRES_SETUP_UBUNTU.md # Detailed documentation
```

## 🎯 Connection Details

After setup, your application will use:

```env
DATABASE_URL="postgresql://vx10user:vx10password@localhost:5432/vx10_db"
DIRECT_URL="postgresql://vx10user:vx10password@localhost:5432/vx10_db"
```

## 🔍 Verification Commands

### Test Database Connection
```bash
PGPASSWORD="vx10password" psql -h localhost -U vx10user -d vx10_db -c "SELECT version();"
```

### Check Tables
```bash
PGPASSWORD="vx10password" psql -h localhost -U vx10user -d vx10_db -c "\dt"
```

### View Data
```bash
npm run prisma:studio
# Opens at http://localhost:5555
```

## 🛠️ Manual Recovery Steps

If the automated script fails, follow these manual steps:

### 1. Install PostgreSQL
```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database & User
```bash
sudo -u postgres psql << EOF
CREATE USER vx10user WITH PASSWORD 'vx10password';
ALTER USER vx10user CREATEDB;
ALTER USER vx10user WITH SUPERUSER;
CREATE DATABASE vx10_db OWNER vx10user;
GRANT ALL PRIVILEGES ON DATABASE vx10_db TO vx10user;
\q
EOF
```

### 3. Configure Access
```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Change this line:
# local   all             all                                     peer
# To:
# local   all             all                                     md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 4. Update .env File
```bash
cat > .env << EOF
DATABASE_URL="postgresql://vx10user:vx10password@localhost:5432/vx10_db"
DIRECT_URL="postgresql://vx10user:vx10password@localhost:5432/vx10_db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
EOF
```

### 5. Setup Prisma
```bash
npm install
npm run prisma:generate
npm run prisma:push
node prisma/seed.js
```

## 🚨 Troubleshooting

### Common Issues & Solutions

#### PostgreSQL Won't Start
```bash
# Check status
sudo systemctl status postgresql

# Check logs
sudo journalctl -u postgresql

# Restart service
sudo systemctl restart postgresql
```

#### Connection Refused
```bash
# Check if PostgreSQL is listening
sudo netstat -tlnp | grep 5432

# Check configuration
sudo nano /etc/postgresql/*/main/postgresql.conf
# Ensure: listen_addresses = 'localhost'
```

#### Permission Denied
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod 755 .
chmod 644 .env

# Fix PostgreSQL permissions
sudo -u postgres psql -c "ALTER USER vx10user WITH SUPERUSER;"
```

#### Prisma Issues
```bash
# Clear and regenerate
rm -rf node_modules/.prisma
npm run prisma:generate

# Reset database
npm run prisma:push --force-reset
```

#### Port Already in Use
```bash
# Find what's using port 5432
sudo lsof -i :5432

# Kill conflicting process
sudo systemctl stop postgresql
sudo systemctl start postgresql
```

## 🔒 Security Considerations

### Development Environment
- Uses simple passwords for ease of development
- Database user has superuser privileges
- Local connections only (not exposed externally)

### Production Recommendations
1. **Change all default passwords**
2. **Use environment-specific secrets**
3. **Implement proper user roles**
4. **Enable SSL/TLS connections**
5. **Configure firewall rules**
6. **Regular security updates**

## 📊 Performance Optimization

### For Better Performance
```bash
# Increase shared_buffers in postgresql.conf
sudo nano /etc/postgresql/*/main/postgresql.conf
# shared_buffers = 256MB

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Monitor Performance
```bash
# Check active connections
PGPASSWORD="vx10password" psql -h localhost -U vx10user -d vx10_db -c "SELECT * FROM pg_stat_activity;"

# Check database size
PGPASSWORD="vx10password" psql -h localhost -U vx10user -d vx10_db -c "SELECT pg_size_pretty(pg_database_size('vx10_db'));"
```

## 🎉 Success Indicators

After successful setup, you should see:
- ✅ PostgreSQL service running
- ✅ Database and user created
- ✅ Connection test successful
- ✅ Prisma client generated
- ✅ Database schema applied
- ✅ Initial data seeded
- ✅ Application builds successfully

## 📞 Support

If you encounter issues:
1. Run the test script: `./test-postgres-setup.sh`
2. Check the detailed documentation: `POSTGRES_SETUP_UBUNTU.md`
3. Review PostgreSQL logs: `sudo journalctl -u postgresql`
4. Verify system requirements (Ubuntu 18.04+)

---

**Happy coding with your local PostgreSQL setup! 🚀**
