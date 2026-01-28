---
title: Twig Basics
sidebar_position: 2
---

# Twig Basics

Thelia 3 uses **Twig** as the template engine for front-office development. Twig is Symfony's default templating language, providing a clean, secure, and fast way to build HTML pages.

:::warning Deprecated: Twig Loops
The `loop()` and `loopCount()` Twig functions are **deprecated** in Thelia 3. They were provided for backward compatibility but should not be used in new code.

**Use `resources()` instead:**

```twig
{# Deprecated - do not use #}
{% set products = loop('products', 'product', {category: categoryId}) %}

{# Recommended - use API resources #}
{% set products = resources('/api/front/products', {
    'productCategories.category.id': categoryId,
    'visible': true
}) %}
```

See [Data Access](./data-access) for complete documentation on using the API.
:::

## Template Inheritance

### Base Layout

All pages extend a base layout that defines the HTML structure:

```twig
{# base.html.twig #}
<!DOCTYPE html>
<html lang="{{ lang_code }}">
    <head>
        <meta charset="UTF-8">
        <title>{% block title %}{{ SEOnePageTitle() }}{% endblock %}</title>

        {% block stylesheets %}
            {{ encore_entry_link_tags('app') }}
        {% endblock %}

        {% block javascripts %}
            {{ encore_entry_script_tags('app') }}
        {% endblock %}
    </head>

    <body>
        {% block header %}
            {{ include('@components/Layout/Header/Header.html.twig') }}
        {% endblock %}

        <main {% block stimulus_controller %}{% endblock %}>
            {% block body %}{% endblock %}
        </main>

        {% block footer %}
            {{ include('@components/Layout/Footer/Footer.html.twig') }}
        {% endblock %}
    </body>
</html>
```

### Extending the Base Layout

Child templates extend the base and override blocks:

```twig
{# product.html.twig #}
{% extends 'base.html.twig' %}

{% block title %}
    {{ product.i18ns.title }} - {{ parent() }}
{% endblock %}

{% block stylesheets %}
    {{ parent() }}
    {{ encore_entry_link_tags('product-css') }}
{% endblock %}

{% block body %}
    <h1>{{ product.i18ns.title }}</h1>
    <p>{{ product.i18ns.description|raw }}</p>
{% endblock %}
```

## Variables and Expressions

### Basic Output

```twig
{# Simple variable #}
{{ product.i18ns.title }}

{# With default value #}
{{ product.i18ns.chapo|default('No description') }}

{# Raw HTML (be careful with user content) #}
{{ product.i18ns.description|raw }}

{# Escaped by default #}
{{ userInput }}  {# Automatically HTML-escaped #}
```

### Accessing Nested Data

```twig
{# Object/array access #}
{{ product.i18ns.title }}
{{ product['i18ns']['title'] }}

{# First item in collection #}
{{ products|first }}

{# Filter collection #}
{% set defaultCategory = product.productCategories|filter(c => c.defaultCategory)|first %}
```

## Control Structures

### Conditionals

```twig
{% if product.visible %}
    <div class="product">{{ product.i18ns.title }}</div>
{% elseif product.virtual %}
    <div class="virtual-product">{{ product.i18ns.title }}</div>
{% else %}
    <div class="unavailable">Product unavailable</div>
{% endif %}

{# Ternary operator #}
{{ product.promo ? 'On Sale!' : 'Regular Price' }}

{# Null coalescing #}
{{ product.i18ns.chapo ?? 'Default description' }}
```

### Loops

```twig
{# Basic loop #}
{% for product in products %}
    <div>{{ product.i18ns.title }}</div>
{% endfor %}

{# Loop with index #}
{% for product in products %}
    <div>{{ loop.index }}. {{ product.i18ns.title }}</div>
{% endfor %}

{# Loop with else (empty case) #}
{% for product in products %}
    <div>{{ product.i18ns.title }}</div>
{% else %}
    <p>No products found.</p>
{% endfor %}

{# Loop variables #}
{% for item in items %}
    {{ loop.index }}      {# Current iteration (1-indexed) #}
    {{ loop.index0 }}     {# Current iteration (0-indexed) #}
    {{ loop.first }}      {# True if first iteration #}
    {{ loop.last }}       {# True if last iteration #}
    {{ loop.length }}     {# Total items #}
{% endfor %}
```

## Filters

### Common Filters

```twig
{# Text manipulation #}
{{ title|upper }}
{{ title|lower }}
{{ title|capitalize }}
{{ title|title }}
{{ longText|truncate(100) }}
{{ text|trim }}

{# HTML #}
{{ content|raw }}           {# Output unescaped HTML #}
{{ content|striptags }}     {# Remove HTML tags #}
{{ content|nl2br }}         {# Convert newlines to <br> #}

{# Numbers #}
{{ price|number_format(2, ',', ' ') }}
{{ 1234.56|format_currency('EUR') }}

{# Dates #}
{{ date|date('d/m/Y') }}
{{ date|date('F j, Y') }}

{# Arrays #}
{{ items|length }}
{{ items|first }}
{{ items|last }}
{{ items|join(', ') }}
{{ items|sort }}
{{ items|reverse }}
{{ items|filter(i => i.active) }}
{{ items|map(i => i.name) }}

{# JSON #}
{{ data|json_encode }}
```

