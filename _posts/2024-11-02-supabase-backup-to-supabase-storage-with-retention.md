---
title: Supabase backup to supabase storage with retention
---

Dockerfile


```
FROM alpine:3.18.2

# Install required packages
RUN apk add --no-cache \
    curl \
    git \
    bash \
    postgresql-client

# Copy the backup script
COPY entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
```


entrypoint.sh


```
#!/bin/bash

set -euo pipefail

# Function for timestamped logging
log() {
 echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

DATABASE_URL="postgresql://postgres:${SERVICE_PASSWORD_POSTGRES}@37.27.182.105:${POSTGRES_PORT}/${POSTGRES_DB}"
SUPABASE_PROJECT_ID="supabase.app.localhost"
SUPABASE_SERVICE_KEY="${SERVICE_SUPABASESERVICE_KEY}"
SUPABASE_BUCKET_NAME="backup"
TIMESTAMP="$(date +%s)"
DUMP_FILE="db-dump-${TIMESTAMP}.sql.gz"

log "Starting backup process"
log "Creating dump at ${DUMP_FILE}"
log "Using Supabase project: ${SUPABASE_PROJECT_ID}"
log "Using bucket: ${SUPABASE_BUCKET_NAME}"

# Create the backup with disabled triggers
if [[ -n "${USE_PGDUMPALL:-}" ]]; then
 export PGPASSWORD="$(echo "${DATABASE_URL}" | awk -F'[:@]' '{ print $3 }')"
 log "Using pg_dumpall for backup"
 time pg_dumpall -d "${DATABASE_URL}" --no-role-passwords | gzip > "${DUMP_FILE}"
else
 log "Using pg_dump for backup"
 time pg_dump -d "${DATABASE_URL}" --disable-triggers | gzip > "${DUMP_FILE}"
fi

log "Dump complete. File size: $(ls -lh ${DUMP_FILE} | awk '{print $5}')"
log "Uploading to Supabase..."

# Upload the new backup
UPLOAD_RESPONSE=$(curl -s \
 -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
 -F "data=@${DUMP_FILE}" \
 "https://${SUPABASE_PROJECT_ID}/storage/v1/object/${SUPABASE_BUCKET_NAME}/${DUMP_FILE}")

log "Upload response: ${UPLOAD_RESPONSE}"
log "Upload complete. Managing backup retention..."

# Get list of all backups
log "Retrieving list of buckets..."
LIST_RESPONSE_BUCKET=$(curl -s \
 -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
 "https://${SUPABASE_PROJECT_ID}/storage/v1/bucket/")

log "Full list response: ${LIST_RESPONSE_BUCKET}"

# Get list of all backups
log "Retrieving list of existing backups..."
LIST_RESPONSE=$(curl -s \
 -X POST \
 -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
 -H "Content-Type: application/json" \
 -d '{
        "prefix": ""
    }' \
 "https://${SUPABASE_PROJECT_ID}/storage/v1/object/list/backup")

log "Full list response: ${LIST_RESPONSE}"

# Extract and sort backup names
BACKUP_LIST=$(echo "${LIST_RESPONSE}" | grep -o '"name":"[^"]*' | cut -d'"' -f4 | grep '^db-dump-' | sort -r)

log "Extracted backup list:"
echo "${BACKUP_LIST}"

# Convert to array
OLD_IFS="$IFS"
IFS=$'\n' BACKUP_ARRAY=($BACKUP_LIST)
IFS="$OLD_IFS"
BACKUP_COUNT=${#BACKUP_ARRAY[@]}

log "Total number of backups found: ${BACKUP_COUNT}"

if [ "$BACKUP_COUNT" -gt 3 ]; then
 log "Need to remove $(($BACKUP_COUNT - 3)) old backups"

 # Show backups that will be kept
 log "Backups to keep:"
 for ((i=0; i<3; i++)); do
 log "  - ${BACKUP_ARRAY[$i]}"
 done

 # Remove older backups
 log "Removing old backups..."
 for ((i=3; i<BACKUP_COUNT; i++)); do
        BACKUP_TO_DELETE="${BACKUP_ARRAY[$i]}"
 log "Attempting to delete: ${BACKUP_TO_DELETE}"

        DELETE_RESPONSE=$(curl -s -X DELETE \
 -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
 "https://${SUPABASE_PROJECT_ID}/storage/v1/object/${SUPABASE_BUCKET_NAME}/${BACKUP_TO_DELETE}")

 log "Delete response for ${BACKUP_TO_DELETE}: ${DELETE_RESPONSE}"
 done
else
 log "Only ${BACKUP_COUNT} backups found, no cleanup needed"
 log "Current backups:"
 for ((i=0; i<BACKUP_COUNT; i++)); do
 log "  - ${BACKUP_ARRAY[$i]}"
 done
fi

# Verify final state
log "Verifying final state..."
FINAL_LIST=$(curl -s \
 -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
 "https://${SUPABASE_PROJECT_ID}/storage/v1/object/list/${SUPABASE_BUCKET_NAME}" \
 | grep -o '"name":"[^"]*' | cut -d'"' -f4 | grep '^db-dump-' | sort -r)

log "Final backup list:"
echo "${FINAL_LIST}"

# Cleanup
log "Cleaning up temporary files..."
rm -f "${DUMP_FILE}"

log "Backup process completed successfully"
```
