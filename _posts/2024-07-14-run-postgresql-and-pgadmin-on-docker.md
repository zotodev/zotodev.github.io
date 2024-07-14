---
title: Run PostgreSQL and pgAdmin on Docker
---

![](/assets/images/run-postgresql-and-pgadmin-on-docker/01-3f253569.png)

In the Current Dynamic Software Development Landscape containerization plays a crucial role in constructing, delivering, and executing applications. Docker, known for its user-friendly nature and versatility, has risen as a dominant platform for containerization. PostgreSQL holds a prominent position as a robust open-source relational database management system for database management tasks. Additionally, pgAdmin offers an intuitive interface for graphical administration of PostgreSQL databases. This detailed guide will delve into utilizing Docker to establish and oversee PostgreSQL and pgAdmin setups, facilitating the efficient streamlining of database operations.

## Chapter 1: Understanding Docker

Docker has transformed the landscape of software development by providing a consistent environment for building, shipping, and running applications. In this chapter, we’ll explore the fundamental concepts of Docker through practical code examples.

### 1. Installing Docker

Let’s make sure Docker is installed on your PC before we get started. Docker offers installation packages for Windows, Linux, and macOS, among other operating systems. From the Docker website, download the installer that is compatible with your platform, then follow the installation guidelines.

Once Docker is installed, verify its version by running the following command in your terminal or command prompt:


```
docker --version
```


If Docker is installed correctly, you should see output displaying the installed version, confirming that Docker is ready to use.

### 2. Running Your First Container

Let’s start by running a simple containerized application. We’ll use the classic “hello-world” example provided by Docker to ensure that everything is set up correctly.

Run the following command in your terminal:


```
docker run hello-world
```


This command instructs Docker to download the “hello-world” image from Docker Hub (if it’s not already available locally) and run it as a container. You should see a message indicating that Docker is working correctly.

### 3. Exploring Docker Images

Docker images are the building blocks of containers. They contain the filesystem and configuration required to run a specific application. Let’s explore how to work with Docker images using some basic commands.

List all Docker images available locally:


```
docker images
```


This command will display a list of all Docker images stored on your system, along with their tags and sizes.

### 4. Building a Docker Image

You can create your own Docker images using Dockerfiles, which are text files that contain instructions for building the image. Let’s create a simple Dockerfile for a Node.js application.

Create a new directory for your project and navigate into it. Then, create a file named “Dockerfile” with the following content:


```
Dockerfile
# Use the official Node.js image as a base
FROM node:14
# Set the working directory in the container
WORKDIR /app
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the application code
COPY . .
# Expose port 3000
EXPOSE 3000
# Command to run the application
CMD ["node", "index.js"]
```


### 5. Building and Running the Docker Image

Now that we have created our Dockerfile, let’s build the Docker image and run a container based on it.

Navigate to the directory containing your Dockerfile and run the following command:


```
docker build -t my-node-app .
```


This command builds a Docker image named “my-node-app” based on the instructions in your Dockerfile.

Once the image is built, you can run a container using the following command:


```
docker run -p 3000:3000 my-node-app
```


This command starts a container based on the “my-node-app” image and maps port 3000 on the host to port 3000 in the container. You should now be able to access your Node.js application running inside the Docker container.

The fundamentals of Docker have been covered in this chapter, including installation, utilizing Dockerfiles to create custom images, and operating containers. A strong and adaptable platform for consistently and reliably creating and delivering applications is offered by Docker. We’ll look at using Docker to run PostgreSQL and pgAdmin, two critical tools for database administration and management, in the upcoming chapter.

## Chapter 2: Setting Up PostgreSQL with Docker

PostgreSQL is a powerful relational database management system, and Docker provides an efficient way to deploy and manage PostgreSQL instances as containers. In this chapter, we’ll walk through the steps to set up PostgreSQL using Docker, complete with code examples.

### 1. Pulling the PostgreSQL Docker Image

The first step is to pull the official PostgreSQL Docker image from Docker Hub. This image contains the PostgreSQL server and its dependencies.


```
docker pull postgres
```


This command fetches the latest version of the PostgreSQL image from Docker Hub and stores it locally on your system.

### 2. Running a PostgreSQL Container

Once the PostgreSQL image is downloaded, you can run a PostgreSQL container using the docker run command. You can specify environment variables to configure the PostgreSQL instance, such as the password for the default user (postgres).


```
docker run --name my-postgres -e POSTGRES_PASSWORD=mysecretpassword -d postgres
```


Here’s what each part of the command does:

- `--name my-postgres`: Assigns a name to the container.
- `-e POSTGRES_PASSWORD=mysecretpassword`: Sets the password for the default PostgreSQL user (postgres).
- `-d`: Runs the container in detached mode.

