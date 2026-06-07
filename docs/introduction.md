---
title: Introduction
slug: /
sidebar_position: 1
---

# Thelia 3

Thelia is an open-source e-commerce platform built on **PHP 8.3+**, **Symfony 7.4 LTS**, **API Platform 4.3** (standalone), and **Propel ORM**.

Version 3 introduces a modern front-office powered by Twig and Symfony UX, a full REST API, and a domain-layer architecture. The back-office has been ported to a Twig bundle (`default-twig`) on the same stack.

## At a glance

| Layer | Technology |
|-------|-----------|
| Framework | Symfony 7.4 LTS |
| ORM | Propel 2 (not Doctrine) |
| API | API Platform 4.3 standalone (`api-platform/symfony`), JWT authentication |
| Front-office | Twig, LiveComponents, TwigComponent, Stimulus |
| Back-office | Twig (`default-twig` bundle), Repositories + UiComponents, Hooks |
| Default front theme | Flexy (Tailwind CSS, ~50 components) |

## How data flows

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

## Quick start

```bash
git clone https://github.com/thelia/thelia.git && cd thelia && git checkout twig

# With DDEV (recommended)
ddev start && ddev composer install
ddev exec php bin/install \
  --frontoffice_theme=flexy --backoffice_theme=default-twig \
  --pdf_theme=default --email_theme=default \
  --with-demo --with-admin \
  --admin_login=thelia --admin_password=thelia \
  --admin_first_name=thelia --admin_last_name=thelia \
  --admin_email=thelia@example.com

# Without DDEV
composer install
DATABASE_HOST=localhost DATABASE_NAME=thelia DATABASE_USER=root DATABASE_PASSWORD=secret \
  php bin/install \
  --frontoffice_theme=flexy --backoffice_theme=default-twig \
  --pdf_theme=default --email_theme=default
```

The theme flags pick the front-office theme (`flexy`) and the Twig back-office bundle (`default-twig`). When the install finishes, open the front-office in your browser and the back-office at `/admin`.

## What's new in Thelia 3

Compared to [Thelia 2](/docs/2.x):

- Twig replaces Smarty in the front-office.
- API Platform provides a full REST API (it was "coming soon" in v2).
- LiveComponents enable reactive UIs without JavaScript.
- Domain facades (Cart, Customer, Checkout) encapsulate business logic.
- `bin/install` is a standalone installer that runs without the Symfony kernel.
- A testing framework ships with `IntegrationTestCase` and `FixtureFactory`.

The back-office has been ported to a Twig bundle (`default-twig`) built on Bootstrap 5, Twig and Stimulus. This is the reference back-office. The legacy Smarty back-office (`default`) is transitional and likely to be dropped in a future release.

## Documentation structure

The sections build on each other, from installation to reference:

1. [Getting Started](./getting-started/index.md): install and configure Thelia
2. [Architecture](./architecture/index.md): understand the system design
3. [Front-Office](./front-office/index.md): build pages with Twig and Symfony UX
4. [API](./api/index.md): REST endpoints, resources, filters
5. [Back-Office](./back-office/index.md): Twig admin bundle, repositories, hooks
6. [Modules](./modules): create and distribute extensions
7. [Testing](./testing/index.md): write tests with IntegrationTestCase
8. [Reference](./reference/index.md): events, forms, CLI commands, i18n

## Requirements

- PHP 8.3+ with extensions: PDO_MySQL, openssl, intl, gd, curl, dom
- MySQL 8.0+ or MariaDB 10.6+
- Composer 2+

## Community

- [GitHub](https://github.com/thelia/thelia): source code and issues
- [Forum](https://forum.thelia.net): community discussions
- [Discord](https://discord.gg/YgwpYEE3y3): real-time chat

Thelia is licensed under [LGPL v3](https://www.gnu.org/licenses/lgpl-3.0.en.html).
