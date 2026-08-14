---
title: Templating Engines
sidebar_position: 2
---

# Templating Engines

Thelia 3 renders its interfaces with Twig. The front-office (Flexy theme) and the modern back-office (`default-twig` theme) are Twig bundles built on Symfony UX (Stimulus, TwigComponent, LiveComponent) and Bootstrap 5, and the transactional emails and order PDF are Twig themes too.

A second engine, Smarty, still ships for the legacy `default` back-office theme. It is kept only for the transition and is not the recommended path for new development.

:::caution The Smarty back-office is being phased out
The Smarty `default` back-office theme is legacy and will likely be dropped in Thelia 3.1. Build new admin screens and module admin extensions against the `default-twig` bundle conventions. Smarty examples below are documented for reference only.
:::

## Overview

| Aspect | Front-office (Flexy) | Back-office (default-twig) | Back-office (default, legacy) |
|--------|----------------------|----------------------------|-------------------------------|
| **Engine** | Twig 3 | Twig 3 | Smarty |
| **Data access** | `resources()` / `attr()` Twig functions (DataAccessService) | Repositories + presenters (Propel) | Loops (Propel) |
| **Components** | TwigComponent / LiveComponent | TwigComponent / LiveComponent | Template includes |
| **JavaScript** | Stimulus | Stimulus | jQuery |
| **Styling** | Theme SCSS | Bootstrap 5.3 | Theme CSS |
| **Routing** | `#[Route]` attributes | `#[Route]` attributes | `admin.xml` route files |
| **Packaging** | `FlexyBundle` | `BackOfficeDefaultTwigBundle` | Thelia templates |

Both Twig themes are Symfony bundles: their templates, components, Stimulus controllers, form themes and assets all live inside the bundle. See [Modules vs Bundles](./modules-vs-bundles.md).

## Front-office: Twig + Symfony UX

The front-office ships as the `FlexyBundle`. Templates live at the theme root, components and PHP under `src/`.

### Template location

```
templates/frontOffice/flexy/
├── base.html.twig            # base layout
├── index.html.twig           # homepage
├── product.html.twig         # product page
├── category.html.twig        # category page
├── checkout-cart.html.twig   # cart step
└── src/
    ├── Twig/
    │   └── DataAccessExtension.php   # registers resources() and attr()
    └── UiComponents/         # TwigComponent / LiveComponent
```

### Data retrieval

Fetch data from the API layer with the `resources()` Twig function. It is registered by `FlexyBundle\Twig\DataAccessExtension` and delegates to `Thelia\Api\Service\DataAccess\DataAccessService`:

```twig
{# Fetch a single product #}
{% set product = resources('/api/front/products/' ~ productId) %}

{# Fetch a collection with filters #}
{% set products = resources('/api/front/products', {
    'productCategories.category.id': categoryId,
    'visible': true,
    'order[position]': 'asc',
    'itemsPerPage': 20
}) %}

{# Display products #}
{% for product in products %}
    <h2>{{ product.i18ns.title }}</h2>
    {# Prices live on the product's sale elements (PSE), not on a flat property #}
    <p>{{ product.productSaleElements[0].productPrices[0].price }} EUR</p>
{% endfor %}
```

See [Front-office data access](../front-office/data-access.md) for the full reference.

### Route attributes

Read a value derived from the current route with the `attr()` Twig function (also registered by `DataAccessExtension`, backed by `AttributeAccessService`):

```twig
{# On /product/42 page #}
{% set productId = attr('product', 'id') %}

{# On /category/5 page #}
{% set categoryId = attr('category', 'id') %}
```

:::note
`attr(type, name)` resolves a method `attribute<Type>()` on `AttributeAccessService`. Calling it with a type that has no matching method throws a `RuntimeException`, so only documented attribute types are valid.
:::

### Components

Flexy ships TwigComponents (server-rendered) and LiveComponents (reactive, re-render on the server without a page reload). Render them with the `component()` function, using the names declared in the `#[AsTwigComponent]` / `#[AsLiveComponent]` attributes under `src/UiComponents/`:

```twig
{# Product page LiveComponent - receives the product array #}
{{ component('Flexy:Pages:Product', { product: product }) }}

{# Category listing with filters (LiveComponent) #}
{{ component('Flexy:CategoryFilters', {
    initialCategoryId: categoryId,
    initialPage: page
}) }}

{# Cart step (LiveComponent) #}
{{ component('Flexy:Checkout:Cart') }}

{# Order summary (LiveComponent) #}
{{ component('Flexy:Checkout:Summary') }}
```

