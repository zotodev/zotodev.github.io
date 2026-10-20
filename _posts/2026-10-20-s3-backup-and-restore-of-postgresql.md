---
title: "S3 Backup and Restore of PostgreSQL"
---

The following `docker-compose.yml` defines backup and restore services for PostgreSQL. Both expect a PostgreSQL service named `db` in the same Compose project; the database service itself is not included in this snippet.

To connect to an external PostgreSQL database, remove the `links` entries and change the `POSTGRES_HOST` environment variables.

## Docker Compose configuration

```yaml
version: '3.4'

services:
  pgbackups3:
    build:
      context: .
      dockerfile: postgres-backup-s3/Dockerfile
    links:
      - db
    environment:
      SCHEDULE: '@daily'
      S3_REGION: eu-west-2
      S3_ACCESS_KEY_ID: keygoeshere
      S3_SECRET_ACCESS_KEY: secretkeygoeshere
      S3_BUCKET: yourapp-backups
      S3_PREFIX: backup
      POSTGRES_HOST: db
      POSTGRES_DATABASE: yourdbname
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: passwordgoeshere
      POSTGRES_EXTRA_OPTS: '--schema=public --blobs'

  pgrestores3:
    build:
      context: .
      dockerfile: postgres-restore-s3/Dockerfile
    links:
      - db
    environment:
      S3_ACCESS_KEY_ID: keygoeshere
      S3_SECRET_ACCESS_KEY: secretkeygoeshere
      S3_BUCKET: yourapp-backups
      S3_PREFIX: backup
      POSTGRES_HOST: db
      POSTGRES_DATABASE: yourdbname
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: passwordgoeshere
      DROP_PUBLIC: 'yes'
```

## Backing up PostgreSQL to S3

### Backup Dockerfile

Save this as `postgres-backup-s3/Dockerfile`:

```dockerfile
FROM alpine:3.13

RUN apk update \
    && apk add coreutils \
    && apk add postgresql-client \
    && apk add python3 py3-pip \
    && pip3 install --upgrade pip \
    && pip3 install awscli \
    && apk add openssl \
    && apk add curl \
    && curl -L --insecure https://github.com/odise/go-cron/releases/download/v0.0.6/go-cron-linux.gz | zcat > /usr/local/bin/go-cron \
    && chmod u+x /usr/local/bin/go-cron \
    && apk del curl \
    && rm -rf /var/cache/apk/*

ENV POSTGRES_DATABASE None
ENV POSTGRES_HOST None
ENV POSTGRES_PORT 5432
ENV POSTGRES_USER None
ENV POSTGRES_PASSWORD None
ENV POSTGRES_EXTRA_OPTS ''
ENV S3_ACCESS_KEY_ID None
ENV S3_SECRET_ACCESS_KEY None
ENV S3_BUCKET None
ENV S3_REGION us-west-1
ENV S3_PATH 'backup'
ENV S3_ENDPOINT None
ENV S3_S3V4 no
ENV SCHEDULE None

COPY ["postgres-backup-s3/run.sh", "run.sh"]
COPY ["postgres-backup-s3/backup.sh", "backup.sh"]

CMD ["sh", "run.sh"]
```

This Dockerfile combines parts from existing PostgreSQL backup implementations with additional customisation.

It creates a lightweight Linux environment that can connect to both PostgreSQL and an S3-compatible storage service. It also copies and runs two shell scripts: `run.sh` and `backup.sh`.

### Run script

Save this as `postgres-backup-s3/run.sh`.

The `run.sh` script configures the AWS CLI when S3 Signature Version 4 is required. It then either runs the backup immediately or schedules it using `go-cron`.

Setting `SCHEDULE` to `@daily` causes the backup to run once every day.

```sh
#!/bin/sh

set -e

if [ "${S3_S3V4}" = "yes" ]; then
    aws configure set default.s3.signature_version s3v4
fi

if [ "${SCHEDULE}" = "None" ]; then
    sh backup.sh
else
    exec go-cron "$SCHEDULE" /bin/sh backup.sh
fi
```

