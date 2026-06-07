---
title: Endpoints Reference
sidebar_position: 1
---

# API Endpoints Reference

Reference documentation for Thelia's core API endpoints.

## Endpoint overview

### Admin endpoints (`/api/admin/`)

Full CRUD operations requiring authentication.

| Resource | Endpoint | Operations |
|----------|----------|------------|
| Products | `/api/admin/products` | GET, POST, PUT, PATCH, DELETE |
| Categories | `/api/admin/categories` | GET, POST, PUT, PATCH, DELETE |
| Customers | `/api/admin/customers` | GET, POST, PUT, PATCH, DELETE |
| Orders | `/api/admin/orders` | GET, POST, PUT, PATCH, DELETE |
| Brands | `/api/admin/brands` | GET, POST, PUT, PATCH, DELETE |
| Tax Rules | `/api/admin/tax_rules` | GET, POST, PUT, PATCH, DELETE |
| Features | `/api/admin/features` | GET, POST, PUT, PATCH, DELETE |
| Attributes | `/api/admin/attributes` | GET, POST, PUT, PATCH, DELETE |
| Contents | `/api/admin/contents` | GET, POST, PUT, PATCH, DELETE |
| Folders | `/api/admin/folders` | GET, POST, PUT, PATCH, DELETE |
| Currencies | `/api/admin/currencies` | GET, POST, PUT, PATCH, DELETE |
| Countries | `/api/admin/countries` | GET, POST, PUT, PATCH, DELETE |
| Modules | `/api/admin/modules` | GET, POST, PUT, DELETE |

### Front endpoints (`/api/front/`)

Mostly read-only public access. A few operations write data (cart management, account creation, account updates) and several require a customer JWT.

| Resource | Endpoint | Operations |
|----------|----------|------------|
| Products | `/api/front/products` | GET (collection, item) |
| Categories | `/api/front/categories` | GET (collection, item) |
| Brands | `/api/front/brands` | GET (collection, item) |
| Contents | `/api/front/contents` | GET (collection, item) |
| Feature products | `/api/front/feature_products` | GET (collection, item) |
| Cart | `/api/front/carts` | POST, GET (item), PUT, DELETE |
| Current cart | `/api/front/cart` | GET |
| Customers | `/api/front/customers` | POST |
| Customer account | `/api/front/account/customers/{id}` | GET, PUT |
| Orders | `/api/front/account/orders` | GET (collection) |
| Order detail | `/api/front/account/orders/{id}` | GET |
| Countries | `/api/front/countries` | GET (collection, item) |

:::note
The current-cart shortcut `/api/front/cart` returns the cart bound to the current session through a dedicated controller, so you do not need to know its `id`. The collection-style `/api/front/carts/{id}` operations require customer authentication.
:::

:::caution
Customer and order personal-data routes (`/api/front/account/customers/{id}`, `/api/front/account/orders`, `/api/front/account/orders/{id}`) require a customer JWT and only expose the authenticated customer's own data. The `POST /api/front/customers` operation is the public account-creation endpoint.
:::

## Common patterns

### Collection request

```http
GET /api/front/products?visible=true&itemsPerPage=20&page=1
Accept: application/ld+json
```

### Collection response

```json
{
    "@context": "/api/contexts/Product",
    "@id": "/api/front/products",
    "@type": "hydra:Collection",
    "hydra:totalItems": 150,
    "hydra:member": [
        {
            "@id": "/api/front/products/1",
            "@type": "Product",
            "id": 1,
            "ref": "PROD-001",
            "visible": true,
            "i18ns": {
                "title": "Product Title",
                "description": "..."
            }
        }
    ],
    "hydra:view": {
        "@id": "/api/front/products?page=1",
        "hydra:first": "/api/front/products?page=1",
        "hydra:last": "/api/front/products?page=8",
        "hydra:next": "/api/front/products?page=2"
    }
}
```

### Single item request

```http
GET /api/front/products/1
Accept: application/ld+json
```

### Single item response

```json
{
    "@context": "/api/contexts/Product",
    "@id": "/api/front/products/1",
    "@type": "Product",
    "id": 1,
    "ref": "PROD-001",
    "visible": true,
    "position": 1,
    "createdAt": "2024-01-15T10:30:00+00:00",
    "i18ns": {
        "title": "Product Title",
        "description": "Full product description...",
        "chapo": "Short description",
        "postscriptum": "Additional notes"
    },
    "productCategories": [...],
    "productSaleElements": [...],
    "featureProducts": [...]
}
```

### Create request (admin)

```http
POST /api/admin/products
Content-Type: application/json
Authorization: Bearer {token}

{
    "ref": "NEW-PROD-001",
    "visible": true,
    "taxRule": "/api/admin/tax_rules/1",
    "productCategories": [
        {
            "category": "/api/admin/categories/5",
            "defaultCategory": true
        }
    ],
    "i18ns": {
        "en_US": {
            "title": "New Product",
            "description": "Product description"
        }
    }
}
```

### Update request (admin)

```http
PUT /api/admin/products/1
Content-Type: application/json
Authorization: Bearer {token}

{
    "visible": false,
    "i18ns": {
        "en_US": {
            "title": "Updated Title"
        }
    }
}
```

### Delete request (admin)

```http
DELETE /api/admin/products/1
Authorization: Bearer {token}
```

## Error responses

:::note
Error responses use the Hydra format regardless of the `Accept` header you send.
:::

### 400 Bad Request

```json
{
    "@context": "/api/contexts/ConstraintViolationList",
    "@type": "ConstraintViolationList",
    "hydra:title": "An error occurred",
    "hydra:description": "ref: This value should not be blank.",
    "violations": [
        {
            "propertyPath": "ref",
            "message": "This value should not be blank."
        }
    ]
}
```

### 404 Not Found

```json
{
    "@context": "/api/contexts/Error",
    "@type": "hydra:Error",
    "hydra:title": "An error occurred",
    "hydra:description": "Not Found"
}
```

### 401 Unauthorized

```json
{
    "@context": "/api/contexts/Error",
    "@type": "hydra:Error",
    "hydra:title": "An error occurred",
    "hydra:description": "Full authentication is required to access this resource."
}
```

## Available formats

| Format | Accept Header | Description |
|--------|---------------|-------------|
| JSON-LD | `application/ld+json` | Canonical format, with Hydra metadata (pagination info) |
| JSON | `application/json` | Plain JSON, enabled by default |
| HTML | `text/html` | Serves the interactive OpenAPI documentation |

:::note
JSON-LD (`application/ld+json`) is the canonical format Thelia configures for its API and the one used throughout the examples below.
:::

## OpenAPI documentation

Thelia's API is documented with OpenAPI. The interactive documentation is available at:

```
/api/docs
```

It offers:
- "Try it out" functionality
- Complete schema definitions
- Authentication testing
- Example requests and responses
