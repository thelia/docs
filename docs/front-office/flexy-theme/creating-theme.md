---
title: Creating a Theme
sidebar_position: 3
---

# Creating a theme from scratch

A Thelia 3 front-office theme is a Symfony bundle. The Flexy theme ships as `FlexyBundle`: a class extending `AbstractBundle` that auto-loads its own services, Twig/Live components, controllers and assets. Template files alone are not enough. A real theme needs its Bundle class so Symfony can wire everything together.

This guide walks through the pieces of a theme, using Flexy as the reference, and shows how to build your own.

## Prerequisites

- A working Thelia 3 installation (see [Installation](/docs/getting-started/installation)).
- Node.js and npm for the asset pipeline (Webpack Encore).
- Familiarity with [Twig basics in Thelia](/docs/front-office/twig-basics) and [data access](/docs/front-office/data-access).

## A theme is a bundle

The Flexy theme registers itself as a Symfony bundle. The whole theme (services, Twig components, Live components, controllers) is autowired from the bundle's `src/` directory.

```php
// templates/frontOffice/flexy/src/FlexyBundle.php
namespace FlexyBundle;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\HttpKernel\Bundle\AbstractBundle;
use Thelia\Core\Template\TemplateDefinition;
use Thelia\Model\ConfigQuery;

class FlexyBundle extends AbstractBundle
{
    public function loadExtension(array $config, ContainerConfigurator $container, ContainerBuilder $builder): void
    {
        $serviceConfigurator = $container->services();

        $resourcePath = $this->getResourcePath();
        if (is_dir($resourcePath)) {
            $serviceConfigurator->load('FlexyBundle\\', $resourcePath)
                ->autowire()
                ->autoconfigure();
        }

        $serviceConfigurator->load('FlexyBundle\\UiComponents\\', $this->getUiComponentsPath())
            ->autowire()
            ->autoconfigure();
    }

    public function prependExtension(ContainerConfigurator $container, ContainerBuilder $builder): void
    {
        if (!is_dir($this->getResourcePath())) {
            return;
        }
        $container->import('../config/packages/*.yaml');
    }

    private function getResourcePath(): string
    {
        return THELIA_TEMPLATE_DIR.TemplateDefinition::FRONT_OFFICE_SUBDIR.DS.ConfigQuery::read(TemplateDefinition::FRONT_OFFICE_CONFIG_NAME, 'default').DS.'src';
    }

    private function getUiComponentsPath(): string
    {
        return THELIA_TEMPLATE_DIR.TemplateDefinition::FRONT_OFFICE_SUBDIR.DS.ConfigQuery::read(TemplateDefinition::FRONT_OFFICE_CONFIG_NAME, 'default').DS.'src'.DS.'UiComponents';
    }
}
```

What this does:

- `loadExtension()` registers every class under `FlexyBundle\` (the bundle's `src/`) and `FlexyBundle\UiComponents\` as autowired, autoconfigured services. `autoconfigure()` is what makes `#[Route]` controllers, `#[AsTwigComponent]` and `#[AsLiveComponent]` classes work without any XML.
- `prependExtension()` imports the theme's own `config/packages/*.yaml` so the theme can ship its own framework configuration.
- The resource path is resolved at runtime from the *active* front-office template (the `default` config key), so the bundle always points at the theme currently selected in the back office.

The bundle is enabled in `config/bundles.php`:

```php
// config/bundles.php
return [
    // ...
    FlexyBundle\FlexyBundle::class => ['all' => true],
];
```

:::note
For your own theme, create a `MyThemeBundle` class following this pattern (adjust the namespace and the `psr-4` autoload entry in `composer.json`), register it in `config/bundles.php`, and point its resource paths at your theme directory. Without a Bundle class, controllers, Twig components and Live components in your theme will never be discovered.
:::

## Directory structure

The Flexy theme lives in `templates/frontOffice/flexy/`. A theme combines flat page templates at the root, a `src/` PHP tree (the bundle code) and an `assets/` pipeline:

```
templates/frontOffice/my-theme/
├── template.xml               # Theme descriptor (read by Thelia)
├── composer.json              # type: thelia-frontoffice-template
├── webpack.config.js          # Asset pipeline (Webpack Encore)
├── base.html.twig             # Base layout
├── index.html.twig            # Homepage
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
├── components/                # Twig partials (Atomic Design)
│   ├── Atoms/
│   ├── Layout/
│   ├── Molecules/
│   ├── Organisms/
│   └── Page/
├── form/                      # Form theme(s)
├── src/                       # The bundle: Bundle class, Controllers, UiComponents
│   ├── MyThemeBundle.php
│   ├── Controller/
│   └── UiComponents/          # TwigComponents and LiveComponents (PHP + .html.twig)
└── assets/
    ├── app.js
    ├── controllers.json
    ├── css/
    └── images/
```

