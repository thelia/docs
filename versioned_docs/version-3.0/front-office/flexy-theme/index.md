---
title: Flexy Theme
sidebar_position: 1
---

# Flexy Theme

Flexy is the default front-office theme for Thelia 3. It is a Symfony bundle (`FlexyBundle`) that ships its PHP classes, Twig templates, components, form theme and front-end assets together. It is built on the modern Thelia stack: Twig, Symfony UX (Live/Twig Components, Stimulus), AssetMapper and Tailwind CSS.

## Overview

Flexy provides:

- A UI styled with Tailwind CSS
- 88 PHP-backed components (21 LiveComponents + 67 TwigComponents) plus a set of anonymous ones, all auto-discovered from `components/`
- A full e-commerce flow (catalog, cart, checkout, account)
- Server-rendered reactivity through Symfony UX LiveComponents and Stimulus
- The routes that serve the front office, including the catch-all that renders catalog pages

The theme requires no Thelia module to serve a page. It carries the front-office routes itself and
depends only on the core.

## Theme structure

The whole theme is a single Composer package of type `thelia-frontoffice-template`, installed as a path repository. Everything, PHP and templates, lives under `templates/frontOffice/flexy/`:

```
templates/frontOffice/flexy/
├── composer.json              # type: thelia-frontoffice-template, two PSR-4 roots
├── src/                       # PHP classes (PSR-4: FlexyBundle\)
│   ├── FlexyBundle.php        # the bundle entry point
│   ├── Controller/
│   ├── DTO/
│   ├── Event/
│   ├── EventListener/
│   ├── Form/
│   ├── Service/
│   └── Twig/
├── base.html.twig             # base layout
├── index.html.twig            # homepage
├── category.html.twig         # category listing
├── product.html.twig          # product detail
├── checkout-*.html.twig       # checkout steps
├── account*.html.twig         # customer account
├── login.html.twig            # login page
├── components/                # every component (PSR-4: FlexyBundle\Components\, namespace @Flexy)
│   ├── Atoms/
│   ├── Fields/
│   ├── Forms/
│   ├── Layouts/
│   ├── Molecules/
│   ├── Organisms/
│   └── Toolkit/
├── form/                      # form theme (namespace @FlexyForm)
│   └── flexy_form_theme.html.twig
├── config/
│   ├── views.yaml             # root templates that are not pages of their own
│   └── packages/              # third-party bundle config the theme ships
├── assets/                    # styles, icons, images, Stimulus controllers
└── importmap.php              # AssetMapper entrypoints and JavaScript dependencies
```

