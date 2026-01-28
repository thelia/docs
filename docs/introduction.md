---
title: Introduction
slug: /
sidebar_position: 1
---

# Thelia 3

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/thelia/thelia/test.yml?branch=twig&style=flat-square)
![Scrutinizer code quality (GitHub/Bitbucket)](https://img.shields.io/scrutinizer/quality/g/thelia/thelia?style=flat-square)
![GitHub](https://img.shields.io/github/license/thelia/thelia?style=flat-square)
![Last commit](https://img.shields.io/github/last-commit/thelia/thelia.svg?style=flat-square)
![GitHub Repo stars](https://img.shields.io/github/stars/thelia/thelia?style=flat-square)

Thelia is a powerful open-source e-commerce platform built on modern PHP technologies. It provides a complete solution for creating online stores with advanced customization capabilities.

## Key Features

### Modern Technology Stack

- **PHP 8.3+** with strict typing
- **Symfony 6.4+** framework foundation
- **API Platform 3+** for RESTful APIs
- **Propel ORM** for database operations

### API-First Architecture

Thelia 3 embraces an API-first approach with full API Platform integration:

- RESTful endpoints for all core entities (products, categories, customers, orders)
- Separate `/admin/` and `/front/` API routes with different access levels
- JSON-LD and Hydra support for semantic web standards
- Built-in filtering, pagination, and sorting

### Dual Templating System

Thelia 3 uses different templating engines optimized for each use case:

| Area | Engine | Purpose |
|------|--------|---------|
| **Front-Office** | Twig + Symfony UX | Customer-facing pages with reactive components |
| **Back-Office** | Smarty | Admin interface (legacy, stable) |

### Symfony UX Integration

The front-office leverages the full power of Symfony UX:

- **LiveComponents** for reactive UI without writing JavaScript
- **Stimulus** controllers for JavaScript interactivity
- **Turbo** for SPA-like navigation without page reloads

### Flexy Theme

The default front-office theme **Flexy** is built as a Symfony bundle with:

- 38+ pre-built LiveComponents
- Responsive design
- Easy customization through template inheritance

## System Requirements

### PHP 8.3+

**Required extensions:**
- PDO_MySQL
- openssl
- intl
- gd
- curl
- dom

**PHP configuration:**
- `memory_limit`: 256M minimum
- `post_max_size`: 20M
- `upload_max_filesize`: 2M
- `date.timezone`: must be defined

### Database

- **MySQL 8.0+** or **MariaDB 10.6+**

### Web Server

- Apache 2.4+ with mod_rewrite
- Nginx 1.18+

### Additional Tools

- **Composer 2+** for dependency management
- **Node.js 20+** for asset compilation (optional, for theme development)

## Compatibility Matrix

| Thelia Version | PHP | MySQL/MariaDB | Symfony |
|----------------|-----|---------------|---------|
| 3.x | 8.3+ | 8.0+ / 10.6+ | 6.4+ |
| 2.5 | 8.0 - 8.2 | 5.6 - 8.0 | 6.0 - 6.3 |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Front-Office                           │
│                  (Twig + Symfony UX)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │    Twig     │    │    Live     │    │  Stimulus   │    │
│  │  Templates  │    │ Components  │    │ Controllers │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│                            │                               │
│                            ▼                               │
│              ┌─────────────────────────┐                   │
│              │   DataAccessService     │                   │
│              │   (API calls in PHP)    │                   │
│              └─────────────────────────┘                   │
│                            │                               │
├────────────────────────────┼───────────────────────────────┤
│                            ▼                               │
│              ┌─────────────────────────┐                   │
│              │      API Platform       │                   │
│              │  /admin/  &  /front/    │                   │
│              └─────────────────────────┘                   │
│                            │                               │
├────────────────────────────┼───────────────────────────────┤
│                            ▼                               │
│              ┌─────────────────────────┐                   │
│              │     Domain Layer        │                   │
│              │  (Facades & Services)   │                   │
│              └─────────────────────────┘                   │
│                            │                               │
│                            ▼                               │
│              ┌─────────────────────────┐                   │
│              │      Propel ORM         │                   │
│              │   (Database Access)     │                   │
│              └─────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# Clone the repository
git clone https://github.com/thelia/thelia.git
cd thelia

# Install dependencies
composer install

# Run the installer
php Thelia thelia:install

# Start development server
php -S localhost:8000 -t public
```

For detailed installation instructions, see [Getting Started](/docs/getting_started).

## Documentation Sections

- **[Getting Started](/docs/getting_started)** - Installation and initial setup
- **[Architecture](/docs/architecture)** - System design and patterns
- **[API](/docs/api)** - API Platform integration and endpoints
- **[Front-Office](/docs/front-office)** - Twig templates and Symfony UX
- **[Back-Office](/docs/back-office)** - Admin interface and Smarty
- **[Module Development](/docs/modules)** - Creating custom modules
- **[Migration](/docs/migration)** - Upgrading from Thelia 2.5

## Community & Support

- **GitHub**: [github.com/thelia/thelia](https://github.com/thelia/thelia)
- **Forum**: [forum.thelia.net](https://forum.thelia.net)
- **Discord**: Join our community chat

## License

Thelia is open-source software licensed under the [LGPL v3](https://www.gnu.org/licenses/lgpl-3.0.en.html).