### 3. Verifying the PostgreSQL Container

To ensure that the PostgreSQL container is up and running, you can use the docker ps command to list all running containers.


```
docker ps
```


You should see an output similar to this:


```
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS      NAMES
2bf310d7e1e3   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   5432/tcp   my-postgres
```


This indicates that the my-postgres container is running, and PostgreSQL is accessible on port 5432.

### 4. Connecting to the PostgreSQL Database

You can connect to the PostgreSQL database running inside the container using various PostgreSQL client tools. For example, you can use the psql client to connect to the database.


```
docker exec -it my-postgres psql -U postgres
```


This command opens an interactive psql session as the postgres user in the my-postgres container.

### 5. Performing Database Operations

Once connected to the PostgreSQL database, you can perform various database operations. For example, you can create a new database using SQL commands.


```
CREATE DATABASE mydatabase;
```


This command creates a new database named mydatabase within the PostgreSQL server.

## Conclusion

Setting up PostgreSQL with Docker is straightforward and efficient. By pulling the PostgreSQL image and running a container with the desired configuration, you can quickly deploy PostgreSQL instances for your development or production environments. In the next chapter, we’ll explore how to set up pgAdmin, a graphical administration tool for PostgreSQL, using Docker.

## Chapter 3: Managing PostgreSQL with pgAdmin

pgAdmin is a popular open-source graphical user interface (GUI) for PostgreSQL that simplifies database administration tasks. By running pgAdmin in a Docker container, you can easily manage your PostgreSQL databases in a convenient and isolated environment. In this chapter, we’ll explore how to set up pgAdmin with Docker and demonstrate some common management tasks using code examples.

### 1. Pulling the pgAdmin Docker Image

First, let’s pull the official pgAdmin Docker image from Docker Hub.


```
docker pull dpage/pgadmin4
```


This command fetches the latest version of the pgAdmin image and stores it locally on your system.

### 2. Running a pgAdmin Container

Now, let’s run a pgAdmin container using the Docker command-line interface. We’ll specify environment variables to configure pgAdmin, including the login credentials.


```
docker run --name my-pgadmin -p 5050:5050 -e PGADMIN_DEFAULT_EMAIL=user@example.com -e PGADMIN_DEFAULT_PASSWORD=mysecretpassword -d dpage/pgadmin4
```


Here’s a breakdown of the command:

- `--name my-pgadmin:` Assigns a name to the pgAdmin container.
- `-p 5050:5050:` Maps port 5050 on the host to port 5050 in the container, allowing access to pgAdmin’s web interface.
- `-e PGADMIN_DEFAULT_EMAIL=user@example.com:` Sets the default email address for logging in to pgAdmin.
- `-e PGADMIN_DEFAULT_PASSWORD=mysecretpassword:` Sets the default password for logging in to pgAdmin.
- `-d:` Runs the container in detached mode.

Once the pgAdmin container is running, you can access it through a web browser by navigating to <http://localhost:5050>. Log in using the email address and password specified earlier (`user@example.com` and `mysecretpassword`, respectively).

**4. Managing PostgreSQL Databases**

With pgAdmin up and running, you can perform various database management tasks, such as creating databases, tables, and users, executing SQL queries, and managing data. Let’s demonstrate how to create a new database using pgAdmin’s web interface.

1. Log in to pgAdmin through your web browser.
2. In the navigation pane, expand the “Servers” node and select “Add New Server.”
3. Enter the connection details for your PostgreSQL server, including the host, port, username, and password.
4. Click “Save” to connect to the PostgreSQL server.
5. Once connected, right-click on the “Databases” node and select “Create > Database.”
6. Enter the name of the new database and any desired options, then click “Save” to create the database.

We have looked at using pgAdmin in a Docker container to handle PostgreSQL databases in this chapter. You can simply administrate your PostgreSQL databases using an intuitive web interface by obtaining the pgAdmin image and starting a container with the right setup. We’ll explore sophisticated Docker Compose setups to coordinate PostgreSQL and pgAdmin containers in the upcoming chapter.

## Chapter 4: Configuring PostgreSQL and pgAdmin

Configuring PostgreSQL and pgAdmin involves setting up environment variables, defining volumes, and specifying network configurations to ensure seamless communication between the containers. In this chapter, we’ll explore how to configure PostgreSQL and pgAdmin using Docker Compose, a tool for defining and running multi-container Docker applications.

**1. Creating a Docker Compose File**

First, let’s create a Docker Compose file named `docker-compose.yml` in your project directory.


```
version: '3'
services:
  postgres:
    image: postgres
    environment:
      POSTGRES_PASSWORD: mysecretpassword
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: user@example.com
      PGADMIN_DEFAULT_PASSWORD: mysecretpassword
    ports:
      - "5050:5050"
volumes:
  pgdata:
```


