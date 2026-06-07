---
title: Filters & Pagination
sidebar_position: 7
---

# Filters & Pagination

Thelia's API supports powerful filtering, sorting, and pagination through API Platform's filter system with custom Propel adapters.

## Basic Usage

Filters are applied via query parameters:

```http
GET /api/front/products?visible=true&brand.id=5&order[position]=asc&page=2&itemsPerPage=20
```

## Available Filters

### SearchFilter

Exact and partial matching on text fields.

```php
#[ApiFilter(
    filterClass: SearchFilter::class,
    properties: [
        'ref',                              // Exact match
        'title' => 'word_start',            // Starts with (word boundary)
        'productCategories.category.id',    // Related entity ID
        'brand.id',                         // Related entity ID
    ],
)]
```

**Usage:**

```http
# Exact match
GET /api/admin/products?ref=PROD-001

# Partial match (word_start)
GET /api/admin/products?title=shirt

# Related entity
GET /api/front/products?brand.id=5
GET /api/front/products?productCategories.category.id=10
```

**Match strategies:**

| Strategy | Description | Example |
|----------|-------------|---------|
| `exact` | Exact match (default) | `ref=PROD-001` |
| `partial` | Contains anywhere | `title=shirt` matches "T-shirt" |
| `start` | Starts with | `ref=PROD` matches "PROD-001" |
| `end` | Ends with | `ref=001` matches "PROD-001" |
| `word_start` | Word boundary start | `title=blue` matches "Blue shirt" |

### BooleanFilter

Filter on boolean fields.

```php
#[ApiFilter(
    filterClass: BooleanFilter::class,
    properties: [
        'visible',
        'virtual',
        'productCategories.defaultCategory',
        'productSaleElements.isDefault',
        'productSaleElements.promo',
        'productSaleElements.newness',
    ],
)]
```

**Usage:**

```http
# Direct boolean
GET /api/front/products?visible=true
GET /api/front/products?virtual=false

# Related boolean
GET /api/front/products?productSaleElements.promo=true
GET /api/front/products?productSaleElements.newness=true
```

### OrderFilter

Sort results by field.

```php
#[ApiFilter(
    filterClass: OrderFilter::class,
    properties: [
        'ref',
        'position',
        'createdAt',
        'productCategories.position',
    ],
)]
```

**Usage:**

```http
# Single field
GET /api/front/products?order[position]=asc
GET /api/admin/products?order[createdAt]=desc

# Multiple fields
GET /api/front/products?order[position]=asc&order[ref]=asc

# Related field
GET /api/front/products?order[productCategories.position]=asc
```

### RangeFilter

Filter by numeric ranges.

```php
#[ApiFilter(
    filterClass: RangeFilter::class,
    properties: [
        'productSaleElements.productPrices.price',
        'productSaleElements.productPrices.promoPrice',
        'productSaleElements.weight',
        'productSaleElements.quantity',
    ],
)]
```

**Usage:**

```http
# Greater than
GET /api/front/products?productSaleElements.productPrices.price[gt]=50

# Less than
GET /api/front/products?productSaleElements.productPrices.price[lt]=100

# Greater than or equal
GET /api/front/products?productSaleElements.productPrices.price[gte]=10

# Less than or equal
GET /api/front/products?productSaleElements.productPrices.price[lte]=100

# Between (combine gte and lte)
GET /api/front/products?productSaleElements.productPrices.price[gte]=10&productSaleElements.productPrices.price[lte]=100
```

### DateFilter

Filter on `TIMESTAMP` / date columns by range. The operators are `before`, `after`, `strictly_before` and `strictly_after` (not `gte`/`lte`).

```php
// core/lib/Thelia/Api/Resource/Order.php
#[ApiFilter(
    filterClass: DateFilter::class,
    properties: [
        'createdAt' => DateFilter::INCLUDE_NULL_BEFORE_AND_AFTER,
        'updatedAt' => DateFilter::INCLUDE_NULL_BEFORE_AND_AFTER,
    ],
)]
```

