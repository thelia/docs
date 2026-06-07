---
title: Customizing Flexy
sidebar_position: 2
---

# Customizing Flexy

This guide covers how to customize the Flexy theme for your project. Flexy is a Symfony bundle (`FlexyBundle\`), so you customize it the way you customize any bundle-based theme: clone it, register it as a Composer path repository, and activate it.

## Creating Your Custom Theme

The recommended approach is to **clone the `thelia-templates/flexy` repository** into your project and declare it as a Composer **path repository**. You keep the upstream git history (so you can pull future Flexy updates), and Composer installs your local copy instead of the published package.

### Step 1: Clone Flexy into your templates directory

```bash
git clone https://github.com/thelia/Flexy.git templates/frontOffice/myCustomTheme
```

The Flexy `composer.json` declares the package name `thelia/flexy`, the PSR-4 root `FlexyBundle\` and the Twig component `name_prefix: Flexy`. Those identifiers are global. **If you keep both the original Flexy and your copy installed at the same time, they collide.** See the caution below before going further.

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

:::caution Namespace and component-prefix collisions
Flexy registers three project-global identifiers:

- the Composer package name `thelia/flexy` (`composer.json`)
- the PSR-4 namespace root `FlexyBundle\` (`composer.json`, `autoload.psr-4`)
- the Twig component name prefix `Flexy` (`config/packages/twig_component.yaml`, under `FlexyBundle\UiComponents\`)

If you install your copy **alongside** the original Flexy, both register `FlexyBundle\` and the `Flexy:` Twig component prefix. Symfony will load one class definition over the other and component names like `Flexy:ProductCard` become ambiguous.

To run both side by side, rename them in your copy:

1. In `composer.json`, change the package `name` and the `autoload.psr-4` root (for example `MyThemeBundle\`).
2. Rename the `FlexyBundle\` namespace in every PHP file under `src/` to your new root.
3. In `config/packages/twig_component.yaml`, change the `name_prefix` and the namespace key:

```yaml
# templates/frontOffice/myCustomTheme/config/packages/twig_component.yaml
twig_component:
    anonymous_template_directory: 'frontOffice/%thelia_front_template%/components/'
    defaults:
        MyThemeBundle\UiComponents\:
            name_prefix: MyTheme
            template_directory: '%kernel.project_dir%/templates/frontOffice/%thelia_front_template%/src/UiComponents'
```

4. Update every `{{ component('Flexy:...') }}` call in your templates to the new prefix.

If you only need **one** active front-office theme (the common case), you do not have to rename anything: keep `FlexyBundle\` and `Flexy:` and simply do not require the upstream `thelia/flexy` package at the same time.
:::

## Customization Strategies

| Strategy | Use Case |
|----------|----------|
| **CSS/Tailwind overrides** | Colors, fonts, spacing |
| **Template overrides** | Layout changes, new sections |
| **Component overrides** | Modified behavior |
| **Full theme clone** | Major customizations |

## CSS Customization

### Tailwind Configuration

Flexy's `tailwind.config.js` scans the bundle's own files. The real `content` globs are relative to the theme directory:

```javascript
// templates/frontOffice/myCustomTheme/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './components/**/*.{twig,ts,js,json}',
        './src/UiComponents/**/*.{twig,ts,js,json}',
        './form/**/*.twig',
        './*.twig',
    ],
    theme: {
        extend: {
            colors: {
                // Flexy maps Tailwind colors to CSS variables.
                // Override the variables in your CSS (see below), or add new colors here.
                'brand': {
                    50: '#f0f9ff',
                    500: '#0ea5e9',
                    700: '#0369a1',
                },
            },
        },
    },
    plugins: [],
};
```

:::note
Flexy's default theme colors (`theme`, `theme-dark`, `grey`, `error`, ...) are defined as `var(--...)` CSS variables, not hard-coded hex values. The cleanest way to re-skin Flexy is to override those CSS variables in your stylesheet rather than rewriting the Tailwind palette.
:::

### Custom CSS

Edit the theme stylesheets under `templates/frontOffice/myCustomTheme/assets/css/`:

```css
/* templates/frontOffice/myCustomTheme/assets/css/app.css */

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

