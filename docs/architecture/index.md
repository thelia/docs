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
| Framework | Symfony 6.4+ | HTTP handling, DI, routing, security |
| ORM | Propel 2 | Database abstraction and queries |
| API | API Platform 3+ | RESTful API generation |
| Front-Office | Twig + Symfony UX | Reactive UI components |
| Back-Office | Smarty | Admin interface templating |

### Directory Structure

```
thelia/
├── core/
│   └── lib/Thelia/
│       ├── Api/                    # API Platform integration
│       │   ├── Resource/           # API resources
│       │   ├── Bridge/Propel/      # Propel state providers
│       │   └── Service/            # DataAccessService
│       ├── Domain/                 # Business logic facades
│       │   ├── Cart/
│       │   ├── Customer/
│       │   ├── Order/
│       │   └── Checkout/
│       ├── Core/                   # Kernel, security, forms
│       └── Model/                  # Propel models
├── templates/
│   ├── frontOffice/flexy/          # Twig templates
│   └── backOffice/default/         # Smarty templates
├── vendor/thelia/
│   ├── flexy/                      # Flexy theme bundle
│   └── modules/                    # Official modules
└── local/modules/                  # Custom modules
```

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

See [Facades](./facades) for detailed documentation.

### Dual Templating

Thelia 3 uses two templating engines optimized for different purposes:

| Front-Office (Twig) | Back-Office (Smarty) |
|---------------------|----------------------|
| Modern, reactive UI | Stable, battle-tested |
| LiveComponents | Template loops |
| DataAccessService | Direct Propel queries |
| Stimulus/Turbo | jQuery |

See [Dual Templating](./dual-templating) for details.

### Module System

Modules extend Thelia functionality:

```
local/modules/MyModule/
├── Config/
│   ├── module.xml          # Module metadata
│   ├── config.xml          # Services & listeners
│   └── routing.xml         # Routes
├── Api/
│   ├── Resource/           # API resources
│   └── Addon/              # Resource enrichments
├── LiveComponent/          # Front-office components
├── Hook/                   # Back-office hooks
└── templates/
```

See [Modules vs Bundles](./modules-vs-bundles) for the difference between Thelia modules and Symfony bundles.

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

- [Dual Templating](./dual-templating) - Understand Twig vs Smarty usage
- [Facades](./facades) - Learn about the domain layer
- [Modules vs Bundles](./modules-vs-bundles) - Extension architecture
