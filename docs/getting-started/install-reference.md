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

7. Generates the JWT key pair the API authenticates with
8. Configures and installs templates
9. Runs the post-activation hooks of the modules
10. Imports demo data (if `--with-demo`)
11. Creates admin user (if `--with-admin`)
12. Builds the front-office assets

## Front-office assets

The last step runs `importmap:install`, then `tailwind:build`. Both read the template that step 8
selected, which is why they run at the end.

Neither command belongs to the core: they come from packages a template requires, `symfony/asset-mapper`
and `symfonycasts/tailwind-bundle`. `bin/install` skips whichever one the console does not carry, so a
template built on another pipeline installs without an error.

A Twig back-office such as `default-twig` is outside this: it is built with Webpack Encore, ships no
`dist/` directory, and is built once by hand.

```bash
cd templates/backOffice/default-twig && npm install && npm run build
```

## Options

### Theme options

| Option | Default | Description |
|--------|---------|-------------|
| `--frontoffice_theme` | `flexy` | Front-office template |
| `--backoffice_theme` | `default-twig` | Back-office template. `default-twig` is the Twig admin; `default` is the legacy Smarty back-office |
| `--pdf_theme` | `default` | PDF template |
| `--email_theme` | `default` | Email template |

Each of these also reads an environment variable when the flag is absent: `ACTIVE_FRONT_TEMPLATE`,
`ACTIVE_ADMIN_TEMPLATE`, `ACTIVE_PDF_TEMPLATE`, `ACTIVE_EMAIL_TEMPLATE`.

### Setup options

| Option | Default | Description |
|--------|---------|-------------|
| `--with-demo` | - | Import demo catalog |
| `--skip-demo-images` | - | With `--with-demo`, import the catalog without its images |
| `--with-admin` | - | Create admin user |
| `--strict-themes` | - | Remove the bundles of the templates you did not select |

`--skip-demo-images` passes `--skip-images` to `thelia:demo:import`. The demo catalog is created
without downloading or copying the product images, which makes the install noticeably faster. It has
no effect without `--with-demo`.

`--strict-themes` is off by default so that several templates of the same type can sit side by side
in one installation, which is what lets the Twig and Smarty back-offices coexist during the
migration. With the flag on, `bin/install` scans `templates/<type>/` and removes from
`config/bundles.php` every bundle belonging to a template other than the selected one. Use it for a
lean production install, not on a development checkout where you switch templates.

### Admin options (requires `--with-admin`)

| Option | Default | Description |
|--------|---------|-------------|
| `--admin_login` | `thelia` | Admin username |
| `--admin_password` | `thelia` | Admin password |
| `--admin_first_name` | `Admin` | Admin first name |
| `--admin_last_name` | `Thelia` | Admin last name |
| `--admin_email` | `admin@thelia.net` | Admin email |

## Database credentials

Credentials can be given either as CLI options or as environment variables. Each setting is resolved
in this order: **CLI option, then environment variable, then default.**

| Option | Variable | Required | Default | Description |
|--------|----------|----------|---------|-------------|
| `--database_host` | `DATABASE_HOST` | Yes | - | Database hostname |
| `--database_port` | `DATABASE_PORT` | No | `3306` | Database port |
| `--database_name` | `DATABASE_NAME` | Yes | - | Database name |
| `--database_user` | `DATABASE_USER` | Yes | - | Database user |
| `--database_password` | `DATABASE_PASSWORD` | Yes | - | Database password |

Host and name have no default: the script exits with an error if neither the option nor the variable
is set. Whichever way you pass them, `bin/install` writes the resolved values to `.env.local`.

With DDEV, the variables are injected automatically (all set to `db`), so no database option is
needed.

## Examples

### Minimal (DDEV)

```bash
ddev exec php bin/install --frontoffice_theme=flexy
```

### With demo and admin (DDEV)

```bash
ddev exec php bin/install --frontoffice_theme=flexy \
    --with-demo --skip-demo-images --with-admin \
    --admin_login=admin --admin_password=admin123
```

### Standard environment, credentials as options

```bash
php bin/install --database_host=localhost --database_name=thelia \
    --database_user=thelia --database_password=secret \
    --frontoffice_theme=flexy --with-demo --with-admin
```

### Standard environment, credentials as variables

```bash
DATABASE_HOST=localhost DATABASE_NAME=thelia \
DATABASE_USER=thelia DATABASE_PASSWORD=secret \
php bin/install --frontoffice_theme=flexy --with-demo --with-admin
```

### Custom themes

```bash
ddev exec php bin/install --frontoffice_theme=myTheme --strict-themes
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
