#!/bin/bash

# --- CONFIGURATION ---
LOCAL_USER="postgres"
LOCAL_DB="postgres"
LOCAL_HOST="127.0.0.1"
LOCAL_PORT="54322"
DUMP_FILE="data.sql"
OUTPUT_FILE="filtered-data.sql"

# --- GET LOCAL TABLES ---
echo "Getting list of local tables..."
TABLES=$(psql -U "$LOCAL_USER" -d "$LOCAL_DB" -h "$LOCAL_HOST" -p "$LOCAL_PORT" -Atc "SELECT tablename FROM pg_tables WHERE schemaname='public';")

if [ -z "$TABLES" ]; then
  echo "No tables found in local database. Exiting."
  exit 1
fi

echo "Found tables:"
echo "$TABLES"

# --- EXTRACT DATA FOR LOCAL TABLES ---
echo "Extracting data for local tables from $DUMP_FILE..."

# Build a grep pattern for all tables
PATTERN=$(echo "$TABLES" | awk '{printf "COPY %s |INSERT INTO %s|", $1, $1}' | sed 's/|$//')

# Use awk to extract blocks for each table
awk -v pat="$PATTERN" '
  BEGIN { IGNORECASE=1; split(pat, arr, "|"); for (i in arr) pat_arr[arr[i]]=1 }
  /^COPY / || /^INSERT INTO / {
    for (p in pat_arr) {
      if ($0 ~ p) {
        printing=1
        break
      } else {
        printing=0
      }
    }
  }
  printing { print }
' "$DUMP_FILE" > "$OUTPUT_FILE"

echo "Filtered data written to $OUTPUT_FILE"
echo "You can now import it with:"
echo "psql -U $LOCAL_USER -d $LOCAL_DB -f $OUTPUT_FILE"