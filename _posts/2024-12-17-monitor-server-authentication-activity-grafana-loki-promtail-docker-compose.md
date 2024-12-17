---
title: Monitor Server Authentication Activity (Grafana, Loki, Promtail, Docker Compose)
---

![](/assets/images/monitor-server-authentication-activity-grafana-loki-promtail-docker-compose/01-8f079fc6.jpeg)

Monitor a server's authentication activity using the `/var/log/auth.log` file. Everything will be done with Grafana provisioning.

## Authentication Monitoring

To monitor a Linux server's authentication activity, we can observe the `/var/log/auth.log` file. This file records authentication-related events (such as login attempts) on Linux systems. This includes logins, privilege escalations, failed SSH attempts, etc. Therefore, we want to set up a real-time monitoring solution for this file.

## The Stack

In this demonstration, we will monitor a Linux server's authentication activity using Promtail, Loki, and Grafana. All of these instances will be deployed using Docker Compose. Specifically:

- Promtail will watch the `/var/log/auth.log` file and send logs to Loki.
- Loki will receive and store the logs.
- Grafana will visualize logs through dashboards.

## Environment Variables

Set up environment variables to define the location of containers in the Docker network. Variables starting with `GF` configure Grafana settings.

### .env


```
# .env
PROJECT_NAME=GRAFANA_LOKI_PROMTAIL

LOKI_CONTAINER_NAME=l-c
LOKI_PORT=3100

PROMTAIL_CONTAINER_NAME=p-c
PROMTAIL_PORT=9080

GRAFANA_CONTAINER_NAME=g-c
GRAFANA_PORT=3000
GF_AUTH_ANONYMOUS_ENABLED=true
GF_AUTH_ANONYMOUS_ORG_ROLE=Admin
GF_LOG_LEVEL=warn
```


## Loki Configuration

This configuration file sets up Loki to store log data on the local filesystem.

### monitoring/local-config.yaml


```
# local-config.yaml
auth_enabled: false

server:
  http_listen_address: ${LOKI_CONTAINER_NAME}
  http_listen_port: ${LOKI_PORT}

limits_config:
  allow_structured_metadata: false

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    kvstore:
      store: inmemory

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v13
      index:
        prefix: index_
        period: 24h
```


## Promtail Configuration

Promtail configuration to monitor `/var/log/auth.log` and push logs to Loki:

### monitoring/promtail.yaml


```
# promtail.yaml
server:
  http_listen_address: ${PROMTAIL_CONTAINER_NAME}
  http_listen_port: ${PROMTAIL_PORT}

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://${LOKI_CONTAINER_NAME}:${LOKI_PORT}/loki/api/v1/push

scrape_configs:
  - job_name: auth
    static_configs:
      - targets:
          - localhost
        labels:
          job: auth
          __path__: /var/log/auth.log
```


## Grafana Provisioning

Provision Grafana to connect to Loki as a data source.

### monitoring/datasources.yaml


```
# datasources.yaml
apiVersion: 1

datasources:
  - name: Loki
    type: loki
    access: proxy
    url: http://${LOKI_CONTAINER_NAME}:${LOKI_PORT}

    jsonData:
      timeout: 60
      maxLines: 1000
```


## Docker Compose Services

Define Docker Compose services for Loki, Promtail, and Grafana:

### docker-compose.yaml


```
# docker-compose.yaml
name: ${PROJECT_NAME}

services:
  loki:
    pull_policy: always
    image: grafana/loki
    container_name: ${LOKI_CONTAINER_NAME}
    env_file: .env
    volumes:
      - ./monitoring/local-config.yaml:/etc/loki/local-config.yaml
    expose:
      - ${LOKI_PORT}
    command:
      - -config.expand-env=true
      - -config.file=/etc/loki/local-config.yaml

  promtail:
    pull_policy: always
    image: grafana/promtail
    container_name: ${PROMTAIL_CONTAINER_NAME}
    env_file: .env
    volumes:
      - ./monitoring/promtail.yaml:/etc/promtail/config.yml
      - /var/log/auth.log:/var/log/auth.log
    expose:
      - ${PROMTAIL_PORT}
    depends_on:
      - loki
    command:
      - -config.expand-env=true
      - -config.file=/etc/promtail/config.yml

  grafana:
    pull_policy: always
    image: grafana/grafana
    container_name: ${GRAFANA_CONTAINER_NAME}
    env_file: .env
    volumes:
      - ./monitoring/datasources.yaml:/etc/grafana/provisioning/datasources/datasources.yml
    ports:
      - ${GRAFANA_PORT}:${GRAFANA_PORT}
    depends_on:
      - loki
```


## Running the Application

Run the application by navigating to the project root and running:

### Running the Application


```
# Run the Application
docker compose up
```


Now navigate to `localhost:${GRAFANA_PORT}` in your browser. Go to datasources, click on Loki, and explore the authentication data.