:::tip
The exact file list above mirrors the real Flexy theme root. Pages like `checkout-gateway`, `customer-activation`, `customer-informations`, `password-forgotten-confirm`, `reset-password-confirm`, `faq`, `page`, `sitemap` and `wishlist` also exist in Flexy. Browse `templates/frontOffice/flexy/` to see the full set, then keep only the pages your shop needs.
:::

## Theme descriptor: template.xml

Every theme has a `template.xml` at its root. This is the only XML a theme needs: a descriptor read by Thelia, not a service or routing configuration. Here is the real Flexy descriptor:

```xml
<!-- templates/frontOffice/my-theme/template.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<template xmlns="http://thelia.net/schema/dic/template"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://thelia.net/schema/dic/template http://thelia.net/schema/dic/template/template-1_0.xsd">
    <descriptive locale="en">
        <title>My front office template</title>
    </descriptive>
    <languages>
        <language>en_US</language>
        <language>fr_FR</language>
    </languages>
    <version>1.0.0</version>
    <authors>
        <author>
            <name>Your Name</name>
            <company>your-company</company>
            <email>contact@example.com</email>
            <website>example.com</website>
        </author>
    </authors>
    <thelia>2.5.4</thelia>
    <stability>prod</stability>
    <assets>dist</assets>
</template>
```

The tags, in order:

- `<descriptive locale="...">`: one block per locale, each with a `<title>`. Add as many as you need (Flexy ships `fr` and `en`).
- `<languages>`: the locales the theme supports.
- `<version>`: the theme version.
- `<authors>`: one or more `<author>` blocks with `<name>`, `<company>`, `<email>`, `<website>`.
- `<thelia>`: the minimum core version the theme requires.
- `<stability>`: `prod`, `beta`, `alpha`, etc.
- `<assets>`: the directory holding compiled assets (Flexy uses `dist`, matching the Webpack output path).

:::caution
There is no `<name>`, flat `<author>`, `<description>`, `<parent>` or `<required_version>` tag. The descriptor does not declare theme inheritance. To reuse Flexy from your own theme, render Flexy's components directly (`{{ component('Flexy:...') }}`, see [Using Flexy components](#using-flexy-components)) rather than declaring a parent.
:::

## Creating the base layout

```twig
{# templates/frontOffice/my-theme/base.html.twig #}
<!DOCTYPE html>
<html lang="{{ app.request.locale }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{% block title %}My Shop{% endblock %}</title>

    {% block stylesheets %}
        {{ encore_entry_link_tags('app') }}
    {% endblock %}

    {% block head_js %}
        {{ encore_entry_script_tags('app') }}
    {% endblock %}
</head>

<body class="{% block body_class %}{% endblock %}">
    {% block header %}
        {{ include('@components/Layout/Header/Header.html.twig') }}
    {% endblock %}

    <main {% block main_attributes %}{% endblock %}>
        {% block body %}{% endblock %}
    </main>

    {% block footer %}
        {{ include('@components/Layout/Footer/Footer.html.twig') }}
    {% endblock %}

    {% block body_js %}{% endblock %}
</body>
</html>
```

`encore_entry_link_tags()` and `encore_entry_script_tags()` come from WebpackEncoreBundle and resolve the compiled `app` entry defined in `webpack.config.js`.

:::note
`@components` is a Twig namespace the theme registers in `config/packages/twig.yaml`, pointing at the theme's `components/` directory (Flexy also registers `@UiComponents` for `src/UiComponents` and `@assets` for `assets`). Always reference partials through the namespace (`@components/Layout/...`) as Flexy does, rather than a bare relative path.
:::

## Essential pages

### Homepage (index.html.twig)

The homepage is served at `/` by the route named `index`. Fetch data with `resources()` (see [Data access](/docs/front-office/data-access)). Product and category URLs are rewritten, so link with the resource's `publicUrl` field. There is no `product_show` or `category` route to call.

```twig
{# templates/frontOffice/my-theme/index.html.twig #}
{% extends 'base.html.twig' %}

{% block body %}
    <section class="featured-categories container">
        <h2>Shop by Category</h2>

        {% set categories = resources('/api/front/categories', {
            parent: 0,
            visible: 1,
            itemsPerPage: 6
        }) %}

        <div class="category-grid">
            {% for category in categories %}
                {# publicUrl is the rewritten, SEO-friendly category URL #}
                <a href="{{ category.publicUrl }}" class="category-card">
                    <h3>{{ category.i18ns.title }}</h3>
                </a>
            {% endfor %}
        </div>
    </section>

    <section class="featured-products container">
        <h2>Featured Products</h2>

        {% set products = resources('/api/front/products', {
            visible: 1,
            itemsPerPage: 8
        }) %}

        <div class="product-grid">
            {% for product in products %}
                {{ include('@components/Molecules/ProductCard/ProductCard.html.twig', {
                    product: product
                }) }}
            {% endfor %}
        </div>
    </section>
{% endblock %}
```

