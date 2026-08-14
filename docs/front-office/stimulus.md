---
title: Stimulus Controllers
sidebar_position: 6
---

# Stimulus Controllers

Thelia 3 uses Stimulus for client-side JavaScript behavior. Stimulus connects JavaScript to DOM elements using data attributes.

:::tip Official Documentation
For complete Stimulus documentation, see [stimulus.hotwired.dev](https://stimulus.hotwired.dev/).
:::

## Twig helpers

Symfony UX provides Twig helpers for Stimulus:

```twig
{# Controller #}
<div {{ stimulus_controller('drawer') }}>

{# Controller with values #}
<div {{ stimulus_controller('gallery', {index: 0, autoplay: true}) }}>

{# Action #}
<button {{ stimulus_action('cart', 'add') }}>Add</button>
<input {{ stimulus_action('search', 'filter', 'input') }}>

{# Target #}
<div {{ stimulus_target('modal', 'content') }}>

{# Multiple controllers #}
<div {{ stimulus_controller('gallery')|stimulus_controller('lazy-load') }}>
```

## Flexy theme controllers

The Flexy theme includes several Stimulus controllers you can use directly:

| Controller | Purpose |
|------------|---------|
| `drawer` | Sidebar/modal panels |
| `modal` | Modal dialogs |
| `quantity` | Quantity input +/- |
| `header` | Header behavior |
| `filters` | Filter UI interactions |
| `product` | Product page interactions |
| `simple-slider` | Image slider |
| `tooltip` | Tooltip display |

Location: `templates/frontOffice/flexy/assets/controllers/`. A file named `*_controller.js` dropped
there is registered, with no build step. The theme declares the directories it scans from its
bundle class:

```php
// templates/frontOffice/flexy/src/FlexyBundle.php
$builder->prependExtensionConfig('stimulus', [
    'controller_paths' => [
        '%kernel.project_dir%/templates/frontOffice/%thelia_front_template%/assets/controllers',
        '%kernel.project_dir%/templates/frontOffice/%thelia_front_template%/components',
    ],
    'controllers_json' => '%kernel.project_dir%/templates/frontOffice/%thelia_front_template%/assets/controllers.json',
]);
```

`controller_paths` is a list, so a module can add its own directory to it. `controllers_json` is a
single value: it names the manifest that enables Symfony UX packages, and the theme owns it.
`php Thelia debug:config stimulus` prints the resolved paths.

:::note
The table above lists the most commonly used controllers. The Flexy theme ships around 20 controllers; the authoritative list is always the `assets/controllers/` folder of the theme bundle.
:::

### Usage example

```twig
{# Using Flexy's drawer controller #}
<div data-controller="drawer">
    <button data-action="drawer#toggle">Open Menu</button>

    <div data-drawer-target="overlay" class="hidden fixed inset-0 bg-black/50"
         data-action="click->drawer#hide"></div>

    <div data-drawer-target="panel" class="fixed right-0 top-0">
        <button data-action="drawer#hide">Close</button>
        <!-- Menu content -->
    </div>
</div>
```

## Integrating with LiveComponents

Stimulus works alongside LiveComponents for client-side animations and effects:

```twig
{# LiveComponent with Stimulus for UI animations #}
<div {{ attributes }}
     data-controller="animation"
     data-action="addToCart->animation#pulse">
    {{ component('Flexy:ProductCard', {product: product}) }}
</div>
```

### Listening to LiveComponent events

```javascript
// assets/controllers/cart_animation_controller.js
import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    connect() {
        document.addEventListener('addToCart', this.handleAddToCart.bind(this));
    }

    disconnect() {
        document.removeEventListener('addToCart', this.handleAddToCart.bind(this));
    }

    handleAddToCart(event) {
        const cartIcon = document.querySelector('[data-cart-icon]');
        cartIcon.classList.add('animate-bounce');
        setTimeout(() => cartIcon.classList.remove('animate-bounce'), 500);
    }
}
```

## Creating custom controllers

### 1. Create the controller

```javascript
// assets/controllers/my_controller.js
import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['output'];
    static values = { message: String };

    greet() {
        this.outputTarget.textContent = this.messageValue;
    }
}
```

### 2. Use in templates

```twig
<div data-controller="my" data-my-message-value="Hello!">
    <button data-action="my#greet">Greet</button>
    <p data-my-target="output"></p>
</div>
```

Stimulus automatically discovers controllers from `assets/controllers/` using naming conventions.

## Next steps

- [LiveComponents](./live-components) - Server-side reactivity
- [Flexy Theme](./flexy-theme/) - See controllers in action
