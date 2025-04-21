#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Netlify deployment process...${NC}"

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null
then
    echo -e "${YELLOW}Netlify CLI not found. Installing...${NC}"
    npm install -g netlify-cli
fi

# Clean and build
echo -e "${YELLOW}Cleaning previous builds...${NC}"
rm -rf .next
rm -rf node_modules/.cache

# Run the build script
echo -e "${YELLOW}Building project for Netlify...${NC}"
node build-for-netlify.js

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Build successful!${NC}"
    
    # Login to Netlify if needed
    netlify status &> /dev/null || netlify login
    
    # Deploy to Netlify
    echo -e "${YELLOW}Deploying to Netlify...${NC}"
    netlify deploy --prod
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Deployment successful!${NC}"
        echo -e "${GREEN}Your site is now live on Netlify!${NC}"
    else
        echo -e "${RED}Deployment failed.${NC}"
        exit 1
    fi
else
    echo -e "${RED}Build failed. Please check the logs above.${NC}"
    exit 1
fi 