### Category page (category.html.twig)

The current category id is read from the request attributes with `attr()`. The title comes from the resource's `i18ns` collection.

```twig
{# templates/frontOffice/my-theme/category.html.twig #}
{% extends 'base.html.twig' %}

{% set categoryId = attr('category', 'id') %}
{% set category = resources('/api/front/categories/' ~ categoryId) %}

{% block title %}
    {{ category.i18ns.title }} - {{ parent() }}
{% endblock %}

{% block body %}
    <div class="category-page container">
        <header class="category-header">
            <h1>{{ category.i18ns.title }}</h1>
            {% if category.i18ns.chapo %}
                <p class="lead">{{ category.i18ns.chapo|raw }}</p>
            {% endif %}
        </header>

        {# Delegate product listing + filters + pagination to a LiveComponent #}
        {{ component('Flexy:CategoryFilters', {initialCategoryId: categoryId}) }}
    </div>
{% endblock %}
```

:::tip
Filtering, sorting and paginating a product grid is stateful work. Flexy delegates it to the `Flexy:CategoryFilters` LiveComponent rather than rebuilding pagination by hand in the template. See [LiveComponents](/docs/front-office/live-components).
:::

### Product page (product.html.twig)

```twig
{# templates/frontOffice/my-theme/product.html.twig #}
{% extends 'base.html.twig' %}

{% set productId = attr('product', 'id') %}
{% set product = resources('/api/front/products/' ~ productId) %}

{% block title %}
    {{ product.i18ns.title }} - {{ parent() }}
{% endblock %}

{% block body %}
    <div class="product-page container">
        <h1>{{ product.i18ns.title }}</h1>

        {# The add-to-cart UI (price, PSE selection, quantity) is a LiveComponent #}
        {{ component('Flexy:Pages:Product', {product: product}) }}

        {% if product.i18ns.description %}
            <section class="product-description">
                <h2>Description</h2>
                <div class="wysiwyg">{{ product.i18ns.description|raw }}</div>
            </section>
        {% endif %}
    </div>
{% endblock %}
```

:::caution
Adding to the cart is handled by the `Flexy:Pages:Product` LiveComponent, not by a plain HTML `<form>` posting to a `cart_add` route. No such route exists. If you build your own add-to-cart UI, model it on the Flexy Live component in `src/UiComponents/Pages/Product/`.
:::

## Creating components

Flexy splits its UI in two places:

- `components/` holds plain Twig partials organized with Atomic Design (`Atoms/`, `Molecules/`, `Organisms/`, `Layout/`, `Page/`). You `include` them through the `@components` namespace.
- `src/UiComponents/` holds TwigComponents and LiveComponents: a PHP class plus its `.html.twig` template, rendered by name with `{{ component('Flexy:...') }}`. Flexy's own product card is one of these: `Flexy:ProductCard` (`src/UiComponents/ProductCard/`), which fetches its own price and image data.

For a custom theme you can either reuse `Flexy:ProductCard` or build your own partial. The hand-built version below links to the product with `product.publicUrl` and resolves the image the same way the real Flexy `ProductCard` component does:

```twig
{# templates/frontOffice/my-theme/components/Molecules/ProductCard/ProductCard.html.twig #}
<article class="product-card">
    <a href="{{ product.publicUrl }}">
        <div class="product-card-image">
            {# Product images are a separate resource. The collection endpoint returns ids,
               so build the image URL from the id (the front-single read group carries fileUrl). #}
            {% set images = resources('/api/front/product_images', {
                'product.id': product.id,
                position: 'ASC',
                itemsPerPage: 1
            }) %}
            {% if images %}
                <img src="/legacy-image-library/product_image_{{ images|first.id }}/full/%5E*!386,280/0/default.webp"
                     alt="{{ product.i18ns.title }}"
                     loading="lazy">
            {% endif %}
        </div>

        <div class="product-card-info">
            <h3 class="product-card-title">{{ product.i18ns.title }}</h3>
        </div>
    </a>
</article>
```

The header links to real, named routes (the back-office and the Flexy controllers register them via `#[Route]` attributes):

