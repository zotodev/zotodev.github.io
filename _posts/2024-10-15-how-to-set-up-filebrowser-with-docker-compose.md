---
title: How To Set Up Filebrowser with Docker Compose
---

![](/assets/images/how-to-set-up-filebrowser-with-docker-compose/01-7f0adce0.jpeg)

[Filebrowser](https://filebrowser.org/) is a powerful web-based file manager that allows you to easily manage your files and folders from any device with a web browser. It provides a user-friendly interface for uploading, deleting, previewing, renaming, and editing files, as well as creating and managing user accounts with customizable permissions.

One of the best ways to set up Filebrowser is by using Docker, which simplifies the installation and deployment process. In this guide, we’ll walk you through the steps to set up Filebrowser with Docker Compose, a tool that makes it easy to manage and deploy multi-container Docker applications.

## 1. Prerequisites

Before you begin, make sure you have the following prerequisites in place:

VPS where you can host.
Docker and Dockge installed on your server, you can check the [Dockge - Docker Management](/posts/dockge-docker-manager/) for the full tutorial.

## 2. Create A Docker Compose File

Create a new file named docker-compose.yml in your preferred directory and add the following configuration:


```yaml
version: "3"
services:
  filebrowser:
    image: filebrowser/filebrowser:v2-s6
    container_name: filebrowser
    restart: unless-stopped
    volumes:
      - /opt/stacks:/srv # Change to match your directory
      - ./filebrowser.db:/database/filebrowser.db # Change to match your directory
      - ./settings.json:/config/settings.json # Change to match your directory
    environment:
      PUID: $(id -u)
      PGID: $(id -g)
    ports:
      - 5040:80 # Change the port if needed
```


In this configuration, we’re using the **filebrowser/filebrowser:v2-s6** Docker image, which is the latest stable version of Filebrowser. The volumes section maps the necessary directories and files for Filebrowser to function, including the file storage directory (/opt/stacks), the database file (filebrowser.db), and the settings file (settings.json). You’ll need to update these paths to match your own setup.

The environment section sets the user and group IDs for the Filebrowser container, which is important for file permissions. The ports section exposes the Filebrowser web interface on port 5040, which you can change if needed.

## 3. Create the filebrowser.db and settings.json

In the same directory as your docker-compose.yml file, create the following files:

**filebrowser.db:**


```sh
touch filebrowser.db
```


**settings.json:** Fetch the [Filebrowser settings file](https://github.com/filebrowser/filebrowser/blob/master/docker/root/defaults/settings.json) and create one with:


```sh
vi settings.json
```


Then paste the following configuration:


```json
{
  "port": 80,
  "baseURL": "",
  "address": "",
  "log": "stdout",
  "database": "/database/filebrowser.db",
  "root": "/srv"
}
```


In case you are seeing the bellow error:


```sh
filebrowser  | 2024/04/25 07:17:26 Using database: /database/filebrowser.db
filebrowser  | 2024/04/25 07:17:26 open /database/filebrowser.db: permission denied
```


Just grant the filebrowser.db the rights you are seeing in the startup of the container, this happens when you are running with root the docker install:


```sh
filebrowser  | GID/UID
filebrowser  | ───────────────────────────────────────
filebrowser  |
filebrowser  | User UID:    911
filebrowser  | User GID:    1001
filebrowser  | ───────────────────────────────────────
```



```sh
chown 911:1001 filebrowser.db
```


## 4. Deploy Filebrowser

In the same directory as your docker-compose.yml file, run the following command to start the Filebrowser container:


```sh
docker-compose up -d
```


You can check that the container is running with the following command:


```sh
docker ps | grep -i filebrowser
```


## 5. Access the Filebrowser UI

Once you’ve set up the CloudFlare Tunnels (or another reverse proxy), you can access the Filebrowser web interface using the domain or subdomain you configured. The default login credentials are admin/admin, but you should change the password immediately after your first login.
