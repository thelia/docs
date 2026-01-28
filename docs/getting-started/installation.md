---
title: Standard Installation
sidebar_position: 5
---

# Standard Installation

This guide covers installing Thelia 3 on a standard PHP/MySQL environment without Docker.

:::tip Recommended for Development
For local development, we recommend using **[DDEV](./ddev)** for a faster, more consistent setup.
:::

## Prerequisites

### PHP 8.3+

Ensure PHP 8.3 or higher is installed:

```bash
php -v
# PHP 8.3.x (cli) ...
```

#### Required Extensions

```bash
php -m | grep -E "pdo_mysql|openssl|intl|gd|curl|dom"
```

All of these should be present:
- `pdo_mysql`
- `openssl`
- `intl`
- `gd`
- `curl`
- `dom`

#### PHP Configuration

Edit `php.ini`:

```ini
memory_limit = 256M
post_max_size = 20M
upload_max_filesize = 10M
date.timezone = Europe/Paris  # Your timezone
```

### Composer 2+

```bash
composer --version
# Composer version 2.x.x
```

### Database

MySQL 8.0+ or MariaDB 10.6+:

```bash
mysql --version
# mysql  Ver 8.0.x
```

Create a database:

```sql
CREATE DATABASE thelia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'thelia'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON thelia.* TO 'thelia'@'localhost';
FLUSH PRIVILEGES;
```

## Installation Steps

### 1. Clone or Create Project

**Option A: Clone from GitHub**

```bash
git clone https://github.com/thelia/thelia.git
cd thelia
git checkout twig
```

**Option B: Composer Create-Project**

```bash
composer create-project thelia/thelia-project my-shop
cd my-shop
```

### 2. Install Dependencies

```bash
composer install
```

### 3. Install Thelia

Run the installation command with your database credentials:

```bash
php Thelia thelia:install \
    --database_host=localhost \
    --database_username=thelia \
    --database_password=your_password \
    --database_name=thelia \
    --database_port=3306 \
    --frontoffice_theme=flexy \
    --backoffice_theme=default \
    --pdf_theme=default \
    --email_theme=default
```

#### Installation Command Options

**Database options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--database_host` | Database hostname | `localhost` |
| `--database_username` | Database user | - |
| `--database_password` | Database password | - |
| `--database_name` | Database name | - |
| `--database_port` | Database port | `3306` |

**Theme options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--frontoffice_theme` | Front-office theme | `flexy` |
| `--backoffice_theme` | Back-office theme | `default` |
| `--pdf_theme` | PDF generation theme | `default` |
| `--email_theme` | Email template theme | `default` |

**Additional options:**

| Option | Description |
|--------|-------------|
| `--with-demo` | Import demo data after installation |
| `--with-admin` | Create admin user during installation |

**Admin options (with `--with-admin`):**

| Option | Description |
|--------|-------------|
| `--admin_login_name` | Admin username |
| `--admin_first_name` | Admin first name |
| `--admin_last_name` | Admin last name |
| `--admin_email` | Admin email |
| `--admin_password` | Admin password |
| `--admin_locale` | Admin locale (default: `en_US`) |

#### Complete Example with Admin

```bash
php Thelia thelia:install \
    --database_host=localhost \
    --database_username=thelia \
    --database_password=your_password \
    --database_name=thelia \
    --database_port=3306 \
    --frontoffice_theme=flexy \
    --backoffice_theme=default \
    --pdf_theme=default \
    --email_theme=default \
    --with-demo \
    --with-admin \
    --admin_login_name=admin \
    --admin_first_name=Admin \
    --admin_last_name=User \
    --admin_email=admin@example.com \
    --admin_password=admin123
```

### 4. Start Development Server

Using PHP's built-in server:

```bash
php -S localhost:8000 -t public
```

### 5. Access Your Site

- **Front-office**: http://localhost:8000
- **Back-office**: http://localhost:8000/admin

## Post-Installation

### Create Admin User (if not created during install)

```bash
php Thelia admin:create
```

### Import Demo Data (if not imported during install)

```bash
php Thelia thelia:demo:import
```

### Clear Cache

```bash
php Thelia cache:clear
```

## Production Setup

### Web Server Configuration

Configure your web server:
- [Apache Configuration](./apache_configuration)
- [Nginx Configuration](./nginx_configuration)

### Environment Mode

Set production mode in `.env.local`:

```bash
APP_ENV=prod
APP_DEBUG=0
```

### Cache and Assets

```bash
php Thelia cache:clear --env=prod
php Thelia cache:warmup --env=prod
php Thelia assets:install public
```

### File Permissions

```bash
chmod -R 755 var/cache var/log
chmod -R 755 public/cache
```

## Useful Commands

```bash
# Clear cache
php Thelia cache:clear

# Create admin user
php Thelia admin:create

# Module management
php Thelia module:list
php Thelia module:activate ModuleName
php Thelia module:deactivate ModuleName
php Thelia module:refresh

# Database
php Thelia propel:migration:migrate
php Thelia propel:model:build

# List all commands
php Thelia list
```

## Troubleshooting

### Memory Limit Error

```bash
php -d memory_limit=512M Thelia thelia:install [options]
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

- [Configuration](./configuration) - Configure your store
- [First Steps](./first_steps) - Create products and customize
- [Architecture](/docs/architecture) - Understand Thelia 3 internals
