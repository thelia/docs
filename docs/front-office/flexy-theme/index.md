---
title: Flexy Theme
sidebar_position: 1
---

# Flexy Theme

**Flexy** is the default front-office theme for Thelia 3. It's built as a Symfony Bundle and showcases modern development practices with Twig, LiveComponents, and Stimulus.

## Overview

Flexy provides:
- **Modern UI** with Tailwind CSS
- **40+ LiveComponents** for reactive interfaces
- **Responsive design** out of the box
- **Complete e-commerce flow** (catalog, cart, checkout, account)
- **SEO optimizations** built-in

## Theme Structure

```
vendor/thelia/flexy/
├── src/
│   ├── FlexyBundle.php
│   ├── UiComponents/          # LiveComponents PHP classes
│   │   ├── Pages/
│   │   │   └── Product/
│   │   ├── Checkout/
│   │   ├── CategoryFilters/
│   │   └── ...
│   ├── Service/
│   ├── DTO/
│   └── Twig/
│       └── DataAccessExtension.php
└── assets/
    └── controllers/           # Stimulus controllers

templates/frontOffice/flexy/
├── base.html.twig             # Base layout
├── index.html.twig            # Homepage
├── category.html.twig         # Category listing
├── product.html.twig          # Product detail
├── checkout-*.html.twig       # Checkout steps
├── account*.html.twig         # Customer account
├── login.html.twig            # Login page
├── components/                # Twig components
│   ├── Layout/
│   │   ├── Header/
│   │   └── Footer/
│   ├── Molecules/
│   │   ├── ProductCard/
│   │   ├── Breadcrumb/
│   │   └── ...
│   └── Organisms/
│       └── CategoryCard/
├── src/
│   └── UiComponents/          # LiveComponent templates
│       ├── Pages/Product/
│       ├── CategoryFilters/
│       └── ...
├── form/
│   └── flexy_form_theme.html.twig
└── assets/
    ├── css/
    └── js/
```

## Key Pages

### Homepage (`index.html.twig`)

```twig
{% extends 'base.html.twig' %}

{% block body %}
    {# Hero section #}
    {{ include('@components/Layout/Hero/Hero.html.twig') }}

    {# Featured categories #}
    <section class="container">
        {% set categories = resources('/api/front/categories', {
            'parent': 0,
            'visible': true,
            'itemsPerPage': 6
        }) %}

        {% for category in categories %}
            {{ include('@components/Organisms/CategoryCard/CategoryCard.html.twig', {
                category: category
            }) }}
        {% endfor %}
    </section>

    {# Featured products #}
    {{ component('Flexy:CrossSelling', {
        title: 'Featured Products'|trans
    }) }}
{% endblock %}
```

### Category Page (`category.html.twig`)

```twig
{% extends 'base.html.twig' %}

{% set categoryId = attr('category', 'id') %}
{% set category = resources('/api/front/categories/' ~ categoryId) %}
{% set page = app.request.get('page')|default(1) %}

{% block body %}
    {# Category hero #}
    {{ component('Flexy:CatHero', {
        title: category.i18ns.title,
        chapo: category.i18ns.chapo,
        breadcrumb: breadcrumb
    }) }}

    {# Product listing with filters #}
    {{ component('Flexy:CategoryFilters', {
        initialCategoryId: categoryId,
        initialPage: page
    }) }}
{% endblock %}

{% block stimulus_controller %}
    {{ stimulus_controller('drawer') }}
{% endblock %}
```

### Product Page (`product.html.twig`)

```twig
{% extends 'base.html.twig' %}

{% set productId = attr('product', 'id') %}
{% set product = resources('/api/front/products/' ~ productId) %}

{% block body %}
    <div class="ProductPage container">
        {# Breadcrumb #}
        {{ component('Molecules:Breadcrumb:Breadcrumb', {breadcrumb: breadcrumb}) }}

        {# Main product component #}
        {{ component('Flexy:Pages:Product', {product: product}) }}

        {# Description accordion #}
        {% if product.i18ns.description %}
            {{ include('@components/Molecules/Accordion/Accordion.html.twig', {
                title: 'Description'|trans,
                content: product.i18ns.description|raw,
                open: true
            }) }}
        {% endif %}

        {# Cross-selling #}
        {{ component('Flexy:CrossSelling', {
            categoryId: product.productCategories|first.category.id
        }) }}
    </div>

    {# Add to cart toast notification #}
    {{ component('Flexy:AddToCartToast') }}
{% endblock %}
```

## LiveComponents

Flexy includes 40+ LiveComponents organized by function:

### Page Components

| Component | Purpose |
|-----------|---------|
| `Flexy:Pages:Product` | Full product page with variant selection |
| `Flexy:CategoryFilters` | Product listing with filters |
| `Flexy:SearchBar` | Search with autocomplete |

### Checkout Components

