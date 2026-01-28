---
title: Dual Templating System
sidebar_position: 2
---

# Dual Templating System

Thelia 3 uses two templating engines: **Twig** for the front-office and **Smarty** for the back-office. This architectural decision optimizes each interface for its specific requirements.

## Overview

| Aspect | Front-Office (Twig) | Back-Office (Smarty) |
|--------|---------------------|----------------------|
| **Engine** | Twig 3.x | Smarty 4.x |
| **Data Access** | DataAccessService | Loops (Propel) |
| **Components** | Symfony LiveComponents | Template includes |
| **JavaScript** | Stimulus + Turbo | jQuery |
| **Theme** | Flexy (Symfony Bundle) | Default (Thelia templates) |

## Front-Office: Twig + Symfony UX

The front-office provides a modern, reactive user experience using Twig templates enhanced with Symfony UX components.

### Template Location

```
templates/frontOffice/flexy/
├── base.html.twig           # Base layout
├── home.html.twig           # Homepage
├── product.html.twig        # Product page
├── category.html.twig       # Category page
├── checkout.html.twig       # Checkout process
└── src/
    └── UiComponents/        # LiveComponents
```

### Data Retrieval

Use `DataAccessService` via the `resources()` Twig function:

```twig
{# Fetch a single product #}
{% set product = resources('/api/front/products/' ~ productId) %}

{# Fetch a collection with filters #}
{% set products = resources('/api/front/products', {
    'productCategories.category.id': categoryId,
    'visible': true,
    'order[position]': 'asc',
    'itemsPerPage': 20
}) %}

{# Display products #}
{% for product in products %}
    <h2>{{ product.i18ns.title }}</h2>
    <p>{{ product.price }} EUR</p>
{% endfor %}
```

### Route Attributes

Access route parameters with `attr()`:

```twig
{# On /product/42 page #}
{% set productId = attr('product', 'id') %}

{# On /category/5 page #}
{% set categoryId = attr('category', 'id') %}
```

### LiveComponents

Reactive components without custom JavaScript:

```twig
{# Render a product page component #}
{{ component('Flexy:Pages:Product', { product: product }) }}

{# Render cart widget #}
{{ component('Flexy:CartWidget') }}

{# Render category filters #}
{{ component('Flexy:CategoryFilters', { categoryId: categoryId }) }}
```

### Stimulus Controllers

For custom JavaScript behavior:

```twig
<div data-controller="product-gallery">
    <img data-product-gallery-target="main" src="{{ mainImage }}">

    {% for image in images %}
        <img
            data-action="click->product-gallery#select"
            data-product-gallery-url-param="{{ image.url }}"
            src="{{ image.thumbnail }}"
        >
    {% endfor %}
</div>
```

### Turbo Navigation

SPA-like navigation with Turbo Drive:

```twig
{# Automatic: all links use Turbo by default #}
<a href="{{ path('category', { id: category.id }) }}">
    {{ category.title }}
</a>

{# Disable Turbo for specific links #}
<a href="/external-site" data-turbo="false">External</a>

{# Turbo Frame for partial updates #}
<turbo-frame id="product-list">
    {% for product in products %}
        {{ include('partials/product-card.html.twig') }}
    {% endfor %}
</turbo-frame>
```

## Back-Office: Smarty

The back-office uses Smarty templates with Thelia's loop system for data retrieval.

### Template Location

```
templates/backOffice/default/
├── layout.tpl               # Base layout
├── home.tpl                 # Dashboard
├── product-edit.tpl         # Product editing
├── order-edit.tpl           # Order management
└── includes/                # Partial templates
```

### Data Retrieval with Loops

```smarty
{* List products in a category *}
{loop name="products" type="product" category=$category_id visible=1}
    <tr>
        <td>{$ID}</td>
        <td>{$TITLE}</td>
        <td>{$PRICE} {$CURRENCY}</td>
        <td>
            <a href="{url path="/admin/product/update/$ID"}">Edit</a>
        </td>
    </tr>
{/loop}
```

### Hooks

Extend back-office templates without modifying core files:

```smarty
{* In a template *}
{hook name="product.additional-info"}

{* Hook content rendered from modules *}
```

### Form Handling

```smarty
{form name="product_modification"}
    <input type="text" name="{field field='title'}" value="{$form.title.value}">
    {if $form.title.hasError}
        <span class="error">{$form.title.error}</span>
    {/if}

    <button type="submit">Save</button>
{/form}
```

## When to Use Which

### Use Twig (Front-Office) When:

- Building customer-facing pages
- Creating reactive UI components
- Integrating with JavaScript frameworks
- Building a custom storefront theme
- Need modern component architecture

### Use Smarty (Back-Office) When:

- Extending admin functionality via modules
- Adding admin hooks
- Creating admin pages in modules
- Maintaining compatibility with existing modules

## Comparison Examples

### Displaying a Product List

**Twig (Front-Office):**

```twig
{% set products = resources('/api/front/products', {
    'productCategories.category.id': categoryId,
    'visible': true
}) %}

<div class="products">
    {% for product in products %}
        <article class="product-card">
            <h2>{{ product.i18ns.title }}</h2>
            <p class="price">{{ product.price|number_format(2) }} EUR</p>
            <a href="{{ path('product', { id: product.id }) }}">View</a>
        </article>
    {% endfor %}
</div>
```

**Smarty (Back-Office):**

```smarty
{loop name="products" type="product" category=$category_id visible=1}
    <tr>
        <td>{$TITLE}</td>
        <td>{$PRICE|number_format:2} {$CURRENCY}</td>
        <td><a href="{url path="/admin/product/update/$ID"}">Edit</a></td>
    </tr>
{/loop}
```

### Conditional Display

**Twig:**

```twig
{% if customer is not null %}
    <p>Welcome, {{ customer.firstname }}!</p>
{% else %}
    <a href="{{ path('login') }}">Sign In</a>
{% endif %}
```

**Smarty:**

```smarty
{if $customer}
    <p>Welcome, {$customer.firstname}!</p>
{else}
    <a href="{url path="/login"}">Sign In</a>
{/if}
```

## Next Steps

- [Front-Office Development](/docs/front-office) - Complete Twig guide
- [Back-Office Development](/docs/back-office) - Smarty and loops reference
- [LiveComponents](/docs/front-office/live-components) - Building reactive UIs
