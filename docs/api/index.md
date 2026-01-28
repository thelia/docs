---
title: API Overview
sidebar_position: 1
---

# API Platform Integration

Thelia 3 uses [API Platform](https://api-platform.com/) to provide a powerful, fully-featured REST API. The API exposes all core e-commerce entities and can be extended by modules.

## Architecture

```
                    ┌─────────────────────────────────┐
                    │        External Clients         │
                    │    (Mobile apps, SPAs, etc.)    │
                    └───────────────┬─────────────────┘
                                    │ HTTP/JSON
                    ┌───────────────▼─────────────────┐
                    │        API Platform             │
                    │  /api/admin/  &  /api/front/    │
                    └───────────────┬─────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    │                               │                               │
    ▼                               ▼                               ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│   Resources   │           │    Addons     │           │    Filters    │
│ (entities)    │           │ (enrichment)  │           │ (queries)     │
└───────────────┘           └───────────────┘           └───────────────┘
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    │
                    ┌───────────────▼─────────────────┐
                    │         Propel ORM              │
                    │    (State Providers/Processors) │
                    └─────────────────────────────────┘
```

## Key Concepts

### Resources

API resources are PHP classes that define how Propel models are exposed via the API.

```php
#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/admin/products'),
        new Get(uriTemplate: '/admin/products/{id}'),
        new Post(uriTemplate: '/admin/products'),
        // ...
    ],
)]
class Product extends AbstractTranslatableResource
{
    #[Groups([self::GROUP_ADMIN_READ])]
    public ?int $id = null;

    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE])]
    public string $ref;
    // ...
}
```

See [Resources](./resources) for complete documentation.

### Addons

Addons enrich existing resources with additional data without modifying the core.

```php
class CustomerCustomerFamily implements ResourceAddonInterface
{
    #[Groups([Customer::GROUP_ADMIN_READ])]
    public ?string $familyCode = null;

    public static function getResourceParent(): string
    {
        return Customer::class;
    }
    // ...
}
```

See [Addons](./addons) for complete documentation.

### Serialization Groups

Control which fields are visible in different contexts:

| Group Pattern | Description |
|---------------|-------------|
| `admin:*:read` | Admin read operations |
| `admin:*:write` | Admin write operations |
| `front:*:read` | Public front-office |
| `*:single` | Single item only (not collections) |

See [Serialization Groups](./serialization-groups) for details.

### Filters

Filter, sort, and search API collections:

```http
GET /api/front/products?visible=true&brand.id=5&order[position]=asc
```

See [Filters](./filters) for available filters.

## Route Namespaces

### Admin Routes (`/api/admin/`)

Full CRUD operations for authenticated administrators:

```
GET    /api/admin/products           # List products
POST   /api/admin/products           # Create product
GET    /api/admin/products/{id}      # Get single product
PUT    /api/admin/products/{id}      # Update product
DELETE /api/admin/products/{id}      # Delete product
```

### Front Routes (`/api/front/`)

Read-only access for public consumption:

```
GET    /api/front/products           # List visible products
GET    /api/front/products/{id}      # Get single product
```

## Authentication

The API uses JWT (JSON Web Token) authentication via `lexik/jwt-authentication-bundle`.

See [Authentication](./authentication) for details on:
- JWT token authentication
- Login endpoints (`/api/admin/login`, `/api/front/login`)
- CORS configuration

## Internal Access: DataAccessService

Templates and components can call the API internally without HTTP overhead:

```twig
{% set products = resources('/api/front/products', {
    'productCategories.category.id': categoryId,
    'visible': true,
    'itemsPerPage': 20
}) %}
```

```php
$products = $this->dataAccessService->resources('/api/front/products', [
    'productCategories.category.id' => $categoryId,
]);
```

## Response Format

### Default Format (JSON)

API responses return simple JSON arrays by default:

```json
[
    {
        "id": 1,
        "ref": "PROD-001",
        "visible": true,
        "i18ns": {
            "title": "My Product",
            "description": "Product description..."
        }
    },
    {
        "id": 2,
        "ref": "PROD-002",
        "visible": true,
        "i18ns": {
            "title": "Another Product",
            "description": "..."
        }
    }
]
```

### JSON-LD Format (with Hydra Metadata)

To get pagination metadata (total items, page info), request JSON-LD format with `Accept: application/ld+json` header:

```json
{
    "@context": "/api/contexts/Product",
    "@id": "/api/front/products",
    "@type": "hydra:Collection",
    "hydra:totalItems": 42,
    "hydra:member": [
        {
            "@id": "/api/front/products/1",
            "@type": "Product",
            "id": 1,
            "ref": "PROD-001"
        }
    ],
    "hydra:view": {
        "@id": "/api/front/products?page=1",
        "hydra:first": "/api/front/products?page=1",
        "hydra:last": "/api/front/products?page=3",
        "hydra:next": "/api/front/products?page=2"
    }
}
```

### DataAccessService (PHP/Twig)

When using `DataAccessService::resources()` internally, the **default format is JSON** (simple arrays):

```php
// Default: returns simple array
$products = $this->dataAccessService->resources('/api/front/products');
// Result: [['id' => 1, 'ref' => 'PROD-001', ...], ...]

// JSON-LD: returns Hydra structure with pagination metadata
$response = $this->dataAccessService->resources('/api/front/products', [], 'jsonld');
// Result: ['hydra:member' => [...], 'hydra:totalItems' => 42, ...]
```

Use `'jsonld'` format only when you need pagination metadata (total items, page info).

## Available Endpoints

| Entity | Admin Route | Front Route |
|--------|-------------|-------------|
| Products | `/api/admin/products` | `/api/front/products` |
| Categories | `/api/admin/categories` | `/api/front/categories` |
| Customers | `/api/admin/customers` | - |
| Orders | `/api/admin/orders` | - |
| Cart | - | `/api/front/carts` |
| Brands | `/api/admin/brands` | `/api/front/brands` |

See [Endpoints Reference](./endpoints) for complete API documentation.

## Creating Custom Resources

Modules can add their own API resources:

```php
// MyModule/Api/Resource/ProductReview.php

#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/front/product_reviews'),
        new Post(uriTemplate: '/front/product_reviews'),
    ],
)]
class ProductReview implements PropelResourceInterface
{
    use PropelResourceTrait;

    #[Groups(['front:product_review:read'])]
    public ?int $id = null;

    #[Groups(['front:product_review:read', 'front:product_review:write'])]
    public string $content;

    // ...
}
```

See [Module API Resources](/docs/modules/api-resources) for module-specific documentation.

## Next Steps

- [Authentication](./authentication) - Secure your API access
- [Resources](./resources) - Create API resources
- [Addons](./addons) - Extend existing resources
- [Filters](./filters) - Query and filter data
- [Endpoints Reference](./endpoints) - Complete API reference
