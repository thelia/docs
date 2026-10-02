---
title: Creating a Theme
sidebar_position: 3
---

# Creating a theme from scratch

A Thelia 3 front-office theme is a Symfony bundle. The Flexy theme ships as `FlexyBundle`: a class extending `AbstractBundle` that auto-loads its own services, Twig/Live components, controllers and assets. Template files alone are not enough. A real theme needs its Bundle class so Symfony can wire everything together.

This guide walks through the pieces of a theme, using Flexy as the reference, and shows how to build your own.

## Prerequisites

- A working Thelia 3 installation (see [Installation](/docs/getting-started/installation)).
- Familiarity with [Twig basics in Thelia](/docs/front-office/twig-basics) and [data access](/docs/front-office/data-access).

A front-office theme served through AssetMapper needs no Node.js and no bundler. Flexy is one, and
the guide below follows it.

## A theme is a bundle

The Flexy theme registers itself as a Symfony bundle. Services and controllers are autowired from `src/`, components from `components/`, and both directories are declared as PSR-4 roots in the theme's `composer.json`:

```json
{
    "autoload": {
        "psr-4": {
            "FlexyBundle\\": "src/",
            "FlexyBundle\\Components\\": "components/"
        }
    }
}
```

```php
// templates/frontOffice/flexy/src/FlexyBundle.php
namespace FlexyBundle;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\HttpKernel\Bundle\AbstractBundle;

class FlexyBundle extends AbstractBundle
{
    public function loadExtension(array $config, ContainerConfigurator $container, ContainerBuilder $builder): void
    {
        $container->import('../config/services.yaml');

        $container->services()
            ->defaults()
            ->autowire()
            ->autoconfigure();
    }

    public function prependExtension(ContainerConfigurator $container, ContainerBuilder $builder): void
    {
        $builder->prependExtensionConfig('twig', [
            'paths' => [
                \dirname(__DIR__).'/components' => 'Flexy',
                \dirname(__DIR__).'/form' => 'FlexyForm',
            ],
            'globals' => [
                'flexy_form_themes' => ['@FlexyForm/flexy_form_theme.html.twig'],
            ],
        ]);

        $builder->prependExtensionConfig('twig_component', [
            'anonymous_template_directory' => 'frontOffice/%thelia_front_template%/components/',
            'defaults' => [
                'FlexyBundle\\Components\\' => [
                    'template_directory' => '@Flexy',
                    'name_prefix' => '',
                ],
            ],
        ]);

        // AssetMapper, UX Icons, Tailwind and Stimulus are configured the same way.
    }
}
```

What this does:

- `loadExtension()` imports `config/services.yaml`, which registers both PSR-4 roots as autowired, autoconfigured services. `autoconfigure()` is what makes `#[Route]` controllers, `#[AsTwigComponent]` and `#[AsLiveComponent]` classes work without any XML.
- `prependExtension()` configures the framework for the theme: Twig namespaces and globals, the TwigComponent defaults, AssetMapper, UX Icons, Tailwind and the Stimulus controller paths. `name_prefix: ''` is what makes component names carry no prefix.
- Keys that must follow the *active* front-office template are written with the `%thelia_front_template%` parameter, so a theme that is installed but not active does not register its own paths.

The bundle is enabled in `config/bundles.php`:

```php
// config/bundles.php
return [
    // ...
    FlexyBundle\FlexyBundle::class => ['all' => true],
];
```

:::note
For your own theme, create a `MyThemeBundle` class following this pattern (adjust the namespaces and the two `psr-4` entries in `composer.json`), register it in `config/bundles.php`, and point its Twig and component paths at your theme directory. Without a Bundle class, controllers, Twig components and Live components in your theme will never be discovered.
:::

## Directory structure

The Flexy theme lives in `templates/frontOffice/flexy/`. A theme combines flat page templates at the root, a `components/` tree, a `src/` PHP tree (the bundle code) and an `assets/` pipeline:

```
templates/frontOffice/my-theme/
├── template.xml               # Theme descriptor (read by Thelia)
├── composer.json              # type: thelia-frontoffice-template
├── importmap.php              # AssetMapper entrypoints and JavaScript dependencies
├── config/
│   ├── views.yaml             # root templates that are not pages of their own
│   └── packages/              # framework configuration the theme ships
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
├── components/                # Components, PHP-backed or anonymous (namespace @Flexy)
│   ├── Atoms/
│   ├── Fields/
│   ├── Forms/
│   ├── Layouts/
│   ├── Molecules/
│   └── Organisms/
├── form/                      # Form theme (namespace @FlexyForm)
├── src/                       # The bundle: Bundle class, Controllers, Services, DTOs
│   ├── MyThemeBundle.php
│   └── Controller/
└── assets/
    ├── app.js
    ├── controllers.json
    ├── controllers/
    ├── styles/
    ├── icons/
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
    <thelia>3.0.0</thelia>
    <stability>prod</stability>
</template>
```

The tags, in order:

