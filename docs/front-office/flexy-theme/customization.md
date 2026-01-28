---
title: Customizing Flexy
sidebar_position: 2
---

# Customizing Flexy

This guide covers how to customize the Flexy theme for your project.

## Creating Your Custom Theme

The recommended approach is to **duplicate Flexy** and configure it as a local package. This allows you to fully customize the theme while still benefiting from Composer's dependency management.

### Step 1: Copy Flexy

Copy the Flexy theme to your templates directory with your custom name:

```bash
cp -r vendor/thelia/flexy templates/frontOffice/myCustomTheme
```

### Step 2: Update Theme's composer.json

Edit `templates/frontOffice/myCustomTheme/composer.json` and change the package name:

```json
{
    "name": "myCustomTheme/flexy",
    "description": "My Custom Flexy Theme for Thelia 3",
    "type": "thelia-frontoffice-template",
    ...
}
```

### Step 3: Add Repository to Root composer.json

In your project's root `composer.json`, add a path repository pointing to your theme:

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "templates/frontOffice/myCustomTheme/"
        }
    ],
    "require": {
        ...
        "myCustomTheme/flexy": "dev-main"
    }
}
```

### Step 4: Update Autoload

In the root `composer.json`, update the autoload section to point to your custom theme:

```json
{
    "autoload": {
        "psr-4": {
            "FlexyBundle\\": "templates/frontOffice/myCustomTheme/src/"
        }
    }
}
```

### Step 5: Install and Configure

Run Composer to install your custom theme:

```bash
composer update myCustomTheme/flexy
```

Then set your theme as the active front-office template:

```bash
php Thelia thelia:install --frontoffice_theme=myCustomTheme
```

Or via environment variable in `.env.local`:

```bash
ACTIVE_FRONT_TEMPLATE=myCustomTheme
```

## Customization Strategies

| Strategy | Use Case |
|----------|----------|
| **CSS/Tailwind overrides** | Colors, fonts, spacing |
| **Template overrides** | Layout changes, new sections |
| **Component overrides** | Modified behavior |
| **Full theme duplicate** | Major customizations |

## CSS Customization

### Tailwind Configuration

Edit `templates/frontOffice/myCustomTheme/tailwind.config.js`:

```javascript
module.exports = {
    content: [
        './templates/frontOffice/myCustomTheme/**/*.html.twig',
        './local/modules/**/templates/frontoffice/**/*.html.twig',
    ],
    theme: {
        extend: {
            colors: {
                // Brand colors
                'brand': {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                },
                // Theme colors
                'theme': {
                    'lighter': '#f8fafc',
                    'light': '#f1f5f9',
                    'DEFAULT': '#0ea5e9',
                    'dark': '#0369a1',
                },
            },
            fontFamily: {
                'sans': ['Inter', 'system-ui', 'sans-serif'],
                'heading': ['Montserrat', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
```

### Custom CSS

Edit `templates/frontOffice/myCustomTheme/assets/css/app.css`:

```css
/* Override theme variables */
:root {
    --color-primary: #0ea5e9;
    --color-primary-dark: #0369a1;
    --font-family-base: 'Inter', sans-serif;
    --font-family-heading: 'Montserrat', sans-serif;
}

/* Custom component styles */
.ProductCard {
    @apply rounded-xl shadow-lg hover:shadow-xl transition-shadow;
}

.btn-primary {
    @apply bg-brand-500 hover:bg-brand-600 text-white font-semibold
           py-2 px-4 rounded-lg transition-colors;
}
```

### Rebuild Assets

After CSS changes, rebuild the assets:

```bash
cd templates/frontOffice/myCustomTheme
npm install
npm run build
```

## Template Customization

Since you have a full copy of the theme, you can directly edit any template file:

```
templates/frontOffice/myCustomTheme/
├── base.html.twig           # Base layout
├── index.html.twig          # Homepage
├── product.html.twig        # Product page
├── category.html.twig       # Category page
├── components/
│   ├── Layout/
│   │   ├── Header/
│   │   │   └── Header.html.twig
│   │   └── Footer/
│   │       └── Footer.html.twig
│   └── Molecules/
│       └── ProductCard/
│           └── ProductCard.html.twig
└── src/
    └── UiComponents/        # LiveComponents
```

### Modify Page Templates

```twig
{# templates/frontOffice/myCustomTheme/product.html.twig #}
{% extends 'base.html.twig' %}

{% set productId = attr('product', 'id') %}
{% set product = resources('/api/front/products/' ~ productId) %}

{% block body %}
    {# Your custom product layout #}
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

### Modify Header

```twig
{# templates/frontOffice/myCustomTheme/components/Layout/Header/Header.html.twig #}
<header class="site-header">
    <div class="container">
        {# Custom logo #}
        <a href="{{ path('homepage') }}" class="logo">
            <img src="{{ asset('images/my-logo.svg') }}" alt="My Store">
        </a>

        {# Custom navigation #}
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

        {# Header actions #}
        <div class="header-actions">
            {{ component('Flexy:HeaderButton') }}
        </div>
    </div>
</header>
```

## LiveComponent Customization

### Modify Existing Components

Edit components in `templates/frontOffice/myCustomTheme/src/UiComponents/`:

```php
<?php
// templates/frontOffice/myCustomTheme/src/UiComponents/ProductCard/ProductCard.php

declare(strict_types=1);

namespace FlexyBundle\UiComponents\ProductCard;

use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\DefaultActionTrait;

#[AsLiveComponent(
    name: 'Flexy:ProductCard',
    template: '@UiComponents/ProductCard/ProductCard.html.twig'
)]
class ProductCard
{
    use DefaultActionTrait;

    #[LiveProp]
    public array $product;

    // Add custom properties
    #[LiveProp]
    public bool $showQuickView = true;

    #[LiveProp]
    public bool $showWishlist = false;
}
```

### Add New Components

Create new components in your theme:

```php
<?php
// templates/frontOffice/myCustomTheme/src/UiComponents/Newsletter/Newsletter.php

declare(strict_types=1);

namespace FlexyBundle\UiComponents\Newsletter;

use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\DefaultActionTrait;

#[AsLiveComponent(
    name: 'Flexy:Newsletter',
    template: '@UiComponents/Newsletter/Newsletter.html.twig'
)]
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
        // Subscribe logic
        $this->submitted = true;
    }
}
```

## JavaScript Customization

### Add Stimulus Controllers

Create controllers in `templates/frontOffice/myCustomTheme/assets/controllers/`:

```javascript
// quick_view_controller.js
import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['modal', 'content'];

    async open(event) {
        const productId = event.currentTarget.dataset.productId;
        const response = await fetch(`/quick-view/${productId}`);
        const html = await response.text();

        this.contentTarget.innerHTML = html;
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

## Adding Product Features

### Product Badges

```twig
{# In ProductCard template #}
<div class="product-card">
    <div class="product-badges">
        {% if product.newProduct %}
            <span class="badge badge-new">New</span>
        {% endif %}
        {% if product.promo %}
            <span class="badge badge-sale">
                -{{ product.promoPercent }}%
            </span>
        {% endif %}
        {% if product.quantity <= 5 and product.quantity > 0 %}
            <span class="badge badge-low">Low Stock</span>
        {% endif %}
    </div>
    {# Rest of card... #}
</div>
```

### Custom Product Sections

```twig
{# product.html.twig #}
{% block body %}
    {{ component('Flexy:Pages:Product', {product: product}) }}

    {# Specifications #}
    <section class="product-specs">
        <h2>Specifications</h2>
        {% for feature in product.featureProducts %}
            <dl>
                <dt>{{ feature.feature.i18ns.title }}</dt>
                <dd>{{ feature.featureAv.i18ns.title }}</dd>
            </dl>
        {% endfor %}
    </section>

    {# Related products #}
    <section class="related-products">
        <h2>You might also like</h2>
        {% set related = resources('/api/front/products', {
            'productCategories.category.id': product.productCategories[0].category.id,
            'id[not_in]': product.id,
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

## Form Customization

### Custom Form Theme

Create `templates/frontOffice/myCustomTheme/form/form_theme.html.twig`:

```twig
{% use 'form_div_layout.html.twig' %}

{% block form_row %}
    <div class="form-group {{ errors|length ? 'has-error' : '' }}">
        {{ form_label(form) }}
        {{ form_widget(form) }}
        {{ form_errors(form) }}
        {% if help %}
            <small class="form-help">{{ help }}</small>
        {% endif %}
    </div>
{% endblock %}

{% block button_widget %}
    <button {{ block('button_attributes') }}
            class="btn {{ attr.class|default('btn-primary') }}">
        {{ label|trans }}
    </button>
{% endblock %}
```

## Best Practices

1. **Version control your theme** - Track all changes in git
2. **Document customizations** - Add comments explaining changes
3. **Use CSS variables** - Easier to maintain and override
4. **Keep component changes minimal** - Override only what you need
5. **Test after Thelia updates** - Check compatibility with core updates

## Next Steps

- [Creating a Theme](./creating-theme) - Build completely from scratch
- [LiveComponents](/docs/front-office/live-components) - Component documentation
- [Modules](/docs/modules/) - Packaging additional customizations