:::tip
Component names are namespaced with colons (`Flexy:Checkout:Cart`), mirroring their folder under `src/UiComponents/`. Grep the bundle for `AsLiveComponent` / `AsTwigComponent` to discover the available components and their props.
:::

See [LiveComponents](../front-office/live-components.md) for building your own.

### Stimulus controllers

For custom JavaScript behavior, attach a Stimulus controller. Controllers live in `assets/controllers/` inside the bundle:

```twig
<div data-controller="product-gallery">
    <img data-product-gallery-target="main" src="{{ mainImage }}">

    {% for image in images %}
        <img
            data-action="click->product-gallery#select"
            data-product-gallery-url-param="{{ image.url }}"
            src="{{ image.thumbnail }}"
        >
    {% endfor %}
</div>
```

See [Stimulus](../front-office/stimulus.md).

## Back-office: the default-twig bundle (recommended)

The reference back-office is the `default-twig` theme, packaged as `BackOfficeDefaultTwigBundle`. It is a Bootstrap 5.3 / Twig / Stimulus port of the legacy Smarty admin, and it is autonomous: its routes, hooks, forms and assets all live inside the bundle.

### Activation

```bash
# fresh install
ddev exec php bin/install \
  --frontoffice_theme=flexy --backoffice_theme=default-twig \
  --pdf_theme=default --email_theme=default \
  --with-demo --with-admin

# already installed: switch active back-office template
ddev exec php Thelia template:set backOffice default-twig
ddev exec php Thelia cache:warmup -e dev

# build assets
ddev exec bash -c "cd templates/backOffice/default-twig && npm install && npm run build"
```

### Bundle layout

```
templates/backOffice/default-twig/
├── base.html.twig            # base layout
├── home.html.twig            # dashboard
├── <domain>/                 # one folder per domain (catalog, customer, ...)
│   ├── list.html.twig
│   ├── edit.html.twig
│   └── _create_modal.html.twig
├── components/               # reusable Twig components (BoDataTable, BoDashboard, ...)
├── form/
│   └── bo_form_theme.html.twig   # custom Bootstrap 5 form theme
├── assets/                   # SCSS + JS + img
│   └── controllers/          # Stimulus controllers
└── src/
    ├── BackOfficeDefaultTwigBundle.php
    ├── Controller/           # thin controllers, #[Route] attributes
    ├── DTO/                  # immutable data transfer objects
    ├── Form/                 # Symfony forms
    ├── Twig/                 # HookExtension, BackOfficeUrlExtension, DataTableExtension, ...
    └── UiComponents/         # AsTwigComponent / AsLiveComponent
```

### Routing with attributes

Admin screens declare their routes with PHP 8 `#[Route]` attributes on thin controllers, with no `admin.xml`:

```php
// templates/backOffice/default-twig/src/Controller/Catalog/BrandController.php
#[Route('/admin/brand', name: 'admin.brand.')]
final class BrandController
{
    #[Route('', name: 'default', methods: ['GET'])]
    public function list(/* ... */) { /* ... */ }

    #[Route('/create', name: 'create', methods: ['POST'])]
    public function create(/* ... */) { /* ... */ }

    #[Route('/update/{brand_id}', name: 'update', methods: ['GET'], requirements: ['brand_id' => '\d+'])]
    public function updateView(int $brand_id) { /* ... */ }
}
```

### Components

The bundle exposes its own TwigComponents, prefixed `Bo`. Render them with `component()`:

```twig
{# Reusable list table #}
{{ component('BoDataTable', { /* ... */ }) }}

{# Confirmation modal #}
{{ component('BoConfirmDialog', { /* ... */ }) }}
```

Discover them by grepping the bundle for `AsTwigComponent` under `src/UiComponents/` (`BoDataTable`, `BoDashboard`, `BoCreateDialog`, `BoConfirmDialog`, `BoPagination`, ...).

### Hooks

Modules extend admin screens through hooks, exposed as Twig functions by `BackOfficeDefaultTwigBundle\Twig\HookExtension`:

```twig
{{ safe_hook('main.head-css') }}

{% for block in hook_block('home.block', { foo: bar }) %}
    <h2>{{ block.title }}</h2>
    {{ block.content|raw }}
{% endfor %}

{% if has_hook('product.tab') %}{# ... #}{% endif %}
```

Most hook names are kept identical to the legacy Smarty template; a few renamed hooks are bridged to their legacy name so existing third-party modules keep working unchanged. See [Back-office hooks](../back-office/hooks.md).

