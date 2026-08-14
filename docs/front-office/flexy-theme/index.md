---
title: Flexy Theme
sidebar_position: 1
---

# Flexy Theme

Flexy is the default front-office theme for Thelia 3. It is a Symfony bundle (`FlexyBundle`) that ships its PHP classes, Twig templates, components, form theme and front-end assets together. It is built on the modern Thelia stack: Twig, Symfony UX (Live/Twig Components, Stimulus), AssetMapper and Tailwind CSS.

## Overview

Flexy provides:

- A UI styled with Tailwind CSS
- Around 50 components (25 LiveComponents + 24 TwigComponents), all auto-discovered from `src/UiComponents/`
- A full e-commerce flow (catalog, cart, checkout, account)
- Server-rendered reactivity through Symfony UX LiveComponents and Stimulus
- The routes that serve the front office, including the catch-all that renders catalog pages

The theme requires no Thelia module to serve a page. It carries the front-office routes itself and
depends only on the core.

## Theme structure

The whole theme is a single Composer package of type `thelia-frontoffice-template`, installed as a path repository. Everything, PHP and templates, lives under `templates/frontOffice/flexy/`:

```
templates/frontOffice/flexy/
├── composer.json              # type: thelia-frontoffice-template, autoload FlexyBundle\ → src/
├── src/                       # PHP classes (PSR-4: FlexyBundle\)
│   ├── FlexyBundle.php        # the bundle entry point
│   ├── Controller/
│   ├── DTO/
│   ├── Event/
│   ├── EventListener/
│   ├── Form/
│   ├── Service/
│   ├── Twig/
│   └── UiComponents/          # Live & Twig Components (PHP + colocated .html.twig)
│       ├── Pages/Product/
│       ├── Checkout/
│       ├── CategoryFilters/
│       ├── CrossSelling/
│       └── ...
├── base.html.twig             # base layout
├── index.html.twig            # homepage
├── category.html.twig         # category listing
├── product.html.twig          # product detail
├── checkout-*.html.twig       # checkout steps
├── account*.html.twig         # customer account
├── login.html.twig            # login page
├── components/                # anonymous Twig components (Atoms / Molecules / Organisms / Layout)
├── form/                      # form theme + custom field templates
│   └── flexy_form_theme.html.twig
├── config/
│   ├── views.yaml             # root templates that are not pages of their own
│   └── packages/              # bundle config imported by the theme
├── assets/                    # styles, icons, images, Stimulus controllers
└── importmap.php              # AssetMapper entrypoints and JavaScript dependencies
```

:::note
There is no `vendor/thelia/flexy/src/` versus `templates/frontOffice/flexy/` split. The bundle is one directory. The `FlexyBundle\` namespace maps to `src/`, declared in the theme's own `composer.json`.
:::

### How the bundle wires itself

`FlexyBundle` extends Symfony's `AbstractBundle`. It loads its services with autowiring and autoconfiguration, and imports its own configuration:

```php
// templates/frontOffice/flexy/src/FlexyBundle.php
public function loadExtension(array $config, ContainerConfigurator $container, ContainerBuilder $builder): void
{
    $serviceConfigurator = $container->services();

    $serviceConfigurator->load('FlexyBundle\\', $this->getResourcePath())
        ->autowire()
        ->autoconfigure();

    $serviceConfigurator->load('FlexyBundle\\UiComponents\\', $this->getUiComponentsPath())
        ->autowire()
        ->autoconfigure();
}

