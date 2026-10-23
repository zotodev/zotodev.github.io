---
title: Dockge - Docker Manager
---

![](/assets/images/dockge-docker-manager/01-a7ee8765.png)

Dockge is a web-based Docker manager that simplifies the process of self-hosting your own applications and services. With Dockge, you can easily create, manage, and update your Docker containers, stacks, and services from a user-friendly interface.

In this article, we will introduce Dockge, explain how it works, and show you how to install it on your server. We will also highlight some of the features and benefits of using Dockge for your self-hosting needs.

## What is Dockge?

[Dockge](https://github.com/louislam/dockge) is a web-based Docker manager that lets you self-host your own applications and services with minimal hassle. Dockge is a Portainer alternative that is a lot simpler and can help you deploy docker-compose applications, it was developed by Louis the creator of [Uptime Kuma](https://github.com/louislam/uptime-kuma) which is a well known tool that can help you monitor your applications and websites.Dockge, you can access everything you need on a single page, without switching between multiple tabs. Whether you want to create a new container, view the logs, edit the YAML file, use the terminal, or control the container, you can do it all from one place. Dockge integrates all the essential functions into a single interface, making Docker management easy and convenient.

Dockge is also a powerful tool that helps you manage Docker Compose.yaml stacks with ease. You can create, edit, start, stop, restart, and delete Docker containers and services, all defined by your compose.yaml files. Dockge provides an interactive compose.yaml editor that lets you configure your stacks without hassle. You can also communicate with your containers and services in real time through the web terminal.

Dockge lets you track the progress of your container operations, such as image pulls, in real time. Dockge has a sleek and stylish user interface that enhances your productivity and enjoyment. If you like Uptime Kuma’s elegant UI/UX, you will love Dockge’s interface too. Moreover, Dockge makes it easy to convert complex “docker run” commands into Compose.yaml configurations, keeping your Compose files safe and organized on your drive. You can access and manage them using standard Docker Compose commands, giving you full control over your configuration files.

# Installing Dockge

In this section, we are going to see everything that needs to be done to have Dockge installed and running on a VPS server.

## 1. Create a VPS server

You will need a VPS server where you can host your docker containers

The VPS process is easy and you just need a Ubuntu server, Dockge is working on ARM and x86\_64 also.

## 2. Install Docker

Now that you have your VPS created you will need to update it and have docker installed, the below will need to be done to have docker UP and running:


```sh
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  jammy stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-compose
```


## 3. Install Dockge

Installing Dockge is easy. Here are the steps they lay out on their [GitHub Page](https://github.com/louislam/dockge?l#basic)


```sh
# Create directories that store your stacks and stores Dockge's stack
mkdir -p /opt/stacks /opt/dockge
cd /opt/dockge

# Download the compose.yaml
curl https://raw.githubusercontent.com/louislam/dockge/master/compose.yaml --output compose.yaml

# Start the server
docker compose up -d
```


The default port in the YAML file is 5001 but you can change it if you want with your port. Below is the YAML file:


```yaml
version: "3.8"
services:
  dockge:
    image: louislam/dockge:1
    restart: unless-stopped
    ports:
      # Host Port : Container Port
      - 5001:5001
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./data:/app/data

      # If you want to use private registries, you need to share the auth file with Dockge:
      # - /root/.docker/:/root/.docker

      # Stacks Directory
      # ⚠️ READ IT CAREFULLY. If you did it wrong, your data could end up writing into a WRONG PATH.
      # ⚠️ 1. FULL path only. No relative path (MUST)
      # ⚠️ 2. Left Stacks Path === Right Stacks Path (MUST)
      - /opt/stacks:/opt/stacks
    environment:
      # Tell Dockge where is your stacks directory
      - DOCKGE_STACKS_DIR=/opt/stacks
```


## 4. Access Dockge

To access the dockge installation and create your first user you will need to use the server IP and the port(5001 by default) in the compose.yaml file. First, you will be prompted to create your first user. After you can go and start deploying docker compose apps.

## 5. Adding Admin URL with SSL to Dockge and the APPS

If this is an internet-facing server and the APPs hosted on it will be internet facing then you will need to add a container that is handling the reverse proxy to your containers.
