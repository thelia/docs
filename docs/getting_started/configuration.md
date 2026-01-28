---
title: Configuration
sidebar_position: 4
---

# Configuration

Thelia 3 uses Symfony's configuration system with environment variables and YAML configuration files.

## Environment Variables

### .env Files

Thelia uses the standard Symfony `.env` file hierarchy:

| File | Purpose | Git |
|------|---------|-----|
| `.env` | Default values (committed) | Yes |
| `.env.local` | Local overrides (not committed) | No |
| `.env.prod` | Production defaults | Yes |
| `.env.prod.local` | Production local overrides | No |

### Key Variables

Edit `.env.local` for your local configuration:

```bash
# Application
APP_ENV=dev
APP_SECRET=your-secret-key-change-this
APP_DEBUG=1

# Database
DATABASE_URL="mysql://user:password@127.0.0.1:3306/thelia?serverVersion=8.0"

# Mailer
MAILER_DSN=smtp://localhost:1025

# Cache
CACHE_DRIVER=file

# Session
SESSION_HANDLER_ID=session.handler.native_file

# Locale
DEFAULT_LOCALE=en_US
```

### Database Configuration

```bash
# MySQL
DATABASE_URL="mysql://user:password@host:3306/database?serverVersion=8.0"

# MariaDB
DATABASE_URL="mysql://user:password@host:3306/database?serverVersion=mariadb-10.11"

# DDEV
DATABASE_URL="mysql://db:db@db:3306/db?serverVersion=mariadb-10.11"
```

### Mail Configuration

```bash
# SMTP
MAILER_DSN=smtp://user:password@smtp.example.com:587

# Gmail
MAILER_DSN=gmail://username:password@default

# MailHog (development)
MAILER_DSN=smtp://localhost:1025

# Null (disable emails)
MAILER_DSN=null://null
```

## Symfony Configuration

### config/packages/

Configuration files are organized by package:

```
config/
├── packages/
│   ├── api_platform.yaml
│   ├── doctrine.yaml
│   ├── framework.yaml
│   ├── security.yaml
│   ├── twig.yaml
│   └── dev/
│       └── debug.yaml
└── services.yaml
```

### API Platform

`config/packages/api_platform.yaml`:

```yaml
api_platform:
    title: 'Thelia API'
    version: '3.0.0'
    formats:
        jsonld: ['application/ld+json']
        json: ['application/json']
    docs_formats:
        jsonld: ['application/ld+json']
        json: ['application/json']
        html: ['text/html']
    defaults:
        pagination_items_per_page: 30
        pagination_maximum_items_per_page: 100
```

### Twig

`config/packages/twig.yaml`:

```yaml
twig:
    default_path: '%kernel.project_dir%/templates'
    paths:
        '%kernel.project_dir%/templates/frontOffice/flexy': 'Flexy'
    globals:
        site_name: '%env(SITE_NAME)%'
```

### Security

`config/packages/security.yaml`:

```yaml
security:
    providers:
        admin_provider:
            entity:
                class: Thelia\Model\Admin
                property: login
        customer_provider:
            entity:
                class: Thelia\Model\Customer
                property: email

    firewalls:
        admin:
            pattern: ^/admin
            provider: admin_provider
            # ...
        front:
            pattern: ^/
            provider: customer_provider
            # ...
```

## Thelia Configuration

### Store Settings

Access in back-office: **Configuration > Store**

- Store name
- Company information
- Contact details
- Default currency
- Default language

### Module Configuration

Each module can have its own configuration, typically stored in the database and managed via back-office.

### Theme Configuration

Configure active themes:

```bash
# List themes
php Thelia template:list

# Set front-office theme
php Thelia template:set frontOffice flexy

# Set back-office theme
php Thelia template:set backOffice default
```

## Caching

### Cache Configuration

```bash
# Environment variable
CACHE_DRIVER=file  # or redis, memcached
```

### Clear Cache

```bash
# Development
php Thelia cache:clear

# Production
php Thelia cache:clear --env=prod

# DDEV
ddev exec php Thelia cache:clear
```

### Warmup Cache

```bash
php Thelia cache:warmup --env=prod
```

## Logging

### Log Configuration

Logs are stored in `var/log/`:

```
var/log/
├── dev.log
├── prod.log
└── api.log
```

### Log Levels

In `.env.local`:

```bash
# Monolog configuration
LOG_LEVEL=debug  # debug, info, notice, warning, error, critical
```

## Performance

### Production Optimization

```bash
# Clear and warmup cache
php Thelia cache:clear --env=prod
php Thelia cache:warmup --env=prod

# Compile container
composer dump-autoload --optimize --classmap-authoritative

# Install assets
php Thelia assets:install public --symlink
```

### OPcache

Enable in `php.ini`:

```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0  # Production only
```

## Debug Mode

### Development

```bash
APP_ENV=dev
APP_DEBUG=1
```

### Production

```bash
APP_ENV=prod
APP_DEBUG=0
```

:::warning
Never enable `APP_DEBUG=1` in production. It exposes sensitive information.
:::

## Multi-Language

### Configure Languages

In back-office: **Configuration > Languages**

Or via command:

```bash
php Thelia language:create --code=fr_FR --title="French" --locale=fr_FR
php Thelia language:activate fr_FR
```

### Default Language

```bash
DEFAULT_LOCALE=en_US
```

## Multi-Currency

### Configure Currencies

In back-office: **Configuration > Currencies**

### Exchange Rates

Currencies can be updated automatically or manually in the back-office.

## Next Steps

- [First Steps](./first_steps) - Create your first content
- [Architecture](/docs/architecture) - Understand the system
- [Module Development](/docs/modules) - Extend Thelia