```twig
{# templates/frontOffice/my-theme/components/Layout/Header/Header.html.twig #}
<header class="site-header">
    <div class="container">
        {# Homepage route is named "index" #}
        <a href="{{ path('index') }}" class="logo">
            <img src="{{ asset('images/logo.svg') }}" alt="My Shop">
        </a>

        <nav class="main-nav">
            {% set categories = resources('/api/front/categories', {parent: 0, visible: 1}) %}
            <ul>
                {% for category in categories %}
                    {# Rewritten URL, not a route #}
                    <li><a href="{{ category.publicUrl }}">{{ category.i18ns.title }}</a></li>
                {% endfor %}
            </ul>
        </nav>

        <div class="header-actions">
            {% if app.user %}
                {# Account index route is "account_index" #}
                <a href="{{ path('account_index') }}">My Account</a>
            {% else %}
                <a href="{{ path('customer_login') }}">Login</a>
            {% endif %}

            {# Cart link. Flexy renders this with its Flexy:HeaderButton TwigComponent,
               which requires at least `text` (and usually `href`, `icon`). #}
            <a href="{{ path('checkout_cart') }}" class="cart-link">Cart</a>
        </div>
    </div>
</header>
```

:::caution Route names
The Flexy controllers prefix their routes. Use `path('index')` for the homepage, `path('customer_login')` to log in, `path('account_index')` for the account dashboard, `path('checkout_cart')` for the cart. Do not use `homepage`, `account`, `product_show` or `category`: those route names do not exist.
:::

## Asset pipeline

Flexy compiles its assets with [Webpack Encore](https://symfony.com/doc/current/frontend.html). The real `webpack.config.js` outputs to the theme's `dist/` directory (matching `<assets>dist</assets>` in `template.xml`), registers an `app` entry plus per-page CSS entries, and enables the Stimulus bridge, PostCSS, TypeScript and React.

Key parts of `templates/frontOffice/flexy/webpack.config.js`:

```javascript
// templates/frontOffice/my-theme/webpack.config.js
const Encore = require('@symfony/webpack-encore');
const path = require('path');

if (!Encore.isRuntimeEnvironmentConfigured()) {
  Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore
  .setOutputPath('dist/')
  .setPublicPath('/templates-assets/frontOffice/' + path.basename(__dirname) + '/dist')
  .setManifestKeyPrefix('dist/')

  // Main entry: ./assets/app.js -> dist/app.js (+ app.css if it imports CSS)
  .addEntry('app', './assets/app.js')
  // Per-page CSS entries
  .addEntry('category-css', './assets/css/pages/category.css')
  .addEntry('product-css', './assets/css/pages/product.css')

  .splitEntryChunks()
  .enableSingleRuntimeChunk()
  .cleanupOutputBeforeBuild()
  .enableSourceMaps(!Encore.isProduction())
  .enableVersioning(Encore.isProduction());

Encore.enablePostCssLoader();
Encore.enableTypeScriptLoader();
Encore.enableReactPreset();
Encore.enableStimulusBridge('./assets/controllers.json');

module.exports = Encore.getWebpackConfig();
```

:::note
`setOutputPath('dist/')` writes compiled assets inside the theme directory, and the public path resolves to `/templates-assets/frontOffice/<theme>/dist`. Read the full file at `templates/frontOffice/flexy/webpack.config.js` for the image/favicon copy rules and the dev-server settings before adapting it.
:::

Build the assets from the theme directory:

```bash
cd templates/frontOffice/my-theme
npm install
npm run build      # or: npm run watch during development
```

## Using Flexy components

A custom theme can reuse Flexy's components instead of declaring inheritance in `template.xml`. Render them by name with the `component()` Twig function:

```twig
{# In your custom theme #}
{% extends 'base.html.twig' %}

{% block body %}
    {{ component('Flexy:Pages:Product', {product: product}) }}
    {{ component('Flexy:CategoryFilters', {initialCategoryId: categoryId}) }}
    {{ component('Flexy:HeaderButton', {href: path('checkout_cart'), icon: 'cart', text: 'Cart'|trans}) }}
{% endblock %}
```

This works because Flexy's bundle registers those components as services; as long as `FlexyBundle` is enabled in `config/bundles.php`, their names are available to any active theme.

## Activating the theme

Activate a theme from the command line with the `template:set` command (type then name):

```bash
php Thelia template:set frontOffice my-theme
```

Or from the back office: **Configuration → Templates**, select your theme for the front office, and save.

:::tip
`bin/install` accepts `--frontoffice_theme=my-theme` to set the active front-office template during installation. See [Installation](/docs/getting-started/installation).
:::

## Learn more

- [Customizing Flexy](./customization): override specific parts of the Flexy theme
- [LiveComponents](/docs/front-office/live-components): build interactive, server-rendered components
- [TwigComponents](/docs/front-office/live-components): reusable Twig component classes
- [Data access](/docs/front-office/data-access): fetch data with `resources()` and `attr()`
- [Stimulus](/docs/front-office/stimulus): add behavior to your assets
