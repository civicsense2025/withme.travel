#!/bin/bash

# Make the fix script executable
chmod +x fixes/fix-route-handlers.js

# List of files to process
FILES=(
  "app/api/trips/[tripId]/expenses/route.ts"
  "app/api/trips/[tripId]/export-calendar/route.ts"
  "app/api/trips/[tripId]/get-permissions/route.ts"
  "app/api/trips/[tripId]/images/route.ts"
  "app/api/trips/[tripId]/itinerary/[itemId]/notes/route.ts"
  "app/api/trips/[tripId]/itinerary/[itemId]/route.ts"
  "app/api/trips/[tripId]/itinerary/[itemId]/status/route.ts"
  "app/api/trips/[tripId]/itinerary/[itemId]/vote/route.ts"
  "app/api/trips/[tripId]/itinerary/reorder/route.ts"
  "app/api/trips/[tripId]/itinerary/route.ts"
  "app/api/trips/[tripId]/itinerary/scrape-url/route.ts"
  "app/api/trips/[tripId]/members/[memberId]/route.ts"
  "app/api/trips/[tripId]/members/check-access/route.ts"
  "app/api/trips/[tripId]/members/import/route.ts"
  "app/api/trips/[tripId]/members/invite/route.ts"
  "app/api/trips/[tripId]/members/me/route.ts"
  "app/api/trips/[tripId]/members/route.ts"
  "app/api/trips/[tripId]/notes/[noteId]/route.ts"
  "app/api/trips/[tripId]/notes/[noteId]/tags/route.ts"
  "app/api/trips/[tripId]/notes/route.ts"
  "app/api/trips/[tripId]/permissions/request/route.ts"
  "app/api/trips/[tripId]/reorder/route.ts"
  "app/api/trips/[tripId]/request-access/route.ts"
  "app/api/trips/[tripId]/role-fix/route.ts"
  "app/api/trips/[tripId]/route.ts"
  "app/api/trips/[tripId]/sections/reorder/route.ts"
  "app/api/trips/[tripId]/tags/route.ts"
  "app/api/trips/[tripId]/travel-times/route.ts"
  "app/api/trips/[tripId]/vote/[pollId]/cast/route.ts"
  "app/api/trips/[tripId]/vote/[pollId]/results/route.ts"
  "app/api/trips/[tripId]/vote/[pollId]/route.ts"
  "app/api/trips/[tripId]/vote/[pollId]/vote/route.ts"
  "app/api/trips/[tripId]/vote/create/route.ts"
  "app/api/trips/[tripId]/vote/polls/route.ts"
  "app/api/trips/[tripId]/vote/route.ts"
  "app/api/trips/[tripId]/vote/submit/route.ts"
  "app/api/trips/create-with-defaults/route.ts"
  "app/api/trips/create/route.ts"
)

# Run the fix script for each file
echo "Running fixes for ${#FILES[@]} files..."
./fixes/fix-route-handlers.js "${FILES[@]}"

echo "Fix script completed." 