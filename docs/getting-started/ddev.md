---
title: DDEV Installation
sidebar_position: 3
---

# DDEV Installation (Recommended)

[DDEV](https://ddev.com/) is the recommended way to develop Thelia 3 locally. It provides a consistent, pre-configured Docker environment.

## Prerequisites

1. **Docker Desktop** (Mac/Windows) or **Docker Engine** (Linux)
2. **DDEV** — [Installation Guide](https://ddev.readthedocs.io/en/stable/users/install/)

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

# Install Thelia
ddev exec php bin/install

# Open in browser
ddev launch
```

Your site is now accessible at **https://thelia-3.ddev.site**

:::tip
`bin/install` reads database credentials from DDEV's environment automatically (`DATABASE_HOST=db`, `DATABASE_NAME=db`, etc.). No options needed for the database.
:::

## Install with Demo Data and Admin

```bash
ddev exec php bin/install \
    --with-demo \
    --with-admin \
    --admin_login=admin \
    --admin_password=admin123 \
    --admin_email=admin@example.com
```

See [Install Reference](./install-reference) for all available options and environment variables.

## DDEV Commands Reference

### Daily Commands

```bash
ddev start                  # Start environment
ddev stop                   # Stop environment
ddev restart                # Restart
ddev ssh                    # SSH into container
ddev describe               # View project info
ddev launch                 # Open in browser
```

### Running PHP Commands

```bash
ddev exec php bin/console cache:clear
ddev exec php bin/console module:list
ddev exec php bin/console module:activate ModuleName
ddev exec php bin/console admin:create
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

## Accessing Services

| Service | URL |
|---------|-----|
| Front-office | https://thelia-3.ddev.site |
| Back-office | https://thelia-3.ddev.site/admin |
| Mailpit | https://thelia-3.ddev.site:8026 |

## Theme Development

```bash
ddev ssh
cd templates/frontOffice/flexy
npm install
npm run dev    # Watch mode
npm run build  # Production
```

## Troubleshooting

### Port Conflicts

```bash
ddev poweroff    # Stop all DDEV projects
ddev start       # Restart
```

### Permission Issues

```bash
ddev exec chmod -R 777 var/cache var/log
```

### Complete Reset

```bash
ddev delete -O
ddev start
ddev exec php bin/install
```

## Next Steps

- [Configuration](./configuration) — Environment variables and settings
- [First Steps](./first-steps) — Create your first product
- [Architecture](/docs/architecture) — Understand Thelia 3
