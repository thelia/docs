---
title: Standard Installation
sidebar_position: 2
---

# Standard Installation

This guide covers installing Thelia 3 on a standard PHP/MySQL environment without Docker.

:::tip Recommended for Development
For local development, we recommend using **[DDEV](./ddev)** for a faster, more consistent setup.
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

## Installation Steps

### 1. Get the Code

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

### 2. Install Dependencies

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

#### With Demo Data and Admin User

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

#### All Options

**Environment variables (database):**

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_HOST` | — | Database hostname |
| `DATABASE_PORT` | `3306` | Database port |
| `DATABASE_NAME` | — | Database name |
| `DATABASE_USER` | — | Database user |
| `DATABASE_PASSWORD` | — | Database password |

**CLI options (themes and setup):**

| Option | Default | Description |
|--------|---------|-------------|
| `--frontoffice_theme` | `flexy` | Front-office template |
| `--backoffice_theme` | `default` | Back-office template |
| `--pdf_theme` | `default` | PDF template |
| `--email_theme` | `default` | Email template |
| `--with-demo` | — | Import demo catalog |
| `--with-admin` | — | Create admin user |
| `--admin_login` | `thelia` | Admin username |
| `--admin_password` | `thelia` | Admin password |
| `--admin_first_name` | `Admin` | Admin first name |
| `--admin_last_name` | `Thelia` | Admin last name |
| `--admin_email` | `admin@thelia.net` | Admin email |

### 4. Start Development Server

```bash
php -S localhost:8000 -t public
```

### 5. Access Your Site

- **Front-office**: http://localhost:8000
- **Back-office**: http://localhost:8000/admin

## Post-Installation

### Create Admin User (if not created during install)

```bash
php bin/console admin:create
```

### Clear Cache

```bash
php bin/console cache:clear
```

## Production Setup

### Web Server Configuration

- [Apache Configuration](./apache-configuration)
- [Nginx Configuration](./nginx-configuration)

### Environment Mode

Set production mode in `.env.local`:

```bash
APP_ENV=prod
APP_DEBUG=0
```

### Cache and Assets

```bash
php bin/console cache:clear --env=prod
php bin/console cache:warmup --env=prod
```

## Useful Commands

```bash
php bin/console cache:clear
php bin/console admin:create
php bin/console module:list
php bin/console module:activate ModuleName
php bin/console module:deactivate ModuleName
php bin/console module:refresh
```

## Troubleshooting

### Memory Limit Error

```bash
php -d memory_limit=512M bin/install
```

### Permission Denied

```bash
sudo chown -R www-data:www-data var/
chmod -R 755 var/cache var/log
```

### Database Connection Error

Verify credentials and ensure the MySQL user has proper permissions:

```sql
GRANT ALL PRIVILEGES ON thelia.* TO 'thelia'@'localhost';
FLUSH PRIVILEGES;
```

## Next Steps

- [Configuration](./configuration) — Configure your store
- [First Steps](./first-steps) — Create products and customize
- [Architecture](/docs/architecture) — Understand Thelia 3 internals
