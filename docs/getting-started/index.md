---
title: Getting Started
sidebar_position: 1
---

# Getting Started

This guide takes you from zero to a working Thelia 3 store in under 10 minutes.

## Prerequisites

- **PHP 8.3+** with extensions: PDO_MySQL, openssl, intl, gd, curl, dom
- **Composer 2+**
- **MySQL 8.0+** or **MariaDB 10.6+**
- **DDEV** (recommended) or any local PHP environment

## Install with DDEV (Recommended)

```bash
git clone https://github.com/thelia/thelia.git
cd thelia
git checkout twig

ddev start
ddev composer install
ddev exec php bin/install
```

Open **https://thelia.ddev.site** — your store is running.

## Install Without DDEV

```bash
git clone https://github.com/thelia/thelia.git
cd thelia && git checkout twig
composer install

DATABASE_HOST=localhost DATABASE_NAME=thelia \
DATABASE_USER=root DATABASE_PASSWORD=secret \
php bin/install --with-demo --with-admin
```

Then start a development server:

```bash
php -S localhost:8000 -t public
```

## The `bin/install` Command

`bin/install` is a standalone script that sets up Thelia without requiring the Symfony kernel to be bootable first. It solves the chicken-and-egg problem: you need a database to boot the kernel, but you need the kernel to create the database.

### What It Does

1. **Checks permissions** on `var/`, `public/`, `local/` directories
2. **Creates the database** if it does not exist
3. **Applies the schema** (`thelia.sql` + `insert.sql`)
4. **Generates a form secret** for CSRF protection
5. **Writes `.env.local`** with database credentials
6. **Registers all modules** and applies their SQL schemas
7. **Configures templates** (boots the kernel only for this step)
8. **Imports demo data** and **creates admin user** (if requested)

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `--frontoffice_theme` | `flexy` | Front-office template |
| `--backoffice_theme` | `default` | Back-office template |
| `--pdf_theme` | `default` | PDF template |
| `--email_theme` | `default` | Email template |
| `--with-demo` | — | Import demo catalog data |
| `--with-admin` | — | Create an admin user |
| `--admin_login` | `thelia` | Admin username |
| `--admin_password` | `thelia` | Admin password |
| `--admin_first_name` | `Admin` | Admin first name |
| `--admin_last_name` | `Thelia` | Admin last name |
| `--admin_email` | `admin@thelia.net` | Admin email |

### Required Environment Variables

| Variable | DDEV Value | Description |
|----------|-----------|-------------|
| `DATABASE_HOST` | `db` | Database hostname |
| `DATABASE_PORT` | `3306` | Database port |
| `DATABASE_NAME` | `db` | Database name |
| `DATABASE_USER` | `db` | Database user |
| `DATABASE_PASSWORD` | `db` | Database password |

### Full Example

```bash
DATABASE_HOST=db DATABASE_PORT=3306 DATABASE_NAME=db \
DATABASE_USER=db DATABASE_PASSWORD=db \
php bin/install \
  --frontoffice_theme=flexy \
  --backoffice_theme=default \
  --with-demo \
  --with-admin \
  --admin_login=admin \
  --admin_password=admin123 \
  --admin_email=admin@example.com
```

### Dual Layout Support

`bin/install` auto-detects whether it runs in:

- **Development layout** (`thelia/thelia`): `core/` is at the project root
- **Project layout** (`thelia/thelia-project`): core is in `vendor/thelia/core/`

No configuration needed — the script adapts automatically.

## Next Steps

- [DDEV Installation](./ddev) — Detailed DDEV setup and commands
- [Configuration](./configuration) — Environment variables and settings
- [First Steps](./first-steps) — Create your first product
