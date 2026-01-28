---
title: Data Access
sidebar_position: 3
---

# Data Access Service

The **DataAccessService** is the primary way to fetch data in Thelia 3 front-office templates. It provides a unified interface to call API endpoints internally without HTTP overhead.

## Overview

Instead of using loops (which are now reserved for back-office), front-office templates use the `resources()` function to fetch data through the API layer:

```twig
{# Fetch a single product #}
{% set product = resources('/api/front/products/' ~ productId) %}

{# Fetch a collection #}
{% set products = resources('/api/front/products', {visible: true}) %}
```

## Twig Functions

The `DataAccessExtension` provides these functions:

| Function | Description |
|----------|-------------|
| `resources(path, params)` | Fetch data from an API endpoint |
| `attr(type, name)` | Get URL attributes (product id, category id, etc.) |
| `loop()` | **Deprecated** - Use `resources()` instead |
| `loopCount()` | **Deprecated** - Use `resources()` instead |

## The `resources()` Function

### Basic Usage

```twig
{# Fetch a single item by ID #}
{% set product = resources('/api/front/products/123') %}
{{ product.i18ns.title }}

{# Fetch a collection #}
{% set categories = resources('/api/front/categories') %}
{% for category in categories %}
    {{ category.i18ns.title }}
{% endfor %}
```

### With Parameters

```twig
{# Filter by category #}
{% set products = resources('/api/front/products', {
    'productCategories.category.id': categoryId,
    'visible': true
}) %}

{# Order results #}
{% set categories = resources('/api/front/categories', {
    'parent': categoryId,
    'order[position]': 'asc',
    'visible': true
}) %}

{# Pagination #}
{% set products = resources('/api/front/products', {
    'itemsPerPage': 30,
    'page': 2
}) %}
```

### Pagination

Use `itemsPerPage` and `page` parameters for pagination:

```twig
{% set products = resources('/api/front/products', {
    'productCategories.category.id': categoryId,
    'itemsPerPage': 30,
    'page': currentPage
}) %}

{% for product in products %}
    {{ product.i18ns.title }}
{% endfor %}
```

:::note
In PHP (services, LiveComponents), you can use the `'jsonld'` format as a third parameter to `DataAccessService::resources()` to get Hydra metadata with pagination info. This format parameter is not available in the Twig function.
:::

## The `attr()` Function

The `attr()` function retrieves URL parameters based on the current route:

```twig
{# Get product ID from URL #}
{% set productId = attr('product', 'id') %}

{# Get category ID #}
{% set categoryId = attr('category', 'id') %}

{# Get content ID #}
{% set contentId = attr('content', 'id') %}

{# Get folder ID #}
{% set folderId = attr('folder', 'id') %}
```

### Complete Example

```twig
{# product.html.twig #}
{% extends 'base.html.twig' %}

{% set productId = attr('product', 'id') %}
{% set product = resources('/api/front/products/' ~ productId) %}

{% block body %}
    <h1>{{ product.i18ns.title }}</h1>
    <p>{{ product.i18ns.description|raw }}</p>
{% endblock %}
```

## Available Endpoints

### Products

```twig
{# Single product #}
{% set product = resources('/api/front/products/' ~ id) %}

{# Products list #}
{% set products = resources('/api/front/products', {
    'visible': true,
    'productCategories.category.id': categoryId
}) %}

{# Product images #}
{% set images = resources('/api/front/product_images', {
    'product.id': productId
}) %}

{# Product sale elements (variants) #}
{% set pses = resources('/api/front/product_sale_elements', {
    'product.id': productId
}) %}

{# PSE by reference #}
{% set pse = resources('/api/front/product_sale_elements', {
    'ref': 'SKU-123'
})|first %}
```

### Categories

```twig
{# Single category #}
{% set category = resources('/api/front/categories/' ~ id) %}

{# Child categories #}
{% set children = resources('/api/front/categories', {
    'parent': parentId,
    'visible': true,
    'order[position]': 'asc'
}) %}

{# Root categories #}
{% set roots = resources('/api/front/categories', {
    'parent': 0,
    'visible': true
}) %}
```

### Content & Folders

```twig
{# Single content #}
{% set content = resources('/api/front/contents/' ~ id) %}

{# Contents in folder #}
{% set contents = resources('/api/front/contents', {
    'folder.id': folderId,
    'visible': true
}) %}

{# Folder #}
{% set folder = resources('/api/front/folders/' ~ id) %}
```

### Customers

```twig
{# Current customer (when logged in) #}
{% set customer = resources('/api/front/customers/me') %}

{# Customer addresses #}
{% set addresses = resources('/api/front/addresses') %}
```

### Cart & Orders

```twig
{# Current cart #}
{% set cart = resources('/api/front/carts/current') %}

{# Customer orders #}
{% set orders = resources('/api/front/orders') %}

{# Single order #}
{% set order = resources('/api/front/orders/' ~ orderId) %}
```

## Using in PHP (Services & LiveComponents)

### Injecting DataAccessService

```php
<?php

declare(strict_types=1);

namespace App\Service;

use Thelia\Api\Service\DataAccess\DataAccessService;

final readonly class ProductService
{
    public function __construct(
        private DataAccessService $dataAccessService,
    ) {}

    public function getFeaturedProducts(int $limit = 10): array
    {
        return $this->dataAccessService->resources('/api/front/products', [
            'featured' => true,
            'visible' => true,
            'itemsPerPage' => $limit,
        ]);
    }

    public function getProduct(int $id): ?array
    {
        return $this->dataAccessService->resources('/api/front/products/' . $id);
    }
}
```

