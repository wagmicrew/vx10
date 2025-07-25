# Running setup-postgres-ubuntu.sh as Root

The `setup-postgres-ubuntu.sh` script has been updated to support execution as root while maintaining security best practices.

## 🔐 Root Execution Support

### What Changed
The script now detects if it's running as root and automatically creates a deployment user for safe operations:

- **Deployment User**: `vx10deploy` (created automatically)
- **Password**: `vx10deploy123` (temporary, change after setup)
- **Privileges**: Added to sudo group for system operations
- **Project Ownership**: All project files owned by deployment user

### How It Works

#### When Running as Root:
```bash
sudo sh setup-postgres-ubuntu.sh
# OR
sudo ./setup-postgres-ubuntu.sh
```

The script will:
1. ✅ Create deployment user `vx10deploy` if it doesn't exist
2. ✅ Set project ownership to deployment user
3. ✅ Run application commands as deployment user
4. ✅ Run system commands as root
5. ✅ Maintain proper security separation

#### When Running as Regular User:
```bash
./setup-postgres-ubuntu.sh
```

The script will:
1. ✅ Use your current user for application operations
2. ✅ Use sudo for system operations
3. ✅ Maintain existing behavior

## 🚀 Usage Examples

### Root Execution (Server Environment)
```bash
# Make executable
chmod +x setup-postgres-ubuntu.sh

# Run as root
sudo sh setup-postgres-ubuntu.sh

# The script will create vx10deploy user and handle everything
```

### Regular User Execution (Development Environment)
```bash
# Make executable
chmod +x setup-postgres-ubuntu.sh

# Run as regular user with sudo privileges
./setup-postgres-ubuntu.sh
```

## 🔧 Technical Details

### User Context Functions

#### `check_user_context()`
- Detects if running as root
- Creates deployment user if needed
- Sets up proper ownership and permissions
- Configures user context variables

#### `execute_with_user()`
- Runs application commands as appropriate user
- Uses `su` for root execution
- Uses direct execution for regular users

#### `execute_sudo()`
- Runs system commands with proper privileges
- Direct execution when root
- Uses `sudo` for regular users

### Security Considerations

#### Root Execution Benefits:
- ✅ No sudo password prompts
- ✅ Proper system service management
- ✅ Clean deployment user creation
- ✅ Consistent server environment setup

#### Security Measures:
- ✅ Separate deployment user for application operations
- ✅ Proper file ownership and permissions
- ✅ Limited privileges for application user
- ✅ System operations only when necessary

## 📋 Post-Setup Information

### When Run as Root:
- **Application User**: `vx10deploy`
- **Application Directory**: Owned by `vx10deploy:vx10deploy`
- **Database User**: `vx10user` (unchanged)
- **System Services**: Managed by root

### Login as Deployment User:
```bash
# Switch to deployment user
su - vx10deploy

# Or run commands as deployment user
sudo -u vx10deploy bash

# Start application
cd /path/to/project
npm run dev
```

### Change Deployment User Password:
```bash
# As root
passwd vx10deploy

# Or as deployment user
sudo passwd vx10deploy
```

## 🔍 Verification

### Check User Creation:
```bash
# Verify deployment user exists
id vx10deploy

# Check user groups
groups vx10deploy

# Check home directory
ls -la /home/vx10deploy
```

### Check Project Ownership:
```bash
# Check project directory ownership
ls -la /var/www/din-trafikskola-hlm/

# Should show: vx10deploy vx10deploy
```

### Test Application Access:
```bash
# Switch to deployment user
su - vx10deploy

# Navigate to project
cd /var/www/din-trafikskola-hlm

# Test npm commands
npm run prisma:studio
```

## 🛠️ Troubleshooting

### Permission Issues:
```bash
# Fix ownership if needed
sudo chown -R vx10deploy:vx10deploy /var/www/din-trafikskola-hlm

# Fix permissions
sudo chmod 755 /var/www/din-trafikskola-hlm
sudo chmod 644 /var/www/din-trafikskola-hlm/.env
```

### User Issues:
```bash
# Recreate deployment user if needed
sudo userdel -r vx10deploy
sudo useradd -m -s /bin/bash vx10deploy
sudo usermod -aG sudo vx10deploy
sudo passwd vx10deploy
```

### Database Access:
```bash
# Test database connection as deployment user
sudo -u vx10deploy bash -c "PGPASSWORD='vx10password' psql -h localhost -U vx10user -d vx10_db -c 'SELECT 1;'"
```

## 📝 Best Practices

### Production Deployment:
1. **Change default passwords** immediately after setup
2. **Use strong passwords** for deployment user
3. **Configure SSH keys** for deployment user
4. **Disable password authentication** for SSH
5. **Regular security updates**

### Development Environment:
1. **Use regular user execution** when possible
2. **Keep deployment user** for testing production scenarios
3. **Regular backups** of database and configuration

## 🎯 Summary

The updated script provides flexible execution options:

- ✅ **Root execution**: Perfect for server deployments
- ✅ **Regular user execution**: Great for development
- ✅ **Security maintained**: Proper user separation
- ✅ **Automatic setup**: No manual user creation needed
- ✅ **Backward compatible**: Existing workflows unchanged

Choose the execution method that best fits your environment and security requirements!