### Rebuild Assets

Flexy uses Webpack Encore. After CSS or JS changes, rebuild the assets from the theme directory:

```bash
cd templates/frontOffice/myCustomTheme
npm install
npm run build
```

:::note Output directory is `dist/`
Flexy's `webpack.config.js` sets the output path to `dist/` (not `public/build/`). The compiled assets are served from `/templates-assets/frontOffice/<theme>/dist`. Reference the placeholder image as `asset('dist/images/placeholder.webp')`, as the core components do.
:::

## Template Customization

Since you have a full clone of the theme, you can directly edit any template file. The real Flexy layout is:

```
templates/frontOffice/myCustomTheme/
├── base.html.twig            # Base layout
├── index.html.twig           # Homepage
├── product.html.twig         # Product page
├── category.html.twig        # Category page
├── components/               # Anonymous Twig components (atoms / molecules / organisms)
│   ├── Layout/
│   │   ├── Header/
│   │   │   └── Header.html.twig
│   │   └── Footer/
│   └── Organisms/
│       └── CategoryCard/
│           └── CategoryCard.html.twig
└── src/
    └── UiComponents/         # Twig / Live components (PHP + template)
        ├── ProductCard/
        ├── CrossSelling/
        └── Pages/
            └── Product/
```

### Modify Page Templates

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
            {{ component('Flexy:Pages:Product', {product: product}) }}
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

### Modify the Header

Categories and products are linked through their **rewritten URLs**, not through route-name-with-id helpers. The API resource exposes a `publicUrl` field (`Category::getPublicUrl()`, `Product::getPublicUrl()`, serialized in the `front:*:read` group). The homepage route is named `index`.

```twig
{# templates/frontOffice/myCustomTheme/components/Layout/Header/Header.html.twig #}
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
        {{ include('@components/Organisms/HeaderNav/HeaderNav.html.twig') }}
    </div>
</header>
```

:::caution Do not build catalog links from route + id
There is no `product_show` or `category` route taking an `{id}`. Catalog pages are served from SEO-friendly rewritten URLs. Always render a category or product link from its `publicUrl` field. For a ready-made card, feed the resource to the `CategoryCard` organism, which reads `category.publicUrl` internally:

```twig
{{ include('@components/Organisms/CategoryCard/CategoryCard.html.twig', {
    category: category,
    id: category.id
}) }}
```
:::

## Component Customization

Flexy ships two kinds of server-rendered components under `src/UiComponents/`:

- **Twig components** (`#[AsTwigComponent]`) — stateless, rendered once. Example: `ProductCard`, `CrossSelling`.
- **Live components** (`#[AsLiveComponent]`) — reactive, can re-render on user interaction. Example: `Pages\Product`, `CategoryFilters`.

### Modify an Existing Component

`ProductCard` is a Twig component. It accepts either a `productId` (it then fetches the product itself) or a `product` (a `ProductDTO` or a raw array). Here is its real signature:

```php
<?php
// templates/frontOffice/myCustomTheme/src/UiComponents/ProductCard/ProductCard.php

declare(strict_types=1);

namespace FlexyBundle\UiComponents\ProductCard;

use FlexyBundle\DTO\ProductDTO;
use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;
use Symfony\UX\TwigComponent\Attribute\PreMount;
use Thelia\Api\Service\DataAccess\DataAccessService;
use Thelia\Domain\Taxation\TaxEngine\TaxEngine;

#[AsTwigComponent(name: 'Flexy:ProductCard', template: '@UiComponents/ProductCard/ProductCard.html.twig')]
class ProductCard
{
    public ?int $productId = null;

    public function __construct(
        private readonly DataAccessService $dataAccessService,
        private TaxEngine $taxEngine,
    ) {
    }

    #[PreMount]
    public function preMount(?array $data): void
    {
        if (isset($data['productId']) && $data['productId']) {
            $this->productId = $data['productId'];
        }
    }

    public function mount(ProductDTO|array|null $product = null): void
    {
        // Resolves the product from $product (DTO or array) or from $productId.
    }
}
```

