---
title: Dockerize your Thelia
sidebar_position: 4
---

A docker configuration is provided in the repository of Thelia. It uses docker-compose. 

It requires obviously [docker](https://docker.com/) and [docker-compose](http://docs.docker.com/compose/)

## start the containers

Simply run : 

```
docker-compose up -d
```

tip : create an alias for docker-compose, it's boring to write it all the time

## How to use it

All the script are launched through docker. For examples : 

```
docker exec -it thelia_web_1 php Thelia cache:clear
docker exec -it thelia_web_1 php setup/faker.php
docker exec -it thelia_web_1 unit-tests.sh
docker exec -it thelia_web_1 php composer.phar install
```

```thelia_web_1``` is the name of your main container. run ```docker-compose``` if your container name is different.

You can now use Thelia exactly as if you have all the php/apache/mysql stack installed on your machine. This configuration contains xdebug so you can also use the ste by step feature.

## Database information

* host : mariaDB
* login : root
* password : toor


## How to change the configuration

All the configuration can be customize for your own project. It uses the official [php image](https://hub.docker.com/_/php/) provided by docker so you can change the php version as you want.
You can also install all the extension you want.

Each time you modify the configuration, you have to rebuild the containers : ```docker-composer build --no-cache```
