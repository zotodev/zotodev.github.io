---
title: Run Postgres and pgWeb on Docker
---

# Create the Environment File

## .env

> POSTGRES\_USER=your\_postgres\_user
> POSTGRES\_PASSWORD=your\_postgres\_password
> POSTGRES\_DB=your\_postgres\_db

![](/assets/images/run-postgres-and-pgweb-on-docker/01-86e51bca.png)

# Update the docker-compose.yml File

![](/assets/images/run-postgres-and-pgweb-on-docker/02-d0066654.png)

> version: '3.8'
> services:
>      db:
>          image: postgres:latest
>          container\_name: postgres\_db
>          env\_file:
>              - .env
>          ports:
>              - "5432:5432"
>          volumes:
>              - postgres\_data:/var/lib/postgresql/data
>
> pgweb:
>
> image: sosedoff/pgweb
>         container\_name: pgweb
>         depends\_on:
>              - db
>          ports:
>              - "8081:8081"
>          environment:
>              -DATABASE\_URL=postgres://${POSTGRES\_USER}:${POSTGRES\_PASSWORD}@db:5432/${POSTGRES\_DB}?sslmode=disable
>          env\_file:
>              - .env
> volumes:
>
> postgres\_data:

# Steps to Run the Containers

1. **Create the Environment File:** Create a file named .env and add the PostgreSQL environment variables as shown above.
2. **Create the Docker Compose File:** Create a file named docker-compose.yml and add the content provided.
3. **Run Docker Compose:** Open a terminal, navigate to the directory where these files are located, and run:

> docker-compose up -d

# Explanation

- **Environment File****:** Both PostgreSQL and PGWeb services use the same .env file.
- **DATABASE\_URL**: The DATABASE\_URL in the PGWeb service is constructed using environment variables defined in the common .env file.

> You can access PGWeb at http://localhost:8081 to manage your PostgreSQL database.

![](/assets/images/run-postgres-and-pgweb-on-docker/03-0dc5d327.png)
