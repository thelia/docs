---
title: Getting Started
sidebar_position: 1
---

# Getting Started

Install Thelia 3 and get your store running.

## With DDEV (Recommended)

```bash
git clone https://github.com/thelia/thelia.git
cd thelia && git checkout twig

ddev start
ddev composer install
ddev exec php bin/install
ddev launch
```

Your store is at **https://thelia-3.ddev.site** — back-office at `/admin`.

Want demo data and an admin account?

```bash
ddev exec php bin/install --with-demo --with-admin \
    --admin_login=admin --admin_password=admin123
```

## Without DDEV

```bash
git clone https://github.com/thelia/thelia.git
cd thelia && git checkout twig
composer install

DATABASE_HOST=localhost DATABASE_NAME=thelia \
DATABASE_USER=root DATABASE_PASSWORD=secret \
php bin/install --with-demo --with-admin

php -S localhost:8000 -t public
```

## Prerequisites

- **PHP 8.2+** with extensions: PDO_MySQL, openssl, intl, gd, curl, dom
- **Composer 2+**
- **MySQL 8.0+** or **MariaDB 10.6+**

## Next Steps

| Guide | Description |
|-------|-------------|
| [DDEV Installation](./ddev) | Detailed DDEV setup, commands, and services |
| [Standard Installation](./installation) | Manual PHP/MySQL setup for production |
| [Install Reference](./install-reference) | All `bin/install` options and env vars |
| [Configuration](./configuration) | Environment variables and Symfony config |
| [First Steps](./first-steps) | Create your first product |
