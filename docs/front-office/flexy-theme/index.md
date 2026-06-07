---
title: Flexy Theme
sidebar_position: 1
---

# Flexy Theme

**Flexy** is the default front-office theme for Thelia 3. It is a Symfony bundle (`FlexyBundle`) that ships its PHP classes, Twig templates, components, form theme and front-end assets together. It showcases the modern Thelia stack: Twig, Symfony UX (Live/Twig Components, Stimulus) and Webpack Encore.

## Overview

Flexy provides:

- **Modern UI** styled with Tailwind CSS
- **Around 50 components** (25 LiveComponents + 24 TwigComponents), all auto-discovered from `src/UiComponents/`
- **Complete e-commerce flow** (catalog, cart, checkout, account)
- **Server-rendered reactivity** through Symfony UX LiveComponents and Stimulus

## Theme Structure

The whole theme is a single Composer package of type `thelia-frontoffice-template`, installed as a path repository. Everything — PHP and templates — lives under `templates/frontOffice/flexy/`:

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
├── config/packages/           # bundle config (twig, twig_component, encore, …)
├── assets/                    # JS, CSS, images, Stimulus controllers
└── webpack.config.js          # Webpack Encore build
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

## Key Pages

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
`Flexy:CrossSelling` requires a `categoryId` — there is no default in the PHP class, so calling it without one throws an error. See [Cross-selling](#cross-selling) below.
:::

### Category Page (`category.html.twig`)

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

### Product Page (`product.html.twig`)

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

Flexy ships around 50 components in `src/UiComponents/`. The directory is the authoritative list — each PHP class carries either an `#[AsLiveComponent]` or an `#[AsTwigComponent]` attribute, and the component name is whatever that attribute declares.

- **LiveComponents** (`#[AsLiveComponent]`) re-render on the server in response to user interaction (model binding, live actions). Use them for forms, filters, checkout steps.
- **TwigComponents** (`#[AsTwigComponent]`) are stateless and render once. Use them for cards, layout pieces and presentational widgets.

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
`categoryId` is **required**. There is no `limit` property — the component always returns up to 3 products. `title` is a presentational prop read by the template, not by the PHP class.
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

Per-page CSS is added as dedicated Webpack entries (see below). Add your stylesheets under `assets/css/` and reference them from an entry.

## Assets

### Webpack Encore

Assets are built with Webpack Encore. The real configuration lives in `templates/frontOffice/flexy/webpack.config.js`:

```javascript
// templates/frontOffice/flexy/webpack.config.js (excerpt)
const Encore = require('@symfony/webpack-encore');
const path = require('path');

Encore
    // compiled assets go to dist/, served from /templates-assets/frontOffice/flexy/dist
    .setOutputPath('dist/')
    .addAliases({
        '@components': path.resolve(__dirname, './components'),
        '@js': path.resolve(__dirname, './assets/js'),
        '@assets': path.resolve(__dirname, './assets'),
    })

    // main entry + per-page CSS entries
    .addEntry('app', './assets/app.js')
    .addEntry('category-css', './assets/css/pages/category.css')
    .addEntry('product-css', './assets/css/pages/product.css')

    .splitEntryChunks()
    .enableSingleRuntimeChunk()
    .cleanupOutputBeforeBuild()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(Encore.isProduction())
;

Encore.enablePostCssLoader();
Encore.enableTypeScriptLoader();
Encore.enableReactPreset();
Encore.enableStimulusBridge('./assets/controllers.json');

module.exports = Encore.getWebpackConfig();
```

:::note
Output goes to `dist/` (not `public/build/`), and is served under `/templates-assets/frontOffice/flexy/dist`. Templates reference built assets with `encore_entry_link_tags('app')` / `encore_entry_script_tags('app')`, as in `base.html.twig`.
:::

### Building Assets

```bash
ddev exec bash -c "cd templates/frontOffice/flexy && npm install && npm run build"
```

For development you can also run `npm run dev` or `npm run watch` from the same directory.

## Form Theme

Flexy ships a custom form theme at `form/flexy_form_theme.html.twig`. The `form/` directory is mapped to the `@formTwig` Twig namespace by the bundle's `config/packages/twig.yaml`, and the theme is applied **globally** in the same file:

```yaml
# templates/frontOffice/flexy/config/packages/twig.yaml
twig:
  paths:
    "%kernel.project_dir%/templates/frontOffice/%thelia_front_template%/form": formTwig
  form_themes:
    - "frontOffice/%thelia_front_template%/form/flexy_form_theme.html.twig"
```

Because the theme is registered globally, you usually do **not** need a per-form `{% form_theme %}` tag — every form rendered in the front office already uses it. If you do need to override it for a single form, reference the theme by its namespace:

```twig
{% form_theme myForm '@formTwig/flexy_form_theme.html.twig' %}
{{ form_widget(myForm) }}
```

:::caution
The `@Flexy` Twig namespace does not exist in this bundle. Form-related templates use `@formTwig`, components use `@components` and `@UiComponents`.
:::

## SEO Features

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
ddev exec php bin/install --frontoffice_theme=flexy --backoffice_theme=default
```

If `--frontoffice_theme` is omitted, the installer falls back to the `ACTIVE_FRONT_TEMPLATE` environment variable, then to `flexy`.

## Learn more

- [Customizing Flexy](./customization.md) — adapt Flexy to your needs
- [Creating a Theme](./creating-theme.md) — build a front-office theme from scratch
- [LiveComponents](../live-components.md) — develop reactive components
- [Twig basics](../twig-basics.md) — `resources()`, `attr()` and the Data Access layer
