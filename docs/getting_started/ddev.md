---
title: DDEV Installation
sidebar_position: 3
---

# DDEV Installation (Recommended)

[DDEV](https://ddev.com/) is the recommended way to develop Thelia 3 locally. It provides a consistent, pre-configured Docker environment that matches production settings.

## Prerequisites

1. **Docker Desktop** (Mac/Windows) or **Docker Engine** (Linux)
2. **DDEV** - [Installation Guide](https://ddev.readthedocs.io/en/stable/users/install/)

Verify installation:

```bash
ddev version
# DDEV version v1.x.x
```

## Quick Installation

```bash
# Clone Thelia 3
git clone https://github.com/thelia/thelia.git
cd thelia
git checkout twig

# Start DDEV
ddev start

# Install dependencies
ddev composer install

# Install Thelia (one command)
ddev php Thelia thelia:install \
    --database_host=db \
    --database_username=db \
    --database_password=db \
    --database_name=db \
    --database_port=3306 \
    --frontoffice_theme=flexy \
    --backoffice_theme=default \
    --pdf_theme=default \
    --email_theme=default

# Launch browser
ddev launch
```

Your site is now accessible at **https://thelia.ddev.site**

## Installation Command Options

The `thelia:install` command accepts many options for non-interactive installation:

### Database Options

| Option | Description | DDEV Value |
|--------|-------------|------------|
| `--database_host` | Database hostname | `db` |
| `--database_username` | Database user | `db` |
| `--database_password` | Database password | `db` |
| `--database_name` | Database name | `db` |
| `--database_port` | Database port | `3306` |

### Theme Options

| Option | Description | Default |
|--------|-------------|---------|
| `--frontoffice_theme` | Front-office theme | `flexy` |
| `--backoffice_theme` | Back-office theme | `default` |
| `--pdf_theme` | PDF generation theme | `default` |
| `--email_theme` | Email template theme | `default` |

### Additional Options

| Option | Description |
|--------|-------------|
| `--with-demo` | Import demo data (products, categories) |
| `--with-admin` | Create an admin user during installation |

### Admin User Options (with `--with-admin`)

| Option | Description |
|--------|-------------|
| `--admin_login_name` | Admin username |
| `--admin_first_name` | Admin first name |
| `--admin_last_name` | Admin last name |
| `--admin_email` | Admin email |
| `--admin_password` | Admin password |
| `--admin_locale` | Admin locale (default: `en_US`) |

### Complete Installation Example

Install with demo data and admin user:

```bash
ddev php Thelia thelia:install \
    --database_host=db \
    --database_username=db \
    --database_password=db \
    --database_name=db \
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
    --admin_password=admin123 \
    --admin_locale=en_US
```

## DDEV Commands Reference

### Basic Commands

```bash
# Start environment
ddev start

# Stop environment
ddev stop

# Restart
ddev restart

# Remove project (keeps files)
ddev delete

# View project info
ddev describe
```

### Running Commands

```bash
# SSH into container
ddev ssh

# Run PHP commands
ddev php Thelia cache:clear
ddev php Thelia module:list

# Run Composer
ddev composer install
ddev composer require vendor/package

# Run npm/yarn (inside templates)
ddev ssh
cd templates/frontOffice/flexy
npm install
npm run build
```

### Database

```bash
# MySQL CLI access
ddev mysql

# Import database
ddev import-db --file=dump.sql.gz

# Export database
ddev export-db --file=dump.sql.gz

# Create database snapshot
ddev snapshot

# Restore snapshot
ddev snapshot restore
```

### Logs and Debugging

```bash
# View logs
ddev logs
ddev logs -f  # Follow mode

# View specific service logs
ddev logs -s web
ddev logs -s db

# Xdebug (if configured)
ddev xdebug on
ddev xdebug off
```

## Accessing Services

| Service | URL |
|---------|-----|
| Front-office | https://thelia.ddev.site |
| Back-office | https://thelia.ddev.site/admin |
| MailHog | https://thelia.ddev.site:8026 |
| phpMyAdmin | https://thelia.ddev.site:8037 |

## DDEV Configuration

DDEV configuration is stored in `.ddev/config.yaml`:

```yaml
name: thelia
type: php
docroot: public
php_version: "8.3"
webserver_type: nginx-fpm
database:
  type: mariadb
  version: "10.11"
nodejs_version: "20"

# Performance (macOS)
mutagen_enabled: true
```

### Custom Local Configuration

Create `.ddev/config.local.yaml` for personal overrides (not committed):

```yaml
# Override PHP version
php_version: "8.4"

# Custom hooks
hooks:
  post-start:
    - exec: echo "Thelia ready at https://thelia.ddev.site"
```

### Additional Services

Add Redis:

```yaml
# .ddev/docker-compose.redis.yaml
services:
  redis:
    image: redis:7
    container_name: ddev-${DDEV_SITENAME}-redis
    labels:
      com.ddev.site-name: ${DDEV_SITENAME}
    expose:
      - "6379"
```

## Theme Development

For Flexy theme customization:

```bash
ddev ssh
cd templates/frontOffice/flexy

# Install dependencies
npm install

# Development (watch mode)
npm run dev

# Production build
npm run build
```

## Common Tasks

### Clear Cache

```bash
ddev php Thelia cache:clear
```

### Create Admin User

```bash
ddev php Thelia admin:create
```

### Module Management

```bash
# List modules
ddev php Thelia module:list

# Activate module
ddev php Thelia module:activate ModuleName

# Deactivate module
ddev php Thelia module:deactivate ModuleName

# Refresh module list
ddev php Thelia module:refresh
```

### Database Migrations

```bash
ddev php Thelia propel:migration:migrate
```

## Troubleshooting

### Port Conflicts

```bash
# Stop all DDEV projects
ddev poweroff

# Restart
ddev start
```

### Permission Issues

```bash
# Fix permissions from host
ddev exec chmod -R 777 var/cache var/log
```

### Clear Everything

```bash
# Full reset (keeps database)
ddev restart

# Complete reset
ddev delete -O
ddev start
# Re-run installation
```

### Check Configuration

```bash
ddev describe
```

## Next Steps

- [Configuration](./configuration) - Environment variables and settings
- [First Steps](./first_steps) - Create your first product
- [Architecture](/docs/architecture) - Understand Thelia 3