To customize it, edit the file in your theme: add helper methods, change the price logic, or edit the template at `src/UiComponents/ProductCard/ProductCard.html.twig`.

:::caution
`ProductCard` is a Twig component (`#[AsTwigComponent]`), **not** a Live component, and its data property is a typed `ProductDTO` (resolved in `mount()`), not a public `array $product` LiveProp. If you need reactivity (a property writable from the browser that triggers a re-render), create a Live component instead.
:::

### Add a New Live Component

Create reactive components under `src/UiComponents/`. The Twig component prefix is `Flexy` (from `twig_component.yaml`), and the template directory resolves to `src/UiComponents`:

```php
<?php
// templates/frontOffice/myCustomTheme/src/UiComponents/Newsletter/Newsletter.php

declare(strict_types=1);

namespace FlexyBundle\UiComponents\Newsletter;

use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\DefaultActionTrait;

#[AsLiveComponent(name: 'Flexy:Newsletter', template: '@UiComponents/Newsletter/Newsletter.html.twig')]
class Newsletter
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

See [Live Components](/docs/front-office/live-components) for the full reference.

## JavaScript Customization

### Add Stimulus Controllers

Flexy enables the Stimulus bridge in `webpack.config.js`. Add controllers under `templates/frontOffice/myCustomTheme/assets/controllers/`:

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

### Use in Templates

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

## Adding Product Sections

### Related Products

Use the `Flexy:ProductCard` Twig component to render a grid of products. To exclude the current product, use the `not_in` filter exposed by the API resource.

```twig
{# product.html.twig #}
{% block body %}
    {{ component('Flexy:Pages:Product', {product: product}) }}

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
                {{ component('Flexy:ProductCard', {product: p}) }}
            {% endfor %}
        </div>
    </section>
{% endblock %}
```

:::caution NotInFilter syntax
The Thelia `NotInFilter` is keyed `not_in[<property>]` and expects an **array** of values, for example `'not_in[id]': [product.id]`. This matches the core `Flexy:CrossSelling` component, which queries `'not_in[id]' => $this->productIdsToIgnore`. The reverse form `id[not_in]` is **not** supported and will be ignored.
:::

`Flexy:ProductCard` accepts a `product` (a `ProductDTO` or a raw array) — both are handled by its `mount()` method — or a `productId` if you only have the id.

## Form Customization

Flexy ships a form theme at `form/flexy_form_theme.html.twig`. To customize form rendering in your theme, edit that file (or create your own and register it). It overrides the standard Symfony form blocks:

```twig
{# templates/frontOffice/myCustomTheme/form/flexy_form_theme.html.twig #}
{% use 'form_div_layout.html.twig' %}

{% block form_row %}
    <div class="form-group {{ errors|length ? 'has-error' : '' }}">
        {{ form_label(form) }}
        {{ form_widget(form) }}
        {{ form_errors(form) }}
    </div>
{% endblock %}
```

See [Forms](/docs/front-office/forms) for the front-office form workflow.

## Best Practices

1. **Version control your theme** — you cloned a git repository; keep committing.
2. **Override CSS variables** rather than rewriting the Tailwind palette.
3. **Link catalog pages via `publicUrl`**, never via a route + id.
4. **Keep component changes minimal** — override only what you need.
5. **Rebuild assets** (`npm run build`) after every CSS/JS change.
6. **Test after Thelia updates** — pull upstream Flexy, then re-test.

## Learn More

- [Creating a Theme](./creating-theme) — Build a theme from scratch
- [Live Components](/docs/front-office/live-components) — Reactive component reference
- [Data Access](/docs/front-office/data-access) — Fetching data with `resources()` and `attr()`
- [Stimulus](/docs/front-office/stimulus) — Front-office JavaScript controllers
- [Modules](/docs/modules/) — Packaging additional customizations
