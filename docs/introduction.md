---
title: Introduction
slug: /
sidebar_position: 1
---

# Thelia 3

Thelia is an open-source e-commerce platform built on **PHP 8.2+**, **Symfony 6.4**, **API Platform 3**, and **Propel ORM**.

Version 3 introduces a modern front-office powered by Twig and Symfony UX, a full REST API, and a domain-layer architecture — while keeping the stable Smarty-based back-office.

## At a Glance

| Layer | Technology |
|-------|-----------|
| Framework | Symfony 6.4+ |
| ORM | Propel 2 (not Doctrine) |
| API | API Platform 3, JWT authentication |
| Front-office | Twig, LiveComponents, Stimulus, Turbo |
| Back-office | Smarty, Loops, Hooks |
| Default theme | Flexy (Tailwind CSS, 40+ LiveComponents) |

## How Data Flows

```
Browser → Symfony Router → Twig Template
                              ↓
                     resources('/api/front/products')
                              ↓
                     DataAccessService (no HTTP overhead)
                              ↓
                     API Platform → Propel ORM → Database
```

Templates call the API internally through `DataAccessService`. External clients (mobile apps, SPAs) call the same API over HTTP.

## Quick Start

```bash
git clone https://github.com/thelia/thelia.git && cd thelia && git checkout twig

# With DDEV (recommended)
ddev start && ddev composer install
ddev exec php bin/install

# Without DDEV
composer install
DATABASE_HOST=localhost DATABASE_NAME=thelia DATABASE_USER=root DATABASE_PASSWORD=secret php bin/install
```

Your store is ready. Open the front-office and the back-office at `/admin`.

## What's New in Thelia 3

Compared to [Thelia 2](/docs/2.x):

- **Twig replaces Smarty** in the front-office
- **API Platform** provides a full REST API (was "coming soon" in v2)
- **LiveComponents** enable reactive UIs without JavaScript
- **Domain Facades** (Cart, Customer, Checkout) encapsulate business logic
- **`bin/install`** — standalone installer that works without the Symfony kernel
- **Testing framework** with `IntegrationTestCase` and `FixtureFactory`

The back-office still uses Smarty, Loops, and Hooks — no migration needed for admin modules.

## Documentation Structure

This documentation follows a progressive approach:

1. **[Getting Started](./getting-started)** — Install and configure Thelia
2. **[Architecture](./architecture)** — Understand the system design
3. **[Front-Office](./front-office)** — Build pages with Twig and Symfony UX
4. **[API](./api)** — REST endpoints, resources, filters
5. **[Back-Office](./back-office)** — Admin interface, loops, hooks
6. **[Modules](./modules)** — Create and distribute extensions
7. **[Testing](./testing)** — Write tests with IntegrationTestCase
8. **[Reference](./reference)** — Events, forms, CLI commands, i18n

## Requirements

- PHP 8.2+ with extensions: PDO_MySQL, openssl, intl, gd, curl, dom
- MySQL 8.0+ or MariaDB 10.6+
- Composer 2+

## Community

- [GitHub](https://github.com/thelia/thelia) — Source code and issues
- [Forum](https://forum.thelia.net) — Community discussions
- [Discord](https://discord.gg/YgwpYEE3y3) — Real-time chat

Thelia is licensed under [LGPL v3](https://www.gnu.org/licenses/lgpl-3.0.en.html).
