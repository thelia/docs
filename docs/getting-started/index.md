---
title: Getting Started
sidebar_position: 1
---

# Getting Started

Install Thelia 3 and get your store running.

## With DDEV (recommended)

```bash
git clone https://github.com/thelia/thelia.git
cd thelia && git checkout twig

ddev start
ddev composer install
ddev exec php bin/install --frontoffice_theme=flexy --backoffice_theme=default-twig
ddev exec bash -c "cd templates/frontOffice/flexy && npm install && npm run build"
ddev exec bash -c "cd templates/backOffice/default-twig && npm install && npm run build"
ddev launch
```

The `flexy` front-office and `default-twig` back-office themes ship their assets as source and must
be built with Webpack Encore before the pages render — skipping the `npm run build` step leaves them
on a *"Could not find the entrypoints file from Webpack"* error. Pass
`--backoffice_theme=default-twig` to `bin/install` (it defaults to the legacy Smarty `default`);
otherwise `/admin` fails with `Unknown "safe_hook" function`.

Your store is at https://thelia-3.ddev.site, with the back-office at `/admin`.

To add demo data and an admin account:

```bash
ddev exec php bin/install --frontoffice_theme=flexy --backoffice_theme=default-twig \
    --with-demo --with-admin \
    --admin_login=admin --admin_password=admin123
```

## Without DDEV

```bash
git clone https://github.com/thelia/thelia.git
cd thelia && git checkout twig
composer install

DATABASE_HOST=localhost DATABASE_NAME=thelia \
DATABASE_USER=root DATABASE_PASSWORD=secret \
php bin/install --frontoffice_theme=flexy --backoffice_theme=default-twig --with-demo --with-admin

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
