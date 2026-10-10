---
title: Endpoints Reference
sidebar_position: 1
---

# API Endpoints Reference

Reference documentation for Thelia's core API endpoints.

:::note Order returns are behind a setting
The order return resources answer 404, rather than 403, while `order_return_enabled` is off. See
[Order Returns](../../features/order-returns.md).
:::

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
| Sales | `/api/admin/sales` | GET (collection, item) |
| Order returns | `/api/admin/order_returns` | GET, POST, PUT, PATCH, DELETE |
| Order return lines | `/api/admin/order_return_lines` | GET, POST, PATCH |
| Order return reasons | `/api/admin/order_return_reasons` | GET, POST, PUT, PATCH, DELETE |
| Order return statuses | `/api/admin/order_return_statutes` | GET (collection, item) |
| Product relation types | `/api/admin/product_association_types` | GET, POST, PUT, PATCH, DELETE |
| Product relations | `/api/admin/product_associations` | GET, POST, DELETE |
| Customer tags | `/api/admin/tags` | GET, POST, PUT, PATCH, DELETE |
| Customer tag attachments | `/api/admin/tag-elements` | GET, POST, DELETE |

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
| Sales | `/api/front/sales` | GET (collection, item) |
| Product relation types | `/api/front/product_association_types` | GET (collection, item) |
| Product relations | `/api/front/product_associations` | GET (collection, item) |
| Account order returns | `/api/front/account/order_returns` | GET (collection, item), POST |
| Guest account conversion | `/api/front/guest-customers/{id}/convert` | POST |
| Checkout | `/api/front/account/checkout/{cartId}` | POST (`delivery_address`, `invoice_address`, `delivery_module`, `payment_module`, `place`), GET (`validation`) |

:::note
The current-cart shortcut `/api/front/cart` returns the cart bound to the current session through a dedicated controller, so you do not need to know its `id`. The collection-style `/api/front/carts/{id}` operations require customer authentication.
:::

:::caution
Customer and order personal-data routes (`/api/front/account/customers/{id}`, `/api/front/account/orders`, `/api/front/account/orders/{id}`) require a customer JWT and only expose the authenticated customer's own data. The `POST /api/front/customers` operation is the public account-creation endpoint.
:::

The checkout operations are documented on their own page: [Checkout over the front API](../checkout.md).

## Common patterns

### Collection request

```http
GET /api/front/products?visible=true&itemsPerPage=20&page=1
Accept: application/ld+json
```

### Sorting a collection

Sorting is asked for with the `order` parameter, keyed by the property to sort on, with `asc` or
`desc` as its value:

```http
GET /api/front/products?order[createdAt]=desc&itemsPerPage=20
```

The product collection, both on `/api/admin/products` and on `/api/front/products`, sorts on:

| Property | Sorts by |
| --- | --- |
| `ref` | The product reference |
| `position` | The manual position |
| `productCategories.position` | The manual position inside a category |
| `createdAt` | The date the product was created |
| `updatedAt` | The date the product was last written |
| `title` | The product title in the requested language |

`order[title]` is a filter of its own rather than the generic one, because a title lives in the
translation rows of the product: sorting through the plain relation path would multiply the rows
of the collection. It takes the same `asc` and `desc` values as the others.

Several keys can be combined, and they apply in the order they are written:

```http
GET /api/front/products?order[position]=asc&order[title]=asc
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

Use `PATCH` to change part of a resource. Properties the payload leaves out keep
their value.

```http
PATCH /api/admin/products/1
Content-Type: application/merge-patch+json
Authorization: Bearer {token}

{
    "visible": false
}
```

The `Content-Type` matters: a `PATCH` sent as `application/json` answers `415`.

### PUT replaces the whole resource

`PUT` writes the resource the payload describes, so every writable property the
payload omits is emptied. Sending only the property you want to change deletes
the rest:

```http
PUT /api/admin/products/1
Content-Type: application/json
Authorization: Bearer {token}

{
    "visible": false
}
```

That request answers `422` naming `taxRule`, `ref` and `i18ns`, the writable
properties it left out. Use `PUT` when you send the complete resource, and
`PATCH` otherwise.

### Nested collections are replaced, not merged

A collection sent inside its parent replaces the collection that was there, for
`PATCH` as well as for `PUT`. This follows the JSON merge patch rules, where an
array is replaced as a whole.

The practical consequences on a product and its sale elements:

- A sale element absent from `productSaleElements` is deleted, along with its
  attribute combinations and its customer family prices.
- A sale element present but carrying no `productPrices` ends up with no price.
- A sale element with no `id` is matched on its `ref` under the same product, so
  a client holding its own references keeps addressing the same row. Two rows
  sharing a reference are ambiguous, and a new one is created instead.

To update a sale element on its own, address it directly and leave
`productSaleElements` out of the product payload:

```http
PATCH /api/admin/product_sale_elements/42
Content-Type: application/merge-patch+json
Authorization: Bearer {token}

{
    "quantity": 12
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

### 422 Unprocessable Entity

A write that breaks a validation rule answers `422` and writes no row. Each
violation names the property at fault in `propertyPath`:

```json
{
    "@context": "/api/contexts/ConstraintViolation",
    "@type": "ConstraintViolation",
    "status": 422,
    "violations": [
        {
            "propertyPath": "firstname",
            "message": "This value should not be blank.",
            "code": "c1051bb4-d103-4f74-8988-acbcafc7fdc3"
        },
        {
            "propertyPath": "lastname",
            "message": "This value should not be blank.",
            "code": "c1051bb4-d103-4f74-8988-acbcafc7fdc3"
        }
    ],
    "detail": "firstname: This value should not be blank.\nlastname: This value should not be blank.",
    "hydra:title": "An error occurred",
    "hydra:description": "firstname: This value should not be blank.\nlastname: This value should not be blank."
}
```

The checks that clients synchronising data, such as an ERP, run into most often:

| Request | Refused when | Violations |
|---------|--------------|------------|
| `POST /api/admin/customers`, `POST /api/front/customers` | `firstname` or `lastname` is left out or empty | `firstname`, `lastname` |
| `PUT /api/admin/customers/{id}`, `PUT /api/front/account/customers/{id}` | `firstname` or `lastname` is left out or empty | `firstname`, `lastname` |
| `PATCH /api/admin/customers/{id}` | `firstname` or `lastname` is sent empty | `firstname`, `lastname` |
| `POST /api/admin/customers` | `email` is left out, empty or not an email address, or `password` is left out or empty | `email`, `password` |
| `POST /api/admin/product_sale_elements`, `PUT /api/admin/product_sale_elements/{id}` | `product` or `ref` is left out or empty, or `quantity` is left out | `product`, `ref`, `quantity` |
| `PUT` on another admin resource | a required property is left out (see [PUT replaces the whole resource](#put-replaces-the-whole-resource)) | the properties left out |

Property names are the ones the resource declares: a payload sending
`firstName` where the customer resource reads `firstname` is refused as a
customer without a first name. A `quantity` of `0` is accepted.

A violation found in a nested resource carries the path to that resource. When
the second address posted with a customer has an empty label, the response
names `addresses[1].label`, the index being the position of the address in the
payload:

```json
{
    "violations": [
        {
            "propertyPath": "addresses[1].label",
            "message": "This value should not be blank."
        }
    ],
    "detail": "addresses[1].label: This value should not be blank."
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