### Backup script

Save this as `postgres-backup-s3/backup.sh`.

The `backup.sh` script validates the required PostgreSQL and S3 environment variables. It then creates a compressed PostgreSQL dump and uploads it to the configured S3 bucket.

```sh
#!/bin/sh

set -e
set -o pipefail

if [ "${S3_ACCESS_KEY_ID}" = "None" ]; then
    echo "You need to set the S3_ACCESS_KEY_ID environment variable."
    exit 1
fi

if [ "${S3_SECRET_ACCESS_KEY}" = "None" ]; then
    echo "You need to set the S3_SECRET_ACCESS_KEY environment variable."
    exit 1
fi

if [ "${S3_BUCKET}" = "None" ]; then
    echo "You need to set the S3_BUCKET environment variable."
    exit 1
fi

if [ "${POSTGRES_DATABASE}" = "None" ]; then
    echo "You need to set the POSTGRES_DATABASE environment variable."
    exit 1
fi

if [ "${POSTGRES_HOST}" = "None" ]; then
    if [ -n "${POSTGRES_PORT_5432_TCP_ADDR}" ]; then
        POSTGRES_HOST=$POSTGRES_PORT_5432_TCP_ADDR
        POSTGRES_PORT=$POSTGRES_PORT_5432_TCP_PORT
    else
        echo "You need to set the POSTGRES_HOST environment variable."
        exit 1
    fi
fi

if [ "${POSTGRES_USER}" = "None" ]; then
    echo "You need to set the POSTGRES_USER environment variable."
    exit 1
fi

if [ "${POSTGRES_PASSWORD}" = "None" ]; then
    echo "You need to set the POSTGRES_PASSWORD environment variable or link to a container named POSTGRES."
    exit 1
fi

if [ "${S3_ENDPOINT}" = "None" ]; then
    AWS_ARGS=""
else
    AWS_ARGS="--endpoint-url ${S3_ENDPOINT}"
fi

export AWS_ACCESS_KEY_ID=$S3_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=$S3_SECRET_ACCESS_KEY
export AWS_DEFAULT_REGION=$S3_REGION

export PGPASSWORD=$POSTGRES_PASSWORD

POSTGRES_HOST_OPTS="-h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER $POSTGRES_EXTRA_OPTS"

echo "Creating dump of ${POSTGRES_DATABASE} database from ${POSTGRES_HOST}..."

pg_dump $POSTGRES_HOST_OPTS $POSTGRES_DATABASE | gzip > dump.sql.gz

echo "Uploading dump to ${S3_BUCKET}"

cat dump.sql.gz | aws $AWS_ARGS s3 cp - "s3://${S3_BUCKET}/${S3_PREFIX}/${POSTGRES_DATABASE}_$(date +"%Y-%m-%dT%H:%M:%SZ").sql.gz" || exit 2

echo "SQL backup uploaded successfully"
```

The generated backup filename contains the PostgreSQL database name and the current UTC timestamp. A generated filename will look similar to this:

```text
yourdbname_2026-07-12T03:30:00Z.sql.gz
```

## Restoring PostgreSQL from S3

> Setting `DROP_PUBLIC` to `yes` drops the existing `public` schema and its objects before restoring the backup.

### Restore Dockerfile

Save this as `postgres-restore-s3/Dockerfile`:

