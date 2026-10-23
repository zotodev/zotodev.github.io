---
title: Caddy as a Reverse Proxy with Docker
---

# Caddy v2 Reverse Proxy

###### guide-by-example

![logo](/assets/images/caddy-as-a-reverse-proxy-with-docker/01-09ae82c1.png)

1. [Purpose & Overview](#Purpose--Overview)
2. [Caddy as a reverse proxy in docker](#Caddy-as-a-reverse-proxy-in-docker)
3. [Caddy more info and various configurations](#Caddy-more-info-and-various-configurations)
4. [Caddy DNS challenge](#Caddy-DNS-challenge)
5. [Monitoring](#monitoring)
6. [Other guides](#other-guides)

# Purpose & Overview

Reverse proxy is needed if one wants access to services based on the
hostname.
For example `nextcloud.example.com` points traffic to nextcloud
docker container, while `jellyfin.example.com` points to the
media server on the network.

- [Official site](https://caddyserver.com/v2)
- [Official documentation](https://caddyserver.com/docs/)
- [Forum](https://caddy.community/)
- [Github](https://github.com/caddyserver/caddy)

Caddy is a pretty damn good web server with automatic HTTPS. Written in
Go.

Web servers are build to deal with http traffic, so they are the obvious
choice for the function of reverse proxy. In this setup Caddy is used
mostly as
[a TLS termination proxy](https://www.youtube.com/watch?v=H0bkLsUe3no). Https encrypted tunel ends with it, so that the traffic can be analyzed
and send to a correct webserver based on the settings in
`Caddyfile`.

Caddy with its build-in automatic https allows configs to be clean and
simple and to just work.


```
nextcloud.example.com {
  reverse_proxy nextcloud-web:80
}

jellyfin.example.com {
  reverse_proxy 192.168.1.20:80
}
```


And **just works** means fully works. No additional
configuration needed for https redirect, or special services if target is
not a container, or need to deal with load balancer, or need to add
boilerplate headers for x-forward, or other extra work.
It has great out of the box defaults, fitting majority of uses and only
some special casess with extra functionality need extra work.

![url](/assets/images/caddy-as-a-reverse-proxy-with-docker/02-a45baa87.png)

# Caddy as a reverse proxy in docker

Caddy will be running as a docker container, will be in charge of ports 80
and 443, and will route traffic to other containers, or machines on the
network.

### - Create a new docker network


```
docker network create caddy_net
```


All the future containers and Caddy must be on this new network.

Can be named whatever you want, but it must be a new custom named network.
Otherwise
[dns resolution would not work](https://docs.docker.com/network/drivers/bridge/)
and containers would not be able to target each other just by the
hostname.

### - Files and directory structure


```
/home/
└── ~/
    └── docker/
        └── caddy/
            ├── 🗁 caddy_config/
            ├── 🗁 caddy_data/
            ├── 🗋 .env
            ├── 🗋 Caddyfile
            └── 🗋 docker-compose.yml
```


- `caddy_config/` - a directory containing configs that Caddy
  generates, most notably `autosave.json` which is a backup of
  the last loaded config
- `caddy_data/` - a directory storing TLS certificates
- `.env` - a file containing environment variables for docker
  compose
- `Caddyfile` - Caddy configuration file
- `docker-compose.yml` - a docker compose file, telling docker
  how to run containers

You only need to provide the three files.
The directories are created by docker compose on the first run, the
content of these is visible only as root of the docker host.

### - Create docker-compose.yml and .env file

Basic simple docker compose, using the official caddy image.
Ports 80 and 443 are published/mapped on to docker host as Caddy is the
one in charge of any traffic coming there.

#### docker-compose.yml


```
services:

  caddy:
    image: caddy
    container_name: caddy
    hostname: caddy
    restart: unless-stopped
    env_file: .env
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./caddy_config:/config
      - ./caddy_data:/data

networks:
  default:
    name: $DOCKER_MY_NETWORK
    external: true
```


#### .env


```
# GENERAL
TZ=Europe/Bratislava
DOCKER_MY_NETWORK=caddy_net
MY_DOMAIN=example.com
```


You obviously want to change `example.com` to your domain.

### - Create Caddyfile

#### Caddyfile


```
a.{$MY_DOMAIN} {
    reverse_proxy whoami:80
}

b.{$MY_DOMAIN} {
    reverse_proxy nginx:80
}
```


`a` and `b` are the subdomains, can be named
whatever.
For them to work they **must have type-A DNS record set**,
that points at your public ip set on Cloudflare, or wherever the domains
DNS is managed.
Can test if correctly set with online dns lookup tools,
[like this one.](https://mxtoolbox.com/DNSLookup.aspx)

The value of `{$MY_DOMAIN}` is provided by the
`.env` file.
The subdomains point at docker containers by their
**hostname** and **exposed port**. So every
docker container you spin should have hostname defined and be on
`caddy_net`.

### Setup some docker containers

Something light to setup to route to that has a webpage to show.
Not bothering with an `.env` file here.

Note the lack of published/mapped ports in the compose, as they will be
accessed only through Caddy, which has its ports published.
Containers on the same bridge docker network can access each other on
any port.
**extra info:**
To know which ports containers have exposed - `docker ps`, or
`docker port <container-name>`, or use
[ctop](https://github.com/bcicen/ctop).

#### welcome-compose.yml


```
services:

  whoami:
    image: "containous/whoami"
    container_name: "whoami"
    hostname: "whoami"

networks:
  default:
    name: caddy_net
    external: true
```


#### nginx-compose.yml


```
services:

  nginx:
    image: nginx:latest
    container_name: nginx
    hostname: nginx

networks:
  default:
    name: caddy_net
    external: true
```


# Caddy DNS challenge

This setup only works for Cloudflare.

DNS challenge authenticates ownership of the domain by requesting that the
owner puts a specific TXT record in to the domains DNS zone.
Benefit of using DNS challenge is that there is no need for your server to
be reachable by the letsencrypt servers. Cant open ports or want to
exclude entire world except your own country from being able to reach your
server? DNS challange is what you want to use for https then.
It also allows for issuance of wildcard certificates.
The drawback is a potential security issue, since you are creating a token
that allows full control over your domain's DNS. You store this token
somewhere, you are giving it to some application from dockerhub...

### - Create API token on Cloudflare

[On Cloudflare](https://dash.cloudflare.com/profile/api-tokens)
create a new API Token with two permissions,
[pic of it here](https://i.imgur.com/YWxgUiO.png)

- zone/zone/read
- zone/dns/edit

Include all zones needs to be set.

### - Edit .env file

Add `CLOUDFLARE_API_TOKEN` variable with the value of the newly
created token.

#### .env


```
MY_DOMAIN=example.com
DOCKER_MY_NETWORK=caddy_net

CLOUDFLARE_API_TOKEN=<cloudflare api token goes here>
```


### - Create Dockerfile

To add support, Caddy needs to be compiled with
[Cloudflare DNS plugin](https://github.com/caddy-dns/cloudflare).
This is done by using your own Dockerfile, using the
`builder` image.

Create a directory `dockerfile-caddy` in the caddy
directory.
Inside create a file named `Dockerfile`.

#### Dockerfile


```
FROM caddy:2.8.4-builder AS builder

RUN xcaddy build \
    --with github.com/caddy-dns/cloudflare

FROM caddy:2.8.4

COPY --from=builder /usr/bin/caddy /usr/bin/caddy
```


of note - if making changes in the Dockerfile after running, use command
`docker compose down --rmi local` to remove locally built
containers and force rebuild on the next compose up.

### - Edit docker-compose.yml

`image` replaced with `build` option pointing at the
`Dockerfile` location
and `CLOUDFLARE_API_TOKEN` variable added.

#### docker-compose.yml


```
services:

  caddy:
    build: ./dockerfile-caddy
    container_name: caddy
    hostname: caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    environment:
      - MY_DOMAIN
      - CLOUDFLARE_API_TOKEN
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./caddy_data:/data
      - ./caddy_config:/config

networks:
  default:
    name: $DOCKER_MY_NETWORK
    external: true
```


### - Edit Caddyfile

Add global option `acme_dns`
or add `tls` directive to the site-blocks.

#### Caddyfile


```
{
  acme_dns cloudflare {$CLOUDFLARE_API_TOKEN}
}

a.{$MY_DOMAIN} {
    reverse_proxy whoami:80
}

b.{$MY_DOMAIN} {
    reverse_proxy nginx:80
    tls {
        dns cloudflare {$CLOUDFLARE_API_TOKEN}
    }
}
```


### - Wildcard certificate

A one certificate to rule all subdomains. But not apex/naked domain, thats
separate.
As shown in
[the documentation](https://caddyserver.com/docs/caddyfile/patterns#wildcard-certificates), the subdomains must be moved under the wildcard site block and make use
of host matching and handles.

#### Caddyfile


```
{
    email abc@example.com
}

logs.example.com {
    reverse_proxy dozzle:8080
}

docker.example.com {
    reverse_proxy dockge:5001
}

auth.example.com {
    reverse_proxy authelia:9091
}

supabase.example.com {
    forward_auth authelia:9091 {
        uri /api/verify?rd=https://auth.example.com
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }
    reverse_proxy studio:3000
}
```
