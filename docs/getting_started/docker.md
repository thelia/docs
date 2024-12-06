---
title: Dockerize your Thelia
sidebar_position: 6
---

A docker configuration is provided in the repository of Thelia. It uses docker compose.

It requires obviously [docker](https://docker.com/) and [docker compose](http://docs.docker.com/compose/)

## Get the project

### With composer

Run the composer command shown in the [dedicated page](/docs/getting_started/Installation).

### Or download the archive

You can download the archive from official [releases pages](https://github.com/thelia/thelia/releases).

## Run docker

> ⚠️ **Important** : First, copy and paste content from file `.env.docker` to `.env` file.
Change default values if needed, but default values should work. You should overrides default values with a `.env.local` file.
> Then, add the following line to your `.env` file :
> ```
> MYSQL_DATABASE=thelia
> MYSQL_ROOT_PASSWORD=root
> MYSQL_USER=thelia
> MYSQL_PASSWORD=thelia
> ```


Then execute this command from the root path of the project :
```
docker compose up -d
```


Your website should be accessible here, but not yet installed : [http://localhost:8080](http://localhost:8080)  . You should see "Thelia is not installed".

## Initial commands

To be able to run PHP command, you first need to execute this if you need :

``` 
docker compose exec php-fpm bash
```

You will be inside the php docker container. From here, you have to follow the classic installation process of Thelia ( cf: [installation page](/docs/getting_started/Installation) )

A few differences :
- you have to use the database host `docker-thelia-mariadb` instead of `localhost`
- use `thelia` (if you didn't change it) as the database name, user and password
- to install modern theme, please execute command from your host (not inside docker container)
- execute php commands of the installation process inside the docker container (only php commands)

If you have permission errors at the end of the execution or in the browser, simply run this from your host terminal :

``` 
sudo chmod -R 777 var/log
sudo chmod -R 777 var/cache
sudo chmod -R 777 web
```

From here, your Thelia might be correctly installed.
Your website should be accessible here : [http://localhost:8080](http://localhost:8080) .


## To go further

Environment variables are set in the `.env` file, if you change them, you have to restart the container :
```bash
docker compose down --remove-orphans
docker compose up -d
docker compose exec php-fpm bash
rm -rf var/cache/*
```

You can now run commands like this inside your container :

``` 
php Thelia c:c
php Thelia admin:create
php local/setup/import.php
``` 

## Shut down docker

Run this command from your root path if you need to stop your docker containers:
``` 
docker compose down --remove-orphans
```


## How to change the configuration

All the configuration can be customize for your own project. It uses the official [php image](https://hub.docker.com/_/php/) provided by docker so you can change the php version as you want.
You can also install all the extension you want.

Each time you modify the configuration, you have to rebuild the containers : ```docker composer build --no-cache```