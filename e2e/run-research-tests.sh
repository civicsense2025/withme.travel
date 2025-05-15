#!/bin/bash

# Run Research E2E Tests
# This script runs the user testing survey end-to-end tests

# Set colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Load .env.test file if it exists
if [ -f .env.test ]; then
  echo -e "${YELLOW}Loading environment variables from .env.test${NC}"
  export $(grep -v '^#' .env.test | xargs)
fi

echo -e "\n${BOLD}${YELLOW}=== WithMe.Travel Research Survey E2E Tests ===${NC}\n"

# Ensure we're in the project root
if [[ ! -d "e2e" ]]; then
  echo -e "${RED}Error: Must be run from project root${NC}"
  exit 1
fi

# Check for required environment variables
if [[ -z "$NEXT_PUBLIC_SUPABASE_URL" || -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
  echo -e "${RED}Error: Required environment variables not set.${NC}"
  echo -e "Make sure ${BOLD}NEXT_PUBLIC_SUPABASE_URL${NC} and ${BOLD}SUPABASE_SERVICE_ROLE_KEY${NC} are defined."
  echo -e "You can set them by running:"
  echo -e "  ${BLUE}export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url${NC}"
  echo -e "  ${BLUE}export SUPABASE_SERVICE_ROLE_KEY=your_service_key${NC}"
  echo -e "Or add them to .env.test file."
  exit 1
fi

# Create a temporary file for test output
TEMP_OUTPUT=$(mktemp)

echo -e "${YELLOW}Running survey flow tests...${NC}"
echo -e "${BLUE}This may take a minute - please wait...${NC}\n"

# Run the survey flow tests and save output to temp file
npx playwright test e2e/survey-flow.spec.ts --headed > "$TEMP_OUTPUT" 2>&1
TEST_RESULT=$?

# Display a summary based on the result
echo -e "\n${BOLD}${YELLOW}=== Test Results ===${NC}\n"

if [ $TEST_RESULT -eq 0 ]; then
  echo -e "${GREEN}✅ Success: Research survey tests completed successfully!${NC}"
  echo -e "\n${YELLOW}Test Summary:${NC}"
  grep -E "Running|passed" "$TEMP_OUTPUT" | tail -2
else
  echo -e "${RED}❌ Error: Research survey tests failed.${NC}"
  echo -e "\n${YELLOW}Error Details:${NC}"
  grep -E "Error|Failed" "$TEMP_OUTPUT" | head -5
fi

# Show how to view report
echo -e "\n${BLUE}To see the full report:${NC}"
echo -e "  npx playwright show-report"

# Clean up temp file
rm "$TEMP_OUTPUT"

exit $TEST_RESULT 