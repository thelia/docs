---
title: Twig Basics
sidebar_position: 2
---

# Twig Basics

Thelia 3 uses **Twig** as the template engine for front-office development.

:::tip Official Documentation
For complete Twig documentation, see [twig.symfony.com](https://twig.symfony.com/doc/).
:::

## Template Inheritance

### Base Layout

All pages extend a base layout:

```twig
{# base.html.twig #}
<!DOCTYPE html>
<html lang="{{ lang_code }}">
    <head>
        <title>{% block title %}{{ SEOnePageTitle() }}{% endblock %}</title>
        {% block stylesheets %}{{ encore_entry_link_tags('app') }}{% endblock %}
        {% block javascripts %}{{ encore_entry_script_tags('app') }}{% endblock %}
    </head>
    <body>
        {% block header %}{{ include('@components/Layout/Header.html.twig') }}{% endblock %}
        <main>{% block body %}{% endblock %}</main>
        {% block footer %}{{ include('@components/Layout/Footer.html.twig') }}{% endblock %}
    </body>
</html>
```

### Extending the Base Layout

```twig
{# product.html.twig #}
{% extends 'base.html.twig' %}

{% block title %}
    {{ product.i18ns.title }} - {{ parent() }}
{% endblock %}

{% block body %}
    <h1>{{ product.i18ns.title }}</h1>
    <p>{{ product.i18ns.description|raw }}</p>
{% endblock %}
```

## Data Access

Use the `resources()` function to fetch data from the API:

```twig
{# Get product by ID #}
{% set product = resources('/api/front/products/' ~ productId) %}

{# Get products in category #}
{% set products = resources('/api/front/products', {
    'productCategories.category.id': categoryId,
    'visible': true,
    'itemsPerPage': 20
}) %}

{% for product in products %}
    <div>{{ product.i18ns.title }}</div>
{% endfor %}
```

See [Data Access](./data-access) for complete documentation.

## Thelia-Specific Functions

### URL Attributes

Get URL parameters using `attr()`:

```twig
{% set productId = attr('product', 'id') %}
{% set categoryId = attr('category', 'id') %}
```

### SEO Functions

```twig
<title>{{ SEOnePageTitle() }}</title>
<meta name="description" content="{{ SEOnePageDesc() }}">
<link rel="canonical" href="{{ SEOnePageCanonical() }}">
{{ SEOneBreadcrumbJsonLd(breadcrumb)|raw }}
{{ SEOneHreflang()|raw }}
```

### Translation

```twig
{{ 'Add to cart'|trans }}
{{ 'Welcome, %name%!'|trans({'%name%': customer.firstname}) }}
{{ '%count% item|%count% items'|trans({'%count%': cart.itemCount}) }}
```

### Price Formatting

```twig
{{ product.price|format_money }}
```

## Components

### Twig Components

```twig
{{ component('Flexy:ProductCard', {product: product}) }}

{% component 'Flexy:Card' %}
    {% block header %}Card Title{% endblock %}
    {% block content %}Card content{% endblock %}
{% endcomponent %}
```

### LiveComponents

```twig
{{ component('Flexy:CategoryFilters', {
    initialCategoryId: categoryId,
    initialPage: 1
}) }}
```

See [LiveComponents](./live-components) for details.

## Asset Management

```twig
{# CSS #}
{{ encore_entry_link_tags('app') }}

{# JavaScript #}
{{ encore_entry_script_tags('app') }}

{# Single asset #}
{{ asset('build/images/logo.png') }}
```

## Stimulus Controllers

```twig
<div {{ stimulus_controller('drawer') }}>
    <button {{ stimulus_action('drawer', 'toggle') }}>Toggle</button>
    <div {{ stimulus_target('drawer', 'panel') }}>Content</div>
</div>
```

## Debugging

```twig
{{ dump(product) }}
{{ dump() }}  {# All variables #}
```

:::tip
`dump()` only works when `APP_DEBUG=1`.
:::

## Best Practices

### Use DataAccessService

```twig
{# Recommended #}
{% set products = resources('/api/front/products', {visible: true}) %}
```

### Keep Templates Clean

```twig
{# Good - logic in component #}
{{ component('Flexy:ProductPrice', {product: product}) }}

{# Avoid - complex logic in template #}
{% if product.promo and product.promoStartDate <= 'now'|date %}
    ...
{% endif %}
```

### Escape User Content

```twig
{{ userComment }}  {# Auto-escaped #}
{{ product.i18ns.description|raw }}  {# Trusted admin content only #}
```

## Next Steps

- [Data Access](./data-access) - Learn the `resources()` function
- [LiveComponents](./live-components) - Build reactive components
- [Flexy Theme](./flexy-theme/) - Explore the default theme