| Component | Purpose |
|-----------|---------|
| `Flexy:Checkout:Cart` | Shopping cart |
| `Flexy:Checkout:Delivery` | Delivery method selection |
| `Flexy:Checkout:Payment` | Payment method selection |
| `Flexy:Checkout:Summary` | Order summary |
| `Flexy:CheckoutSteps` | Step indicator |

### Cart Components

| Component | Purpose |
|-----------|---------|
| `Flexy:CartItem` | Single cart item |
| `Flexy:HeaderButton` | Cart icon with count |
| `Flexy:AddToCartToast` | Add to cart notification |
| `Flexy:PromoCodeForm` | Promo code input |

### Account Components

| Component | Purpose |
|-----------|---------|
| `Flexy:AccountHero` | Account header |
| `Flexy:AccountCustomerUpdate` | Profile edit form |
| `Flexy:AddressCard` | Address display/edit |
| `Flexy:AddressesForm` | Address form |
| `Flexy:OrderCard` | Order history item |

### UI Components

| Component | Purpose |
|-----------|---------|
| `Flexy:ProductCard` | Product card in listings |
| `Flexy:CrossSelling` | Related products |
| `Flexy:LangSelect` | Language switcher |
| `Flexy:HeaderProfile` | User menu |
| `Flexy:Blocks` | CMS blocks |

### Using Components

```twig
{# With required props #}
{{ component('Flexy:ProductCard', {product: product}) }}

{# With optional props #}
{{ component('Flexy:CrossSelling', {
    categoryId: categoryId,
    title: 'Related Products'|trans,
    limit: 8
}) }}

{# In checkout flow #}
{{ component('Flexy:Checkout:Delivery', {
    addresses: customerAddresses
}) }}
```

## Twig Components

Non-reactive components use standard Twig includes:

```twig
{# Layout components #}
{{ include('@components/Layout/Header/Header.html.twig') }}
{{ include('@components/Layout/Footer/Footer.html.twig') }}

{# UI molecules #}
{{ include('@components/Molecules/ProductCard/ProductCard.html.twig', {
    product: product
}) }}

{{ include('@components/Molecules/Accordion/Accordion.html.twig', {
    title: 'Details',
    content: contentHtml,
    open: true
}) }}

{{ include('@components/Molecules/Breadcrumb/Breadcrumb.html.twig', {
    breadcrumb: breadcrumb
}) }}
```

## Styling

### Tailwind CSS

Flexy uses Tailwind CSS for styling:

```twig
<div class="container mx-auto px-4">
    <h1 class="text-3xl font-bold text-gray-900 mb-4">
        {{ product.i18ns.title }}
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {% for product in products %}
            <div class="bg-white rounded-lg shadow p-4">
                {{ component('Flexy:ProductCard', {product: product}) }}
            </div>
        {% endfor %}
    </div>
</div>
```

### Custom CSS

Add custom styles in `assets/css/`:

```css
/* assets/css/custom.css */
.ProductPage {
    @apply container mx-auto py-8;
}

.ProductPage-grid {
    @apply grid grid-cols-1 lg:grid-cols-2 gap-8;
}
```

## Assets

### Webpack Encore

Flexy uses Webpack Encore for asset management:

```javascript
// webpack.config.js
const Encore = require('@symfony/webpack-encore');

Encore
    .setOutputPath('public/build/')
    .setPublicPath('/build')
    .addEntry('app', './templates/frontOffice/flexy/assets/js/app.js')
    .addStyleEntry('app-css', './templates/frontOffice/flexy/assets/css/app.css')
    .enableStimulusBridge('./assets/controllers.json')
    .enablePostCssLoader()
;
```

### Building Assets

```bash
# Development
ddev ssh
cd templates/frontOffice/flexy
npm install
npm run dev

# Production
npm run build

# Watch mode
npm run watch
```

## Configuration

### Theme Selection

In Thelia configuration or during installation:

```bash
php Thelia thelia:install --frontoffice_theme=flexy
```

### Environment Variables

Flexy respects Thelia's environment configuration:

```env
# .env.local
APP_ENV=dev
APP_DEBUG=1
```

## Form Theme

Flexy includes a custom form theme:

```twig
{# Apply theme globally in base.html.twig #}
{% form_theme form '@Flexy/form/flexy_form_theme.html.twig' %}

{# Or per-form #}
{% form_theme myForm '@Flexy/form/flexy_form_theme.html.twig' %}
{{ form_widget(myForm) }}
```

## SEO Features

### Built-in SEO Functions

```twig
{# Page title #}
<title>{{ SEOnePageTitle() }}</title>

{# Meta description #}
<meta name="description" content="{{ SEOnePageDesc() }}">

{# Canonical URL #}
<link rel="canonical" href="{{ SEOnePageCanonical() }}">

{# Structured data #}
{{ SEOneBreadcrumbJsonLd(breadcrumb)|raw }}

{# Hreflang for multi-language #}
{{ SEOneHreflang()|raw }}
```

## Next Steps

- [Customization](./customization) - Customize Flexy for your needs
- [Creating a Theme](./creating-theme) - Build a theme from scratch
- [LiveComponents](/docs/front-office/live-components) - Component development
