---
title: Getting Started
sidebar_position: 1
---

# Getting Started

Install Thelia 3 and get your store running.

## Start a new store

```bash
composer create-project thelia/thelia-project my-shop --stability=beta
cd my-shop
```

Thelia 3.0.0-beta1 is a pre-release, so `--stability=beta` is required for Composer to select it.
The skeleton gives you a project without the core sources in your repository. From there, follow
either of the two setups below, starting at `bin/install`.

To work on Thelia itself, clone the repository instead: `git clone https://github.com/thelia/thelia.git`.

## With DDEV (recommended)

```bash
git clone https://github.com/thelia/thelia.git
cd thelia

ddev start
ddev composer install
ddev exec php bin/install --frontoffice_theme=flexy
ddev exec bash -c "cd templates/frontOffice/flexy && npm install && npm run build"
ddev exec bash -c "cd templates/backOffice/default-twig && npm install && npm run build"
ddev launch
```

The `flexy` front-office and `default-twig` back-office themes ship their assets as source and must
be built with Webpack Encore before the pages render. Skipping the `npm run build` step leaves them
on a *"Could not find the entrypoints file from Webpack"* error.

Your store is at https://thelia.ddev.site, with the back-office at `/admin`. DDEV derives that
hostname from the directory name, so a project created in `my-shop/` answers on
https://my-shop.ddev.site. Run `ddev describe` to check.

To add demo data and an admin account:

```bash
ddev exec php bin/install --frontoffice_theme=flexy \
    --with-demo --with-admin \
    --admin_login=admin --admin_password=admin123
```

## Without DDEV

```bash
git clone https://github.com/thelia/thelia.git
cd thelia
composer install

php bin/install --database_host=localhost --database_name=thelia \
    --database_user=root --database_password=secret \
    --frontoffice_theme=flexy --with-demo --with-admin

(cd templates/frontOffice/flexy && npm install && npm run build)
(cd templates/backOffice/default-twig && npm install && npm run build)

php -S localhost:8000 -t public
```

## Prerequisites

- **PHP 8.3+** with extensions: PDO_MySQL, openssl, intl, gd, curl, dom
- **Composer 2+**
- **MySQL 8.0+** or **MariaDB 10.6+**

## Next steps

| Guide | Description |
|-------|-------------|
| [DDEV Installation](./ddev.md) | Detailed DDEV setup, commands, and services |
| [Standard Installation](./installation.md) | Manual PHP/MySQL setup for production |
| [Install Reference](./install-reference.md) | All `bin/install` options and env vars |
| [Configuration](./configuration.md) | Environment variables and Symfony config |
| [First Steps](./first-steps.md) | Create your first product |
