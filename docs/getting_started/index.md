---
title: Getting Started
sidebar_position: 1
---

# Getting Started

This guide will help you install and configure Thelia 3 for local development.

## Prerequisites

Before installing Thelia 3, ensure you have:

### Required

- **PHP 8.3+** with extensions: PDO_MySQL, openssl, intl, gd, curl, dom
- **Composer 2+**
- **MySQL 8.0+** or **MariaDB 10.6+**

### Recommended

- **DDEV** (local development environment)
- **Node.js 20+** (for theme development)
- **Git**

## Installation Methods

Choose your preferred installation method:

| Method | Description | Best For |
|--------|-------------|----------|
| [DDEV (Recommended)](./ddev) | Containerized development with pre-configured environment | Fast setup, consistent environments |
| [Standard Installation](./Installation) | Manual PHP/MySQL setup | Production servers, custom setups |

## Quick Start with DDEV

The fastest way to get started:

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

# Open in browser
ddev launch
```

Your site is now accessible at **https://thelia.ddev.site**

## Installation Command Reference

The `thelia:install` command supports many options:

| Option | Description |
|--------|-------------|
| `--database_host` | Database hostname |
| `--database_username` | Database user |
| `--database_password` | Database password |
| `--database_name` | Database name |
| `--database_port` | Database port (default: 3306) |
| `--frontoffice_theme` | Front theme (default: flexy) |
| `--backoffice_theme` | Admin theme (default: default) |
| `--pdf_theme` | PDF theme (default: default) |
| `--email_theme` | Email theme (default: default) |
| `--with-demo` | Import demo data |
| `--with-admin` | Create admin user |

See [DDEV Installation](./ddev) or [Standard Installation](./Installation) for complete examples.

## Next Steps

After installation:

1. **[Configuration](./configuration)** - Configure environment variables and parameters
2. **[First Steps](./first_steps)** - Create your first product and customize the theme
3. **[Architecture Overview](/docs/architecture)** - Understand how Thelia 3 works

## Troubleshooting

If you encounter issues during installation, check:

- [Common Issues](./troubleshooting) - Solutions to frequent problems
- [DDEV Installation](./ddev#troubleshooting) - DDEV-specific issues
- [Standard Installation](./Installation#troubleshooting) - Manual setup issues

## Support

- **GitHub Issues**: [github.com/thelia/thelia/issues](https://github.com/thelia/thelia/issues)
- **Forum**: [forum.thelia.net](https://forum.thelia.net)
