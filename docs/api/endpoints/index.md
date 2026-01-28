---
title: Endpoints Reference
sidebar_position: 1
---

# API Endpoints Reference

This section provides reference documentation for Thelia's core API endpoints.

## Endpoint Overview

### Admin Endpoints (`/api/admin/`)

Full CRUD operations requiring authentication.

| Resource | Endpoint | Operations |
|----------|----------|------------|
| Products | `/api/admin/products` | GET, POST, PUT, PATCH, DELETE |
| Categories | `/api/admin/categories` | GET, POST, PUT, PATCH, DELETE |
| Customers | `/api/admin/customers` | GET, POST, PUT, PATCH, DELETE |
| Orders | `/api/admin/orders` | GET, PUT, PATCH |
| Brands | `/api/admin/brands` | GET, POST, PUT, PATCH, DELETE |
| Tax Rules | `/api/admin/tax_rules` | GET, POST, PUT, DELETE |
| Features | `/api/admin/features` | GET, POST, PUT, DELETE |
| Attributes | `/api/admin/attributes` | GET, POST, PUT, DELETE |
| Contents | `/api/admin/contents` | GET, POST, PUT, PATCH, DELETE |
| Folders | `/api/admin/folders` | GET, POST, PUT, PATCH, DELETE |
| Currencies | `/api/admin/currencies` | GET, POST, PUT, DELETE |
| Countries | `/api/admin/countries` | GET, POST, PUT, DELETE |
| Modules | `/api/admin/modules` | GET, PUT |

### Front Endpoints (`/api/front/`)

Read-only public access (some with customer auth).

| Resource | Endpoint | Operations |
|----------|----------|------------|
| Products | `/api/front/products` | GET (collection, item) |
| Categories | `/api/front/categories` | GET (collection, item) |
| Brands | `/api/front/brands` | GET (collection, item) |
| Contents | `/api/front/contents` | GET (collection, item) |
| Cart | `/api/front/carts` | GET, POST, PUT |
| Countries | `/api/front/countries` | GET (collection, item) |

## Common Patterns

### Collection Request

```http
GET /api/front/products?visible=true&itemsPerPage=20&page=1
Accept: application/ld+json
```

### Collection Response

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

### Single Item Request

```http
GET /api/front/products/1
Accept: application/ld+json
```

### Single Item Response

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

### Create Request (Admin)

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

### Update Request (Admin)

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

### Delete Request (Admin)

```http
DELETE /api/admin/products/1
Authorization: Bearer {token}
```

## Error Responses

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

## Available Formats

| Format | Accept Header | Description |
|--------|---------------|-------------|
| JSON | `application/json` | Default, plain JSON arrays |
| JSON-LD | `application/ld+json` | With Hydra metadata (pagination info) |

## Detailed Endpoint Documentation

- [Products API](./products) - Complete products endpoint reference
- [Categories API](./categories) - Category management
- [Customers API](./customers) - Customer management
- [Orders API](./orders) - Order management
- [Cart API](./cart) - Shopping cart operations

## OpenAPI Documentation

Thelia's API is fully documented with OpenAPI. Access the interactive documentation at:

```
/api/docs
```

This provides:
- Interactive "Try it out" functionality
- Complete schema definitions
- Authentication testing
- Example requests and responses