:::note
There is no `vendor/thelia/flexy/src/` versus `templates/frontOffice/flexy/` split. The bundle is one directory. Its `composer.json` declares two PSR-4 roots: `FlexyBundle\` on `src/` and `FlexyBundle\Components\` on `components/`.
:::

### How the bundle wires itself

`FlexyBundle` extends Symfony's `AbstractBundle`. It loads its services from its own
`config/services.yaml`, which registers both PSR-4 roots with autowiring and autoconfiguration:

```php
// templates/frontOffice/flexy/src/FlexyBundle.php
public function loadExtension(array $config, ContainerConfigurator $container, ContainerBuilder $builder): void
{
    $container->import('../config/services.yaml');

    $container->services()
        ->defaults()
        ->autowire()
        ->autoconfigure();
}
```

Almost everything else is configured from `prependExtension()`, in PHP rather than YAML: the Twig
paths and globals, the TwigComponent defaults, AssetMapper, UX Icons, Tailwind and the Stimulus
controller paths. The theme's own `config/packages/` holds only third-party bundle configuration.

```php
public function prependExtension(ContainerConfigurator $container, ContainerBuilder $builder): void
{
    $this->prependConfigTwig($builder);
    $this->prependConfigTwigComponent($builder);
    $this->prependConfigAssetMapper($builder);
    $this->prependConfigUxIcons($builder);
    $this->prependConfigTailwind($builder);
    $this->prependConfigStimulus($builder);
    $this->prependConfigPackages($container);
}
```

No XML. Services, components, Twig namespaces and the form theme are all declared through PHP
attributes and this bundle class.

## Key pages

### Homepage (`index.html.twig`)

```twig
{# templates/frontOffice/flexy/index.html.twig #}
{% extends 'base.html.twig' %}

{% block body %}
    {{ theme_hook('home.top') }}

    <twig:Layouts:CrossSelling:Base categoryId="3" title="{{ 'Last seen products'|trans }}" />

    <div class="bg-lighter">
        <twig:Layouts:CrossSelling:Base categoryId="5" title="{{ 'Popular products'|trans }}" />
    </div>

    <twig:Layouts:ProductCategory:Base title="{{ 'Our product categories'|trans }}" />

    {{ theme_hook('home.bottom') }}
{% endblock %}
```

:::tip
`Layouts:CrossSelling:Base` browses one category, or the whole catalog when `categoryId` is left out. See [Cross-selling](#cross-selling) below.
:::

### Category page (`category.html.twig`)

```twig
{# templates/frontOffice/flexy/category.html.twig #}
{% extends 'base.html.twig' %}

{% block body %}
    {% set categoryId = attr('category', 'id') %}
    {% set category = resources('/api/front/categories/' ~ categoryId) %}

    {{ theme_hook('category.top', {category: category}) }}

    {# Category heading #}
    <twig:Layouts:Subheader:Category
        title="{{ SEOnePageH1()|default(null) ?: attr('category', 'title') }}"
        description="{{ attr('category', 'chapo') }}"
        :breadcrumb="breadcrumb"
    />

    {# Reactive product listing with filters #}
    <twig:Layouts:ProductListing:Base :categoryId="categoryId" />

    {{ theme_hook('category.bottom', {category: category}) }}
{% endblock %}
```

### Product page (`product.html.twig`)

```twig
{# templates/frontOffice/flexy/product.html.twig #}
{% extends 'base.html.twig' %}

{% block body %}
    {% set productId = attr('product', 'id') %}
    {% set product = resources('/api/front/products/' ~ productId) %}

    {{ theme_hook('product.top', {product: product}) }}

    <div class="ProductPage">
        {# Breadcrumb #}
        <twig:Molecules:Breadcrumb:Base :items="breadcrumb" />

        {# Main product component (variant selection, add to cart) #}
        <twig:Layouts:ProductDetails:Base :product="product" />

        {# Cross-selling in the category the product is filed under #}
        <twig:Layouts:CrossSelling:Base
            :categoryId="product.productCategories|first.category.id"
            title="{{ 'Last seen products'|trans }}"
        />
    </div>

    {# Add to cart toast notification #}
    <twig:Organisms:AddToCartToast:Base />
{% endblock %}
```

## Components

Flexy ships 88 PHP-backed components in `components/`, alongside a set of anonymous ones that are template-only. The directory is the authoritative list: each PHP class carries either an `#[AsLiveComponent]` or an `#[AsTwigComponent]` attribute.

- LiveComponents (`#[AsLiveComponent]`) re-render on the server in response to user interaction (model binding, live actions). Use them for forms, filters and checkout steps.
- TwigComponents (`#[AsTwigComponent]`) are stateless and render once. Use them for cards, layout pieces and presentational widgets.

### How a component is named

The attributes are written bare, with no `name:` and no `template:` argument. The bundle sets
`name_prefix: ''` and `template_directory: '@Flexy'`, so both are derived from the class path under
`FlexyBundle\Components\`:

```php
// templates/frontOffice/flexy/components/Organisms/ProductCard/Base.php
namespace FlexyBundle\Components\Organisms\ProductCard;

#[AsTwigComponent]
class Base { /* ... */ }
```

That class is the component `Organisms:ProductCard:Base`, its template is
`components/Organisms/ProductCard/Base.html.twig`, and it renders as:

```twig
<twig:Organisms:ProductCard:Base :product="product" />
```

There is no `Flexy:` prefix. A component that carried one would be named `Flexy:...` only because a
theme chose that prefix; Flexy itself does not.

### LiveComponents

| Component | Purpose |
|-----------|---------|
| `Layouts:ProductDetails:Base` | Product detail block (variant selection, add to cart) |
| `Layouts:ProductListing:Base` | Product listing with reactive filters |
| `Organisms:SearchBar:Base` | Search with autocomplete |
| `Organisms:Cart:Base` | Shopping cart |
| `Organisms:CartButton:Base` | Cart button with count |
| `Organisms:Payment:Base` | Payment method selection |
| `Organisms:Summary:Checkout` | Order summary |
| `Organisms:Summary:Mini` | Compact order summary |
| `Organisms:Invoice:Base` | Invoice address step |
| `Organisms:NextButton:Base` | Checkout next-step button |
| `Organisms:Delivery:Base` | Delivery step (delivery module selection) |
| `Organisms:DeliveryMode:Home` | Home delivery option |
| `Organisms:DeliveryMode:Pickup` | Pickup delivery option |
| `Organisms:AddToCartToast:Base` | Add-to-cart notification |
| `Forms:Address:Base` | Address form |
| `Forms:Address:Account` | Address form in the customer account |
| `Forms:Customer:Update` | Profile edit form |
| `Forms:CustomerInformation:Base` | Customer information form |
| `Forms:PickupSearch:Base` | Pickup point search |
| `Forms:PromoCode:Base` | Promo code input |
| `Forms:RegisterValidationCode:Base` | Registration validation code |

### TwigComponents

The 67 Twig components are grouped the same way. The ones a theme reuses most often:

| Component | Purpose |
|-----------|---------|
| `Organisms:ProductCard:Base` | Product card in listings |
| `Organisms:ProductCard:Search` | Product card in search results |
| `Organisms:ProductCard:Order` | Product card in an order |
| `Layouts:CrossSelling:Base` | Related products strip |
| `Layouts:ProductCategory:Base` | Category grid block |
| `Layouts:Header:Base` | Site header |
| `Layouts:Footer:Base` | Site footer |
| `Organisms:CartItem:Base` | Single cart item |
| `Organisms:CategoryCard:Base` | Category card |
| `Organisms:HeaderProfile:Base` | User menu |
| `Organisms:LangSelect:Base` | Language switcher |
| `Organisms:Blocks:Base` | CMS blocks |
| `Organisms:AddressCard:Base` | Address display |
| `Organisms:OrderCard:Base` | Order history item |
| `Organisms:InvoiceCard:Base` | Invoice card |
| `Organisms:PaymentCard:Base` | Payment method card |
| `Organisms:DeliveryTracking:Base` | Delivery tracking display |
| `Organisms:ProductGallery:Base` | Product image gallery |
| `Molecules:Breadcrumb:Base` | Breadcrumb |
| `Molecules:Button:Base` | Button |
| `Molecules:Pagination:Base` | Pagination |
| `Molecules:CheckoutSteps:Base` | Checkout step indicator |
| `Molecules:Modal:Base` | Modal |
| `Molecules:HeaderButton:Base` | Header icon button |

:::note
Read the directory, not this table: `components/` is the source of truth, and the name of a component is its path under it. `components/Fields/` holds anonymous components (`Fields:Input:Base`, `Fields:Select:Base`, ...) that the form theme renders; they have no PHP class.
:::

### Cross-selling

`Layouts:CrossSelling:Base` is a TwigComponent:

```php
// templates/frontOffice/flexy/components/Layouts/CrossSelling/Base.php
namespace FlexyBundle\Components\Layouts\CrossSelling;

#[AsTwigComponent]
class Base
{
    private const DEFAULT_ITEMS_PER_PAGE = 4;

    public int|string|null $categoryId = null;
    public int $itemsPerPage = self::DEFAULT_ITEMS_PER_PAGE;

    // mount() fetches visible products from /api/front/products, filtered by
    // category when categoryId is set, and preloads their images and taxed prices
}
```

```twig
{# The 4 newest products of category 5 #}
<twig:Layouts:CrossSelling:Base
    categoryId="5"
    title="{{ 'You may also like'|trans }}"
/>
```

:::note
`categoryId` is optional: without it the strip browses the whole catalog. `itemsPerPage` defaults to 4. `title` is a presentational prop read by the template, not by the PHP class.
:::

### Using components

The tag syntax is what the theme uses everywhere:

```twig
{# A stateless TwigComponent #}
<twig:Organisms:ProductCard:Base :product="product" />

{# A reactive LiveComponent #}
<twig:Layouts:ProductListing:Base :categoryId="categoryId" />
```

The `component()` function takes the same names, and is handy where a tag will not do, for instance when the name is computed:

```twig
{{ component('Molecules:FilterList:Base', {filters: filters}) }}
```

Component templates reference each other through the `@Flexy` namespace:

```twig
{% extends '@Flexy/Organisms/AddressCard/Base.html.twig' %}
{{ include('@Flexy/Molecules/Pagination/Base.html.twig', pagination) }}
```

## Styling

### Tailwind CSS

Flexy is styled with Tailwind v4, which is CSS-first: the configuration is `assets/styles/app.css`,
not a `tailwind.config.js`.

```twig
<div class="container mx-auto px-4">
    <h1 class="h2 text-black">
        {{ product.i18ns.title }}
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {% for product in products %}
            <twig:Organisms:ProductCard:Base :product="product" />
        {% endfor %}
    </div>
</div>
```

### Custom CSS

Stylesheets live under `assets/styles/`. `assets/styles/app.css` is the single input Tailwind
compiles, and it imports the rest.

## Assets

### AssetMapper and Tailwind

Flexy is served through Symfony AssetMapper. There is no bundler, no `package.json` and no `dist/`
directory. JavaScript dependencies are declared in the theme's own `importmap.php`, and the theme
points AssetMapper at itself from `FlexyBundle::prependExtension()`:

| Configuration key | Value |
|---|---|
| `framework.asset_mapper.paths` | the theme's `assets/`, `assets/styles/` and `components/` |
| `framework.asset_mapper.vendor_dir` | `templates/frontOffice/%thelia_front_template%/assets/vendor` |
| `framework.asset_mapper.importmap_path` | `templates/frontOffice/%thelia_front_template%/importmap.php` |
| `symfonycasts_tailwind.input_css` | `templates/frontOffice/%thelia_front_template%/assets/styles/app.css` |

`base.html.twig` loads them with the AssetMapper functions:

```twig
{# templates/frontOffice/flexy/base.html.twig (excerpt) #}
{% block stylesheets %}
    <link rel="stylesheet" href="{{ asset('styles/app.css') }}" blocking="render">
{% endblock %}

{% block javascripts %}
    {% block importmap %}{{ importmap('app') }}{% endblock %}
{% endblock %}
```

An `asset()` path is relative to the theme's `assets/` directory: `asset('favicons/favicon.svg')`
resolves `assets/favicons/favicon.svg`.

### Building assets

`bin/install` runs both commands at the end of an install, so a fresh project has nothing to do.
Run them by hand after a `composer update`, which reinstalls the theme package and removes what it
had compiled:

```bash
php Thelia importmap:install
php Thelia tailwind:build
```

While working on the CSS, keep a watcher running:

```bash
php Thelia tailwind:build --watch
```

`symfonycasts/tailwind-bundle` downloads a standalone Tailwind binary on first use.

## Routes the theme carries

Flexy declares the front-office routes in `src/Controller/`, with `#[Route]` attributes. Two of
them deserve a mention.

### The catch-all view

`FlexyBundle\Controller\ViewController` reads the last segment of a URL as the name of a view and
lets the core render it:

```php
#[Route(
    '/{_view}',
    name: 'flexy_view',
    requirements: ['_view' => '^(?!admin|api)[^/]+'],
    defaults: ['_view' => 'index'],
    priority: -1000,
)]
public function view(Request $request): void
{
    $this->noAction($request);
}
```

Every page that is not a route of its own arrives here, either named directly or through the
rewriting router, which resolves a SEO URL and hands over the view it points at. Category, product,
content and folder pages all come through it. The controller extends
`Thelia\Controller\Front\DefaultController`, so the rendering work stays in the core and the theme
only carries the route.

The route is declared last on purpose: the pattern swallows any single segment, and a route
declared after it would never be reached. `admin` and `api` are excluded by the pattern.

This route used to be declared by the `thelia/front-module` package. The theme no longer requires
it, and no module is needed to serve a front-office page.

### Downloading a virtual product

`/account/order/download/{orderProductId}` serves the file bought with a virtual product. The theme
never reads that file. It checks that the order line belongs to the logged-in customer and that the
order is paid, then dispatches `TheliaEvents::VIRTUAL_PRODUCT_ORDER_DOWNLOAD_RESPONSE` and returns
whatever a listener puts on the event.

The module that stores the file answers, VirtualProductDelivery being the usual one. When no module
answers, the route returns 404, not 500, so a shop with no virtual product module is not broken by
it. An unknown id, someone else's order line and an unpaid order all return the same 404.

## Internal views

Root templates such as `base.html.twig` or `checkout-delivery.html.twig` are not pages. They render
only with the context a controller prepares, or they exist to be extended. Without a declaration,
the catch-all above would serve them under a URL made of their own name, which can only produce a
broken page.

Flexy lists them in `config/views.yaml`:

```yaml
# templates/frontOffice/flexy/config/views.yaml
internal:
    # Layouts, only ever extended
    - base
    - checkout-base

    # Rendered by the error handler with its own status code
    - error
    # Quoted: unquoted, YAML reads it as an integer, and the core rejects a non-string entry
    - '404'

    # Customer area: the controller checks authentication and resolves the entity
    - account
    - account-orders

    # Checkout steps, each guarded by the cart state its controller checks
    - checkout-cart
    - checkout-delivery
```

A request naming one of these views gets a 404. A controller rendering the same template is not
affected. See [Creating a theme](./creating-theme.md#declaring-internal-views) for the rules.

## PHP 8.3 and 8.4

Flexy accepts `symfony/ux-twig-component` in `^2.36 || ^3.1`. The 3.x series requires PHP 8.4, so a
shop on 8.3 resolves the 2.x line, which does not ship the `provide()` and `inject()` Twig
functions the theme's compound components use.

`FlexyBundle\Twig\ComponentContextExtension` declares those two functions, and only when the
installed package does not:

```php
private function packageProvidesThem(): bool
{
    if (!class_exists(InstalledVersions::class)) {
        return false;
    }

    return InstalledVersions::satisfies(new VersionParser(), 'symfony/ux-twig-component', '>=3.0');
}
```

There is one implementation in play at any time, never two answering the same name, and the theme
renders the same on both PHP versions.

## Form theme

Flexy ships a custom form theme at `form/flexy_form_theme.html.twig`, reached through the
`@FlexyForm` namespace. The theme is deliberately not registered globally, because a global form
theme would also restyle the back office. Instead the bundle publishes the list as a Twig global,
and each template that renders a form opts in:

```twig
{% form_theme form with flexy_form_themes only %}
{{ form_widget(form) }}
```

Both the namespace and the global come from `FlexyBundle::prependExtension()`:

```php
// templates/frontOffice/flexy/src/FlexyBundle.php
$containerBuilder->prependExtensionConfig('twig', [
    'paths' => [
        \dirname(__DIR__).'/components' => 'Flexy',
        \dirname(__DIR__).'/form' => 'FlexyForm',
    ],
    'globals' => [
        'flexy_form_themes' => [
            '@FlexyForm/flexy_form_theme.html.twig',
        ],
    ],
]);
```

The form theme itself renders each widget through an anonymous component under `components/Fields/`,
so restyling an input means editing that component rather than the theme file.

:::caution
Forget the tag and the form falls back to Symfony's default markup. The `only` keyword matters too:
it is what keeps the back-office widgets out of a front-office form.
:::

## SEO features

The base layout does not render the title, the meta description, the canonical link, the hreflang
tags or the breadcrumb JSON-LD itself. It opens a theme hook and lets a module answer:

```twig
{# templates/frontOffice/flexy/base.html.twig (excerpt) #}
{{ theme_hook('layout.head.top', {
    breadcrumb,
    title:       block('title') is defined ? block('title')|trim : null,
    description: block('meta_description') is defined ? block('meta_description')|trim : null,
    og_type:     block('og_type') is defined ? block('og_type')|trim : null,
}) }}

{# ... #}

{{ theme_hook('layout.head.bottom', {breadcrumb}) }}
```

A page fills the `title`, `meta_description` and `og_type` blocks, and the hook receives whatever
they contain. The SEOne module answers both head hooks and falls back to its own computed values for
anything a page leaves unset. With no module answering, the head renders without those tags rather
than breaking.

The layout still emits what belongs to the theme: `og:image`, `og:locale`, `og:site_name`,
`twitter:card`, the favicons and an empty `{% block robots %}` that pages such as the checkout fill
with `noindex, follow`.

Pages also call SEOne's Twig functions directly where the value is page-specific: `SEOneBreadcrumb()`
in the layout, `SEOnePageH1()` on the product and category pages, `SEOneWebSite()` / `SEOneWebPage()`
/ `SEOneLocalBusiness()` in the `structured_data` block of the homepage.

:::note
`theme_hook()` is a core Thelia function, and a module answers it by implementing
`Thelia\Core\Hook\Theme\ThemeHookInterface`. The `SEOne*` functions are provided by the SEOne module,
not by the core. See [Theme hooks](/docs/front-office/theme-hooks) for writing your own handler.
:::

## Installation

Select Flexy as the front-office theme when running the installer:

```bash
ddev exec php bin/install --frontoffice_theme=flexy --backoffice_theme=default-twig
```

If `--frontoffice_theme` is omitted, the installer falls back to the `ACTIVE_FRONT_TEMPLATE` environment variable, then to `flexy`.

## Learn more

- [Customizing Flexy](./customization.md): adapt Flexy to your needs
- [Creating a Theme](./creating-theme.md): build a front-office theme from scratch
- [LiveComponents](../live-components.md): develop reactive components
- [Twig basics](../twig-basics.md): `resources()`, `attr()` and the Data Access layer