The value mapped to each property is a *null-handling strategy*:

| Strategy constant | Behavior on `NULL` values |
|-------------------|---------------------------|
| `EXCLUDE_NULL` (default) | Rows where the column is `NULL` are excluded |
| `INCLUDE_NULL_BEFORE` | `NULL` rows kept, ordered ascending |
| `INCLUDE_NULL_AFTER` | `NULL` rows kept, ordered descending |
| `INCLUDE_NULL_BEFORE_AND_AFTER` | `NULL` rows always kept |

**Usage:**

```http
# On or before a date (LESS_EQUAL)
GET /api/admin/orders?createdAt[before]=2026-01-31

# On or after a date (GREATER_EQUAL)
GET /api/admin/orders?createdAt[after]=2026-01-01

# Strictly before / after (excludes the boundary)
GET /api/admin/orders?createdAt[strictly_before]=2026-02-01
GET /api/admin/orders?createdAt[strictly_after]=2025-12-31

# Between two dates (combine after + before)
GET /api/admin/orders?createdAt[after]=2026-01-01&createdAt[before]=2026-01-31
```

:::note
`before` and `after` are inclusive (`<=` / `>=`). Use `strictly_before` and `strictly_after` for exclusive comparisons (`<` / `>`).
:::

### NotInFilter

Exclude specific values.

```php
#[ApiFilter(
    filterClass: NotInFilter::class,
    properties: [
        'id',
        'ref',
        'productCategories.category.id',
    ],
)]
```

**Usage:**

```http
# Exclude IDs
GET /api/front/products?id[not_in]=1,2,3

# Exclude categories
GET /api/front/products?productCategories.category.id[not_in]=5,10

# Exclude refs
GET /api/admin/products?ref[not_in]=HIDDEN-001,HIDDEN-002
```

### TheliaFilter

Custom Thelia-specific filters (varies by resource).

```php
#[ApiFilter(
    filterClass: TheliaFilter::class,
)]
```

### Custom Filters

#### ProductPriceOrderFilter

`Thelia\Api\Bridge\Propel\Filter\CustomFilters\ProductFilter\ProductPriceOrderFilter`

Sort products by untaxed price. The query parameter is `untaxed_price_order`, with `asc` or `desc` as accepted values.

```http
GET /api/front/products?untaxed_price_order=asc
GET /api/front/products?untaxed_price_order=desc
```

#### DepthProductFilter

`Thelia\Api\Bridge\Propel\Filter\CustomFilters\ProductFilter\DepthProductFilter`

Filter by category depth.

```http
GET /api/front/products?depth=2&productCategories.category.id=5
```

## Pagination

### Query Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `page` | Page number (1-based) | 1 |
| `itemsPerPage` | Items per page | 30 |

**Usage:**

```http
GET /api/front/products?page=2&itemsPerPage=20
```

### Response Format

By default, the API returns a simple JSON array:

```json
[
    {"id": 1, "ref": "PROD-001", ...},
    {"id": 2, "ref": "PROD-002", ...}
]
```

To get pagination metadata (total items, page info), use JSON-LD format with `Accept: application/ld+json` header:

```json
{
    "@context": "/api/contexts/Product",
    "@id": "/api/front/products",
    "@type": "hydra:Collection",
    "hydra:totalItems": 150,
    "hydra:member": [...],
    "hydra:view": {
        "@id": "/api/front/products?page=2",
        "@type": "hydra:PartialCollectionView",
        "hydra:first": "/api/front/products?page=1",
        "hydra:last": "/api/front/products?page=8",
        "hydra:previous": "/api/front/products?page=1",
        "hydra:next": "/api/front/products?page=3"
    }
}
```

### Accessing Pagination in Twig

The Twig `resources()` function returns a simple array by default. For pagination, use `itemsPerPage` and `page` parameters:

```twig
{% set products = resources('/api/front/products', {
    'productCategories.category.id': categoryId,
    'itemsPerPage': 20,
    'page': currentPage
}) %}

<div class="products">
    {% for product in products %}
        {{ include('partials/product-card.html.twig', {product: product}) }}
    {% endfor %}
</div>

{# Simple pagination without total count #}
<nav class="pagination">
    {% if currentPage > 1 %}
        <a href="?page={{ currentPage - 1 }}">Previous</a>
    {% endif %}

    {% if products|length == 20 %}
        <a href="?page={{ currentPage + 1 }}">Next</a>
    {% endif %}
</nav>
```

:::tip Pagination with Total Count
For pagination with total item count, use `DataAccessService` with `'jsonld'` format in a PHP service or LiveComponent, as the Twig function doesn't support JSON-LD format.
:::

## Combining Filters

Filters can be combined:

```http
GET /api/front/products?visible=true&productCategories.category.id=5&productSaleElements.promo=true&productSaleElements.productPrices.price[gte]=10&productSaleElements.productPrices.price[lte]=100&order[position]=asc&itemsPerPage=20
```

In Twig:

```twig
{% set products = resources('/api/front/products', {
    'visible': true,
    'productCategories.category.id': categoryId,
    'productSaleElements.promo': true,
    'productSaleElements.productPrices.price[gte]': '10',
    'productSaleElements.productPrices.price[lte]': '100',
    'order[position]': 'asc',
    'itemsPerPage': 20
}) %}
```

## Adding Filters to Resources

### On the Resource Class

```php
use ApiPlatform\Metadata\ApiFilter;
use Thelia\Api\Bridge\Propel\Filter\SearchFilter;
use Thelia\Api\Bridge\Propel\Filter\BooleanFilter;
use Thelia\Api\Bridge\Propel\Filter\OrderFilter;

#[ApiFilter(
    filterClass: SearchFilter::class,
    properties: ['ref', 'title' => 'word_start'],
)]
#[ApiFilter(
    filterClass: BooleanFilter::class,
    properties: ['visible', 'active'],
)]
#[ApiFilter(
    filterClass: OrderFilter::class,
    properties: ['position', 'createdAt'],
)]
class MyResource implements PropelResourceInterface
{
    // ...
}
```

### Per Operation

```php
new GetCollection(
    uriTemplate: '/front/products',
    filters: [
        'api_platform.filter.search',
        'api_platform.filter.boolean',
    ],
)
```

## Filter Classes Reference

| Filter | Import |
|--------|--------|
| SearchFilter | `Thelia\Api\Bridge\Propel\Filter\SearchFilter` |
| BooleanFilter | `Thelia\Api\Bridge\Propel\Filter\BooleanFilter` |
| OrderFilter | `Thelia\Api\Bridge\Propel\Filter\OrderFilter` |
| RangeFilter | `Thelia\Api\Bridge\Propel\Filter\RangeFilter` |
| DateFilter | `Thelia\Api\Bridge\Propel\Filter\DateFilter` |
| NotInFilter | `Thelia\Api\Bridge\Propel\Filter\NotInFilter` |
| TheliaFilter | `Thelia\Api\Bridge\Propel\Filter\CustomFilters\TheliaFilter` |
| ProductPriceOrderFilter | `Thelia\Api\Bridge\Propel\Filter\CustomFilters\ProductFilter\ProductPriceOrderFilter` |
| DepthProductFilter | `Thelia\Api\Bridge\Propel\Filter\CustomFilters\ProductFilter\DepthProductFilter` |

## Best Practices

1. **Index filtered columns** - Ensure database indexes on filtered fields
2. **Limit exposed filters** - Only expose necessary filters
3. **Use appropriate strategies** - Choose the right search strategy for UX
4. **Paginate collections** - Always paginate large collections
5. **Cache when possible** - Cache frequent filter combinations

## Next Steps

- [Endpoints Reference](./endpoints) - Complete API endpoints
- [Resources](./resources) - Creating API resources
- [DataAccess Service](/docs/front-office/data-access) - Using filters in templates
