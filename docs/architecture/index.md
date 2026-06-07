---
title: Architecture Overview
sidebar_position: 1
---

# Architecture Overview

Thelia 3 is built on a modern architecture that combines the stability of Symfony with the flexibility needed for e-commerce applications.

## Core Components

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Language | PHP 8.3+ | `composer.json` requires `>= 8.3` |
| Framework | Symfony 7.4 LTS | HTTP handling, DI, routing, security |
| ORM | Propel ORM (not Doctrine) | Database abstraction and queries |
| API | API Platform 4.3 (standalone) | RESTful API generation (`api-platform/symfony`) |
| Front-Office | Twig + Symfony UX (Flexy bundle) | Reactive UI components |
| Back-Office | Twig (default-twig bundle) | Admin interface templating |

:::note
Propel is **not** Doctrine: there is no `EntityManager` and no `flush()`. Every `->save()` persists immediately. Respect the strict native Propel types (`string` for decimal columns, `int` for tinyint columns).
:::

:::caution Back-office: Twig is the reference
The Twig back-office (`default-twig` bundle) is the reference admin theme. The legacy Smarty `default` back-office still ships, but it is no longer recommended and is expected to be dropped in a later release. Build new admin features on the `default-twig` bundle.
:::

### Directory Structure

```
thelia/
├── core/
│   └── lib/Thelia/
│       ├── Api/                    # API Platform integration
│       │   ├── Resource/           # API resources
│       │   ├── Bridge/Propel/      # Propel state providers
│       │   └── Service/DataAccess/ # DataAccessService
│       ├── Domain/                 # Business logic facades (17 folders)
│       │   ├── Cart/               # e.g. Cart, Customer, Order, Checkout,
│       │   ├── Customer/           #      Catalog, Promotion, Shipping,
│       │   ├── Order/              #      Taxation, Media, CMS, Addressing,
│       │   └── Checkout/           #      Admin, Localization, Marketing,
│       │                           #      Module, DataTransfer, Shared
│       ├── Core/                   # Kernel, security, forms
│       └── Model/                  # Propel models
├── templates/
│   ├── frontOffice/flexy/          # Front-office Twig theme (FlexyBundle)
│   ├── backOffice/default-twig/    # Back-office Twig theme (reference)
│   └── backOffice/default/         # Legacy Smarty back-office (deprecated)
├── vendor/thelia/
│   └── modules/                    # Official modules
└── local/modules/                  # Custom modules
```

:::note
The front-office theme is a Symfony bundle: `templates/frontOffice/flexy/` exposes namespace `FlexyBundle` (class `src/FlexyBundle.php`). The back-office reference theme is the bundle in `templates/backOffice/default-twig/` (namespace `BackOfficeDefaultTwigBundle`, class `src/BackOfficeDefaultTwigBundle.php`). Both ship their own controllers, Twig/Live components, Stimulus controllers, form themes and assets inside the bundle.
:::

## Architectural Patterns

### API-First Design

All data access in Thelia 3 goes through the API layer:

```
┌─────────────────┐     ┌─────────────────┐
│   Front-Office  │     │   External      │
│   (Templates)   │     │   Clients       │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │   DataAccessService   │   HTTP
         │   (internal PHP)      │   (JSON)
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────┐
│            API Platform                 │
│     /api/admin/    /api/front/          │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│           Propel ORM                    │
└─────────────────────────────────────────┘
```

**Benefits:**
- Single source of truth for data validation
- Consistent serialization across all consumers
- Built-in caching at API level
- Easy integration with external systems

### Domain Layer (Facades)

Business logic is organized into **Facades** that orchestrate services:

```php
// CartFacade orchestrates cart operations
$cartFacade->addItem($dto);       // Validates, applies rules, persists
$cartFacade->getCartFromSession(); // Retrieves current cart
```

See [Facades](./facades.md) for detailed documentation.

### Twig everywhere

Both the front-office and the back-office reference themes are Twig bundles:

