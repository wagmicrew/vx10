#!/bin/bash

# Integration snippet for vx10-admin.sh
# Add this code to your vx10-admin.sh script

# Migration detection and auto-trigger function
check_and_trigger_migration() {
    local current_dir=$(pwd)
    local script_dir=$(dirname "$(readlink -f "$0")")
    local migration_script="./migrate-to-trafikskola.sh"
    
    # Check if we're in a VX10 directory structure
    local is_vx10_context=false
    
    # Method 1: Check if current directory contains "vx10"
    if [[ "$current_dir" == *"vx10"* ]]; then
        is_vx10_context=true
    fi
    
    # Method 2: Check if default project directory exists
    if [[ -d "/var/www/vx10" ]]; then
        is_vx10_context=true
    fi
    
    # Method 3: Check if we're running from within a VX10 project
    if [[ -f "package.json" ]] && grep -q "vx10" package.json 2>/dev/null; then
        is_vx10_context=true
    fi
    
    # Method 4: Check if VX10 nginx config exists
    if [[ -f "/etc/nginx/sites-available/vx10" ]]; then
        is_vx10_context=true
    fi
    
    # If VX10 context detected, offer migration
    if [[ "$is_vx10_context" == true ]]; then
        echo
        echo -e "${YELLOW}╔══════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║                    VX10 INSTALLATION DETECTED                    ║${NC}"
        echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════════╝${NC}"
        echo
        echo -e "${CYAN}It looks like you're running this script from a VX10 installation.${NC}"
        echo -e "${CYAN}Would you like to migrate to the new Din Trafikskola HLM setup?${NC}"
        echo
        echo -e "${GREEN}This migration will:${NC}"
        echo -e "  • Copy your current VX10 installation to the new structure"
        echo -e "  • Update all configuration files and references"
        echo -e "  • Create new user account and database"
        echo -e "  • Update nginx configuration"
        echo -e "  • Restart services with new settings"
        echo -e "  • Create a backup of your current setup"
        echo
        
        while true; do
            read -p "$(echo -e ${YELLOW}Do you want to proceed with migration? [y/N]: ${NC})" migrate_choice
            case $migrate_choice in
                [Yy]* )
                    echo
                    echo -e "${GREEN}Starting migration process...${NC}"
                    
                    # Check if migration script exists
                    if [[ ! -f "$migration_script" ]]; then
                        echo -e "${RED}Error: Migration script not found at $migration_script${NC}"
                        echo -e "${YELLOW}Please ensure migrate-to-trafikskola.sh is in the same directory as this script.${NC}"
                        echo
                        read -p "Press Enter to continue with regular admin menu..."
                        return
                    fi
                    
                    # Make migration script executable
                    chmod +x "$migration_script"
                    
                    # Run migration script
                    if sudo "$migration_script"; then
                        echo
                        echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
                        echo -e "${GREEN}║                     MIGRATION COMPLETED!                         ║${NC}"
                        echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
                        echo
                        echo -e "${CYAN}Your VX10 installation has been successfully migrated to Din Trafikskola HLM.${NC}"
                        echo -e "${CYAN}The new installation is located at: /var/www/din-trafikskola-hlm${NC}"
                        echo
                        echo -e "${YELLOW}Next steps:${NC}"
                        echo -e "  1. Verify the new installation is working correctly"
                        echo -e "  2. Update any external references (DNS, monitoring, etc.)"
                        echo -e "  3. Update deployment scripts or CI/CD pipelines"
                        echo -e "  4. Consider running this admin script from the new location"
                        echo
                        
                        read -p "Would you like to switch to the new installation directory? [y/N]: " switch_dir
                        if [[ "$switch_dir" =~ ^[Yy]$ ]]; then
                            cd "/var/www/din-trafikskola-hlm"
                            echo -e "${GREEN}Switched to new installation directory: $(pwd)${NC}"
                            echo
                            # Update PROJECT_DIR for the rest of the script
                            PROJECT_DIR="/var/www/din-trafikskola-hlm"
                            DEPLOY_USER="trafikskola"
                        fi
                    else
                        echo
                        echo -e "${RED}Migration failed or was cancelled.${NC}"
                        echo -e "${YELLOW}Continuing with regular VX10 admin menu...${NC}"
                        echo
                    fi
                    break
                    ;;
                [Nn]* | "" )
                    echo
                    echo -e "${YELLOW}Migration skipped. Continuing with VX10 admin menu...${NC}"
                    echo
                    break
                    ;;
                * )
                    echo -e "${RED}Please answer yes (y) or no (n).${NC}"
                    ;;
            esac
        done
    fi
}