```dockerfile
FROM alpine:3.13

RUN apk update \
    && apk add coreutils \
    && apk add postgresql-client \
    && apk add python3 py3-pip \
    && pip3 install --upgrade pip \
    && pip3 install awscli \
    && apk add openssl \
    && apk add curl \
    && curl -L --insecure https://github.com/odise/go-cron/releases/download/v0.0.6/go-cron-linux.gz | zcat > /usr/local/bin/go-cron \
    && chmod u+x /usr/local/bin/go-cron \
    && apk del curl \
    && rm -rf /var/cache/apk/*

ENV POSTGRES_DATABASE None
ENV POSTGRES_HOST None
ENV POSTGRES_PORT 5432
ENV POSTGRES_USER None
ENV POSTGRES_PASSWORD None
ENV S3_ACCESS_KEY_ID None
ENV S3_SECRET_ACCESS_KEY None
ENV S3_BUCKET None
ENV S3_REGION us-west-1
ENV S3_PATH 'backup'
ENV DROP_PUBLIC 'no'

COPY ["postgres-restore-s3/restore.sh", "restore.sh"]

CMD ["sh", "restore.sh"]
```

This Dockerfile creates a lightweight environment capable of connecting to PostgreSQL and S3. It copies the `restore.sh` script into the container and runs it when the container starts.

### Restore script

Save this as `postgres-restore-s3/restore.sh`.

The `restore.sh` script validates the required connection settings and locates the most recent backup in the configured S3 location.

It downloads and decompresses the backup. When `DROP_PUBLIC` is set to `yes`, it drops and recreates the PostgreSQL `public` schema before restoring the database.

After the restoration is complete, the local SQL dump is deleted. This allows the same container to be run again for future restores without conflicts from an existing dump file.

```sh
#!/bin/sh

set -e
set -o pipefail

if [ "${S3_ACCESS_KEY_ID}" = "None" ]; then
    echo "You need to set the S3_ACCESS_KEY_ID environment variable."
    exit 1
fi

if [ "${S3_SECRET_ACCESS_KEY}" = "None" ]; then
    echo "You need to set the S3_SECRET_ACCESS_KEY environment variable."
    exit 1
fi

if [ "${S3_BUCKET}" = "None" ]; then
    echo "You need to set the S3_BUCKET environment variable."
    exit 1
fi

if [ "${POSTGRES_DATABASE}" = "None" ]; then
    echo "You need to set the POSTGRES_DATABASE environment variable."
    exit 1
fi

if [ "${POSTGRES_HOST}" = "None" ]; then
    if [ -n "${POSTGRES_PORT_5432_TCP_ADDR}" ]; then
        POSTGRES_HOST=$POSTGRES_PORT_5432_TCP_ADDR
        POSTGRES_PORT=$POSTGRES_PORT_5432_TCP_PORT
    else
        echo "You need to set the POSTGRES_HOST environment variable."
        exit 1
    fi
fi

if [ "${POSTGRES_USER}" = "None" ]; then
    echo "You need to set the POSTGRES_USER environment variable."
    exit 1
fi

if [ "${POSTGRES_PASSWORD}" = "None" ]; then
    echo "You need to set the POSTGRES_PASSWORD environment variable or link to a container named POSTGRES."
    exit 1
fi

export AWS_ACCESS_KEY_ID=$S3_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=$S3_SECRET_ACCESS_KEY
export AWS_DEFAULT_REGION=$S3_REGION

export PGPASSWORD=$POSTGRES_PASSWORD

POSTGRES_HOST_OPTS="-h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER"

echo "Finding latest backup"

LATEST_BACKUP=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | sort | tail -n 1 | awk '{ print $4 }')

echo "Fetching ${LATEST_BACKUP} from S3"

aws s3 cp "s3://${S3_BUCKET}/${S3_PREFIX}/${LATEST_BACKUP}" dump.sql.gz

gzip -d dump.sql.gz

if [ "${DROP_PUBLIC}" = "yes" ]; then
    echo "Recreating the public schema"

    psql $POSTGRES_HOST_OPTS \
        -d $POSTGRES_DATABASE \
        -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
fi

echo "Restoring ${LATEST_BACKUP}"

psql $POSTGRES_HOST_OPTS \
    -d $POSTGRES_DATABASE \
    < dump.sql

echo "Restore complete"

rm -f ./dump.sql

echo "Deleted dump files"
```