| Front-Office (Flexy bundle) | Back-Office (default-twig bundle) |
|-----------------------------|-----------------------------------|
| Twig + LiveComponents | Twig + LiveComponents |
| DataAccessService (`resources()`) | Repositories / Services |
| Stimulus controllers | Stimulus controllers |
| Webpack Encore + Tailwind | Webpack Encore + Bootstrap 5 |

:::caution
The legacy Smarty `default` back-office is still shipped for backward compatibility, but it is deprecated. New back-office work should target the `default-twig` bundle.
:::

See [Dual Templating](./dual-templating.md) for details.

### Module System

Modules extend Thelia functionality. A modern Thelia 3 module is almost free of XML: routes are `#[Route]` PHP 8 attributes auto-scanned by `ModuleAttributeLoader`, services are declared in `configureServices()` with `autowire()` + `autoconfigure()`, and hooks and loops are auto-discovered from their base classes. The only XML the core still requires is `Config/module.xml` (metadata, XSD `module-2_2.xsd`) and `Config/schema.xml` when the module creates its own database tables.

```
local/modules/MyModule/
├── Config/
│   ├── module.xml          # REQUIRED — metadata (XSD module-2_2.xsd)
│   ├── schema.xml          # REQUIRED only if the module has DB tables
│   ├── TheliaMain.sql      # Generated SQL (applied by `module:schema:apply`)
│   └── config.xml          # OPTIONAL — exports/imports/parameters/loop aliases only
├── Controller/             # #[Route] PHP 8 attributes (no routing.xml)
├── Api/
│   ├── Resource/           # API resources (auto-discovered)
│   └── Addon/              # Resource enrichments (ResourceAddonInterface)
├── LiveComponent/          # Front-office components (#[AsLiveComponent])
├── Hook/                   # Back-office hooks (extends BaseHook, auto-tagged)
├── templates/
└── MyModule.php            # extends BaseModule + static configureServices()
```

:::note No more service/route/hook XML
There is no `routing.xml` (routes are PHP attributes), and `config.xml` is optional — it is only needed for exports, imports, parameters or loop aliases. Services, listeners, hooks and loops are registered through `configureServices()` and autoconfiguration. See the modules guide for the full skeleton.
:::

See [Modules vs Bundles](./modules-vs-bundles.md) for the difference between Thelia modules and Symfony bundles.

## Data Flow

### Front-Office Request

```
1. HTTP Request
       │
       ▼
2. Symfony Router
       │
       ▼
3. Twig Template
       │
       ├──► resources('/api/front/products')
       │           │
       │           ▼
       │    DataAccessService
       │           │
       │           ▼
       │    API Platform (internal)
       │           │
       │           ▼
       │    Propel Query
       │           │
       │           ▼
       │    JSON Response
       │
       ▼
4. LiveComponent Rendering
       │
       ▼
5. HTML Response
```

### API Request (External)

```
1. HTTP Request (JSON)
       │
       ▼
2. API Platform Router
       │
       ▼
3. State Provider
       │
       ▼
4. Propel Query
       │
       ▼
5. Serialization (groups)
       │
       ▼
6. JSON-LD Response
```

## Key Concepts

### Resources vs Addons

| Concept | Purpose | Use Case |
|---------|---------|----------|
| **Resource** | Full API entity | New data model (e.g., `ProductReview`) |
| **Addon** | Extend existing resource | Add fields to `Product`, `Customer` |

### Serialization Groups

Control which fields are exposed:

```php
#[Groups([self::GROUP_ADMIN_READ])]  // Admin only
#[Groups([self::GROUP_FRONT_READ])]  // Public front
```

### DataAccessService

Internal API calls without HTTP overhead:

```twig
{% set products = resources('/api/front/products', {
    'visible': true,
    'itemsPerPage': 20
}) %}
```

## Next Steps

- [Dual Templating](./dual-templating.md) - Understand Twig vs Smarty usage
- [Facades](./facades.md) - Learn about the domain layer
- [Modules vs Bundles](./modules-vs-bundles.md) - Extension architecture
