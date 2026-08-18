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

### PHP 8.3 or 8.4

```bash
php -v
# PHP 8.3.x (cli) ...
```

Both versions are supported and covered by the test matrix.

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

### A GitHub token for Composer

Thelia publishes its Symfony Flex recipes in the `thelia/thelia-recipes` repository, and Composer
reads them through the GitHub API. Without a token that API answers with a rate limit. Flex then
falls back on auto-generated recipes without reporting anything: the `config/packages/*.yaml` files
the recipes carry are never written, and the theme bundles they register never reach
`config/bundles.php`. The install fails much later, on a message that says nothing about recipes:

```
You must either configure a "public_key" or a "secret_key"
```

That message comes from `lexik/jwt-authentication-bundle`, whose configuration file was one of the
recipes that never ran.

Create a token on [github.com/settings/tokens](https://github.com/settings/tokens). No scope is
needed, the recipes are public. Give it to Composer once, before installing anything:

```bash
composer config --global github-oauth.github.com <your-token>
```

The value is written to your global `auth.json`. After `composer install`, check that
`config/packages/lexik_jwt_authentication.yaml` exists. If it does not, the recipes did not run.

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
Thelia 3.0.0-beta3 is a pre-release. Composer only selects it when the beta stability is allowed,
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

### 4. Assets

There is no manual step. `bin/install` runs `importmap:install` and `tailwind:build` for the
active front-office template, and `sass:build` for the back-office stylesheet, and skips whichever
command the installed templates do not provide. Both the storefront and `/admin` are ready when
the installer returns. The Smarty back-office template (`default`) needs no build step either.

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