- `<descriptive locale="...">`: one block per locale, each with a `<title>`. Add as many as you need (Flexy ships `fr` and `en`).
- `<languages>`: the locales the theme supports.
- `<version>`: the theme version.
- `<authors>`: one or more `<author>` blocks with `<name>`, `<company>`, `<email>`, `<website>`.
- `<thelia>`: the minimum core version the theme requires.
- `<stability>`: `prod`, `beta`, `alpha`, etc.
- `<assets>`: optional, the directory holding compiled assets. It only drives the Webpack Encore
  manifest and its symlink. A theme served through AssetMapper, as Flexy is, declares no `<assets>`
  tag: it would point at a `dist` directory no build ever produces.

:::caution
There is no `<name>`, flat `<author>`, `<description>`, `<parent>` or `<required_version>` tag. The descriptor does not declare theme inheritance. To reuse Flexy from your own theme, render Flexy's components directly (see [Using Flexy components](#using-flexy-components)) rather than declaring a parent.
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
        <link rel="stylesheet" href="{{ asset('styles/app.css') }}" blocking="render">
    {% endblock %}

    {% block javascripts %}
        {{ importmap('app') }}
    {% endblock %}
</head>

<body class="{% block body_class %}{% endblock %}">
    {% block header %}
        <twig:Layouts:Header:Base />
    {% endblock %}

    <main {% block main_attributes %}{% endblock %}>
        {% block body %}{% endblock %}
    </main>

    {% block footer %}
        <twig:Layouts:Footer:Base />
    {% endblock %}

    {% block body_js %}{% endblock %}
</body>
</html>
```

`asset()` resolves a path inside the theme's `assets/` directory, and `importmap()` renders the
`app` entrypoint declared in the theme's `importmap.php`. Both come from AssetMapper.

:::note
Flexy registers exactly two Twig namespaces from its bundle class: `@Flexy` for `components/` and `@FlexyForm` for `form/`. Components are usually rendered by name (`<twig:Layouts:Header:Base />`), and the namespace is used when one component template references another (`{% extends '@Flexy/Organisms/AddressCard/Base.html.twig' %}`).
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
                <twig:Molecules:ProductCard:Base :product="product" />
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
        <twig:Layouts:ProductListing:Base :categoryId="categoryId" />
    </div>
{% endblock %}
```

:::tip
Filtering, sorting and paginating a product grid is stateful work. Flexy delegates it to the `Layouts:ProductListing:Base` LiveComponent rather than rebuilding pagination by hand in the template. See [LiveComponents](/docs/front-office/live-components).
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
        <twig:Layouts:ProductDetails:Base :product="product" />

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
Adding to the cart is handled by the `Layouts:ProductDetails:Base` LiveComponent, not by a plain HTML `<form>` posting to a `cart_add` route. No such route exists. If you build your own add-to-cart UI, model it on the Flexy Live component in `components/Layouts/ProductDetails/`.
:::

## Creating components

Flexy splits its UI in two places:

Everything lives in `components/`, organized with Atomic Design (`Atoms/`, `Molecules/`, `Organisms/`, `Layouts/`, `Fields/`, `Forms/`). A component is a directory:

- an anonymous component is a `.html.twig` file on its own;
- a PHP-backed one adds a class next to its template, carrying a bare `#[AsTwigComponent]` or `#[AsLiveComponent]`.

Either way the component is named after its path: `components/Organisms/ProductCard/Base.php` is rendered as `<twig:Organisms:ProductCard:Base />`. Flexy's own product card is one of these, and it fetches its own price and image data.

For a custom theme you can either reuse `Organisms:ProductCard:Base` or build your own. The hand-built version below links to the product with `product.publicUrl` and resolves the image the same way the real one does:

```twig
{# templates/frontOffice/my-theme/components/Molecules/ProductCard/Base.html.twig #}
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
{# templates/frontOffice/my-theme/components/Layouts/Header/Base.html.twig #}
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

            {# Cart link. Flexy renders this with its Molecules:HeaderButton:Base
               TwigComponent, which takes `text` and usually `href` and `icon`. #}
            <a href="{{ path('checkout_cart') }}" class="cart-link">Cart</a>
        </div>
    </div>
</header>
```

:::caution Route names
The Flexy controllers prefix their routes. Use `path('index')` for the homepage, `path('customer_login')` to log in, `path('account_index')` for the account dashboard, `path('checkout_cart')` for the cart. Do not use `homepage`, `account`, `product_show` or `category`: those route names do not exist.
:::

## Serving the pages

A theme carries the routes of the front office. The one that makes a shop work is the catch-all:
it reads the last segment of a URL as the name of a view and hands it to the core.

```php
// templates/frontOffice/my-theme/src/Controller/ViewController.php
namespace MyThemeBundle\Controller;

use Symfony\Component\Routing\Attribute\Route;
use Thelia\Controller\Front\DefaultController;
use Thelia\Core\HttpFoundation\Request;

class ViewController extends DefaultController
{
    #[Route(
        '/{_view}',
        name: 'my_theme_view',
        requirements: ['_view' => '^(?!admin|api)[^/]+'],
        defaults: ['_view' => 'index'],
        priority: -1000,
    )]
    public function view(Request $request): void
    {
        $this->noAction($request);
    }
}
```

