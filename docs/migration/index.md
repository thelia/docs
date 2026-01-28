---
title: Migration Guide
sidebar_position: 1
---

# Migration Guide: Thelia 2 to Thelia 3

This guide covers the major changes when upgrading from Thelia 2.x to Thelia 3 and provides migration strategies for your custom code.

## Overview of Changes

### What Changed

| Area | Thelia 2 | Thelia 3 |
|------|----------|----------|
| **Front-Office Templates** | Smarty | **Twig** |
| **Front-Office Data** | Loops | **DataAccessService (API)** |
| **Front-Office Interactivity** | Hooks + JS | **LiveComponents + Stimulus** |
| **Back-Office Templates** | Smarty | Smarty (unchanged) |
| **Back-Office Data** | Loops | Loops (unchanged) |
| **API** | Custom REST | **API Platform** |
| **PHP Version** | 7.4-8.1 | **8.3+** |
| **Symfony Version** | 5.x/6.x | **6.4+** |

### What Stayed the Same

- **Propel ORM** - Same database layer
- **Module system** - Same structure and lifecycle
- **Back-office** - Smarty templates, Loops, Hooks
- **Events system** - Same event dispatcher
- **Forms** - Same Symfony Forms
- **Security** - Same authentication/authorization

## Migration Checklist

### 1. Server Requirements

Ensure your server meets the new requirements:

```bash
# PHP 8.3+ required
php -v

# Check required extensions
php -m | grep -E "ctype|iconv|json|mbstring|pdo"
```

### 2. Update composer.json

```json
{
    "require": {
        "php": ">=8.3",
        "thelia/thelia": "^3.0"
    }
}
```

### 3. Update Your Code

- Add `declare(strict_types=1);` to all PHP files
- Add type hints to all method parameters and returns
- Update deprecated Symfony usage

## Front-Office Migration

### Template Migration: Smarty to Twig

The most significant change is the front-office template engine.

#### Loop to DataAccess

**Before (Smarty + Loop)**:
```smarty
{loop name="products" type="product" category=$category_id visible=1}
    <div class="product">
        <h3>{$TITLE}</h3>
        <p>{$PRICE} {$CURRENCY}</p>
    </div>
{/loop}
```

**After (Twig + DataAccess)**:
```twig
{% set products = resources('/api/front/products', {
    'productCategories.category.id': categoryId,
    'visible': true
}) %}

{% for product in products %}
    <div class="product">
        <h3>{{ product.i18ns.title }}</h3>
        <p>{{ product.defaultSaleElements.price }} {{ product.currency.code }}</p>
    </div>
{% endfor %}
```

#### Hooks to LiveComponents

**Before (Smarty Hook)**:
```smarty
{hook name="product.additional-info" product=$PRODUCT_ID}
```

**After (Twig LiveComponent)**:
```twig
{{ component('Flexy:ProductInfo', { productId: product.id }) }}
```

#### URL Generation

**Before (Smarty)**:
```smarty
<a href="{url path="/product/{$PRODUCT_ID}"}">View</a>
```

**After (Twig)**:
```twig
<a href="{{ path('product.show', { id: product.id }) }}">View</a>
```

#### Internationalization

**Before (Smarty)**:
```smarty
{intl l="Add to cart"}
```

**After (Twig)**:
```twig
{{ 'Add to cart'|trans }}
```

### Data Access Patterns

#### Single Item

**Before**:
```smarty
{loop name="product" type="product" id=$product_id}
    {$TITLE}
{/loop}
```

**After**:
```twig
{% set product = resources('/api/front/products/' ~ productId) %}
{{ product.i18ns.title }}
```

#### Filtered Collection

**Before**:
```smarty
{loop name="products" type="product" category=$cat_id order="alpha" limit="10"}
    ...
{/loop}
```

**After**:
```twig
{% set products = resources('/api/front/products', {
    'productCategories.category.id': categoryId,
    'order[i18ns.title]': 'asc',
    'itemsPerPage': 10
}) %}
```

#### Pagination

**Before**:
```smarty
{loop name="products" type="product" page=$page limit="20"}
    ...
{/loop}
{pagination loop="products"}
    <a href="{$URL}">{$PAGE}</a>
{/pagination}
```

**After**:
```twig
{% set products = resources('/api/front/products', {
    'page': currentPage,
    'itemsPerPage': 20
}) %}

{% for product in products %}
    ...
{% endfor %}

{# Simple pagination #}
{% if currentPage > 1 %}
    <a href="?page={{ currentPage - 1 }}">Previous</a>
{% endif %}
{% if products|length == 20 %}
    <a href="?page={{ currentPage + 1 }}">Next</a>
{% endif %}
```

:::tip Advanced Pagination
For pagination with total item count, use a [LiveComponent](/docs/front-office/live-components) with `DataAccessService` and the `'jsonld'` format to access Hydra metadata.
:::

### JavaScript Migration

#### From jQuery to Stimulus

**Before (jQuery)**:
```javascript
$(document).ready(function() {
    $('.add-to-cart').on('click', function(e) {
        e.preventDefault();
        var productId = $(this).data('product-id');
        $.post('/cart/add', { product_id: productId }, function(response) {
            $('.cart-count').text(response.count);
        });
    });
});
```

