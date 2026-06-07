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

When run without options, the command prompts for each value. Any option you pass on the command line skips the matching prompt. The interactive prompts check the login and email for uniqueness and ask for the password twice. Values passed through options skip those checks.

## Example
Create an admin in one line
```shell
php Thelia admin:create --login_name admin --password StRoNgPaSsWoRd --last_name Admin --first_name Shop --email admin@example.com
```

:::tip Install-time alternative
You don't need this command for the first administrator. The installer creates one for you when you pass `--with-admin`:

```shell
php bin/install --with-demo --with-admin \
    --admin_login=admin --admin_password=StRoNgPaSsWoRd \
    --admin_first_name=Shop --admin_last_name=Admin \
    --admin_email=admin@example.com
```

Use `admin:create` later to add more administrators. See the [Install Reference](../../getting-started/install-reference.md) for all installer options.
:::