Category, product, content and folder pages all arrive here, either named directly or through the
rewriting router, which resolves a SEO URL and hands over the view it points at. Without this
route the shop serves none of them.

Two details are not optional. The negative `priority` puts the route last, because the pattern
swallows any single segment and would otherwise hide every route declared after it. The
requirement excludes `admin` and `api`, which are served by routers that only run once this one
has been tried.

The rendering itself stays in the core: `DefaultController::noAction()` does the work, and the
controller above only carries the route to it. No module is involved. A theme that expects the
`thelia/front-module` package to declare this route is a Thelia 2 theme.

### Downloading a virtual product

A theme that sells virtual products needs a route to serve the file, and it must not read that file
itself. Flexy exposes `/account/order/download/{orderProductId}`: it checks that the order line
belongs to the logged-in customer and that the order is paid, dispatches an event, and returns
whatever a listener puts on it.

```php
#[Route('/order/download/{orderProductId}', name: 'order_download', requirements: ['orderProductId' => '\d+'], methods: ['GET'])]
public function downloadVirtualProduct(EventDispatcherInterface $eventDispatcher, int $orderProductId): Response
{
    // ... resolve $orderProduct for the current customer, 404 otherwise

    $event = new VirtualProductOrderDownloadResponseEvent($orderProduct);
    $eventDispatcher->dispatch($event, TheliaEvents::VIRTUAL_PRODUCT_ORDER_DOWNLOAD_RESPONSE);

    if (!$event->getResponse() instanceof Response) {
        // No module answered, so there is no file to serve
        throw new NotFoundHttpException();
    }

    return $event->getResponse();
}
```

The module storing the file answers the event, VirtualProductDelivery being the usual one. A shop
with no such module gets a 404 here, not a 500. An unknown id, an order line belonging to someone
else and an unpaid order return that same 404: none of them tells whether the file exists.

## Declaring internal views

Not every root template is a page. Layouts exist to be extended, error pages are rendered by the
error handler, and checkout or account templates render only with the context their controller
prepares. The catch-all above cannot tell them apart from a real page, so a theme says which is
which in `config/views.yaml`:

```yaml
# templates/frontOffice/my-theme/config/views.yaml
internal:
    - base
    - checkout-base
    - error
    # Quoted: unquoted, YAML reads it as an integer and the core rejects a non-string entry
    - '404'
    - account
    - checkout-cart
    - checkout-delivery
```

A request naming one of these views gets a 404. A controller rendering the same template is
unaffected, since only requests that name a view go through the check.

The file is optional. A theme that ships none keeps every root template reachable by its own name,
which was the behaviour of every theme until Thelia 3.0.0-beta3. The nearest declaration wins: an
inherited list only applies while the theme itself declares nothing.

An unreadable or malformed file is a packaging error and is reported as one, so a typo does not
pass silently.

## Asset pipeline

A theme served through AssetMapper ships its assets as they are. There is no bundler, no
`package.json` and no `dist/` directory.

- `importmap.php` at the theme root declares the JavaScript entrypoints and dependencies.
- `assets/` holds styles, icons, images and Stimulus controllers.
- `assets/styles/app.css` is the single input Tailwind compiles.

The theme points the framework at those directories from its bundle class:

```php
// templates/frontOffice/my-theme/src/MyThemeBundle.php
public function prependExtension(ContainerConfigurator $container, ContainerBuilder $builder): void
{
    $builder->prependExtensionConfig('framework', [
        'asset_mapper' => [
            // Listed first so AssetMapper searches the theme before the project
            'paths' => [
                \dirname(__DIR__).'/assets',
                \dirname(__DIR__).'/assets/styles',
                \dirname(__DIR__).'/components',
            ],
            'vendor_dir' => '%kernel.project_dir%/templates/frontOffice/%thelia_front_template%/assets/vendor',
            'importmap_path' => '%kernel.project_dir%/templates/frontOffice/%thelia_front_template%/importmap.php',
            'public_prefix' => '/assets/frontOffice/%thelia_front_template%/',
            'excluded_patterns' => ['*/*.html.twig'],
        ],
    ]);
}
```

Keys that must follow the active theme are written with the `%thelia_front_template%` parameter.
`paths` is the exception: those entries designate this bundle's own directories, so they stay on
`dirname(__DIR__)`.

Build the assets:

```bash
php Thelia importmap:install
php Thelia tailwind:build
```

`bin/install` runs both at the end of an install, so a fresh project has nothing to do. Run them
again after a `composer update`, which reinstalls the theme package.

## Using Flexy components

A custom theme can reuse Flexy's components instead of declaring inheritance in `template.xml`. Render them by name with the `component()` Twig function:

```twig
{# In your custom theme #}
{% extends 'base.html.twig' %}

{% block body %}
    <twig:Layouts:ProductDetails:Base :product="product" />
    <twig:Layouts:ProductListing:Base :categoryId="categoryId" />
    <twig:Molecules:HeaderButton:Base href="{{ path('checkout_cart') }}" icon="cart" text="{{ 'Cart'|trans }}" />
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