public function prependExtension(ContainerConfigurator $container, ContainerBuilder $builder): void
{
    $container->import('../config/packages/*.yaml');
}
```

No XML. Services, components, Twig paths and the form theme are all declared through PHP attributes and the bundle's `config/packages/*.yaml`.

## Key pages

### Homepage (`index.html.twig`)

```twig
{# templates/frontOffice/flexy/index.html.twig #}
{% extends 'base.html.twig' %}

{% block body %}
    {{ component('Flexy:CrossSelling', {categoryId: 1, title: 'Last seen products'|trans}) }}

    <div class="bg-theme-lighter">
        {{ component('Flexy:CrossSelling', {categoryId: 2, title: 'Popular products'|trans}) }}
    </div>

    {{ component('Flexy:ProductCategory', {title: 'Our product categories'|trans}) }}
{% endblock %}
```

:::caution
`Flexy:CrossSelling` requires a `categoryId`. There is no default in the PHP class, so calling it without one throws an error. See [Cross-selling](#cross-selling) below.
:::

### Category page (`category.html.twig`)

```twig
{# templates/frontOffice/flexy/category.html.twig #}
{% extends 'base.html.twig' %}

{% set categoryId = attr('category', 'id') %}
{% set category = resources('/api/front/categories/' ~ categoryId) %}

{% block body %}
    {# Category hero #}
    {{ component('Flexy:CatHero', {
        title: category.i18ns.title,
        chapo: category.i18ns.chapo,
        breadcrumb: breadcrumb
    }) }}

    {# Reactive product listing with filters #}
    {{ component('Flexy:CategoryFilters', {
        initialCategoryId: categoryId
    }) }}
{% endblock %}
```

### Product page (`product.html.twig`)

```twig
{# templates/frontOffice/flexy/product.html.twig #}
{% extends 'base.html.twig' %}

{% set productId = attr('product', 'id') %}
{% set product = resources('/api/front/products/' ~ productId) %}

{% block body %}
    <div class="ProductPage container">
        {# Breadcrumb #}
        {{ component('Molecules:Breadcrumb:Breadcrumb', {breadcrumb: breadcrumb}) }}

        {# Main product component (variant selection, add to cart) #}
        {{ component('Flexy:Pages:Product', {product: product}) }}

        {# Cross-selling: categoryId is required #}
        {{ component('Flexy:CrossSelling', {
            categoryId: product.productCategories|first.category.id,
            title: 'Last seen products'|trans
        }) }}
    </div>

    {# Add to cart toast notification #}
    {{ component('Flexy:AddToCartToast') }}
{% endblock %}
```

## Components

Flexy ships around 50 components in `src/UiComponents/`. The directory is the authoritative list: each PHP class carries either an `#[AsLiveComponent]` or an `#[AsTwigComponent]` attribute, and the component name is whatever that attribute declares.

- LiveComponents (`#[AsLiveComponent]`) re-render on the server in response to user interaction (model binding, live actions). Use them for forms, filters and checkout steps.
- TwigComponents (`#[AsTwigComponent]`) are stateless and render once. Use them for cards, layout pieces and presentational widgets.

All names are prefixed with `Flexy` (configured in `config/packages/twig_component.yaml`). Call any component with the `component()` Twig function.

### LiveComponents

| Component | Purpose |
|-----------|---------|
| `Flexy:Pages:Product` | Full product page (variant selection, add to cart) |
| `Flexy:CategoryFilters` | Product listing with reactive filters |
| `Flexy:SearchBar` | Search with autocomplete |
| `Flexy:Checkout:Cart` | Shopping cart |
| `Flexy:Checkout:Payment` | Payment method selection |
| `Flexy:Checkout:Summary` | Order summary |
| `Flexy:Checkout:MiniSummary` | Compact order summary |
| `Flexy:Checkout:Gateway` | Payment gateway step |
| `Flexy:Checkout:Invoice` | Invoice address step |
| `Flexy:Checkout:NextButton` | Checkout next-step button |
| `Flexy:Checkout:PickupPointSearch` | Pickup point search (checkout) |
| `Flexy:Checkout:PromoCodeForm` | Promo code input |
| `Flexy:Checkout:Delivery` | Delivery step (delivery module selection) |
| `Flexy:Checkout:Delivery:HomeDelivery` | Home delivery option |
| `Flexy:Checkout:Delivery:PickupDelivery` | Pickup delivery option |
| `Flexy:AccountAddressForm` | Account address form |
| `Flexy:AccountCustomerUpdate` | Profile edit form |
| `Flexy:AddressesForm` | Address form |
| `Flexy:AddToCartToast` | Add-to-cart notification |
| `Flexy:CustomerInformationForm` | Customer information form |
| `Flexy:InvoiceAddresses` | Invoice address selection |
| `Flexy:OrderCreator` | Order creation flow |
| `Flexy:PaymentModules` | Payment module selection |
| `Flexy:PickupPointSearch` | Pickup point search |
| `Flexy:RegisterValidationCode` | Registration validation code |

### TwigComponents

| Component | Purpose |
|-----------|---------|
| `Flexy:ProductCard` | Product card in listings |
| `Flexy:CrossSelling` | Related products carousel |
| `Flexy:CartItem` | Single cart item |
| `Flexy:HeaderButton` | Cart icon with count |
| `Flexy:HeaderProfile` | User menu |
| `Flexy:LangSelect` | Language switcher |
| `Flexy:Blocks` | CMS blocks |
| `Flexy:AccountHero` | Account header |
| `Flexy:AddressCard` | Address display |
| `Flexy:OrderCard` | Order history item |
| `Flexy:OrderProductCard` | Order line product card |
| `Flexy:CatHero` | Category hero |
| `Flexy:Button` | Button |
| `Flexy:CheckboxButton` | Checkbox button |
| `Flexy:RadioButton` | Radio button |
| `Flexy:InvoiceCard` | Invoice card |
| `Flexy:PaymentCard` | Payment method card |
| `Flexy:DeliveryTracking` | Delivery tracking display |
| `Flexy:ProductCategory` | Product category block |
| `Flexy:SimilarContent` | Similar content block |
| `Flexy:Inputs:Radio` | Radio input |
| `Flexy:Checkout:CheckoutSteps` | Checkout step indicator |
| `Flexy:Checkout:AddressCardCheckout` | Address card in checkout |
| `Flexy:Checkout:Delivery:StoreDelivery` | Store delivery option |

:::note
Watch the exact namespaces: the step indicator is `Flexy:Checkout:CheckoutSteps` (not `Flexy:CheckoutSteps`), and the promo form is `Flexy:Checkout:PromoCodeForm` (not `Flexy:PromoCodeForm`). When in doubt, open the component's PHP class in `src/UiComponents/` and read the `name:` argument of its attribute.
:::

### Cross-selling

`Flexy:CrossSelling` is a TwigComponent. Its PHP class exposes exactly two PHP properties:

```php
// templates/frontOffice/flexy/src/UiComponents/CrossSelling/CrossSelling.php
#[AsTwigComponent(name: 'Flexy:CrossSelling', template: '@UiComponents/CrossSelling/CrossSelling.html.twig')]
class CrossSelling
{
    public string $categoryId;          // required, no default
    public array $productIdsToIgnore = [];

    // getProducts() fetches /api/front/products filtered by category,
    // capped at 3 items, excluding $productIdsToIgnore
}
```

```twig
{# Fetch the 3 newest products of category 5, excluding the current one #}
{{ component('Flexy:CrossSelling', {
    categoryId: 5,
    productIdsToIgnore: [currentProductId],
    title: 'You may also like'|trans
}) }}
```

:::caution
`categoryId` is required. There is no `limit` property: the component always returns up to 3 products. `title` is a presentational prop read by the template, not by the PHP class.
:::

### Using components

```twig
{# A stateless TwigComponent #}
{{ component('Flexy:ProductCard', {product: product}) }}

{# A reactive LiveComponent #}
{{ component('Flexy:CategoryFilters', {initialCategoryId: categoryId}) }}
```

Anonymous components under `components/` are rendered with `include()` using the `@components` namespace:

```twig
{{ include('@components/Layout/Header/Header.html.twig') }}
{{ include('@components/Molecules/Breadcrumb/Breadcrumb.html.twig', {breadcrumb: breadcrumb}) }}
```

## Styling

### Tailwind CSS

Flexy is styled with Tailwind CSS, configured in `tailwind.config.js`:

```twig
<div class="container mx-auto px-4">
    <h1 class="h2 text-black">
        {{ product.i18ns.title }}
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {% for product in products %}
            {{ component('Flexy:ProductCard', {product: product}) }}
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

Flexy ships a custom form theme at `form/flexy_form_theme.html.twig`. The `form/` directory is mapped to the `@formTwig` Twig namespace by the bundle's `config/packages/twig.yaml`, and the theme is applied globally in the same file:

```yaml
# templates/frontOffice/flexy/config/packages/twig.yaml
twig:
  paths:
    "%kernel.project_dir%/templates/frontOffice/%thelia_front_template%/form": formTwig
  form_themes:
    - "frontOffice/%thelia_front_template%/form/flexy_form_theme.html.twig"
```

Because the theme is registered globally, you usually do not need a per-form `{% form_theme %}` tag: every form rendered in the front office already uses it. To override it for a single form, reference the theme by its namespace:

```twig
{% form_theme myForm '@formTwig/flexy_form_theme.html.twig' %}
{{ form_widget(myForm) }}
```

:::caution
The `@Flexy` Twig namespace does not exist in this bundle. Form-related templates use `@formTwig`, components use `@components` and `@UiComponents`.
:::

## SEO features

The base layout uses functions from the SEOne module to render titles, meta and structured data:

```twig
{# templates/frontOffice/flexy/base.html.twig (excerpt) #}
<title>{{ SEOnePageTitle() }}</title>
<meta name="description" content="{{ SEOnePageDesc() }}">
<link rel="canonical" href="{{ SEOnePageCanonical() }}"/>
{{ SEOneBreadcrumbJsonLd(breadcrumb)|raw }}
{{ SEOneHreflang()|raw }}
```

:::note
These functions are provided by the SEOne module (a Flexy dependency), not by Thelia core.
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
