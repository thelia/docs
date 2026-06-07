---
title: DDEV Installation
sidebar_position: 3
---

# DDEV Installation (Recommended)

[DDEV](https://ddev.com/) is the recommended way to develop Thelia 3 locally. It gives you a pre-configured Docker environment that behaves the same on every machine.

## Prerequisites

1. **Docker Desktop** (Mac/Windows) or **Docker Engine** (Linux)
2. **DDEV** ([Installation Guide](https://ddev.readthedocs.io/en/stable/users/install/))

## Quick installation

```bash
# Clone Thelia 3
git clone https://github.com/thelia/thelia.git
cd thelia
git checkout twig

# Start DDEV
ddev start

# Install dependencies
ddev composer install

# Install Thelia
ddev exec php bin/install

# Open in browser
ddev launch
```

Your site is now accessible at **https://thelia-3.ddev.site**

:::tip
`bin/install` reads database credentials from DDEV's environment automatically (`DATABASE_HOST=db`, `DATABASE_NAME=db`, etc.). You do not need to pass any database options.
:::

## Install with demo data and admin

```bash
ddev exec php bin/install \
    --with-demo \
    --with-admin \
    --admin_login=admin \
    --admin_password=admin123 \
    --admin_email=admin@example.com
```

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

| Service | URL |
|---------|-----|
| Front-office | https://thelia-3.ddev.site |
| Back-office | https://thelia-3.ddev.site/admin |
| Mailpit | https://thelia-3.ddev.site:8026 |

## Theme development

```bash
ddev ssh
cd templates/frontOffice/flexy
npm install
npm run dev    # Watch mode
npm run build  # Production
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
ddev exec php bin/install
```

## Next steps

- [Configuration](./configuration): environment variables and settings
- [First Steps](./first-steps): create your first product
- [Architecture](/docs/architecture): understand Thelia 3
