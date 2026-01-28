---
title: Front-Office Development
sidebar_position: 1
---

# Front-Office Development

Thelia 3 introduces a modern front-office architecture built on **Twig** templates and **Symfony UX** components. This provides a reactive, component-based development experience while maintaining excellent performance.

## Technology Stack

| Technology | Purpose |
|------------|---------|
| **Twig** | Template engine |
| **Symfony UX LiveComponents** | Reactive UI components |
| **Stimulus** | JavaScript controllers |
| **Turbo** | SPA-like navigation |
| **Webpack Encore** | Asset management |
| **DataAccessService** | API data fetching |

## Architecture Overview

```
Front-Office Request Flow
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Request                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Symfony Controller                           │
│              (renders Twig template)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Twig Template                              │
│    ┌─────────────────────────────────────────────────────┐      │
│    │  resources('/api/front/products')                   │      │
│    │  → DataAccessService → API Platform → Propel        │      │
│    └─────────────────────────────────────────────────────┘      │
│    ┌─────────────────────────────────────────────────────┐      │
│    │  {{ component('Flexy:ProductCard', {...}) }}        │      │
│    │  → LiveComponent (reactive)                         │      │
│    └─────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     HTML Response                               │
│         (with Stimulus controllers + Turbo)                     │
└─────────────────────────────────────────────────────────────────┘
```

## Key Concepts

### Data Fetching with DataAccessService

Instead of using loops directly in templates, Thelia 3 uses `DataAccessService` to call API endpoints internally (without HTTP overhead):

```twig
{# Get current product ID from URL #}
{% set productId = attr('product', 'id') %}

{# Fetch product data via API #}
{% set product = resources('/api/front/products/' ~ productId) %}

{# Display product title #}
<h1>{{ product.i18ns.title }}</h1>
```

### Reactive Components with LiveComponents

LiveComponents provide reactive UI without writing JavaScript:

```twig
{# Render a reactive product component #}
{{ component('Flexy:Pages:Product', {product: product}) }}
```

The component automatically handles:
- Add to cart functionality
- Product variant selection
- Quantity updates
- Real-time price changes

### JavaScript Behavior with Stimulus

For custom JavaScript behavior, Stimulus controllers provide a clean, declarative approach:

```twig
<div data-controller="drawer">
    <button data-action="drawer#toggle">Open Menu</button>
    <div data-drawer-target="panel">...</div>
</div>
```

## Theme Structure

The default **Flexy** theme demonstrates the recommended structure:

```
templates/frontOffice/flexy/
├── base.html.twig              # Base layout
├── index.html.twig             # Homepage
├── category.html.twig          # Category page
├── product.html.twig           # Product page
├── checkout-*.html.twig        # Checkout pages
├── account*.html.twig          # Customer account
├── components/                 # Twig components
│   ├── Layout/                 # Header, Footer, etc.
│   ├── Molecules/              # Reusable UI elements
│   └── Organisms/              # Complex components
├── src/                        # LiveComponents templates
│   └── UiComponents/
└── assets/                     # JS, CSS, images
    └── controllers/            # Stimulus controllers
```

## Section Contents

| Section | Description |
|---------|-------------|
| [Twig Basics](./twig-basics) | Twig templating in Thelia |
| [Data Access](./data-access) | Fetching data with `resources()` |
| [Flexy Theme](./flexy-theme/) | Default theme structure |
| [LiveComponents](./live-components) | Creating reactive components |
| [Stimulus](./stimulus) | JavaScript controllers |
| [Turbo](./turbo) | SPA-like navigation |
| [Forms](./forms) | Front-office forms |

## Quick Example

Here's a minimal category page showing all concepts together:

```twig
{% extends 'base.html.twig' %}

{# Get category ID from URL parameters #}
{% set categoryId = attr('category', 'id') %}

{# Fetch category and products via API #}
{% set category = resources('/api/front/categories/' ~ categoryId) %}
{% set products = resources('/api/front/products', {
    'productCategories.category.id': categoryId,
    'visible': true,
    'itemsPerPage': 30
}) %}

{% block body %}
    <h1>{{ category.i18ns.title }}</h1>

    {# Use a LiveComponent for filtering #}
    {{ component('Flexy:CategoryFilters', {
        initialCategoryId: categoryId,
        initialPage: 1
    }) }}

    {# Or render products directly #}
    <div class="product-grid">
        {% for product in products %}
            {{ component('Flexy:ProductCard', {product: product}) }}
        {% endfor %}
    </div>
{% endblock %}

{% block stimulus_controller %}
    {{ stimulus_controller('drawer') }}
{% endblock %}
```

## Comparison with Back-Office

| Aspect | Front-Office | Back-Office |
|--------|--------------|-------------|
| Template Engine | **Twig** | Smarty |
| Data Fetching | **DataAccessService** | Loops |
| Components | **LiveComponents** | Smarty templates |
| Hooks | Minimal use | Extensively used |
| JavaScript | **Stimulus** | Custom scripts |

## Next Steps

1. **[Twig Basics](./twig-basics)** - Learn Twig templating fundamentals
2. **[Data Access](./data-access)** - Master the `resources()` function
3. **[Flexy Theme](./flexy-theme/)** - Explore the default theme
