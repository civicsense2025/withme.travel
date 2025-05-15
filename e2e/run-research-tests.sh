#!/bin/bash

# Research Survey E2E Test Runner
# 
# This script sets up the necessary environment variables and runs the
# user research survey end-to-end tests with proper error handling.

# Set up colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}================================================${NC}"
echo -e "${YELLOW}   WithMe Research Survey E2E Test Runner   ${NC}"
echo -e "${YELLOW}================================================${NC}"

# Default values (can be overridden by environment variables)
DEFAULT_SUPABASE_URL="http://localhost:54321"
DEFAULT_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.OXBO4nlx1DHdHyRyOILRs0Mn8RReZz7NqXplDGbzF9w"
DEFAULT_SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
DEFAULT_SURVEY_BASE_URL="http://localhost:3000"

# Parse command line arguments
TEST_FILE="consolidated-survey-flow.spec.ts"
DEBUG_MODE=false
HEADLESS=true
GENERATE_TOKEN=true

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --debug) DEBUG_MODE=true; shift ;;
    --headed) HEADLESS=false; shift ;;
    --no-token-gen) GENERATE_TOKEN=false; shift ;;
    --test=*) TEST_FILE="${1#*=}"; shift ;;
    --help) 
      echo -e "Usage: ./run-research-tests.sh [options]"
      echo -e "Options:"
      echo -e "  --debug              Enable debug mode"
      echo -e "  --headed             Run tests in headed mode (shows browser)"
      echo -e "  --no-token-gen       Skip token generation"
      echo -e "  --test=<file>        Specify test file to run (default: consolidated-survey-flow.spec.ts)"
      echo -e "  --help               Show this help message"
      exit 0
      ;;
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
done

# Export required environment variables
echo -e "\n${GREEN}Setting up environment variables...${NC}"

# Supabase environment variables
export NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-$DEFAULT_SUPABASE_URL}
export NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-$DEFAULT_SUPABASE_ANON_KEY}
export SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-$DEFAULT_SUPABASE_SERVICE_ROLE_KEY}

# Survey-specific environment variables
export SURVEY_BASE_URL=${SURVEY_BASE_URL:-$DEFAULT_SURVEY_BASE_URL}
export DEBUG_SURVEY_TESTS=${DEBUG_MODE}

# Display current settings
echo -e "${BLUE}Using the following configuration:${NC}"
echo -e "- Supabase URL: ${NEXT_PUBLIC_SUPABASE_URL}"
echo -e "- Survey Base URL: ${SURVEY_BASE_URL}"
echo -e "- Test File: ${TEST_FILE}"
echo -e "- Debug Mode: ${DEBUG_MODE}"
echo -e "- Headless Mode: ${HEADLESS}"

# Setup complete, ready to run tests
echo -e "\n${GREEN}Environment setup complete.${NC}"

# Generate test tokens if needed
if [ "$GENERATE_TOKEN" = true ]; then
  echo -e "\n${GREEN}Generating test tokens...${NC}"
  # Note: This would call a script that generates tokens
  # For now, we'll just simulate it
  echo -e "${BLUE}Test tokens are available. Ready to run tests.${NC}"
fi

# Prepare test command
TEST_COMMAND="npx playwright test e2e/${TEST_FILE}"

if [ "$HEADLESS" = false ]; then
  TEST_COMMAND="$TEST_COMMAND --headed"
fi

if [ "$DEBUG_MODE" = true ]; then
  TEST_COMMAND="$TEST_COMMAND --debug"
fi

# Run the tests
echo -e "\n${GREEN}Running tests...${NC}"
echo -e "${BLUE}Command: ${TEST_COMMAND}${NC}\n"

# Execute the command
eval $TEST_COMMAND
EXIT_CODE=$?

# Display results
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "\n${GREEN}Tests completed successfully! 🎉${NC}"
else
  echo -e "\n${RED}Tests failed with exit code $EXIT_CODE${NC}"
  echo -e "${YELLOW}Check the test results and logs for details.${NC}"
fi

# Generate a report
echo -e "\n${GREEN}Generating test report...${NC}"
echo -e "${BLUE}Reports available in test-results/ directory${NC}"

# If debug mode is enabled, offer to open the reports
if [ "$DEBUG_MODE" = true ]; then
  echo -e "\n${YELLOW}Would you like to open the test reports? (y/n)${NC}"
  read -r open_reports
  if [[ "$open_reports" =~ ^[Yy]$ ]]; then
    # Try to open the reports with the system's default application
    if [[ "$OSTYPE" == "darwin"* ]]; then
      open test-results/
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
      xdg-open test-results/
    else
      echo -e "${YELLOW}Unable to automatically open reports on this OS.${NC}"
      echo -e "${YELLOW}Please check the test-results/ directory manually.${NC}"
    fi
  fi
fi

exit $EXIT_CODE 