# Modified main function integration
# Add this code at the beginning of your main() function in vx10-admin.sh

main() {
    # Check for migration first (before showing main menu)
    check_and_trigger_migration
    
    # Rest of your existing main() function code goes here...
    while true; do
        clear
        show_header
        show_main_menu
        
        # ... rest of your existing main menu logic
    done
}

# Alternative: Add migration option to existing menu
# If you prefer to add migration as a menu option instead of auto-detection,
# add this to your show_main_menu() function:

show_main_menu_with_migration() {
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                        VX10 ADMIN MENU                           ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo
    echo -e "${GREEN}[0]${NC} Migrate to Din Trafikskola HLM"
    echo -e "${GREEN}[1]${NC} Node.js Management"
    echo -e "${GREEN}[2]${NC} GitHub Management"
    echo -e "${GREEN}[3]${NC} PM2 Process Management"
    echo -e "${GREEN}[4]${NC} Nginx Management"
    echo -e "${GREEN}[5]${NC} Database Management"
    echo -e "${GREEN}[6]${NC} Utilities"
    echo -e "${GREEN}[7]${NC} System Information"
    echo -e "${GREEN}[q]${NC} Quit"
    echo
}

# And add this case to your main menu switch statement:
handle_migration_menu_option() {
    case $choice in
        0)
            echo
            echo -e "${CYAN}Starting migration to Din Trafikskola HLM...${NC}"
            if [[ -f "./migrate-to-trafikskola.sh" ]]; then
                chmod +x "./migrate-to-trafikskola.sh"
                sudo "./migrate-to-trafikskola.sh"
            else
                echo -e "${RED}Error: Migration script not found.${NC}"
                echo -e "${YELLOW}Please ensure migrate-to-trafikskola.sh is in the same directory.${NC}"
            fi
            pause
            ;;
        # ... rest of your existing menu options with numbers incremented by 1
    esac
}

# Helper function for creating migration script if missing
create_migration_script_if_missing() {
    local migration_script="./migrate-to-trafikskola.sh"
    
    if [[ ! -f "$migration_script" ]]; then
        echo -e "${YELLOW}Migration script not found. Would you like to download it? [y/N]: ${NC}"
        read -p "" download_choice
        
        if [[ "$download_choice" =~ ^[Yy]$ ]]; then
            echo -e "${CYAN}Creating migration script...${NC}"
            
            # Here you could download the script or create it inline
            # For now, we'll just show an error message
            echo -e "${RED}Please manually place the migrate-to-trafikskola.sh script in this directory.${NC}"
            return 1
        fi
        return 1
    fi
    return 0
}

# Example of how to modify your existing script's header
show_header_with_migration_notice() {
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                       VX10 ADMIN SCRIPT                          ║${NC}"
    echo -e "${GREEN}║                    Ubuntu Server Management                      ║${NC}"
    if [[ -d "/var/www/vx10" ]] || [[ "$PWD" == *"vx10"* ]]; then
        echo -e "${YELLOW}║                  Migration to HLM Available                     ║${NC}"
    fi
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo
    echo -e "${BLUE}Current Directory:${NC} $(pwd)"
    if [[ -n "$PROJECT_DIR" ]]; then
        echo -e "${BLUE}Project Directory:${NC} $PROJECT_DIR"
    fi
    echo -e "${BLUE}Deploy User:${NC} $DEPLOY_USER"
    echo -e "${BLUE}Date:${NC} $(date)"
    echo
}
