#!/bin/bash

# VX10 Deployment Script for Ubuntu
# Author: VX10 Team
# Description: Automated deployment script for Next.js application with Nginx, PM2, and SSL

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if running as root and setup user context
check_root() {
    if [[ $EUID -eq 0 ]]; then
        warning "Running as root. Will create/use 'vx10' user for deployment."
        
        # Create vx10 user if it doesn't exist
        if ! id "vx10" &>/dev/null; then
            log "Creating vx10 user..."
            useradd -m -s /bin/bash vx10
            usermod -aG sudo vx10
        fi
        
        DEPLOY_USER="vx10"
        DEPLOY_HOME="/home/vx10"
        IS_ROOT=true
        
        # Ensure the user has proper permissions
        mkdir -p /var/www
        chown vx10:vx10 /var/www
    else
        DEPLOY_USER="$USER"
        DEPLOY_HOME="$HOME"
        IS_ROOT=false
    fi
    
    log "Deploy user: $DEPLOY_USER"
    log "Deploy home: $DEPLOY_HOME"
}

# Function to prompt for input with default value
prompt_input() {
    local prompt_text="$1"
    local default_value="$2"
    local var_name="$3"
    
    if [[ -n "$default_value" ]]; then
        read -p "$prompt_text [$default_value]: " input
        if [[ -z "$input" ]]; then
            input="$default_value"
        fi
    else
        read -p "$prompt_text: " input
        while [[ -z "$input" ]]; do
            echo "This field is required."
            read -p "$prompt_text: " input
        done
    fi
    
    eval "$var_name='$input'"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js and npm
install_nodejs() {
    if ! command_exists node; then
        log "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        log "Node.js is already installed: $(node --version)"
    fi
}

# Function to install PM2
install_pm2() {
    if ! command_exists pm2; then
        log "Installing PM2..."
        if [[ $IS_ROOT == true ]]; then
            npm install -g pm2
        else
            sudo npm install -g pm2
        fi
        
        # Setup PM2 startup for the appropriate user
        if [[ $IS_ROOT == true ]]; then
            runuser -l "$DEPLOY_USER" -c "pm2 startup" || true
            env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u "$DEPLOY_USER" --hp "$DEPLOY_HOME"
        else
            pm2 startup
            sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u "$DEPLOY_USER" --hp "$DEPLOY_HOME"
        fi
    else
        log "PM2 is already installed: $(pm2 --version)"
        warning "Clearing all PM2 processes..."
        if [[ $IS_ROOT == true ]]; then
            runuser -l "$DEPLOY_USER" -c "pm2 delete all" || true
            runuser -l "$DEPLOY_USER" -c "pm2 save"
        else
            pm2 delete all || true
            pm2 save
        fi
    fi
}

# Function to check and install Nginx
install_nginx() {
    if ! command_exists nginx; then
        log "Installing Nginx..."
        sudo apt-get update
        sudo apt-get install -y nginx
        sudo systemctl enable nginx
        sudo systemctl start nginx
    else
        log "Nginx is already installed: $(nginx -v 2>&1 | head -1)"
    fi
}

# Function to setup SSH key for GitHub
setup_github_ssh() {
    local ssh_dir="$DEPLOY_HOME/.ssh"
    local ssh_key_path="$ssh_dir/id_rsa"
    
    # Create SSH directory for deploy user
    if [[ $IS_ROOT == true ]]; then
        mkdir -p "$ssh_dir"
        chown "$DEPLOY_USER:$DEPLOY_USER" "$ssh_dir"
        chmod 700 "$ssh_dir"
    else
        mkdir -p "$ssh_dir"
        chmod 700 "$ssh_dir"
    fi
    
    if [[ ! -f "$ssh_key_path" ]]; then
        log "Generating SSH key for GitHub..."
        
        if [[ $IS_ROOT == true ]]; then
            runuser -l "$DEPLOY_USER" -c "ssh-keygen -t rsa -b 4096 -C '$DEPLOY_USER@$(hostname)' -f '$ssh_key_path' -N ''"
        else
            ssh-keygen -t rsa -b 4096 -C "$(whoami)@$(hostname)" -f "$ssh_key_path" -N ""
        fi
        
        # Set proper ownership
        if [[ $IS_ROOT == true ]]; then
            chown "$DEPLOY_USER:$DEPLOY_USER" "$ssh_key_path" "$ssh_key_path.pub"
            chmod 600 "$ssh_key_path"
            chmod 644 "$ssh_key_path.pub"
        fi
        
        echo
        warning "SSH key generated. Please add the following public key to your GitHub account:"
        echo "GitHub Settings > SSH and GPG keys > New SSH key"
        echo
        cat "$ssh_key_path.pub"
        echo
        read -p "Press Enter after adding the SSH key to GitHub..."
        
        # Test SSH connection
        if [[ $IS_ROOT == true ]]; then
            runuser -l "$DEPLOY_USER" -c "ssh -o StrictHostKeyChecking=no -T git@github.com" || true
        else
            ssh -o StrictHostKeyChecking=no -T git@github.com || true
        fi
    else
        log "SSH key already exists, testing connection..."
        if [[ $IS_ROOT == true ]]; then
            runuser -l "$DEPLOY_USER" -c "ssh -o StrictHostKeyChecking=no -T git@github.com" || true
        else
            ssh -o StrictHostKeyChecking=no -T git@github.com || true
        fi
    fi
}

# Function to create or update Nginx site configuration
setup_nginx_site() {
    local domain="$1"
    local install_dir="$2"
    local site_config="/etc/nginx/sites-available/$domain"
    local site_enabled="/etc/nginx/sites-enabled/$domain"
    
    log "Setting up Nginx configuration for $domain..."
    
    # Remove default site if it exists
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Create site configuration
    sudo tee "$site_config" > /dev/null <<EOF
server {
    listen 80;
    server_name $domain;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    # Enable site
    sudo ln -sf "$site_config" "$site_enabled"
    
    # Test and reload Nginx
    sudo nginx -t
    sudo systemctl reload nginx
    
    log "Nginx configuration updated for $domain"
}

# Function to setup SSL with Let's Encrypt
setup_ssl() {
    local domain="$1"
    
    log "Setting up SSL certificate for $domain..."
    
    # Install certbot
    if ! command_exists certbot; then
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Obtain SSL certificate
    sudo certbot --nginx -d "$domain" --non-interactive --agree-tos --email "admin@$domain"
    
    # Test renewal
    sudo certbot renew --dry-run
    
    log "SSL certificate installed for $domain"
}

# Function to clone and setup project
setup_project() {
    local github_url="$1"
    local branch="$2"
    local install_dir="$3"
    
    log "Setting up project from $github_url (branch: $branch)..."
    
    # Create installation directory
    if [[ $IS_ROOT == true ]]; then
        mkdir -p "$install_dir"
        chown "$DEPLOY_USER:$DEPLOY_USER" "$install_dir"
    else
        sudo mkdir -p "$install_dir"
        sudo chown "$DEPLOY_USER:$DEPLOY_USER" "$install_dir"
    fi
    
    # Clone or update repository
    if [[ -d "$install_dir/.git" ]]; then
        log "Repository exists, updating..."
        if [[ $IS_ROOT == true ]]; then
            runuser -l "$DEPLOY_USER" -c "cd '$install_dir' && git fetch origin && git checkout '$branch' && git pull origin '$branch'"
        else
            cd "$install_dir"
            git fetch origin
            git checkout "$branch"
            git pull origin "$branch"
        fi
    else
        log "Cloning repository..."
        if [[ $IS_ROOT == true ]]; then
            runuser -l "$DEPLOY_USER" -c "git clone -b '$branch' '$github_url' '$install_dir'"
            chown -R "$DEPLOY_USER:$DEPLOY_USER" "$install_dir"
        else
            git clone -b "$branch" "$github_url" "$install_dir"
            cd "$install_dir"
        fi
    fi
    
    # Install dependencies and build
    if [[ $IS_ROOT == true ]]; then
        log "Installing dependencies..."
        runuser -l "$DEPLOY_USER" -c "cd '$install_dir' && npm ci"
        
        log "Building project..."
        runuser -l "$DEPLOY_USER" -c "cd '$install_dir' && npm run build"
    else
        cd "$install_dir"
        log "Installing dependencies..."
        npm ci
        
        log "Building project..."
        npm run build
    fi
    
    log "Project setup completed in $install_dir"
}

# Function to setup PM2 process
setup_pm2_process() {
    local domain="$1"
    local install_dir="$2"
    
    log "Setting up PM2 process for $domain..."
    
    # Create PM2 ecosystem file
    if [[ $IS_ROOT == true ]]; then
        cat > "$install_dir/ecosystem.config.js" <<EOF
module.exports = {
  apps: [{
    name: '$domain',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF
        chown "$DEPLOY_USER:$DEPLOY_USER" "$install_dir/ecosystem.config.js"
        
        # Start PM2 process as deploy user
        runuser -l "$DEPLOY_USER" -c "cd '$install_dir' && pm2 start ecosystem.config.js"
        runuser -l "$DEPLOY_USER" -c "pm2 save"
    else
        cd "$install_dir"
        cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: '$domain',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF
        # Start PM2 process
        pm2 start ecosystem.config.js
        pm2 save
    fi
    
    log "PM2 process started for $domain"
}

# Function to test site availability
test_site() {
    local url="$1"
    local max_attempts=10
    local attempt=1
    
    log "Testing site availability: $url"
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
            log "Site is responding correctly!"
            return 0
        else
            warning "Attempt $attempt/$max_attempts failed, retrying in 5 seconds..."
            sleep 5
            ((attempt++))
        fi
    done
    
    error "Site is not responding after $max_attempts attempts"
    return 1
}

# Main deployment function
main() {
    log "Starting VX10 deployment script..."
    
    # Check prerequisites
    check_root
    
    # Gather user input
    echo
    info "Please provide the following information:"
    prompt_input "Domain name" "" DOMAIN
    prompt_input "Installation directory" "/var/www/vx10" INSTALL_DIR
    prompt_input "GitHub repository URL" "https://github.com/wagmicrew/vx10.git" GITHUB_URL
    prompt_input "Branch to deploy" "master" BRANCH
    
    # Convert HTTPS URL to SSH if needed
    if [[ "$GITHUB_URL" == https://github.com/* ]]; then
        SSH_URL=$(echo "$GITHUB_URL" | sed 's/https:\/\/github.com\//git@github.com:/')
        if [[ "$SSH_URL" != *.git ]]; then
            SSH_URL="${SSH_URL}.git"
        fi
        GITHUB_URL="$SSH_URL"
    fi
    
    echo
    log "Configuration:"
    log "Domain: $DOMAIN"
    log "Install Directory: $INSTALL_DIR"
    log "GitHub URL: $GITHUB_URL"
    log "Branch: $BRANCH"
    echo
    
    read -p "Continue with deployment? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        log "Deployment cancelled."
        exit 0
    fi
    
    # Update system
    log "Updating system packages..."
    sudo apt-get update
    sudo apt-get upgrade -y
    
    # Install required packages
    sudo apt-get install -y curl git ufw
    
    # Install Node.js, PM2, and Nginx
    install_nodejs
    install_pm2
    install_nginx
    
    # Setup GitHub SSH
    setup_github_ssh
    
    # Setup Nginx site
    setup_nginx_site "$DOMAIN" "$INSTALL_DIR"
    
    # Setup project
    setup_project "$GITHUB_URL" "$BRANCH" "$INSTALL_DIR"
    
    # Setup PM2 process
    setup_pm2_process "$DOMAIN" "$INSTALL_DIR"
    
    # Test HTTP site
    if test_site "http://$DOMAIN"; then
        log "HTTP site is working!"
        
        # Setup SSL
        setup_ssl "$DOMAIN"
        
        # Test HTTPS site
        if test_site "https://$DOMAIN"; then
            log "HTTPS site is working!"
            
            # Restart PM2 to ensure everything is working
            if [[ $IS_ROOT == true ]]; then
                runuser -l "$DEPLOY_USER" -c "pm2 restart '$DOMAIN'"
                runuser -l "$DEPLOY_USER" -c "pm2 save"
            else
                pm2 restart "$DOMAIN"
                pm2 save
            fi
            
            echo
            log "🎉 Deployment completed successfully!"
            log "Your site is available at: https://$DOMAIN"
            log "PM2 process name: $DOMAIN"
            log "Installation directory: $INSTALL_DIR"
            echo
            info "Useful commands:"
            info "  Check PM2 status: pm2 status"
            info "  View logs: pm2 logs $DOMAIN"
            info "  Restart app: pm2 restart $DOMAIN"
            info "  Check Nginx status: sudo systemctl status nginx"
            
        else
            error "HTTPS test failed. Please check SSL configuration."
            exit 1
        fi
    else
        error "HTTP test failed. Please check the configuration."
        exit 1
    fi
}

# Run main function
main "$@"