**After (Stimulus)**:
```javascript
// assets/controllers/cart_controller.js
import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['count'];

    async add(event) {
        const productId = event.params.productId;

        const response = await fetch('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId }),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        this.countTarget.textContent = data.count;
    }
}
```

```twig
<div data-controller="cart">
    <span data-cart-target="count">0</span>
    <button data-action="cart#add" data-cart-product-id-param="{{ product.id }}">
        Add to Cart
    </button>
</div>
```

## Module Migration

### Structure Changes

Module structure remains largely the same, with additions for Thelia 3 features:

```
MyModule/
├── Api/                    # NEW: API Resources
│   ├── Resource/
│   └── Addon/
├── LiveComponent/          # NEW: Symfony UX
├── templates/
│   ├── frontOffice/        # Changed: Now Twig
│   └── backOffice/         # Unchanged: Still Smarty
└── ... (other files unchanged)
```

### PHP Code Updates

#### Strict Types

Add to all files:
```php
<?php

declare(strict_types=1);

namespace MyModule\Service;
```

#### Type Hints

**Before**:
```php
public function getProduct($id)
{
    return ProductQuery::create()->findPk($id);
}
```

**After**:
```php
public function getProduct(int $id): ?Product
{
    return ProductQuery::create()->findPk($id);
}
```

#### Readonly Services

**Before**:
```php
class MyService
{
    private $repository;

    public function __construct(ProductRepository $repository)
    {
        $this->repository = $repository;
    }
}
```

**After**:
```php
final readonly class MyService
{
    public function __construct(
        private ProductRepository $repository,
    ) {}
}
```

### Front Templates Migration

If your module has front-office templates:

1. Create Twig versions in `templates/frontOffice/default/`
2. Convert Smarty syntax to Twig
3. Replace loops with DataAccessService calls
4. Replace hooks with LiveComponents if interactive

### API Resource Creation

If your module exposes data, create API resources:

```php
<?php

declare(strict_types=1);

namespace MyModule\Api\Resource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use Thelia\Api\Resource\PropelResourceInterface;
use Thelia\Api\Resource\PropelResourceTrait;

#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/front/my_items'),
        new Get(uriTemplate: '/front/my_items/{id}'),
    ],
)]
class MyItem implements PropelResourceInterface
{
    use PropelResourceTrait;

    // ... properties
}
```

## Database Migration

### Schema Changes

If you have custom tables, the schema format remains the same:

```xml
<table name="my_table" namespace="MyModule\Model">
    <column name="id" type="INTEGER" primaryKey="true" autoIncrement="true"/>
    <!-- Same Propel schema format -->
</table>
```

### Running Migrations

```bash
# Regenerate models
php Thelia module:generate:model MyModule

# Generate SQL
php Thelia module:generate:sql MyModule

# Apply changes
php Thelia module:install MyModule
```

## Testing Migration

### Update PHPUnit Configuration

**phpunit.xml.dist**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="vendor/autoload.php"
         colors="true">
    <testsuites>
        <testsuite name="Unit">
            <directory>tests/Unit</directory>
        </testsuite>
    </testsuites>
</phpunit>
```

### Update Test Code

```php
<?php

declare(strict_types=1);

namespace MyModule\Tests\Unit;

use PHPUnit\Framework\TestCase;

final class MyServiceTest extends TestCase
{
    public function testSomething(): void
    {
        // Test code with strict types
    }
}
```

## Common Issues

### Issue: Loops Don't Work in Front Templates

**Cause**: Loops are back-office only in Thelia 3.

**Solution**: Use DataAccessService in Twig templates:
```twig
{% set data = resources('/api/front/products') %}
```

### Issue: Hooks Don't Render in Front

**Cause**: Smarty hooks are back-office only.

**Solution**: Use LiveComponents or Twig includes:
```twig
{{ component('MyComponent', { ... }) }}
{# or #}
{% include 'partials/my-partial.html.twig' %}
```

### Issue: Form Not Working

**Cause**: Form handling syntax changed.

**Solution**: Use Symfony Form component with Twig:
```twig
{{ form_start(form) }}
    {{ form_row(form.field) }}
    <button type="submit">Submit</button>
{{ form_end(form) }}
```

### Issue: JavaScript Not Working

**Cause**: Asset build system changed.

**Solution**: Use Symfony UX with Stimulus:
```bash
npm install
npm run build
```

## Migration Strategy

### Recommended Approach

1. **Upgrade server** to PHP 8.3+
2. **Update Thelia** to version 3
3. **Test back-office** (should work immediately)
4. **Migrate front-office theme** progressively:
   - Start with layout templates
   - Convert page by page
   - Replace loops with DataAccess
   - Add LiveComponents for interactivity
5. **Update modules** as needed
6. **Test thoroughly** before production

### Parallel Development

During migration, you can:
- Keep Thelia 2 in production
- Develop Thelia 3 front-office on staging
- Test with real data
- Switch when ready

## Resources

- [Front-Office Development](/docs/front-office) - Complete Twig documentation
- [DataAccessService](/docs/front-office/data-access) - API data fetching
- [LiveComponents](/docs/front-office/live-components) - Interactive components
- [Module Development](/docs/modules) - Updated module guide
- [API Reference](/docs/api) - API Platform integration
