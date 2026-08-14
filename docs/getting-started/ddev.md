---
title: DDEV Installation
sidebar_position: 3
---

# DDEV Installation (Recommended)

[DDEV](https://ddev.com/) is the recommended way to develop Thelia 3 locally. It gives you a pre-configured Docker environment that behaves the same on every machine.

## Prerequisites

1. **Docker Desktop** (Mac/Windows) or **Docker Engine** (Linux)
2. **DDEV** ([Installation Guide](https://ddev.readthedocs.io/en/stable/users/install/))
3. A **GitHub token** for Composer, see below

### A GitHub token for Composer

Composer reads the Thelia Flex recipes through the GitHub API, which rate-limits anonymous calls.
When it is rate-limited, Flex silently falls back on auto-generated recipes and the install fails
later on `You must either configure a "public_key" or a "secret_key"`. Create a token on
[github.com/settings/tokens](https://github.com/settings/tokens), no scope needed, and give it to
the Composer that runs inside the container:

```bash
ddev composer config --global github-oauth.github.com <your-token>
```

## Quick installation

### Building a store

Start from the project skeleton. Thelia 3.0.0-beta3 is a pre-release, so Composer only selects it
when the beta stability is allowed:

```bash
composer create-project thelia/thelia-project my-shop --stability=beta
cd my-shop

ddev config --project-type=symfony --docroot=public
ddev start
ddev exec php bin/install --frontoffice_theme=flexy
```

### Contributing to Thelia

Clone the repository instead, which already ships a `.ddev/` configuration:

```bash
# Clone Thelia 3
git clone https://github.com/thelia/thelia.git
cd thelia

# Start DDEV
ddev start

# Install dependencies
ddev composer install

# Install Thelia (Twig front-office + Twig back-office)
ddev exec php bin/install --frontoffice_theme=flexy

# Build the back-office assets
ddev exec bash -c "cd templates/backOffice/default-twig && npm install && npm run build"

# Open in browser
ddev launch
```

Your site is now accessible at **https://thelia.ddev.site**

:::note The hostname follows the directory name
Thelia's `.ddev/config.yaml` sets no `name` key, so DDEV derives the project name from the directory
you cloned into. `git clone https://github.com/thelia/thelia.git` creates a `thelia/` directory and
gives you `https://thelia.ddev.site`; a `my-shop/` directory gives you `https://my-shop.ddev.site`.
Run `ddev describe` to see the URLs of the current project.
:::

:::warning Build the back-office assets
`bin/install` builds the front-office assets itself, by running `importmap:install` and
`tailwind:build` for the active template. The `default-twig` back-office is not covered: it is
built with Webpack Encore and its `dist/` directory is not shipped in the package, so it has to be
built once with `npm install && npm run build`. Until then, `/admin` fails with *"Could not find
the entrypoints file from Webpack"*.
:::

:::tip
`bin/install` reads database credentials from DDEV's environment automatically (`DATABASE_HOST=db`, `DATABASE_NAME=db`, etc.). You do not need to pass any database options.
:::

## Install with demo data and admin

```bash
ddev exec php bin/install \
    --frontoffice_theme=flexy \
    --with-demo \
    --with-admin \
    --admin_login=admin \
    --admin_password=admin123 \
    --admin_email=admin@example.com
```

:::note The back-office theme defaults to `default-twig`
`--backoffice_theme` defaults to `default-twig`, the Twig back-office, so you do not need to pass it.
Pass `--backoffice_theme=default` only if you deliberately want the legacy Smarty admin; that admin
is not built on the Twig hook functions, and a Twig template that calls `safe_hook()` throws
`Unknown "safe_hook" function` when the Twig back-office bundle is not the active one.
:::

See [Install Reference](./install-reference) for all available options and environment variables.

## DDEV commands reference

### Daily commands

```bash
ddev start                  # Start environment
ddev stop                   # Stop environment
ddev restart                # Restart
ddev ssh                    # SSH into container
ddev describe               # View project info
ddev launch                 # Open in browser
```

### Running PHP commands

```bash
ddev exec php Thelia cache:clear
ddev exec php Thelia module:list
ddev exec php Thelia module:activate ModuleName
ddev exec php Thelia admin:create
```

### Composer

```bash
ddev composer install
ddev composer require vendor/package
```

### Database

```bash
ddev mysql                           # MySQL CLI
ddev import-db --file=dump.sql.gz    # Import
ddev export-db --file=dump.sql.gz    # Export
ddev snapshot                        # Create snapshot
ddev snapshot restore                # Restore snapshot
```

### Logs

```bash
ddev logs                   # View logs
ddev logs -f                # Follow mode
ddev logs -s web            # Web server logs
ddev logs -s db             # Database logs
```

## Accessing services

Replace `thelia` with your own directory name if you cloned or created the project elsewhere.

| Service | URL |
|---------|-----|
| Front-office | https://thelia.ddev.site |
| Back-office | https://thelia.ddev.site/admin |
| Mailpit | https://thelia.ddev.site:8026 |

## Theme development

The Flexy front-office theme is served through AssetMapper, so editing a Twig template, a Stimulus
controller or a CSS file needs no bundler. Only the Tailwind stylesheet is compiled, and a watcher
rebuilds it as you type:

```bash
ddev exec php Thelia tailwind:build --watch
```

The `default-twig` back-office keeps its Webpack Encore build:

```bash
ddev exec bash -c "cd templates/backOffice/default-twig && npm run watch"
```

## Troubleshooting

### Port conflicts

```bash
ddev poweroff    # Stop all DDEV projects
ddev start       # Restart
```

### Permission issues

```bash
ddev exec chmod -R 777 var/cache var/log
```

### Complete reset

```bash
ddev delete -O
ddev start
ddev exec php bin/install --frontoffice_theme=flexy
```

## Next steps

- [Configuration](./configuration): environment variables and settings
- [First Steps](./first-steps): create your first product
- [Architecture](/docs/architecture): understand Thelia 3
