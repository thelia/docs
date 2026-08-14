---
title: Twig Basics
sidebar_position: 2
---

# Twig Basics

Thelia 3 uses **Twig** as the template engine for front-office development.

:::tip Official Documentation
For complete Twig documentation, see [twig.symfony.com](https://twig.symfony.com/doc/).
:::

## Template inheritance

### Base layout

All pages extend a base layout:

```twig
{# base.html.twig #}
<!DOCTYPE html>
<html lang="{{ lang_code }}">
    <head>
        {# The title, meta and canonical tags are rendered by whoever answers this hook #}
        {{ theme_hook('layout.head.top', {
            title: block('title') is defined ? block('title')|trim : null,
        }) }}
        {% block stylesheets %}
            <link rel="stylesheet" href="{{ asset('styles/app.css') }}" blocking="render">
        {% endblock %}
        {% block javascripts %}{{ importmap('app') }}{% endblock %}
    </head>
    <body>
        {% block header %}<twig:Layouts:Header:Base />{% endblock %}
        <main>{% block body %}{% endblock %}</main>
        {% block footer %}<twig:Layouts:Footer:Base />{% endblock %}
    </body>
</html>
```

### Extending the base layout

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

## Data access

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

## Thelia-specific functions

### URL attributes

Get URL parameters using `attr()`:

```twig
{% set productId = attr('product', 'id') %}
{% set categoryId = attr('category', 'id') %}
```

### SEO tags

A theme does not render its SEO tags itself. It opens a hook in the `<head>` and passes what the
current page knows:

```twig
{{ theme_hook('layout.head.top', {
    breadcrumb,
    title:       block('title') is defined ? block('title')|trim : null,
    description: block('meta_description') is defined ? block('meta_description')|trim : null,
    og_type:     block('og_type') is defined ? block('og_type')|trim : null,
}) }}
```

The SEOne module answers that hook and renders the title, the meta description, the canonical link,
the hreflang tags and the breadcrumb JSON-LD, falling back to its own values for anything the page
left unset. See [Theme hooks](./theme-hooks).

Its Twig functions (`SEOneBreadcrumb`, `SEOnePageH1`, `SEOnePageCanonical`, `SEOneWebSite`,
`SEOneWebPage`, `SEOneLocalBusiness`, ...) stay available for the values a page wants to read
directly:

```twig
<h1>{{ SEOnePageH1()|default(null) ?: attr('product', 'title') }}</h1>
```

:::note
The `SEOne*` functions are **not** core Twig functions. They come from the SEOne module
(`thelia/seone-module`), which Flexy declares as a dependency. A theme built without that module
renders the head through the hook and simply gets nothing back.
:::

### Translation

```twig
{{ 'Add to cart'|trans }}
{{ 'Welcome, %name%!'|trans({'%name%': customer.firstname}) }}
{{ '%count% item|%count% items'|trans({'%count%': cart.itemCount}) }}
```

### Price formatting

```twig
{{ price|format_currency('EUR', locale: lang_code) }}
```

## Components

### Twig components

Components are named after their class path under `components/`, with no prefix. The tag syntax is
what Flexy uses everywhere; `:` prefixes an attribute whose value is a Twig expression rather than a
string:

```twig
<twig:Organisms:ProductCard:Base :product="product" />

<twig:Molecules:Accordion:Base id="product-details" multiple>
    <twig:Molecules:Accordion:Item value="description" open>
        {# ... #}
    </twig:Molecules:Accordion:Item>
</twig:Molecules:Accordion:Base>
```

### LiveComponents

```twig
<twig:Layouts:ProductListing:Base :categoryId="categoryId" />
```

See [LiveComponents](./live-components) for details.

## Asset management

Assets are served by AssetMapper, and paths resolve inside the theme's `assets/` directory:

```twig
{# CSS #}
<link rel="stylesheet" href="{{ asset('styles/app.css') }}" blocking="render">

{# JavaScript #}
{{ importmap('app') }}

{# Single asset #}
{{ asset('images/logo.png') }}
```

## Stimulus controllers

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

## Best practices

### Use DataAccessService

```twig
{# Recommended #}
{% set products = resources('/api/front/products', {visible: true}) %}
```

### Keep templates clean

```twig
{# Good - logic in component #}
<twig:Organisms:ProductCard:Base :product="product" />

{# Avoid - complex business logic in template #}
{% if someComplexCondition and anotherCondition %}
    ...
{% endif %}
```

### Escape user content

```twig
{{ userComment }}  {# Auto-escaped #}
{{ product.i18ns.description|raw }}  {# Trusted admin content only #}
```

## Next steps

- [Data Access](./data-access) - Learn the `resources()` function
- [LiveComponents](./live-components) - Build reactive components
- [Flexy Theme](./flexy-theme/) - Explore the default theme
