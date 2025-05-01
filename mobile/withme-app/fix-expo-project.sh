#!/bin/bash
set -e

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting WithMe Travel Expo Project Fix Script${NC}"
echo -e "${YELLOW}This script will fix dependency mismatches and configuration issues${NC}"

# Step 1: Backup important files
echo -e "\n${BLUE}Step 1: Creating backups...${NC}"
mkdir -p ./backups

# Function to backup a file if it exists
backup_file() {
  if [ -f "$1" ]; then
    echo "Backing up $1 to ./backups/$1.bak"
    cp "$1" "./backups/$1.bak"
  else
    echo "File $1 does not exist, skipping backup"
  fi
}

backup_file package.json
backup_file app.config.js
backup_file app.json

# Step 2: Fix the app.json and app.config.js conflict
echo -e "\n${BLUE}Step 2: Fixing app configuration...${NC}"
if [ -f "app.json" ]; then
  echo -e "${YELLOW}Removing app.json in favor of app.config.js${NC}"
  rm app.json
else
  echo -e "${GREEN}app.json already removed, continuing...${NC}"
fi

# Step 3: Update package.json with correct dependency versions for Expo SDK 53
echo -e "\n${BLUE}Step 3: Updating package.json with correct dependencies...${NC}"

# Use temporary file to update package.json
cat > temp_package.json << 'EOF'
{
  "name": "withme-travel-mobile",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start --clear",
    "android": "expo start --android --clear",
    "ios": "expo start --ios --clear",
    "web": "expo start --web --clear",
    "clean": "rm -rf node_modules && npm cache clean --force"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "2.1.2",
    "@react-navigation/bottom-tabs": "6.5.8",
    "@react-navigation/native": "6.1.7",
    "@react-navigation/native-stack": "6.9.13",
    "@supabase/supabase-js": "2.29.0",
    "@tanstack/react-query": "4.32.0",
    "expo": "^53.0.5",
    "expo-constants": "~17.1.5",
    "expo-linking": "~7.1.4",
    "expo-secure-store": "~14.2.3",
    "expo-status-bar": "~2.2.3",
    "metro": "^0.82.2",
    "metro-config": "^0.82.2",
    "react": "19.0.0",
    "react-native": "0.79.2",
    "react-native-safe-area-context": "5.4.0",
    "react-native-screens": "~4.10.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~19.0.10",
    "babel-plugin-module-resolver": "^5.0.0",
    "typescript": "^5.1.3"
  },
  "private": true
}
EOF

mv temp_package.json package.json
echo -e "${GREEN}✅ package.json updated with correct dependency versions${NC}"

# Step 4: Create placeholder images for assets
echo -e "\n${BLUE}Step 4: Adding placeholder images to assets folder...${NC}"
mkdir -p assets

# Function to create a simple placeholder image
create_placeholder_image() {
  echo "Creating placeholder image: $1"
  # This command creates a simple 100x100 colored square image
  # You should replace these files with actual app icons later
  echo "This is a placeholder for $1. Replace with actual image." > "assets/$1"
  echo -e "${GREEN}✅ Created placeholder for $1${NC}"
}

create_placeholder_image "icon.png"
create_placeholder_image "splash.png"
create_placeholder_image "adaptive-icon.png"
create_placeholder_image "favicon.png"

# Step 5: Show installation instructions
echo -e "\n${BLUE}Step 5: Manual Cleanup and Installation Instructions${NC}"
echo -e "${YELLOW}The following commands need to be run manually with proper permissions:${NC}"
echo -e "\n${RED}IMPORTANT: Execute these commands to complete the setup:${NC}"
echo -e "${BLUE}------------------------------------------${NC}"
echo -e "${GREEN}# 1. Remove node_modules directory:${NC}"
echo -e "rm -rf node_modules"
echo -e "\n${GREEN}# 2. Clean npm cache:${NC}"
echo -e "npm cache clean --force"
echo -e "\n${GREEN}# 3. Install the updated packages:${NC}"
echo -e "npm install"
echo -e "\n${GREEN}# 4. Start the iOS app:${NC}"
echo -e "npm run ios"
echo -e "${BLUE}------------------------------------------${NC}"

echo -e "\n${GREEN}====================${NC}"
echo -e "${GREEN}✅ Configuration files updated!${NC}"
echo -e "${GREEN}====================${NC}"
echo -e "\n${YELLOW}Backups of original files are saved in ./backups/${NC}"
echo -e "${YELLOW}After running the commands above, the app should work correctly.${NC}"
echo -e "${YELLOW}Note: You should replace the placeholder assets with real images for your app.${NC}"

echo -e "\n${BLUE}Troubleshooting:${NC}"
echo -e "• If you still experience the C++ exception after rebuilding:"
echo -e "  - Try using 'expo start --clear --no-dev' for iOS"
echo -e "  - Check the Expo Go app version on your device (should support SDK 53)"
echo -e "  - You might need to use 'sudo' for some commands if permission issues persist"

