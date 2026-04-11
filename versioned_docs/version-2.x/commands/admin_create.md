---
title: admin:create
---

## Description
Create a new administrator user

## Usage
```shell
  admin:create [options]
```

## Options
 -    `--login_name[=LOGIN_NAME]`  Admin login name
 -    `--first_name[=FIRST_NAME]`  User first name
 -    `--last_name[=LAST_NAME]`    User last name
 -    `--email[=EMAIL]`            Admin email address
 -    `--locale[=LOCALE]`          Preferred locale (default: en_US)
 -    `--password[=PASSWORD]`      Password

## Example
Create an admin in one line
```shell
php Thelia admin:create --login_name thelia2 --password StRoNgPaSsWoRd --last_name thelia2 --first_name thelia2 --email thelia2@example.com
```