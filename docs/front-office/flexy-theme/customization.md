---
title: Customizing Flexy
sidebar_position: 2
---

# Customizing Flexy

This guide covers how to customize the Flexy theme for your project. Flexy is a Symfony bundle (`FlexyBundle\`), so you customize it the way you customize any bundle-based theme: clone it, register it as a Composer path repository, and activate it.

## Creating your custom theme

The recommended approach is to clone the `thelia-templates/flexy` repository into your project and declare it as a Composer path repository. You keep the upstream git history (so you can pull future Flexy updates), and Composer installs your local copy instead of the published package.

### Step 1: Clone Flexy into your templates directory

```bash
git clone https://github.com/thelia-templates/flexy.git templates/frontOffice/myCustomTheme
```

The Flexy `composer.json` declares the package name `thelia/flexy`, the PSR-4 root `FlexyBundle\` and the Twig component `name_prefix: Flexy`. Those identifiers are global. If you keep both the original Flexy and your copy installed at the same time, they collide. See the caution below before going further.

### Step 2: Add a path repository to the root composer.json

In your project's root `composer.json`, point a `path` repository at your clone:

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "templates/frontOffice/myCustomTheme/",
            "options": {
                "symlink": false
            }
        }
    ]
}
```

A `path` repository with `"symlink": false` copies the directory into `vendor/`, so your edits in `templates/frontOffice/myCustomTheme/` are the source of truth and Composer mirrors them on install/update.

### Step 3: Activate the theme

Set your theme as the active front-office template via the environment variable in `.env.local`:

```bash
# .env.local
ACTIVE_FRONT_TEMPLATE=myCustomTheme
```

Or pass it to the installer when you (re)install:

```bash
php Thelia thelia:install --frontoffice_theme=myCustomTheme
```

:::caution Namespace and component-name collisions
Flexy registers three project-global identifiers:

- the Composer package name `thelia/flexy` (`composer.json`)
- the PSR-4 roots `FlexyBundle\` (on `src/`) and `FlexyBundle\Components\` (on `components/`)
- the Twig namespaces `@Flexy` and `@FlexyForm`

Component names carry no prefix at all: Flexy sets `name_prefix: ''`, so a component is named after
its class path under `FlexyBundle\Components\`. `Organisms:ProductCard:Base` is one name in the
project, whichever theme declares it.

If you install your copy alongside the original Flexy, both register the same PSR-4 roots, the same
Twig namespaces and the same component names. Symfony loads one class definition over the other.

To run both side by side, rename them in your copy:

1. In `composer.json`, change the package `name` and both `autoload.psr-4` roots (for example `MyThemeBundle\` and `MyThemeBundle\Components\`).
2. Rename the `FlexyBundle\` namespace in every PHP file under `src/` and `components/`.
3. In your bundle class, change the Twig namespaces and the `twig_component` defaults key:

```php
// templates/frontOffice/myCustomTheme/src/MyThemeBundle.php
$builder->prependExtensionConfig('twig', [
    'paths' => [
        \dirname(__DIR__).'/components' => 'MyTheme',
        \dirname(__DIR__).'/form' => 'MyThemeForm',
    ],
]);

$builder->prependExtensionConfig('twig_component', [
    'anonymous_template_directory' => 'frontOffice/%thelia_front_template%/components/',
    'defaults' => [
        'MyThemeBundle\\Components\\' => [
            'template_directory' => '@MyTheme',
            'name_prefix' => 'MyTheme',
        ],
    ],
]);
```

4. Update the component calls in your templates to the prefix you chose (`<twig:MyTheme:Organisms:ProductCard:Base />`).

If you only need one active front-office theme (the common case), you do not have to rename anything: keep the Flexy identifiers, and do not require the upstream `thelia/flexy` package at the same time.
:::

## Customization strategies

| Strategy | Use case |
|----------|----------|
| CSS/Tailwind overrides | Colors, fonts, spacing |
| Template overrides | Layout changes, new sections |
| Component overrides | Modified behavior |
| Full theme clone | Major customizations |

## CSS customization

### Tailwind configuration

Tailwind v4 is CSS-first: there is no `tailwind.config.js`. `assets/styles/app.css` is the
configuration, and it lists the directories Tailwind scans with `@source`. They are spelled out
because the theme directory is git-ignored from the project root, which makes Tailwind's automatic
source detection skip it:

```css
/* templates/frontOffice/myCustomTheme/assets/styles/app.css */
@import "tailwindcss";

@source "../../components";
@source "../../partials";
@source "../../*.html.twig";
@source "../../form";
@source "../../blocks";
```

:::note
Flexy's default theme colors (`theme`, `theme-dark`, `grey`, `error`, ...) are defined as `var(--...)` CSS variables, not hard-coded hex values. The cleanest way to re-skin Flexy is to override those CSS variables in your stylesheet rather than rewriting the Tailwind palette.
:::

### Custom CSS

Edit the theme stylesheets under `templates/frontOffice/myCustomTheme/assets/styles/`. Component CSS
lives next to the component it styles, and `app.css` imports it.

```css
/* templates/frontOffice/myCustomTheme/assets/styles/variables.css */

/* Override Flexy theme variables */
:root {
    --theme: #0ea5e9;
    --theme-dark: #0369a1;
    --theme-light: #7dd3fc;
}

/* Custom component styles */
.ProductCard {
    @apply rounded-xl shadow-lg hover:shadow-xl transition-shadow;
}
```

### Rebuild assets

Flexy is served through Symfony AssetMapper. There is no bundler and no Node build: a change to a
Twig template, a Stimulus controller, an image or an icon is live on the next request. Only the
Tailwind stylesheet is compiled, by `symfonycasts/tailwind-bundle`:

```bash
php Thelia tailwind:build            # once
php Thelia tailwind:build --watch    # while you work on the CSS
```

The bundle downloads a standalone Tailwind binary on first use, so nothing has to be installed
beforehand.

Two other commands matter after a `composer update`, which reinstalls the theme package and wipes
what it had compiled:

```bash
php Thelia importmap:install    # restore the JavaScript dependencies in assets/vendor
php Thelia tailwind:build
```

`bin/install` runs both at the end of a fresh install, so a new project needs neither.

:::note Referencing an asset
Files under the theme's `assets/` are addressed by their path inside that directory:
`asset('styles/app.css')`, `asset('favicons/favicon.svg')`. There is no `dist/` prefix and no
`dist/` directory, and `template.xml` declares no `<assets>` tag.
:::

## Template customization

Since you have a full clone of the theme, you can directly edit any template file. The real Flexy layout is:

```
templates/frontOffice/myCustomTheme/
├── base.html.twig            # Base layout
├── index.html.twig           # Homepage
├── product.html.twig         # Product page
├── category.html.twig        # Category page
├── components/               # Every component, PHP-backed or anonymous (namespace @Flexy)
│   ├── Layouts/
│   │   ├── Header/
│   │   │   ├── Base.php
│   │   │   └── Base.html.twig
│   │   └── Footer/
│   ├── Molecules/
│   └── Organisms/
│       └── ProductCard/
│           ├── Base.php
│           ├── Base.css
│           └── Base.html.twig
└── src/                      # Bundle class, controllers, DTOs, services
```

A component is a directory holding its PHP class, its Twig template, its CSS and, when it needs one,
its Stimulus controller. Anonymous components (no PHP class) sit in the same tree, template only.

### Modify page templates

```twig
{# templates/frontOffice/myCustomTheme/product.html.twig #}
{% extends 'base.html.twig' %}

{% set productId = attr('product', 'id') %}
{% set product = resources('/api/front/products/' ~ productId) %}

{% block body %}
    <div class="custom-product-layout">
        <div class="product-gallery">
            {# Custom gallery #}
        </div>

        <div class="product-info">
            <twig:Layouts:ProductDetails:Base :product="product" />
        </div>

        {# Custom sections #}
        <div class="product-reviews">
            {{ component('MyModule:ProductReviews', {productId: product.id}) }}
        </div>
    </div>
{% endblock %}
```

:::tip
`attr('product', 'id')` reads an attribute set by the controller (it takes the type and the attribute name), and `resources('/api/front/...')` calls the API resource through the `DataAccessService`. See [Data Access](/docs/front-office/data-access) for the full reference.
:::

### Modify the header

Categories and products are linked through their rewritten URLs, not through route-name-with-id helpers. The API resource exposes a `publicUrl` field (`Category::getPublicUrl()`, `Product::getPublicUrl()`, serialized in the `front:*:read` group). The homepage route is named `index`.

```twig
{# templates/frontOffice/myCustomTheme/components/Layouts/Header/Base.html.twig #}
<header class="site-header">
    <div class="container">
        {# Logo points to the homepage #}
        <a href="{{ path('index') }}" class="logo">
            <img src="{{ asset('images/my-logo.svg') }}" alt="My Store">
        </a>

        {# Top-level categories #}
        <nav class="main-nav">
            {% set categories = resources('/api/front/categories', {
                parent: 0,
                visible: true
            }) %}
            <ul>
                {% for category in categories %}
                    <li>
                        <a href="{{ category.publicUrl }}">
                            {{ category.i18ns.title }}
                        </a>
                    </li>
                {% endfor %}
            </ul>
        </nav>

        {# Cart / account actions #}
        <twig:Organisms:HeaderNav:Base />
    </div>
</header>
```

:::caution Do not build catalog links from route + id
There is no `product_show` or `category` route taking an `{id}`. Catalog pages are served from SEO-friendly rewritten URLs. Always render a category or product link from its `publicUrl` field. For a ready-made card, pass that URL to the `CategoryCard` organism:

```twig
<twig:Organisms:CategoryCard:Base
    id="{{ category.id }}"
    title="{{ category.i18ns.title }}"
    href="{{ category.publicUrl }}"
/>
```
:::

## Component customization

Flexy ships two kinds of server-rendered components under `components/`:

- Twig components (`#[AsTwigComponent]`) are stateless and rendered once. Example: `Organisms:ProductCard:Base`, `Layouts:CrossSelling:Base`.
- Live components (`#[AsLiveComponent]`) are reactive and can re-render on user interaction. Example: `Layouts:ProductDetails:Base`, `Layouts:ProductListing:Base`.

### Modify an existing component

`Organisms:ProductCard:Base` is a Twig component. It accepts either a `productId` (it then fetches the product itself) or a `product` (a `ProductDTO` or a raw array). Here is its real signature:

```php
<?php
// templates/frontOffice/myCustomTheme/components/Organisms/ProductCard/Base.php

declare(strict_types=1);

namespace FlexyBundle\Components\Organisms\ProductCard;

use FlexyBundle\DTO\ProductDTO;
use FlexyBundle\Service\ProductImageResolver;
use FlexyBundle\Service\ProductTaxationResolver;
use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;
use Symfony\UX\TwigComponent\Attribute\PreMount;
use Thelia\Api\Service\DataAccess\DataAccessService;

#[AsTwigComponent]
class Base extends AbstractProductCard
{
    public ?int $productId = null;

    public function __construct(
        DataAccessService $dataAccessService,
        ProductImageResolver $productImageResolver,
        private readonly ProductTaxationResolver $productTaxationResolver,
    ) {
        parent::__construct($dataAccessService, $productImageResolver);
    }

    #[PreMount]
    public function preMount(?array $data): void
    {
        if (isset($data['productId']) && $data['productId']) {
            $this->productId = (int) $data['productId'];
        }
    }

    public function mount(ProductDTO|array|null $product = null): void
    {
        // Resolves the product from $product (DTO or array) or from $productId.
    }
}
```

To customize it, edit the file in your theme: add helper methods, change the price logic, or edit the template next to it, `components/Organisms/ProductCard/Base.html.twig`.

:::caution
`Organisms:ProductCard:Base` is a Twig component (`#[AsTwigComponent]`), not a Live component, and its data property is a typed `ProductDTO` (resolved in `mount()`), not a public `array $product` LiveProp. If you need reactivity (a property writable from the browser that triggers a re-render), create a Live component instead.
:::

### Add a new Live component

Create reactive components under `components/`. The attribute stays bare: Flexy sets `name_prefix: ''`
and `template_directory: '@Flexy'`, so both the component name and its template are derived from the
class path.

```php
<?php
// templates/frontOffice/myCustomTheme/components/Organisms/Newsletter/Base.php

declare(strict_types=1);

namespace FlexyBundle\Components\Organisms\Newsletter;

use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\DefaultActionTrait;

#[AsLiveComponent]
class Base
{
    use DefaultActionTrait;

    #[LiveProp(writable: true)]
    public string $email = '';

    #[LiveProp]
    public bool $submitted = false;

    #[LiveAction]
    public function subscribe(): void
    {
        // Subscribe logic.
        $this->submitted = true;
    }
}
```

Its template is `components/Organisms/Newsletter/Base.html.twig`, and it renders as
`<twig:Organisms:Newsletter:Base />`.

See [Live Components](/docs/front-office/live-components) for the full reference.

## JavaScript customization

### Add Stimulus controllers

The theme registers `assets/controllers/` and `components/` as Stimulus controller paths. Drop a
controller in either and it is picked up, with no build step. Add controllers under
`templates/frontOffice/myCustomTheme/assets/controllers/`:

```javascript
// templates/frontOffice/myCustomTheme/assets/controllers/quick_view_controller.js
import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['modal', 'content'];

    async open(event) {
        const productId = event.currentTarget.dataset.productId;
        const response = await fetch(`/quick-view/${productId}`);
        this.contentTarget.innerHTML = await response.text();
        this.modalTarget.classList.remove('hidden');
    }

    close() {
        this.modalTarget.classList.add('hidden');
    }
}
```

### Use in templates

```twig
<div data-controller="quick-view">
    <button data-action="quick-view#open"
            data-product-id="{{ product.id }}">
        Quick View
    </button>

    <div data-quick-view-target="modal" class="hidden modal">
        <div data-quick-view-target="content"></div>
        <button data-action="quick-view#close">Close</button>
    </div>
</div>
```

See [Stimulus](/docs/front-office/stimulus) for more.

## Adding product sections

### Related products

Use the `Organisms:ProductCard:Base` Twig component to render a grid of products. To exclude the current product, use the `not_in` filter exposed by the API resource.

```twig
{# product.html.twig #}
{% block body %}
    <twig:Layouts:ProductDetails:Base :product="product" />

    {# Related products in the same category #}
    <section class="related-products">
        <h2>You might also like</h2>
        {% set related = resources('/api/front/products', {
            'productCategories.category.id': product.productCategories[0].category.id,
            'not_in[id]': [product.id],
            'itemsPerPage': 4
        }) %}
        <div class="product-grid">
            {% for p in related %}
                <twig:Organisms:ProductCard:Base :product="p" />
            {% endfor %}
        </div>
    </section>
{% endblock %}
```

:::caution NotInFilter syntax
The Thelia `NotInFilter` is keyed `not_in[<property>]` and expects an array of values, for example `'not_in[id]': [product.id]`. This matches the `Layouts:CrossSelling:Base` component, which queries `'not_in[id]' => $this->productIdsToIgnore`. The reverse form `id[not_in]` is not supported and will be ignored.
:::

`Organisms:ProductCard:Base` accepts a `product` (a `ProductDTO` or a raw array), both handled by its `mount()` method, or a `productId` if you only have the id.

## Form customization

Flexy ships a form theme at `form/flexy_form_theme.html.twig`, reached as `@FlexyForm/flexy_form_theme.html.twig`. Each of its blocks delegates the markup to an anonymous component under `components/Fields/`, so restyling an input usually means editing the component rather than the theme:

```twig
{# templates/frontOffice/myCustomTheme/form/flexy_form_theme.html.twig #}
{% use 'form_div_layout.html.twig' %}

{# The widget components render their own label and error, so the row adds no wrapper #}
{%- block form_row -%}
    {{- form_widget(form) -}}
{%- endblock form_row -%}

{%- block form_widget_simple -%}
    {{ component('Fields:Input:Base', {
        label: label,
        name: full_name,
        id: id,
        type: type|default('text'),
        value: value,
        error: errors|first.message|default(false),
        required: required,
    }) }}
{%- endblock form_widget_simple -%}
```

Templates apply the theme explicitly, one form at a time:

```twig
{% form_theme form with flexy_form_themes only %}
```

See [Forms](/docs/front-office/forms) for the front-office form workflow.

## Best practices

1. Version control your theme. You cloned a git repository, so keep committing.
2. Override CSS variables rather than rewriting the Tailwind palette.
3. Link catalog pages via `publicUrl`, never via a route + id.
4. Keep component changes minimal: override only what you need.
5. Run `tailwind:build --watch` while you edit the CSS. Nothing else needs a build.
6. Test after Thelia updates. Pull upstream Flexy, then re-test.

## Learn more

- [Creating a Theme](./creating-theme): build a theme from scratch
- [Live Components](/docs/front-office/live-components): reactive component reference
- [Data Access](/docs/front-office/data-access): fetching data with `resources()` and `attr()`
- [Stimulus](/docs/front-office/stimulus): front-office JavaScript controllers
- [Modules](/docs/modules/): packaging additional customizations
