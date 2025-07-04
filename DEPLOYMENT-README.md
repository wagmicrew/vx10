# VX10 Deployment Scripts

This repository contains two powerful scripts for deploying and managing the VX10 Next.js application on Ubuntu servers.

## 📦 Scripts Overview

### 1. `deploy-vx10.sh` - Deployment Script
Automated deployment script that handles complete setup from scratch.

### 2. `vx10-admin.sh` - Admin Management Script  
Comprehensive admin panel for ongoing management and maintenance.

## 🚀 Quick Start

### Initial Deployment

1. **Download the deployment script:**
   ```bash
   wget https://raw.githubusercontent.com/wagmicrew/vx10/master/deploy-vx10.sh
   chmod +x deploy-vx10.sh
   ```

2. **Run the deployment:**
   ```bash
   ./deploy-vx10.sh
   ```

3. **Follow the prompts:**
   - Enter your domain name (e.g., `vx10.example.com`)
   - Installation directory (default: `/var/www/vx10`)
   - GitHub repository URL (default: `https://github.com/wagmicrew/vx10.git`)
   - Branch to deploy (default: `master`)

### Admin Management

1. **Download the admin script:**
   ```bash
   wget https://raw.githubusercontent.com/wagmicrew/vx10/master/vx10-admin.sh
   chmod +x vx10-admin.sh
   ```

2. **Run the admin panel:**
   ```bash
   ./vx10-admin.sh
   ```

## 🔧 What the Deployment Script Does

### ✅ Prerequisites Check
- Checks for sudo privileges
- Updates Ubuntu packages
- Installs required dependencies

### 🔐 Security Setup
- Generates SSH keys for GitHub
- Configures firewall (UFW)
- Sets up secure Nginx configuration

### 📦 Software Installation
- **Node.js** (Latest LTS)
- **PM2** (Process Manager)
- **Nginx** (Web Server)
- **Let's Encrypt** (SSL Certificates)

### 🌐 Web Server Configuration
- Creates Nginx virtual host
- Configures reverse proxy to Node.js
- Sets up automatic SSL with Let's Encrypt
- Redirects HTTP to HTTPS

### 🚀 Application Deployment
- Clones repository from GitHub
- Installs npm dependencies
- Builds the Next.js application
- Configures PM2 ecosystem
- Starts the application

### 🧪 Testing & Validation
- Tests HTTP connectivity
- Tests HTTPS connectivity
- Verifies SSL certificate
- Ensures PM2 process is running

## 🛠️ Admin Panel Features

### 📊 GitHub Management
- **Pull latest changes** - Quick sync with repository
- **Pull and build** - Update code and rebuild application
- **Stash and pull** - Safely update with local changes
- **Branch management** - Switch branches, create new ones
- **Git status & logs** - Monitor repository state

### ⚡ PM2 Process Management
- **Status monitoring** - View all process states
- **Restart/Stop/Start** - Control individual or all processes
- **Log viewing** - Real-time and historical logs
- **Process monitoring** - Live performance metrics
- **Memory/CPU tracking** - Resource usage monitoring

### 📦 Node.js Management
- **Dependency management** - Install, update, audit packages
- **Cache management** - Clean npm cache and node_modules
- **Build operations** - Rebuild application
- **Version checking** - Node.js and npm versions
- **Security audits** - Vulnerability scanning

### 🗄️ Redis Management
- **Installation** - Automated Redis setup
- **Service control** - Start/stop/restart Redis
- **Configuration** - View and modify settings
- **Data management** - Flush cache, view statistics
- **CLI access** - Direct Redis command line

### 📝 Log Viewer
- **PM2 logs** - Application process logs
- **Nginx logs** - Web server access/error logs
- **System logs** - Ubuntu system logs
- **Real-time monitoring** - Live log streaming
- **Log search** - Find specific events
- **Log management** - Clear old logs

### 📊 System Information
- **Resource usage** - CPU, memory, disk
- **Network status** - IP addresses, connectivity
- **Service status** - All running services
- **Version information** - Software versions

## 🎯 Common Use Cases

### Daily Operations
```bash
# Quick deployment update
./vx10-admin.sh
# Select: 1) GitHub Management → 2) Pull and build
```

### Troubleshooting
```bash
# Check logs for errors
./vx10-admin.sh
# Select: 5) Log Viewer → 1) PM2 logs
```

### Performance Monitoring
```bash
# Monitor system resources
./vx10-admin.sh
# Select: 6) System Info
```

### Emergency Restart
```bash
# Restart all services
./vx10-admin.sh
# Select: 2) PM2 Management → 2) Restart all processes
```

## 🔒 Security Features

- **SSH Key Authentication** - Secure GitHub access
- **SSL/TLS Encryption** - Let's Encrypt certificates
- **Firewall Configuration** - UFW security rules
- **Process Isolation** - PM2 user-level processes
- **Log Security** - Proper file permissions

## 📋 Prerequisites

### System Requirements
- **Ubuntu 20.04+** (tested on 20.04, 22.04)
- **2GB RAM minimum** (4GB recommended)
- **10GB disk space** minimum
- **Domain name** pointing to server IP
- **Sudo privileges** on the server

### Network Requirements
- **Port 80** (HTTP) - for Let's Encrypt validation
- **Port 443** (HTTPS) - for web traffic
- **Port 22** (SSH) - for administration

## 🆘 Troubleshooting

### Common Issues

#### 1. Domain Not Pointing to Server
```bash
# Check DNS resolution
nslookup yourdomain.com
```

#### 2. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates
```

#### 3. Application Not Starting
```bash
# Check PM2 logs
pm2 logs
# Check application directory
ls -la /var/www/vx10
```

#### 4. Nginx Configuration Issues
```bash
# Test Nginx configuration
sudo nginx -t
# Check Nginx status
sudo systemctl status nginx
```

### Getting Help

1. **Check logs** using the admin panel
2. **View system status** for service health
3. **Review configuration files** in `/etc/nginx/sites-available/`
4. **Verify PM2 processes** with `pm2 status`

## 🔄 Updates & Maintenance

### Regular Updates
Run the admin script weekly to:
- Pull latest code changes
- Update dependencies
- Monitor system resources
- Review logs for issues

### Security Updates
- Ubuntu packages: `sudo apt update && sudo apt upgrade`
- Node.js dependencies: Use admin panel → Node.js Management
- SSL certificates: Auto-renewed by Let's Encrypt

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs via admin panel
3. Verify system requirements are met
4. Contact the development team with specific error messages

---

**VX10 Deployment System** - Automated, secure, and scalable Next.js deployment for Ubuntu servers.