:::note Access control
ACL resources live in `core/lib/Thelia/Core/Security/Resource/AdminResources.php`. Check access with `is_granted('VIEW', 'admin.brand')` in templates, or via the bundle's `AdminAccessChecker` in controllers.
:::

## Emails and PDF: Twig themes

Transactional emails and order documents (invoice, delivery slip) are Twig themes as well, installed under `templates/email/` and `templates/pdf/`. They render through the same `TwigParser` as the rest of the site, selected by the `ParserResolver`.

The `ParserResolver` picks a parser by file extension, not by a global setting: `TwigParser` claims `.html.twig` and `.txt.twig`, the legacy `SmartyParser` claimed `.html` and `.tpl`. An email message is a `.html.twig` (HTML body) plus a `.txt.twig` (text body); a PDF document is a single `.html.twig`. Because the choice is per file, a Twig theme and a Smarty theme can coexist during a migration without any core change.

Since a mail or a PDF is often rendered with no HTTP request behind it (from a worker, or the `mail:render` / `pdf:render` console commands), these themes use the CLI-safe helpers the `TwigEngine` module provides (`loop`, `format_money`, `format_date`, `format_address`, `config`, `thelia_url`, `media_url`, `hook` and `hook_block`) rather than request-bound functions. The PDF theme renders HTML that is then converted to PDF by dompdf.

See [Emails and PDF](../reference/emails-and-pdf.md) for the full reference.

## Legacy back-office: Smarty (transitional)

:::caution
This section documents the legacy `default` (Smarty) back-office. It is kept for the transition only and is expected to be dropped in Thelia 3.1. Do not target it for new work. Use the `default-twig` bundle conventions above.
:::

The legacy admin uses Smarty templates with Thelia's loop system for data retrieval.

### Data retrieval with loops

```smarty
{* List products in a category *}
{loop name="products" type="product" category=$category_id visible=1}
    <tr>
        <td>{$ID}</td>
        <td>{$TITLE}</td>
        <td>{$PRICE} {$CURRENCY}</td>
        <td>
            <a href="{url path="/admin/product/update/$ID"}">Edit</a>
        </td>
    </tr>
{/loop}
```

### Hooks

```smarty
{hook name="product.additional-info"}
```

### Form handling

```smarty
{form name="product_modification"}
    <input type="text" name="{field field='title'}" value="{$form.title.value}">
    {if $form.title.hasError}
        <span class="error">{$form.title.error}</span>
    {/if}

    <button type="submit">Save</button>
{/form}
```

## When to use which

### Front-office (Flexy / Twig)

- Customer-facing pages and storefront themes.
- Reactive UI with LiveComponents and Stimulus.
- Data fetched through `resources()` / `attr()`.

### Back-office (default-twig / Twig), recommended

- New admin screens and admin extensions in modules.
- Thin controllers with `#[Route]` attributes.
- Reusable `Bo*` TwigComponents, Bootstrap 5 form theme, Stimulus.
- Extending admin screens through the bundle's hook functions.

### Back-office (Smarty), legacy only

- Maintaining existing modules that still render Smarty admin templates.
- Not recommended for new development; plan migration to the `default-twig` conventions.

## Comparison: displaying a product list

**Front-office (Twig):**

```twig
{% set products = resources('/api/front/products', {
    'productCategories.category.id': categoryId,
    'visible': true
}) %}

<div class="products">
    {% for product in products %}
        <article class="product-card">
            <h2>{{ product.i18ns.title }}</h2>
            <p class="price">{{ product.productSaleElements[0].productPrices[0].price|number_format(2) }} EUR</p>
            <a href="{{ product.publicUrl }}">View</a>
        </article>
    {% endfor %}
</div>
```

**Legacy back-office (Smarty):**

```smarty
{loop name="products" type="product" category=$category_id visible=1}
    <tr>
        <td>{$TITLE}</td>
        <td>{$PRICE|number_format:2} {$CURRENCY}</td>
        <td><a href="{url path="/admin/product/update/$ID"}">Edit</a></td>
    </tr>
{/loop}
```

## Learn more

- [Front-office development](../front-office/index.md): Twig + Flexy guide
- [Front-office data access](../front-office/data-access.md): `resources()` / `attr()`
- [LiveComponents](../front-office/live-components.md): building reactive UIs
- [Back-office development](../back-office/index.md): admin templates and hooks
- [Modules vs Bundles](./modules-vs-bundles.md): how themes are packaged
