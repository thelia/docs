---
title: API
sidebar_position: 12
toc_max_heading_level: 4
---

# API Platform Integration

Thelia 2.5 includes a full REST API built on [API Platform 3](https://api-platform.com/), providing CRUD endpoints for all core entities. The API uses a custom bridge between API Platform and Propel ORM.

## Architecture

```
External Client (SPA, mobile app)
         │ HTTP / JSON
         ▼
   API Platform 3
   /api/admin/  &  /api/front/
         │
         ▼
   Propel Bridge
   (State Providers & Processors)
         │
         ▼
   Propel ORM → Database
```

API Platform normally works with Doctrine. Thelia replaces all Doctrine components with custom Propel equivalents:

| API Platform Component | Thelia Implementation |
|---|---|
| State Provider (item) | `PropelItemProvider` |
| State Provider (collection) | `PropelCollectionProvider` |
| State Processor (persist) | `PropelPersistProcessor` |
| State Processor (remove) | `PropelRemoveProcessor` |

## Route Namespaces

### Admin Routes (`/api/admin/`)

Full CRUD operations, requires admin JWT authentication:

```
GET    /api/admin/products           # List products
POST   /api/admin/products           # Create product
GET    /api/admin/products/{id}      # Get product
PUT    /api/admin/products/{id}      # Update product
PATCH  /api/admin/products/{id}      # Partial update
DELETE /api/admin/products/{id}      # Delete product
```

### Front Routes (`/api/front/`)

Public read access plus customer-specific operations:

```
GET    /api/front/products           # List visible products
GET    /api/front/products/{id}      # Get product

POST   /api/front/customers          # Register
GET    /api/front/account/customers/{id}  # Get own profile (auth required)

GET    /api/front/carts              # Get carts
GET    /api/front/cart               # Get current cart
POST   /api/front/cart_items         # Add to cart

GET    /api/front/account/orders     # Customer orders (auth required)
```

## Authentication

The API uses **JWT** via `lexik/jwt-authentication-bundle`.

### Setup

```bash
# Generate RSA key pair (one-time)
php Thelia lexik:jwt:generate-keypair
```

Configure in `.env.local`:

```bash
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your-passphrase
```

### Login

```http
POST /api/admin/login
Content-Type: application/json

{
    "username": "admin@example.com",
    "password": "your-password"
}
```

Response:

```json
{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
}
```

### Using the Token

```http
GET /api/admin/products
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
```

## Resources

Resources are PHP classes in `core/lib/Thelia/Api/Resource/` that define how Propel models are exposed. All resources implement `PropelResourceInterface`.

### Core Resources

| Domain | Resources |
|--------|-----------|
| **Catalog** | Product, Category, Brand, Attribute, AttributeAv, Feature, FeatureAv, Template |
| **Pricing** | ProductSaleElements, ProductPrice, ProductCategory, TaxRule, Tax, TaxRuleCountry |
| **Media** | ProductImage, ProductDocument, CategoryImage, BrandImage, FolderImage, ContentImage |
| **Orders** | Order, OrderProduct, OrderProductTax, OrderAddress, OrderCoupon, OrderStatus |
| **Customer** | Customer, Address, CustomerTitle, Cart, CartItem |
| **Content** | Content, Folder, ContentFolder |
| **Config** | Config, ModuleConfig, Module, Lang, Currency, Country, State, RewritingUrl |

### Resource Example

```php
<?php

declare(strict_types=1);

namespace Thelia\Api\Resource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/admin/products'),
        new Get(uriTemplate: '/admin/products/{id}'),
        new Post(uriTemplate: '/admin/products'),
        new Put(uriTemplate: '/admin/products/{id}'),
        new Delete(uriTemplate: '/admin/products/{id}'),
    ],
    normalizationContext: ['groups' => [self::GROUP_ADMIN_READ]],
    denormalizationContext: ['groups' => [self::GROUP_ADMIN_WRITE]],
)]
class Product extends AbstractTranslatableResource
{
    public const GROUP_ADMIN_READ = 'admin:product:read';
    public const GROUP_ADMIN_WRITE = 'admin:product:write';
    public const GROUP_FRONT_READ = 'front:product:read';

    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_FRONT_READ])]
    public ?int $id = null;

    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE, self::GROUP_FRONT_READ])]
    public string $ref;

    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE])]
    public bool $visible;

    // Translations
    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE, self::GROUP_FRONT_READ])]
    public I18nCollection $i18ns;

    // ...
}
```

### Translatable Resources

Entities with multilingual content extend `AbstractTranslatableResource` and expose an `I18nCollection`:

```json
{
    "id": 1,
    "ref": "PROD-001",
    "i18ns": {
        "en_US": {
            "title": "My Product",
            "description": "English description"
        },
        "fr_FR": {
            "title": "Mon Produit",
            "description": "Description française"
        }
    }
}
```

## Resource Addons

Modules can enrich existing resources without modifying core code by implementing `ResourceAddonInterface`:

```php
class ProductCustomField implements ResourceAddonInterface
{
    use ResourceAddonTrait;

    #[Groups([Product::GROUP_ADMIN_READ])]
    public ?string $customField = null;

    public static function getResourceParent(): string
    {
        return Product::class;
    }

    // buildFromModel, doSave, doDelete...
}
```

Addon fields appear at the root level of the API response alongside core fields.

## Serialization Groups

Groups control field visibility per context:

| Pattern | Purpose |
|---------|---------|
| `admin:*:read` | Admin read operations |
| `admin:*:write` | Admin write operations |
| `front:*:read` | Public front-office reads |
| `*:single` | Single item detail (not collections) |

## Filters

The API supports filtering, sorting, and pagination via query parameters.

### Available Filters

| Filter | Usage |
|--------|-------|
| `SearchFilter` | `?ref=PROD-001` or `?title=shirt` (partial) |
| `BooleanFilter` | `?visible=true` |
| `OrderFilter` | `?order[position]=asc` |
| `RangeFilter` | `?price[between]=10..100` |
| `DateFilter` | `?createdAt[after]=2024-01-01` |
| `NotInFilter` | `?id[not_in]=1,2,3` |

### Pagination

```http
GET /api/front/products?page=2&itemsPerPage=20
```

## CORS

Configured via `nelmio/cors-bundle` in `config/packages/nelmio_cors.yaml`:

```yaml
nelmio_cors:
    defaults:
        origin_regex: true
        allow_origin: ['%env(CORS_ALLOW_ORIGIN)%']
        allow_methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
        allow_headers: ['Content-Type', 'Authorization']
```

## API Documentation

Interactive API docs are available at `/api/docs` (Swagger UI) when `APP_DEBUG=1`.

## Legacy OpenApi Module

Some older modules may still use the legacy `OpenApi` module (`local/modules/OpenApi/`) which has a different architecture based on `@OA\Schema` annotations. New modules should use the API Platform integration documented above.
