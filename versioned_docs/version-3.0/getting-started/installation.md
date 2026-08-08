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

### PHP 8.3+

```bash
php -v
# PHP 8.3.x (cli) ...
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
```

**With Composer (project):**

```bash
composer create-project thelia/thelia-project my-shop --stability=beta
cd my-shop
```

:::note Beta release
Thelia 3.0.0-beta1 is a pre-release. Composer only selects it when the beta stability is allowed,
which is what `--stability=beta` does above. Alternatively, set the following in your project
`composer.json` before requiring Thelia packages:

```json
{
    "minimum-stability": "beta",
    "prefer-stable": true
}
```
:::

### 2. Install dependencies

```bash
composer install
```

### 3. Install Thelia

`bin/install` is a standalone script that sets up the database, registers modules, and configures templates. Database credentials can be passed either as CLI options or as environment variables:

```bash
php bin/install --database_host=localhost --database_name=thelia \
    --database_user=thelia --database_password=your_password \
    --frontoffice_theme=flexy
```

#### With demo data and admin user

```bash
php bin/install \
    --database_host=localhost --database_name=thelia \
    --database_user=thelia --database_password=your_password \
    --frontoffice_theme=flexy \
    --with-demo \
    --with-admin \
    --admin_login=admin \
    --admin_password=admin123 \
    --admin_email=admin@example.com
```

:::note The back-office theme defaults to `default-twig`
`--backoffice_theme` defaults to `default-twig`, the Twig back-office, so most installs do not need
to pass it. Pass `--backoffice_theme=default` only if you deliberately want the legacy Smarty admin.
:::

#### All options

**Database credentials.** Each setting is resolved as CLI option, then environment variable, then
default. Host and name are required.

| Option | Variable | Default | Description |
|--------|----------|---------|-------------|
| `--database_host` | `DATABASE_HOST` | - | Database hostname |
| `--database_port` | `DATABASE_PORT` | `3306` | Database port |
| `--database_name` | `DATABASE_NAME` | - | Database name |
| `--database_user` | `DATABASE_USER` | - | Database user |
| `--database_password` | `DATABASE_PASSWORD` | - | Database password |

**Themes and setup:**

| Option | Default | Description |
|--------|---------|-------------|
| `--frontoffice_theme` | `flexy` | Front-office template |
| `--backoffice_theme` | `default-twig` | Back-office template (`default` is the legacy Smarty back-office) |
| `--pdf_theme` | `default` | PDF template |
| `--email_theme` | `default` | Email template |
| `--with-demo` | - | Import demo catalog |
| `--skip-demo-images` | - | With `--with-demo`, import the catalog without its images |
| `--with-admin` | - | Create admin user |
| `--strict-themes` | - | Remove the bundles of the templates you did not select |
| `--admin_login` | `thelia` | Admin username |
| `--admin_password` | `thelia` | Admin password |
| `--admin_first_name` | `Admin` | Admin first name |
| `--admin_last_name` | `Thelia` | Admin last name |
| `--admin_email` | `admin@thelia.net` | Admin email |

See [Install Reference](./install-reference) for what `--skip-demo-images` and `--strict-themes` do.

### 4. Build the theme assets

The front-office theme (`flexy`) and any Twig back-office theme ship their assets as
source. They must be compiled with Webpack Encore, otherwise the corresponding pages
fail with *"Could not find the entrypoints file from Webpack"*.

```bash
# Front-office (flexy) — always required
cd templates/frontOffice/flexy && npm install && npm run build && cd -

# Back-office, only when using a Twig template such as default-twig
cd templates/backOffice/default-twig && npm install && npm run build && cd -
```

The Smarty back-office template (`default`) needs no build step.

### 5. Start the development server

```bash
php -S localhost:8000 -t public
```

### 6. Access your site

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
