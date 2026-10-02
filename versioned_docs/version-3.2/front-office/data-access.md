---
title: Data Access
sidebar_position: 3
---

# Data Access Service

`DataAccessService` is how front-office templates fetch data in Thelia 3. It calls API endpoints internally, without the cost of a real HTTP request.

## Overview

Instead of using loops (which are now reserved for back-office), front-office templates use the `resources()` function to fetch data through the API layer:

```twig
{# Fetch a single product #}
{% set product = resources('/api/front/products/' ~ productId) %}

{# Fetch a collection #}
{% set products = resources('/api/front/products', {visible: true}) %}
```

## Twig functions

`DataAccessExtension` provides these functions:

| Function | Description |
|----------|-------------|
| `resources(path, params)` | Fetch data from an API endpoint |
| `attr(type, name)` | Read a contextual attribute (current product, cart, customer, etc.) |

:::note Return type
`resources()` returns `object|array|null`. A collection endpoint returns an array of items, a single-item endpoint returns one object, and a missing resource returns `null`. Do not assume the result is always an array.
:::

## The `resources()` function

### Basic usage

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

### With parameters

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

## The `attr()` function

The `attr()` function reads a contextual attribute. It calls the matching
`attribute<Type>()` method on `AttributeAccessService` (so `attr('product', 'id')`
calls `attributeProduct('id')`). The type comes from the current route attributes
(`product_id`, `category_id`, etc.), the session (cart, currency, lang), or the
configuration table.

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

### Available attribute types

Each type resolves through a dedicated method on `AttributeAccessService`.

| Type (`attr('<type>', ...)`) | Method | Resolvable names |
|------|--------|------------------|
| `product` | `attributeProduct` | Any Propel getter (`id`, `ref`, `visible`, ...) plus i18n columns `title`, `chapo`, `description`, `postscriptum` |
| `category` | `attributeCategory` | Same as product (getter + i18n columns); falls back to the product's default category |
| `content` | `attributeContent` | Getter + i18n columns |
| `folder` | `attributeFolder` | Getter + i18n columns; falls back to the content's default folder |
| `brand` | `attributeBrand` | Getter + i18n columns; falls back to the product's brand |
| `currency` | `attributeCurrency` | Getter + i18n column `name` (from the session currency) |
| `country` | `attributeCountry` | Only `default` (returns the i18n attributes of the default country) |
| `lang` | `attributeLang` | Any `Lang` getter (`id`, `title`, `locale`, `code`, ...) of the session language |
| `config` | `attributeConfig` | A configuration variable name (`ConfigQuery::read()`) |
| `cart` | `attributeCart` | See the cart attributes below |
| `coupon` | `attributeCoupon` | `has_coupons`, `coupon_count`, `coupon_list`, `is_delivery_free` |
| `customer` | `attributeCustomer` | Any `Customer` getter (`id`, `firstname`, `lastname`, `email`, ...) of the logged-in customer |

:::caution
There is no `attr('order', ...)`. Order attributes are exposed through the
`orderDataAccess()` method, which does not follow the `attribute<Type>` naming the
`attr()` function relies on. Read order data with `resources('/api/front/account/orders/...')` instead.
:::

#### Cart attributes

The cart type resolves a fixed set of names (it does not call Propel getters directly):

```twig
{% set itemCount   = attr('cart', 'item_count') %}
{% set productCount = attr('cart', 'product_count') %}
{% set total       = attr('cart', 'total_price') %}
{% set deliveryId  = attr('cart', 'delivery_module_id') %}
{% set paymentId   = attr('cart', 'payment_module_id') %}
```

Supported cart names: `product_count` (alias `count_product`), `item_count`
(alias `count_item`), `postage`, `taxed_postage`, `total_price` (alias
`total_price_with_discount`), `total_price_without_discount`,
`total_price_without_postage`, `raw_total_price`, `total_taxed_price` (alias
`total_taxed_price_with_discount`), `total_taxed_price_without_discount`,
`total_taxed_price_without_postage`, `raw_taxed_total_price`, `is_virtual`
(alias `contains_virtual_product`), `total_vat` (alias `total_tax_amount`),
`total_tax_amount_without_discount`, `raw_total_tax_amount`, `taxed_discount`,
`discount`, `discount_tax_amount`, `weight`, `delivery_module_id`,
`payment_module_id`.

### Complete example

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

## Available endpoints

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
    'contentFolders.folder.id': folderId,
    'visible': true
}) %}

