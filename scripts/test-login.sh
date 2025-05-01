#!/bin/bash

# Color codes for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL for API calls
BASE_URL="http://localhost:3000"

echo -e "${YELLOW}Starting login flow test with test@example.com / password123...${NC}"

# Step 1: Get CSRF token
echo -e "\n${YELLOW}Step 1: Getting CSRF token...${NC}"
CSRF_RESPONSE=$(curl -s -c cookies.txt -H "Accept: application/json" "$BASE_URL/api/auth/csrf")

if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Failed to get CSRF token${NC}"
  exit 1
fi

# Extract CSRF token from response
CSRF_TOKEN=$(echo $CSRF_RESPONSE | grep -o '"csrfToken":"[^"]*"' | sed 's/"csrfToken":"//;s/"//')

if [ -z "$CSRF_TOKEN" ]; then
  echo -e "${RED}Error: Could not extract CSRF token from response:${NC}"
  echo $CSRF_RESPONSE
  exit 1
fi

echo -e "${GREEN}Successfully got CSRF token: $CSRF_TOKEN${NC}"
echo -e "${YELLOW}Cookies stored in cookies.txt${NC}"

# Step 2: Attempt login
echo -e "\n${YELLOW}Step 2: Attempting login...${NC}"
LOGIN_RESPONSE=$(curl -s -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -d '{"email":"test@example.com","password":"password123"}' \
  "$BASE_URL/api/auth/login")

# Check if login was successful
if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}Login successful!${NC}"
  echo $LOGIN_RESPONSE
else
  echo -e "${RED}Login failed:${NC}"
  echo $LOGIN_RESPONSE
fi

# Step 3: Verify login by calling /api/auth/me
echo -e "\n${YELLOW}Step 3: Verifying login by fetching user info...${NC}"
USER_RESPONSE=$(curl -s -b cookies.txt \
  -H "Accept: application/json" \
  "$BASE_URL/api/auth/me")

# Check if we got user info
if echo "$USER_RESPONSE" | grep -q '"id":'; then
  echo -e "${GREEN}Successfully verified login:${NC}"
  echo $USER_RESPONSE
else
  echo -e "${RED}Failed to verify login:${NC}"
  echo $USER_RESPONSE
fi

# Clean up cookie file
rm -f cookies.txt

echo -e "\n${YELLOW}Test completed.${NC}" 