### In LiveComponents

```php
<?php

declare(strict_types=1);

namespace FlexyBundle\UiComponents\CategoryFilters;

use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\DefaultActionTrait;
use Thelia\Api\Service\DataAccess\DataAccessService;

#[AsLiveComponent(name: 'Flexy:CategoryFilters')]
class CategoryFilters
{
    use DefaultActionTrait;

    #[LiveProp]
    public ?int $categoryId = null;

    #[LiveProp]
    public int $page = 1;

    public ?array $products = [];

    public function __construct(
        private readonly DataAccessService $dataAccessService,
    ) {}

    public function mount(?int $initialCategoryId, ?int $initialPage): void
    {
        $this->categoryId = $initialCategoryId;
        $this->page = $initialPage ?? 1;

        $this->loadProducts();
    }

    private function loadProducts(): void
    {
        // Default format (JSON) - returns simple array
        $this->products = $this->dataAccessService->resources('/api/front/products', [
            'productCategories.category.id' => $this->categoryId,
            'itemsPerPage' => 30,
            'page' => $this->page,
        ]);
    }
}
```

### Using JSON-LD Format for Pagination Metadata

When you need pagination metadata (total items, next/previous page links), use the `'jsonld'` format:

```php
private function loadProductsWithPagination(): void
{
    $response = $this->dataAccessService->resources('/api/front/products', [
        'productCategories.category.id' => $this->categoryId,
        'itemsPerPage' => 30,
        'page' => $this->page,
    ], 'jsonld'); // Third parameter enables JSON-LD format

    $this->products = $response['hydra:member'];
    $this->totalItems = $response['hydra:totalItems'];
    // Also available: hydra:view with hydra:first, hydra:last, hydra:next, hydra:previous
}
```

:::note Default vs JSON-LD Format
- **Default (no format)**: Returns a simple array of items. Use this for most cases.
- **JSON-LD format**: Returns Hydra metadata (`hydra:member`, `hydra:totalItems`, `hydra:view`). Use when you need pagination info or total count.
:::

## Filtering Parameters

### Common Filters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `visible` | Filter by visibility | `'visible': true` |
| `order[field]` | Sort by field | `'order[position]': 'asc'` |
| `itemsPerPage` | Pagination limit | `'itemsPerPage': 30` |
| `page` | Page number | `'page': 2` |

### Relation Filters

```twig
{# Filter by related entity ID #}
{% set products = resources('/api/front/products', {
    'productCategories.category.id': categoryId
}) %}

{# Filter by brand #}
{% set products = resources('/api/front/products', {
    'brand.id': brandId
}) %}
```

### Search Filters

```twig
{# Text search #}
{% set products = resources('/api/front/products', {
    'i18ns.title': searchQuery
}) %}
```

### Custom Filters (tfilters)

Thelia provides a `tfilters` system for faceted navigation:

```twig
{# Get available filters for a category #}
{% set filters = resources('/api/front/tfilters/products', {
    'tfilters[category]': categoryId
}) %}

{# Apply filters #}
{% set products = resources('/api/front/products', {
    'productCategories.category.id': categoryId,
    'tfilters': selectedFilters
}) %}
```

## Accessing Translated Content

API responses include translated content in the `i18ns` property:

```twig
{% set product = resources('/api/front/products/' ~ productId) %}

{# Access translations #}
{{ product.i18ns.title }}
{{ product.i18ns.description|raw }}
{{ product.i18ns.chapo }}
{{ product.i18ns.postscriptum }}

{# With default fallback #}
{{ product.i18ns.chapo|default('No description available') }}
```

## Error Handling

```twig
{% set product = resources('/api/front/products/' ~ productId) %}

{% if product %}
    <h1>{{ product.i18ns.title }}</h1>
{% else %}
    <p>Product not found</p>
{% endif %}
```

In PHP:

```php
$product = $this->dataAccessService->resources('/api/front/products/' . $id);

if ($product === null) {
    throw new NotFoundHttpException('Product not found');
}
```

## Performance Considerations

### Avoid N+1 Queries

```twig
{# Bad - multiple API calls in loop #}
{% for product in products %}
    {% set images = resources('/api/front/product_images', {'product.id': product.id}) %}
{% endfor %}

{# Good - fetch all at once if possible, or use component #}
{{ component('Flexy:ProductCard', {product: product}) }}
```

### Use Pagination

```twig
{# Always limit results #}
{% set products = resources('/api/front/products', {
    'itemsPerPage': 30,
    'page': page
}) %}
```

### Cache Considerations

DataAccessService calls go through API Platform's caching layer. The responses benefit from HTTP caching when properly configured.

## Migration from Loops

If migrating from Thelia 2 loops:

| Thelia 2 Loop | Thelia 3 DataAccess |
|---------------|---------------------|
| `{loop type="product" ...}` | `resources('/api/front/products', {...})` |
| `{loop type="category" ...}` | `resources('/api/front/categories', {...})` |
| `{loop type="content" ...}` | `resources('/api/front/contents', {...})` |

See [Migration Guide](/docs/migration) for detailed examples.

## Next Steps

- [LiveComponents](./live-components) - Build reactive components with data access
- [API Endpoints](/docs/api/endpoints/) - Complete endpoint reference
- [Flexy Theme](./flexy-theme/) - See real-world examples
