---
title: thelia:install
---

## Description
Install Thelia using the Symfony console command.

:::tip Preferred Method
For fresh installations, use `php bin/install` instead — it works without a booted kernel. See [Getting Started](/docs/getting-started).
:::

## Usage
```shell 
php Thelia thelia:install [options]
```

## Options
-   `--database_host[=DATABASE_HOST]`          Database host [default: "localhost"]
-   `--database_username[=DATABASE_USERNAME]`  Database username
-   `--database_password[=DATABASE_PASSWORD]`  Database password
-   `--database_name[=DATABASE_NAME]`          Database name
-   `--database_port[=DATABASE_PORT]`          Database port [default: "3306"]

## Example

```shell
php Thelia thelia:install --database_host localhost --database_username myuser --database_password secret --database_name thelia
```
