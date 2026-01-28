---
title: Creating a Theme
sidebar_position: 3
---

# Creating a Theme from Scratch

This guide walks through creating a new front-office theme for Thelia 3, either from scratch or based on Flexy.

## Theme Types

| Type | Description | Best For |
|------|-------------|----------|
| **Child Theme** | Extends Flexy with overrides | Minor to moderate changes |
| **Custom Theme** | New theme from scratch | Complete redesigns |
| **Hybrid** | New theme using Flexy components | Custom design + Flexy functionality |

## Directory Structure

### Minimal Theme Structure

```
templates/frontOffice/my-theme/
├── template.xml               # Theme configuration
├── base.html.twig             # Base layout
├── index.html.twig            # Homepage
├── category.html.twig         # Category page
├── product.html.twig          # Product page
├── checkout-cart.html.twig    # Cart
├── checkout-delivery.html.twig
├── checkout-payment.html.twig
├── checkout-confirm.html.twig
├── login.html.twig
├── account.html.twig
├── 404.html.twig
├── error.html.twig
└── assets/
    ├── css/
    │   └── app.css
    └── js/
        └── app.js
```

### Full Theme Structure

```
templates/frontOffice/my-theme/
├── template.xml
├── base.html.twig
├── index.html.twig
├── category.html.twig
├── product.html.twig
├── content.html.twig
├── folder.html.twig
├── search.html.twig
├── login.html.twig
├── customer-register.html.twig
├── account.html.twig
├── account-orders.html.twig
├── account-order.html.twig
├── account-addresses.html.twig
├── address.html.twig
├── address-update.html.twig
├── checkout-cart.html.twig
├── checkout-delivery.html.twig
├── checkout-payment.html.twig
├── checkout-confirm.html.twig
├── checkout-gateway.html.twig
├── checkout-failed.html.twig
├── contact.html.twig
├── contact-success.html.twig
├── password-forgotten.html.twig
├── reset_password.html.twig
├── 404.html.twig
├── error.html.twig
├── maintenance.html.twig
├── components/
│   ├── Layout/
│   │   ├── Header/
│   │   │   └── Header.html.twig
│   │   └── Footer/
│   │       └── Footer.html.twig
│   ├── Molecules/
│   │   ├── ProductCard/
│   │   ├── Breadcrumb/
│   │   └── Pagination/
│   └── Organisms/
│       └── ...
├── form/
│   └── form_theme.html.twig
├── src/
│   └── UiComponents/          # LiveComponents templates
└── assets/
    ├── css/
    ├── js/
    └── images/
```

## Theme Configuration

### template.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<template>
    <name>my-theme</name>
    <version>1.0.0</version>
    <author>Your Company</author>
    <description>Custom theme for My Shop</description>

    <!-- Optional: extend Flexy -->
    <!-- <parent>flexy</parent> -->

    <required_version>3.0.0</required_version>
</template>
```

## Creating the Base Layout

### base.html.twig

```twig
<!DOCTYPE html>
<html lang="{{ lang_code }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{% block title %}{{ SEOnePageTitle() }}{% endblock %}</title>
    <meta name="description" content="{% block meta_desc %}{{ SEOnePageDesc() }}{% endblock %}">

    <link rel="canonical" href="{{ SEOnePageCanonical() }}">
    {{ SEOneHreflang()|raw }}

    {% block stylesheets %}
        {{ encore_entry_link_tags('app') }}
    {% endblock %}

    {% block head_js %}
        {{ encore_entry_script_tags('app') }}
    {% endblock %}
</head>

<body class="{% block body_class %}{% endblock %}">
    {% block header %}
        {{ include('components/Layout/Header/Header.html.twig') }}
    {% endblock %}

    <main {% block main_attributes %}{% endblock %}>
        {% block body %}{% endblock %}
    </main>

    {% block footer %}
        {{ include('components/Layout/Footer/Footer.html.twig') }}
    {% endblock %}

    {% block modals %}{% endblock %}

    {% block body_js %}{% endblock %}
</body>
</html>
```

## Essential Pages

### Homepage (index.html.twig)

```twig
{% extends 'base.html.twig' %}