{# Folder #}
{% set folder = resources('/api/front/folders/' ~ id) %}
```

### Customers

The current customer ID is read with `attr('customer', 'id')`, then passed to the
account endpoint (requires `ROLE_CUSTOMER`):

```twig
{# Logged-in customer #}
{% set customerId = attr('customer', 'id') %}
{% set customer = resources('/api/front/account/customers/' ~ customerId) %}

{# Customer addresses #}
{% set addresses = resources('/api/front/account/addresses', {
    'customer.id': customerId
}) %}
```

### Cart & Orders

```twig
{# Current session cart #}
{% set cart = resources('/api/front/cart') %}

{# Customer orders #}
{% set orders = resources('/api/front/account/orders') %}

{# Single order #}
{% set order = resources('/api/front/account/orders/' ~ orderId) %}
```

:::note
The current cart endpoint is the singular `/api/front/cart` (served by a dedicated
controller that resolves the session cart). The plural `/api/front/carts/{id}` and
`/api/front/account/orders/{id}` endpoints are scoped to the authenticated customer.
:::

## Using it in PHP (services and LiveComponents)

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

    public function getVisibleProducts(int $limit = 10): object|array|null
    {
        return $this->dataAccessService->resources('/api/front/products', [
            'visible' => true,
            'order[position]' => 'asc',
            'itemsPerPage' => $limit,
        ]);
    }

    public function getProduct(int $id): object|array|null
    {
        return $this->dataAccessService->resources('/api/front/products/' . $id);
    }
}
```

### In LiveComponents

```php
<?php

declare(strict_types=1);

namespace FlexyBundle\Components\Layouts\ProductListing;

use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\DefaultActionTrait;
use Thelia\Api\Service\DataAccess\DataAccessService;

#[AsLiveComponent]
class Base
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

### Using the JSON-LD format for pagination metadata

When you need pagination metadata (total items, next and previous page links), pass the `'jsonld'` format:

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

:::note Default vs JSON-LD format
With no format (the default), you get a plain array of items, which covers most cases. The `'jsonld'` format instead returns Hydra metadata (`hydra:member`, `hydra:totalItems`, `hydra:view`); use it when you need pagination info or a total count.
:::

## Filtering parameters

### Common filters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `visible` | Filter by visibility | `'visible': true` |
| `order[field]` | Sort by field | `'order[position]': 'asc'` |
| `itemsPerPage` | Pagination limit | `'itemsPerPage': 30` |
| `page` | Page number | `'page': 2` |

### Relation filters

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

### Search filters

The product `title` filter uses a `word_start` strategy: it matches the beginning of
each word in the translated title.

```twig
{# Text search on the product title #}
{% set products = resources('/api/front/products', {
    'title': searchQuery
}) %}
```

### Custom filters (tfilters)

Thelia has a `tfilters` system for faceted navigation. The
`/api/front/tfilters/{resource}` endpoint returns the filters available for a
resource (for example `products`), and you then apply the same `tfilters` payload to the
resource collection. The `CategoryFilters` LiveComponent follows this pattern.

```twig
{# Get available product filters for a category #}
{% set filters = resources('/api/front/tfilters/products', {
    'tfilters[category]': categoryId
}) %}

{# Apply the selected filters to the product collection #}
{% set products = resources('/api/front/products', {
    'productCategories.category.id': categoryId,
    'tfilters': selectedFilters
}) %}
```

## Accessing translated content

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

## Error handling

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
// resources() returns object|array|null
$product = $this->dataAccessService->resources('/api/front/products/' . $id);

if ($product === null) {
    throw new NotFoundHttpException('Product not found');
}
```

## Performance

### Avoid N+1 queries

```twig
{# Bad - multiple API calls in loop #}
{% for product in products %}
    {% set images = resources('/api/front/product_images', {'product.id': product.id}) %}
{% endfor %}

{# Good - fetch all at once if possible, or use component #}
<twig:Organisms:ProductCard:Base :product="product" />
```

### Use pagination

```twig
{# Always limit results #}
{% set products = resources('/api/front/products', {
    'itemsPerPage': 30,
    'page': page
}) %}
```

### Caching

`DataAccessService` calls go through API Platform's caching layer, so responses can be served from the HTTP cache once it is configured.

## Next steps

- [LiveComponents](./live-components) - Build reactive components with data access
- [API Endpoints](/docs/api/endpoints/) - Complete endpoint reference
- [Flexy Theme](./flexy-theme/) - See real-world examples
