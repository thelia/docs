---
title: Front-Office Development
sidebar_position: 1
---

# Front-Office Development

Thelia 3 builds its front office on Twig templates and Symfony UX components. Components are reactive, and most of the UI logic stays on the server.

## Technology stack

| Technology | Purpose |
|------------|---------|
| `Twig` | Template engine |
| Symfony UX LiveComponents | Reactive UI components |
| Symfony UX TwigComponent | Static reusable components |
| Stimulus | JavaScript controllers |
| AssetMapper + Tailwind CSS | Asset management, no bundler and no Node build |
| `DataAccessService` | API data fetching |

The theme also carries the front-office routes, including the catch-all that renders category,
product, content and folder pages. No Thelia module is required to serve a page. See
[Serving the pages](./flexy-theme/creating-theme.md#serving-the-pages).

## Architecture overview

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
│    │  <twig:Organisms:ProductCard:Base :product=... />   │      │
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

## Key concepts

### Data fetching with DataAccessService

Instead of running loops directly in templates, Thelia 3 uses `DataAccessService` to call API endpoints internally, without HTTP overhead:

```twig
{# Get current product ID from URL #}
{% set productId = attr('product', 'id') %}

{# Fetch product data via API #}
{% set product = resources('/api/front/products/' ~ productId) %}

{# Display product title #}
<h1>{{ product.i18ns.title }}</h1>
```

### Reactive components with LiveComponents

LiveComponents give you reactive UI without writing JavaScript:

```twig
{# Render a reactive product component #}
<twig:Layouts:ProductDetails:Base :product="product" />
```

The component automatically handles:
- Add to cart functionality
- Product variant selection
- Quantity updates
- Real-time price changes

### JavaScript behavior with Stimulus

For custom JavaScript behavior, Stimulus controllers use a declarative approach:

```twig
<div data-controller="drawer">
    <button data-action="drawer#toggle">Open Menu</button>
    <div data-drawer-target="panel">...</div>
</div>
```

## Theme structure

The front-office theme is a Symfony bundle (`FlexyBundle`). Its services are autoconfigured, and its TwigComponents/LiveComponents, Stimulus controllers and form theme all live inside the bundle, so there is no XML wiring to maintain.

The default Flexy theme shows the recommended structure:

```
templates/frontOffice/flexy/
├── base.html.twig              # Base layout
├── index.html.twig             # Homepage page template
├── category.html.twig          # Category page template
├── product.html.twig           # Product page template
├── checkout-*.html.twig        # Checkout page templates
├── account*.html.twig          # Customer account page templates
├── components/                 # Every component, namespace @Flexy
│   ├── Atoms/                  # Smallest UI primitives (Icon, Font, ...)
│   ├── Fields/                 # Form field markup, rendered by the form theme
│   ├── Forms/                  # Form components (LiveComponents)
│   ├── Layouts/                # Header, Footer, listings, ...
│   ├── Molecules/              # Reusable UI elements
│   ├── Organisms/              # Complex components
│   └── Toolkit/                # Component showcase pages
├── src/                        # PHP code (autoconfigured by FlexyBundle)
│   ├── Controller/             # Front-office controllers
│   ├── DTO/                    # Data Transfer Objects
│   ├── Event/                  # Front-office events
│   ├── EventListener/          # Event listeners (ViewListener)
│   ├── Form/                   # Symfony form types
│   ├── Service/                # Services (DeliveryService, FormService, ...)
│   ├── Twig/                   # Twig extensions (DataAccessExtension)
│   └── FlexyBundle.php         # Bundle class (loadExtension / prependExtension)
├── form/                       # Form theme (flexy_form_theme.html.twig), namespace @FlexyForm
├── assets/                     # styles, icons, images
│   └── controllers/            # Stimulus controllers
├── config/
│   ├── views.yaml              # root templates that are not pages of their own
│   └── packages/               # framework config the theme ships
├── template.xml                # Theme manifest
└── importmap.php               # AssetMapper entrypoints and JavaScript dependencies
```

:::note Components: anonymous vs. PHP-backed
Both kinds live in `components/`, side by side. An anonymous component is a `.html.twig` file on its own; a PHP-backed one adds a class next to its template, in the same folder. `FlexyBundle\Components\` maps to that directory, and a component's name is its path under it: `components/Organisms/ProductCard/Base.php` is `Organisms:ProductCard:Base`.
:::

## Section contents

| Section | Description |
|---------|-------------|
| [Twig Basics](./twig-basics.md) | Twig templating in Thelia |
| [Data Access](./data-access.md) | Fetching data with `resources()` |
| [Flexy Theme](./flexy-theme/index.md) | Default theme structure |
| [LiveComponents](./live-components.md) | Creating reactive components |
| [Stimulus](./stimulus.md) | JavaScript controllers |
| [Theme Hooks](./theme-hooks.md) | Theme extension points for modules |
| [Forms](./forms.md) | Front-office forms |

## Quick example

A minimal category page that uses all of these concepts together:

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
    <twig:Layouts:ProductListing:Base :categoryId="categoryId" :page="1" />

    {# Or render products directly #}
    <div class="product-grid">
        {% for product in products %}
            <twig:Organisms:ProductCard:Base :product="product" />
        {% endfor %}
    </div>
{% endblock %}

{% block stimulus_controller %}
    {{ stimulus_controller('drawer') }}
{% endblock %}
```

## Comparison with the back office

| Aspect | Front office | Back office |
|--------|--------------|-------------|
| Template engine | `Twig` | `Twig` (default-twig bundle) |
| Data fetching | `DataAccessService` | Propel `Repository` classes |
| Components | LiveComponents | Twig and Live components |
| Hooks | Minimal use | Extensively used |
| JavaScript | Stimulus | Stimulus |

## Next steps

1. [Twig Basics](./twig-basics.md) for the Twig templating fundamentals
2. [Data Access](./data-access.md) for the `resources()` function
3. [Flexy Theme](./flexy-theme/index.md) for the default theme
