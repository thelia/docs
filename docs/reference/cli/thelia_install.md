---
title: thelia:install
---

## Description
Install thelia using cli tools.

## Usage
```shell 
thelia:install [options]
```

## Options
-   `--db_host[=DB_HOST]`          host for your database [default: "localhost"]
-   `--db_username[=DB_USERNAME]`  username for your database
-   `--db_password[=DB_PASSWORD]`  password for your database
-   `--db_name[=DB_NAME]`          database name
-   `--db_port[=DB_PORT]`          database port [default: "3306"]



## Example

Example to install Thelia in one line
```shell
php Thelia thelia:install --db_host localhost --db_username myuser --db_password StRoNgPaSsWoRd --db_name thelia --db_port 3306
```