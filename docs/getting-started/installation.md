---
title: Standard Installation
sidebar_position: 2
---

# Standard Installation

This guide covers installing Thelia 3 on a standard PHP/MySQL environment without Docker.

:::tip Recommended for development
For local development, use **[DDEV](./ddev)**. It gives a faster and more consistent setup.
:::

## Prerequisites

### PHP 8.2+

```bash
php -v
# PHP 8.2.x (cli) ...
```

**Required extensions:**

```bash
php -m | grep -E "pdo_mysql|openssl|intl|gd|curl|dom"
```

All of these should be present: `pdo_mysql`, `openssl`, `intl`, `gd`, `curl`, `dom`.

**PHP configuration** (`php.ini`):

```ini
memory_limit = 256M
post_max_size = 20M
upload_max_filesize = 10M
date.timezone = Europe/Paris
```

### Composer 2+

```bash
composer --version
```

### Database

MySQL 8.0+ or MariaDB 10.6+:

```sql
CREATE DATABASE thelia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'thelia'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON thelia.* TO 'thelia'@'localhost';
FLUSH PRIVILEGES;
```

## Installation steps

### 1. Get the code

**From GitHub (development):**

```bash
git clone https://github.com/thelia/thelia.git
cd thelia
git checkout twig
```

**With Composer (project):**

```bash
composer create-project thelia/thelia-project my-shop
cd my-shop
```

### 2. Install dependencies

```bash
composer install
```

### 3. Install Thelia

`bin/install` is a standalone script that sets up the database, registers modules, and configures templates. Database credentials are passed as environment variables:

```bash
DATABASE_HOST=localhost DATABASE_NAME=thelia \
DATABASE_USER=thelia DATABASE_PASSWORD=your_password \
php bin/install
```

#### With demo data and admin user

```bash
DATABASE_HOST=localhost DATABASE_NAME=thelia \
DATABASE_USER=thelia DATABASE_PASSWORD=your_password \
php bin/install \
    --with-demo \
    --with-admin \
    --admin_login=admin \
    --admin_password=admin123 \
    --admin_email=admin@example.com
```

#### All options

**Environment variables (database):**

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_HOST` | - | Database hostname |
| `DATABASE_PORT` | `3306` | Database port |
| `DATABASE_NAME` | - | Database name |
| `DATABASE_USER` | - | Database user |
| `DATABASE_PASSWORD` | - | Database password |

**CLI options (themes and setup):**

| Option | Default | Description |
|--------|---------|-------------|
| `--frontoffice_theme` | `flexy` | Front-office template |
| `--backoffice_theme` | `default` | Back-office template |
| `--pdf_theme` | `default` | PDF template |
| `--email_theme` | `default` | Email template |
| `--with-demo` | - | Import demo catalog |
| `--with-admin` | - | Create admin user |
| `--admin_login` | `thelia` | Admin username |
| `--admin_password` | `thelia` | Admin password |
| `--admin_first_name` | `Admin` | Admin first name |
| `--admin_last_name` | `Thelia` | Admin last name |
| `--admin_email` | `admin@thelia.net` | Admin email |

### 4. Start the development server

```bash
php -S localhost:8000 -t public
```

### 5. Access your site

- **Front-office**: http://localhost:8000
- **Back-office**: http://localhost:8000/admin

## Post-Installation

### Create admin user (if not created during install)

```bash
php Thelia admin:create
```

### Clear cache

```bash
php Thelia cache:clear
```

## Production setup

### Web server configuration

- [Apache Configuration](./apache-configuration)
- [Nginx Configuration](./nginx-configuration)

### Environment mode

Set production mode in `.env.local`:

```bash
APP_ENV=prod
APP_DEBUG=0
```

### Cache and assets

```bash
php Thelia cache:clear --env=prod
php Thelia cache:warmup --env=prod
```

## Useful commands

```bash
php Thelia cache:clear
php Thelia admin:create
php Thelia module:list
php Thelia module:activate ModuleName
php Thelia module:deactivate ModuleName
php Thelia module:refresh
```

## Troubleshooting

### Memory limit error

```bash
php -d memory_limit=512M bin/install
```

### Permission denied

```bash
sudo chown -R www-data:www-data var/
chmod -R 755 var/cache var/log
```

### Database connection error

Verify credentials and ensure the MySQL user has proper permissions:

```sql
GRANT ALL PRIVILEGES ON thelia.* TO 'thelia'@'localhost';
FLUSH PRIVILEGES;
```

## Next steps

- [Configuration](./configuration): configure your store
- [First steps](./first-steps): create products and customize
- [Architecture](/docs/architecture): understand Thelia 3 internals
