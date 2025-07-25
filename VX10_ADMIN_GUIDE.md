# VX10 Admin Script Guide

## Overview

The `vx10-admin.sh` script is a comprehensive administration tool for managing the Din Trafikskola HLM deployment on Ubuntu servers. It must be run with sudo privileges and provides a user-friendly menu interface for common deployment tasks.

## Requirements

- Ubuntu Server (18.04 or later)
- sudo privileges
- Git, Node.js, NPM installed
- PM2 (will be installed if missing)
- Nginx (optional, for web server management)
- PostgreSQL (optional, for database management)

## Usage

### Starting the Admin Panel

```bash
sudo ./vx10-admin.sh
```

The script MUST be run with sudo. It will automatically detect the user who called sudo and execute commands as that user when appropriate.

## Main Features

### 1. GitHub Operations
- **Pull latest changes**: Updates code from the repository
- **Show git status**: Displays current git status
- **Show recent commits**: Shows last 10 commits
- **Switch branch**: Change to a different git branch
- **Create new branch**: Create and switch to a new branch
- **Push changes**: Push local commits to remote

### 2. Node.js Management
- **Install dependencies**: Runs `npm install`
- **Build production**: Creates production build with `npm run build`
- **Build development**: Creates development build
- **Start development server**: Runs `npm run dev` (Ctrl+C to stop)
- **Run tests**: Executes test suite
- **Clear cache**: Removes Next.js cache and clears NPM cache
- **Fix permissions**: Repairs file/directory permissions

### 3. PM2 Process Management
- **Show status**: Display PM2 process status
- **Start application**: Start the application with PM2
- **Stop application**: Stop all PM2 processes
- **Restart application**: Restart all PM2 processes
- **View logs**: Stream PM2 logs (Ctrl+C to exit)
- **Save configuration**: Save PM2 config and enable startup

### 4. Nginx Web Server
- **Show status**: Display Nginx service status
- **Start/Stop/Restart**: Control Nginx service
- **Reload configuration**: Reload config without downtime
- **Test configuration**: Validate Nginx configuration
- **Edit site configuration**: Edit site config with nano
- **View logs**: Display recent error and access logs

### 5. Utilities & Deployment

#### Update Deployment (Key Feature)
This function updates the live production site with code from your current directory:

1. **Confirms** the source (current directory) and target (/var/www/din-trafikskola-hlm)
2. **Stops** the current PM2 processes
3. **Backs up** environment files and uploads
4. **Syncs** code using rsync (excludes .git, node_modules, .next, logs, uploads, .env files)
5. **Preserves** existing .env files in production
6. **Fixes** ownership and permissions
7. **Installs** production dependencies
8. **Builds** the application
9. **Runs** database migrations (if Prisma is used)
10. **Creates/Updates** Nginx configuration
11. **Starts** the application with PM2
12. **Configures** PM2 to start on boot

Other utilities include:
- **View system information**: OS, CPU, memory, disk info
- **Check disk usage**: Display disk space usage
- **Search logs**: Search PM2 and Nginx logs
- **Create database backup**: Backup PostgreSQL database

## Menu Navigation

The script uses a clean, formatted menu system:

```
╔════════════════════════════════════════════╗
║ Din Trafikskola HLM Admin Panel            ║
╚════════════════════════════════════════════╝

Current directory: /home/user/vx10-project
Deploy user: user

1) GitHub Operations
2) Node.js Management
3) PM2 Process Management
4) Nginx Web Server
5) Utilities & Deployment
6) Exit

Select option [1-6]: 
```

## Important Notes

1. **Sudo Required**: Always run with `sudo ./vx10-admin.sh`
2. **User Context**: Commands are executed as the sudo user, not root
3. **Git Safety**: Automatically fixes git ownership issues
4. **Permissions**: Automatically sets correct permissions for web deployment
5. **Current Directory**: Most operations use the directory where the script is run

## Deployment Workflow

To deploy updates from development to production:

1. Navigate to your development directory
2. Run `sudo ./vx10-admin.sh`
3. Choose option 5 (Utilities & Deployment)
4. Choose option 1 (Update deployment from current directory)
5. Confirm when prompted
6. Wait for the deployment to complete

## Troubleshooting

### Permission Denied
- Ensure you're running with sudo
- Use Node.js Management > Fix permissions

### Git Issues
- The script automatically fixes git ownership
- Safe directory is automatically configured

### PM2 Not Found
- Install globally: `sudo npm install -g pm2`
- Or as user: `npm install -g pm2`

### Build Failures
- Check Node.js version compatibility
- Ensure all dependencies are installed
- Check .env configuration

## Default Paths

- **Production Directory**: `/var/www/din-trafikskola-hlm`
- **Nginx Config**: `/etc/nginx/sites-available/din-trafikskola-hlm`
- **Backup Directory**: `/var/backups/`
- **PM2 Logs**: `~/.pm2/logs/`

## Security

- The script preserves environment files during deployment
- Backups are created before updates
- Proper file permissions are maintained (user:www-data)
- Nginx configuration includes security headers