{% block body %}
    {# Hero section #}
    <section class="hero">
        <h1>Welcome to My Shop</h1>
    </section>

    {# Featured categories #}
    <section class="featured-categories container">
        <h2>Shop by Category</h2>

        {% set categories = resources('/api/front/categories', {
            'parent': 0,
            'visible': true,
            'itemsPerPage': 6
        }) %}

        <div class="category-grid">
            {% for category in categories %}
                <a href="{{ path('category', {id: category.id}) }}" class="category-card">
                    {% if category.images|length %}
                        <img src="{{ category.images[0].url }}"
                             alt="{{ category.i18ns.title }}">
                    {% endif %}
                    <h3>{{ category.i18ns.title }}</h3>
                </a>
            {% endfor %}
        </div>
    </section>

    {# Featured products #}
    <section class="featured-products container">
        <h2>Featured Products</h2>

        {% set products = resources('/api/front/products', {
            'visible': true,
            'itemsPerPage': 8
        }) %}

        <div class="product-grid">
            {% for product in products %}
                {{ include('components/Molecules/ProductCard/ProductCard.html.twig', {
                    product: product
                }) }}
            {% endfor %}
        </div>
    </section>
{% endblock %}
```

### Category Page (category.html.twig)

```twig
{% extends 'base.html.twig' %}

{% set categoryId = attr('category', 'id') %}
{% set category = resources('/api/front/categories/' ~ categoryId) %}
{% set page = app.request.get('page')|default(1) %}

{% block title %}
    {{ category.i18ns.title }} - {{ parent() }}
{% endblock %}

{% block body %}
    <div class="category-page container">
        {# Breadcrumb #}
        {{ include('components/Molecules/Breadcrumb/Breadcrumb.html.twig', {
            breadcrumb: SEOneBreadcrumb()
        }) }}

        {# Category header #}
        <header class="category-header">
            <h1>{{ category.i18ns.title }}</h1>
            {% if category.i18ns.chapo %}
                <p class="lead">{{ category.i18ns.chapo|raw }}</p>
            {% endif %}
        </header>

        {# Products - Use LiveComponent for pagination with total count #}
        {% set products = resources('/api/front/products', {
            'productCategories.category.id': categoryId,
            'visible': true,
            'itemsPerPage': 24,
            'page': page
        }) %}

        <div class="product-grid">
            {% for product in products %}
                {{ include('components/Molecules/ProductCard/ProductCard.html.twig', {
                    product: product
                }) }}
            {% else %}
                <p>No products found in this category.</p>
            {% endfor %}
        </div>

        {# Simple pagination - for advanced pagination with total count, use a LiveComponent #}
        <nav class="pagination">
            {% if page > 1 %}
                <a href="{{ path('category', {id: categoryId, page: page - 1}) }}">Previous</a>
            {% endif %}
            {% if products|length == 24 %}
                <a href="{{ path('category', {id: categoryId, page: page + 1}) }}">Next</a>
            {% endif %}
        </nav>
    </div>
{% endblock %}
```

### Product Page (product.html.twig)

```twig
{% extends 'base.html.twig' %}

{% set productId = attr('product', 'id') %}
{% set product = resources('/api/front/products/' ~ productId) %}

{% block title %}
    {{ product.i18ns.title }} - {{ parent() }}
{% endblock %}

{% block body %}
    <div class="product-page container">
        {# Breadcrumb #}
        {{ include('components/Molecules/Breadcrumb/Breadcrumb.html.twig', {
            breadcrumb: SEOneBreadcrumb()
        }) }}

        <div class="product-layout">
            {# Gallery #}
            <div class="product-gallery">
                {% for image in product.images %}
                    <img src="{{ image.url }}" alt="{{ product.i18ns.title }}">
                {% endfor %}
            </div>

            {# Info #}
            <div class="product-info">
                <h1>{{ product.i18ns.title }}</h1>

                <p class="price">{{ product.defaultPse.price|format_money }}</p>

                {# Use Flexy component for add to cart or create your own #}
                {{ component('Flexy:Pages:Product', {product: product}) }}

                {# Or custom add to cart form #}
                {#
                <form action="{{ path('cart_add') }}" method="post">
                    <input type="hidden" name="product" value="{{ product.id }}">
                    <input type="hidden" name="product_sale_elements_id"
                           value="{{ product.defaultPse.id }}">
                    <input type="number" name="quantity" value="1" min="1">
                    <button type="submit">Add to Cart</button>
                </form>
                #}
            </div>
        </div>

        {# Description #}
        {% if product.i18ns.description %}
            <section class="product-description">
                <h2>Description</h2>
                <div class="wysiwyg">
                    {{ product.i18ns.description|raw }}
                </div>
            </section>
        {% endif %}
    </div>
{% endblock %}
```

## Creating Components

### Product Card

```twig
{# components/Molecules/ProductCard/ProductCard.html.twig #}
<article class="product-card">
    <a href="{{ path('product_show', {id: product.id}) }}">
        {# Image #}
        <div class="product-card-image">
            {% if product.images|length %}
                <img src="{{ product.images[0].url }}"
                     alt="{{ product.i18ns.title }}"
                     loading="lazy">
            {% else %}
                <img src="{{ asset('images/placeholder.jpg') }}"
                     alt="No image">
            {% endif %}

            {# Badges #}
            <div class="product-badges">
                {% if product.newProduct %}
                    <span class="badge badge-new">New</span>
                {% endif %}
                {% if product.promo %}
                    <span class="badge badge-sale">Sale</span>
                {% endif %}
            </div>
        </div>

        {# Info #}
        <div class="product-card-info">
            <h3 class="product-card-title">
                {{ product.i18ns.title }}
            </h3>

            <div class="product-card-price">
                {% if product.promo and product.defaultPse.promoPrice %}
                    <span class="price-original">
                        {{ product.defaultPse.price|format_money }}
                    </span>
                    <span class="price-sale">
                        {{ product.defaultPse.promoPrice|format_money }}
                    </span>
                {% else %}
                    <span class="price">
                        {{ product.defaultPse.price|format_money }}
                    </span>
                {% endif %}
            </div>
        </div>
    </a>
</article>
```

### Header

```twig
{# components/Layout/Header/Header.html.twig #}
<header class="site-header">
    <div class="container">
        {# Logo #}
        <a href="{{ path('homepage') }}" class="logo">
            <img src="{{ asset('images/logo.svg') }}" alt="My Shop">
        </a>

        {# Navigation #}
        <nav class="main-nav">
            {% set categories = resources('/api/front/categories', {
                'parent': 0,
                'visible': true
            }) %}

            <ul>
                {% for category in categories %}
                    <li>
                        <a href="{{ path('category', {id: category.id}) }}">
                            {{ category.i18ns.title }}
                        </a>
                    </li>
                {% endfor %}
            </ul>
        </nav>

        {# Actions #}
        <div class="header-actions">
            {# Search #}
            <a href="{{ path('search') }}" class="header-search">
                Search
            </a>

            {# Account #}
            {% if app.user %}
                <a href="{{ path('account') }}">My Account</a>
            {% else %}
                <a href="{{ path('customer_login') }}">Login</a>
            {% endif %}

            {# Cart - using Flexy component #}
            {{ component('Flexy:HeaderButton') }}
        </div>
    </div>
</header>
```

## Asset Pipeline

### webpack.config.js

```javascript
const Encore = require('@symfony/webpack-encore');

Encore
    .setOutputPath('public/build/my-theme/')
    .setPublicPath('/build/my-theme')

    .addEntry('app', './templates/frontOffice/my-theme/assets/js/app.js')
    .addStyleEntry('app-css', './templates/frontOffice/my-theme/assets/css/app.css')

    .enableStimulusBridge('./assets/controllers.json')
    .enableSassLoader()
    .enablePostCssLoader()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(Encore.isProduction())

    .splitEntryChunks()
    .enableSingleRuntimeChunk()
;

module.exports = Encore.getWebpackConfig();
```

### Main CSS (assets/css/app.css)

```css
/* Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
@layer components {
    .container {
        @apply mx-auto px-4 max-w-7xl;
    }

    .product-grid {
        @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6;
    }

    .product-card {
        @apply bg-white rounded-lg shadow hover:shadow-lg transition-shadow;
    }

    .btn {
        @apply inline-flex items-center justify-center px-4 py-2
               font-medium rounded-lg transition-colors;
    }

    .btn-primary {
        @apply bg-blue-600 text-white hover:bg-blue-700;
    }
}
```

### Main JavaScript (assets/js/app.js)

```javascript
// Stimulus
import { startStimulusApp } from '@symfony/stimulus-bridge';

export const app = startStimulusApp(
    require.context(
        '@symfony/stimulus-bridge/lazy-controller-loader!../controllers',
        true,
        /\.[jt]sx?$/
    )
);

// Turbo
import * as Turbo from '@hotwired/turbo';

// Your custom JS
document.addEventListener('turbo:load', () => {
    console.log('Page loaded');
});
```

## Using Flexy Components

You can use Flexy's LiveComponents in a custom theme:

```twig
{# In your custom theme #}
{% extends 'base.html.twig' %}

{% block body %}
    {# Use Flexy components where useful #}
    {{ component('Flexy:Pages:Product', {product: product}) }}
    {{ component('Flexy:CategoryFilters', {initialCategoryId: categoryId}) }}
    {{ component('Flexy:HeaderButton') }}
{% endblock %}
```

## Activating the Theme

### Command Line

```bash
php Thelia thelia:install --frontoffice_theme=my-theme
```

### Admin Panel

1. Go to Configuration > Templates
2. Select your theme for Front Office
3. Save

## Best Practices

1. **Use DataAccessService** for all data fetching
2. **Leverage Flexy components** when possible
3. **Keep templates simple** - move logic to components
4. **Use semantic HTML** for accessibility
5. **Optimize images** with lazy loading
6. **Test responsive** design at all breakpoints
7. **Document** your theme structure

## Next Steps

- [Customizing Flexy](./customization) - Override specific parts
- [LiveComponents](/docs/front-office/live-components) - Create custom components
- [Data Access](/docs/front-office/data-access) - Fetch data efficiently