### Thelia-Specific Filters

```twig
{# Translation #}
{{ 'Add to cart'|trans }}
{{ 'Hello %name%'|trans({'%name%': customer.firstname}) }}

{# Price formatting #}
{{ product.price|format_money }}

{# URL generation #}
{{ path('product_show', {id: product.id}) }}
{{ url('homepage') }}
```

## Including Templates

### Simple Include

```twig
{# Include a template #}
{{ include('components/ProductCard.html.twig') }}

{# Include with variables #}
{{ include('components/ProductCard.html.twig', {product: myProduct}) }}

{# Include with only specific variables (isolated scope) #}
{{ include('components/ProductCard.html.twig', {product: myProduct}, with_context=false) }}
```

### Include with Merge

```twig
{# Merge additional data #}
{% include '@components/CategoryCard.html.twig' with category|merge({classes: "h-full"}) %}
```

## Macros

Macros are reusable template functions:

```twig
{# Define macro #}
{% macro priceDisplay(price, currency='EUR') %}
    <span class="price">
        {{ price|number_format(2, ',', ' ') }} {{ currency }}
    </span>
{% endmacro %}

{# Import and use #}
{% import _self as helpers %}
{{ helpers.priceDisplay(product.price) }}

{# Or import from external file #}
{% import 'macros/price.html.twig' as price %}
{{ price.display(99.99) }}
```

## Components

Thelia 3 leverages Symfony UX components:

### Twig Components

```twig
{# Render a component #}
{{ component('Flexy:ProductCard', {product: product}) }}

{# With named slots #}
{% component 'Flexy:Card' %}
    {% block header %}Card Title{% endblock %}
    {% block content %}Card content here{% endblock %}
{% endcomponent %}
```

### LiveComponents

LiveComponents are interactive server-rendered components:

```twig
{# LiveComponent with props #}
{{ component('Flexy:CategoryFilters', {
    initialCategoryId: categoryId,
    initialPage: 1
}) }}
```

See [LiveComponents](./live-components) for details.

## Asset Management

### Webpack Encore

```twig
{# CSS #}
{{ encore_entry_link_tags('app') }}
{{ encore_entry_link_tags('product-css') }}

{# JavaScript #}
{{ encore_entry_script_tags('app') }}

{# Single asset #}
{{ asset('build/images/logo.png') }}
```

### Stimulus Controllers

```twig
{# Add Stimulus controller to element #}
<div {{ stimulus_controller('drawer') }}>
    <button {{ stimulus_action('drawer', 'toggle') }}>Toggle</button>
    <div {{ stimulus_target('drawer', 'panel') }}>Content</div>
</div>

{# In block #}
{% block stimulus_controller %}
    {{ stimulus_controller('product-gallery') }}
{% endblock %}
```

## Translation

```twig
{# Simple translation #}
{{ 'Add to cart'|trans }}

{# With parameters #}
{{ 'Welcome, %name%!'|trans({'%name%': customer.firstname}) }}

{# Pluralization #}
{{ '%count% item|%count% items'|trans({'%count%': cart.itemCount}) }}

{# From specific domain #}
{{ 'error.not_found'|trans({}, 'errors') }}
```

## SEO Functions

Thelia provides SEO helper functions:

```twig
{# Page title #}
<title>{{ SEOnePageTitle() }}</title>

{# Meta description #}
<meta name="description" content="{{ SEOnePageDesc() }}">

{# Canonical URL #}
<link rel="canonical" href="{{ SEOnePageCanonical() }}">

{# Breadcrumb JSON-LD #}
{{ SEOneBreadcrumbJsonLd(breadcrumb)|raw }}

{# Hreflang tags #}
{{ SEOneHreflang()|raw }}
```

## Debugging

```twig
{# Dump variable #}
{{ dump(product) }}

{# Dump all variables #}
{{ dump() }}

{# Debug in comments #}
{# DEBUG: {{ product.id }} #}
```

:::tip Development Mode
`dump()` only works when `APP_DEBUG=1`. In production, it outputs nothing.
:::

## Best Practices

### 1. Use Meaningful Block Names

```twig
{# Good #}
{% block product_gallery %}{% endblock %}
{% block product_details %}{% endblock %}

{# Avoid #}
{% block content1 %}{% endblock %}
{% block section %}{% endblock %}
```

### 2. Keep Templates Clean

```twig
{# Good - logic in component/controller #}
{{ component('Flexy:ProductPrice', {product: product}) }}

{# Avoid - complex logic in template #}
{% if product.promo and product.promoStartDate <= 'now'|date and product.promoEndDate >= 'now'|date %}
    {% set price = product.promoPrice %}
{% else %}
    {% set price = product.price %}
{% endif %}
```

### 3. Use DataAccessService

```twig
{# Good - use resources() #}
{% set products = resources('/api/front/products', {visible: true}) %}

{# Avoid - direct database queries #}
```

### 4. Escape User Content

```twig
{# Good - automatic escaping #}
{{ userComment }}

{# Only use raw for trusted content #}
{{ product.i18ns.description|raw }}  {# Admin-entered content #}
```

## Next Steps

- [Data Access](./data-access) - Learn the `resources()` function
- [LiveComponents](./live-components) - Build reactive components
- [Flexy Theme](./flexy-theme/) - Explore the default theme
