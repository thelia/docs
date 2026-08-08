---
title: Install Reference
sidebar_position: 6
---

# bin/install Reference

`bin/install` is a standalone script that sets up Thelia without requiring the Symfony kernel. It works around a chicken-and-egg problem: you need a database to boot the kernel, but you need the kernel to create the database.

## How it works

The script runs in two phases:

**Standalone phase** (no kernel needed):

1. Checks permissions on `var/`, `public/`, `local/` directories
2. Creates the database if it does not exist
3. Applies the core schema (`thelia.sql` + `insert.sql`)
4. Generates a form secret for CSRF protection
5. Writes database credentials to `.env.local`
6. Registers all modules and applies their SQL schemas

**Kernel phase** (boots Symfony for these steps only):

7. Configures and installs templates
8. Imports demo data (if `--with-demo`)
9. Creates admin user (if `--with-admin`)

## Options

### Theme options

| Option | Default | Description |
|--------|---------|-------------|
| `--frontoffice_theme` | `flexy` | Front-office template |
| `--backoffice_theme` | `default` | Back-office template — use `default-twig` for the modern Twig admin; `default` is the legacy Smarty back-office |
| `--pdf_theme` | `default` | PDF template |
| `--email_theme` | `default` | Email template |

### Setup options

| Option | Default | Description |
|--------|---------|-------------|
| `--with-demo` | - | Import demo catalog |
| `--with-admin` | - | Create admin user |

### Admin options (requires `--with-admin`)

| Option | Default | Description |
|--------|---------|-------------|
| `--admin_login` | `thelia` | Admin username |
| `--admin_password` | `thelia` | Admin password |
| `--admin_first_name` | `Admin` | Admin first name |
| `--admin_last_name` | `Thelia` | Admin last name |
| `--admin_email` | `admin@thelia.net` | Admin email |

## Environment variables

Database credentials are passed as environment variables, not CLI options:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_HOST` | Yes | - | Database hostname |
| `DATABASE_PORT` | No | `3306` | Database port |
| `DATABASE_NAME` | Yes | - | Database name |
| `DATABASE_USER` | Yes | - | Database user |
| `DATABASE_PASSWORD` | Yes | - | Database password |

With DDEV, these are injected automatically (all set to `db`).

## Examples

:::caution Pass `--backoffice_theme=default-twig`
`--backoffice_theme` defaults to `default` (legacy Smarty). For the modern Twig admin, always pass
`--backoffice_theme=default-twig` — `bin/install` then runs `template:set backOffice default-twig`,
which registers and activates the bundle. Omit it and `/admin` fails with `Unknown "safe_hook"
function`.
:::

### Minimal (DDEV)

```bash
ddev exec php bin/install --frontoffice_theme=flexy --backoffice_theme=default-twig
```

### With demo and admin (DDEV)

```bash
ddev exec php bin/install --frontoffice_theme=flexy --backoffice_theme=default-twig \
    --with-demo --with-admin \
    --admin_login=admin --admin_password=admin123
```

### Standard environment

```bash
DATABASE_HOST=localhost DATABASE_NAME=thelia \
DATABASE_USER=thelia DATABASE_PASSWORD=secret \
php bin/install --frontoffice_theme=flexy --backoffice_theme=default-twig --with-demo --with-admin
```

### Custom themes

```bash
ddev exec php bin/install --frontoffice_theme=myTheme --backoffice_theme=default-twig
```

## Dual layout support

`bin/install` auto-detects the project layout:

| Layout | Detection | Use case |
|--------|-----------|----------|
| Development (`thelia/thelia`) | `core/` at project root | Contributing to Thelia |
| Project (`thelia/thelia-project`) | `vendor/thelia/core/` | Building a store |

You do not need to configure anything.

## bin/test-prepare

A stripped-down variant for CI and test environments. It creates the database, applies the schema, and registers modules. It skips the permission checks, form secret generation, templates, admin, and demo data. It accepts no CLI options.

```bash
APP_ENV=test php bin/test-prepare
```

See [Testing](/docs/testing) for details.
