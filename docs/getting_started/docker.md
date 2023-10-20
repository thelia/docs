---
title: Dockerize your Thelia
sidebar_position: 6
---

A docker configuration is provided in the repository of Thelia. It uses docker-compose. 

It requires obviously [docker](https://docker.com/) and [docker-compose](http://docs.docker.com/compose/)

## Get the project

### With composer

Run the composer command shown in the [dedicated page](/docs/getting_started/Installation).

### Or download the archive

You can download the archive from official [releases pages](https://github.com/thelia/thelia-project/releases). Then, you will need to execute this command at root path:

``` 
composer install
```

## Run docker

First, copy and paste content from file `.env.docker` to `.env` (at the beginning of the file).

A script has been written to execute everything you need for docker. Just run this command from a terminal :

``` 
bash ./start-docker.sh
```

If you want demo datas, add `-demo` argument to the command.

*Sometimes, database connection fail and ask you connection information. Simply stop the script with `CTRL+C` then run again the script.*

It will ask you a template name, you can write `modern` or `default`.

If you have permission errors at the end of the execution or in the browser, simply run this from your terminal :

``` 
sudo chmod -R 777 var/log
sudo chmod -R 777 var/cache
sudo chmod -R 777 web
```

Your website should be accessible here : http://localhost:8080

## PHP command

To be able to run PHP command, you first need to execute this if you need :

``` 
docker-compose exec php-fpm bash
```

You will be inside the php docker container.
You can now simply run commands like this :

``` 
php Thelia c:c
php Thelia admin:create
php local/setup/import.php
``` 

## Shut down docker

Run this command from your root path if you need to stop your docker containers:
``` 
docker-compose down
```


## How to change the configuration

All the configuration can be customize for your own project. It uses the official [php image](https://hub.docker.com/_/php/) provided by docker so you can change the php version as you want.
You can also install all the extension you want.

Each time you modify the configuration, you have to rebuild the containers : ```docker-composer build --no-cache```