In this Docker Compose file:

- We define two services: `postgres` for PostgreSQL and `pgadmin` for pgAdmin.
- For the `postgres` service:

- We use the official PostgreSQL image.
- Set the `POSTGRES_PASSWORD` environment variable to `mysecretpassword` to secure the PostgreSQL instance.
- Expose port 5432 to allow connections to PostgreSQL.
- Define a volume named `pgdata` to persist PostgreSQL data.

- For the `pgadmin` service:

- We use the official pgAdmin image.
- Set the `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` environment variables for logging in to pgAdmin.
- Expose port 5050 to access pgAdmin’s web interface.

**2. Running the Docker Compose Configuration**

To start PostgreSQL and pgAdmin using the Docker Compose configuration, run the following command in your terminal:


```
docker-compose up -d
```


This command reads the `docker-compose.yml` file and creates and starts the defined services in detached mode (`-d`).

**3. Accessing pgAdmin**

Once the Docker Compose configuration is running, you can access pgAdmin through a web browser by navigating to <http://localhost:5050>. Log in using the email address and password specified in the Docker Compose file (`user@example.com` and `mysecretpassword`, respectively).

**4. Connecting to PostgreSQL from pgAdmin**

To connect pgAdmin to the PostgreSQL database, follow these steps:

1. Log in to pgAdmin through your web browser.
2. In the navigation pane, expand the “Servers” node and select “Add New Server.”
3. Enter the connection details for PostgreSQL, including the host (`postgres`), port (`5432`), username (`postgres`), and password (`mysecretpassword`) specified in the Docker Compose file.
4. Click “Save” to connect to the PostgreSQL server.

In this chapter, we’ve configured PostgreSQL and pgAdmin using Docker Compose, defining environment variables, volumes, and network configurations. By orchestrating PostgreSQL and pgAdmin containers together, you can streamline database administration tasks and ensure seamless communication between the components. In the next chapter, we’ll explore best practices for managing Dockerized databases to maintain security and reliability.

## Chapter 5: Best Practices for Dockerized Databases

Managing Dockerized databases involves adopting best practices to enhance security, reliability, and performance. In this chapter, we’ll discuss essential strategies for optimizing your Docker containers running PostgreSQL and pgAdmin.

**1. Use Environment Variables for Configuration**

Instead of hardcoding sensitive information like passwords directly into your Docker Compose files or Dockerfiles, utilize environment variables. This approach enhances security by keeping sensitive data out of version control and simplifies configuration management across different environments.

**2. Implement Data Persistence with Volumes**

Ensure data persistence by mounting volumes in your Docker containers. Volumes allow data to persist beyond the lifecycle of containers, facilitating database backups, upgrades, and migrations without risking data loss.

**3. Secure Communication with Networks**

Use Docker networks to isolate services and control communication between containers. By configuring networks, you can restrict access to sensitive databases like PostgreSQL, ensuring that only authorized services can interact with them.

**4. Regularly Update Docker Images**

Stay current with security patches and feature updates by regularly updating Docker images for PostgreSQL and pgAdmin. Automate image updates where possible to minimize vulnerabilities and leverage new features without manual intervention.

**5. Monitor Containerized Databases**

Implement monitoring solutions to track performance metrics, resource utilization, and potential issues within your Dockerized databases. Monitoring tools provide insights into container health, database activity, and help preemptively address performance bottlenecks or failures.

**6. Implement Backup and Recovery Strategies**

Establish robust backup and recovery mechanisms for Dockerized databases. Schedule automated backups of PostgreSQL databases and pgAdmin configurations to safeguard against data loss due to accidents, hardware failures, or security incidents.

By adhering to these best practices, you can optimize the management of Dockerized databases, ensuring they operate securely, reliably, and efficiently. In the following sections, we’ll delve deeper into each practice, providing implementation details and considerations for maximizing the benefits of containerized database environments.

## Conclusion

Managing PostgreSQL and pgAdmin in Docker containers offers flexibility, scalability, and ease of management for database administrators and developers. By leveraging Docker Compose and adopting best practices for Dockerized databases, you can streamline operations, enhance security, and maintain high availability for your database applications.

Throughout this guide, we’ve explored setting up PostgreSQL and pgAdmin using Docker, configuring environments, managing data persistence, securing communications, and implementing monitoring and backup strategies. Armed with these insights, you’re well-equipped to deploy and manage robust database solutions in Docker containers effectively.

For further reading and advanced topics, refer to Docker’s official documentation, PostgreSQL’s documentation, and community resources to stay updated with the latest advancements and best practices in containerized database management.
