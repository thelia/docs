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
| **Symfony UX TwigComponent** | Static reusable components |
| **Stimulus** | JavaScript controllers |
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
│              (with Stimulus controllers)                        │
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

The front-office theme is a **Symfony bundle** (`FlexyBundle`): its services are autoconfigured, and its TwigComponents/LiveComponents, Stimulus controllers and form theme all live inside the bundle — there is no XML wiring to maintain.

The default **Flexy** theme demonstrates the recommended structure:

```
templates/frontOffice/flexy/
├── base.html.twig              # Base layout
├── index.html.twig             # Homepage page template
├── category.html.twig          # Category page template
├── product.html.twig           # Product page template
├── checkout-*.html.twig        # Checkout page templates
├── account*.html.twig          # Customer account page templates
├── components/                 # Anonymous Twig components
│   ├── Atoms/                  # Smallest UI primitives (Icon, Font, ...)
│   ├── Molecules/              # Reusable UI elements
│   ├── Organisms/              # Complex components
│   ├── Layout/                 # Header, Footer, Hero, ...
│   └── Page/                   # Page-level building blocks
├── src/                        # PHP code (autoconfigured by FlexyBundle)
│   ├── Controller/             # Front-office controllers
│   ├── DTO/                    # Data Transfer Objects
│   ├── Event/                  # Front-office events
│   ├── EventListener/          # Event listeners (ViewListener)
│   ├── Form/                   # Symfony form types
│   ├── Service/                # Services (DeliveryService, FormService, ...)
│   ├── Twig/                   # Twig extensions (DataAccessExtension)
│   ├── UiComponents/           # Twig/Live components (.php + colocated .html.twig)
│   └── FlexyBundle.php         # Bundle class (loadExtension / prependExtension)
├── form/                       # Form theme (flexy_form_theme.html.twig + fields/)
├── assets/                     # JS, CSS, images
│   └── controllers/            # Stimulus controllers
├── config/                     # Bundle config (config/packages/*.yaml)
├── template.xml                # Theme manifest
└── webpack.config.js           # Webpack Encore build config
```

:::note Components: anonymous vs. PHP-backed
`components/` holds **anonymous** Twig components (Atoms/Molecules/Organisms/Layout/Page) — pure `.html.twig` files with no PHP class. `src/UiComponents/` holds **PHP-backed** TwigComponents and LiveComponents: each one is a PHP class with a colocated `.html.twig` template in the same folder.
:::

## Section Contents

| Section | Description |
|---------|-------------|
| [Twig Basics](./twig-basics.md) | Twig templating in Thelia |
| [Data Access](./data-access.md) | Fetching data with `resources()` |
| [Flexy Theme](./flexy-theme/index.md) | Default theme structure |
| [LiveComponents](./live-components.md) | Creating reactive components |
| [Stimulus](./stimulus.md) | JavaScript controllers |
| [Forms](./forms.md) | Front-office forms |

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

1. **[Twig Basics](./twig-basics.md)** - Learn Twig templating fundamentals
2. **[Data Access](./data-access.md)** - Master the `resources()` function
3. **[Flexy Theme](./flexy-theme/index.md)** - Explore the default theme
