---
title: Stimulus Controllers
sidebar_position: 6
---

# Stimulus Controllers

**Stimulus** is a modest JavaScript framework that connects JavaScript behavior to DOM elements using data attributes. It's part of the Hotwire stack and works perfectly alongside LiveComponents.

## Overview

Stimulus provides:
- **Controllers**: JavaScript classes that add behavior to HTML elements
- **Targets**: References to important DOM elements within a controller
- **Values**: Typed data that can be read from data attributes
- **Actions**: Methods triggered by DOM events

## Basic Controller

### JavaScript Controller

```javascript
// assets/controllers/counter_controller.js
import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['count'];
    static values = {
        initial: { type: Number, default: 0 }
    };

    connect() {
        this.count = this.initialValue;
        this.render();
    }

    increment() {
        this.count++;
        this.render();
    }

    decrement() {
        this.count--;
        this.render();
    }

    render() {
        this.countTarget.textContent = this.count;
    }
}
```

### HTML Usage

```html
<div data-controller="counter" data-counter-initial-value="5">
    <button data-action="counter#decrement">-</button>
    <span data-counter-target="count">5</span>
    <button data-action="counter#increment">+</button>
</div>
```

### Twig Usage

```twig
<div {{ stimulus_controller('counter', {initial: 5}) }}>
    <button {{ stimulus_action('counter', 'decrement') }}>-</button>
    <span {{ stimulus_target('counter', 'count') }}>5</span>
    <button {{ stimulus_action('counter', 'increment') }}>+</button>
</div>
```

## Stimulus Helpers in Twig

### stimulus_controller

```twig
{# Basic controller #}
<div {{ stimulus_controller('drawer') }}>

{# With values #}
<div {{ stimulus_controller('gallery', {
    index: 0,
    autoplay: true,
    interval: 3000
}) }}>

{# Multiple controllers #}
<div {{ stimulus_controller('gallery')|stimulus_controller('lazy-load') }}>
```

### stimulus_action

```twig
{# Click event (default) #}
<button {{ stimulus_action('cart', 'add') }}>Add</button>

{# Specific event #}
<input {{ stimulus_action('search', 'filter', 'input') }}>
<form {{ stimulus_action('form', 'submit', 'submit') }}>

{# With parameters #}
<button {{ stimulus_action('cart', 'add', 'click', {
    productId: product.id
}) }}>Add</button>

{# Multiple actions #}
<button {{ stimulus_action('cart', 'add')|stimulus_action('analytics', 'track') }}>
```

### stimulus_target

```twig
{# Single target #}
<div {{ stimulus_target('modal', 'content') }}>

{# Multiple targets #}
<input {{ stimulus_target('form', 'input')|stimulus_target('validation', 'field') }}>
```

## Common Patterns

### Drawer/Modal Controller

```javascript
// assets/controllers/drawer_controller.js
import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['panel', 'overlay'];
    static classes = ['open'];
    static values = {
        open: { type: Boolean, default: false }
    };

    connect() {
        if (this.openValue) {
            this.show();
        }
    }

    toggle() {
        this.openValue ? this.hide() : this.show();
    }

    show() {
        this.openValue = true;
        this.panelTarget.classList.add(this.openClass);
        this.overlayTarget.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    }

    hide() {
        this.openValue = false;
        this.panelTarget.classList.remove(this.openClass);
        this.overlayTarget.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }

    // Close on Escape key
    closeOnEscape(event) {
        if (event.key === 'Escape' && this.openValue) {
            this.hide();
        }
    }
}
```

```twig
<div data-controller="drawer"
     data-action="keydown@window->drawer#closeOnEscape">
    <button data-action="drawer#toggle">Open Menu</button>

    <div data-drawer-target="overlay" class="hidden fixed inset-0 bg-black/50"
         data-action="click->drawer#hide"></div>

    <div data-drawer-target="panel" class="fixed right-0 top-0 h-full w-80 bg-white transform translate-x-full transition-transform"
         data-drawer-open-class="translate-x-0">
        <button data-action="drawer#hide">Close</button>
        <!-- Menu content -->
    </div>
</div>
```

### Gallery Controller

```javascript
// assets/controllers/gallery_controller.js
import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['slide', 'thumbnail', 'counter'];
    static values = {
        index: { type: Number, default: 0 }
    };

    connect() {
        this.showSlide(this.indexValue);
    }

    next() {
        const nextIndex = (this.indexValue + 1) % this.slideTargets.length;
        this.showSlide(nextIndex);
    }

    previous() {
        const prevIndex = (this.indexValue - 1 + this.slideTargets.length) % this.slideTargets.length;
        this.showSlide(prevIndex);
    }

    goTo(event) {
        const index = parseInt(event.currentTarget.dataset.index);
        this.showSlide(index);
    }

    showSlide(index) {
        this.indexValue = index;

        this.slideTargets.forEach((slide, i) => {
            slide.classList.toggle('hidden', i !== index);
        });

        this.thumbnailTargets.forEach((thumb, i) => {
            thumb.classList.toggle('ring-2', i === index);
        });

        if (this.hasCounterTarget) {
            this.counterTarget.textContent = `${index + 1} / ${this.slideTargets.length}`;
        }
    }
}
```

```twig
<div data-controller="gallery" data-gallery-index-value="0">
    <div class="relative">
        {% for image in images %}
            <img data-gallery-target="slide"
                 src="{{ image.url }}"
                 class="{{ loop.first ? '' : 'hidden' }}">
        {% endfor %}

        <button data-action="gallery#previous" class="absolute left-0 top-1/2">←</button>
        <button data-action="gallery#next" class="absolute right-0 top-1/2">→</button>
    </div>

    <div class="flex gap-2 mt-4">
        {% for image in images %}
            <img data-gallery-target="thumbnail"
                 data-action="click->gallery#goTo"
                 data-index="{{ loop.index0 }}"
                 src="{{ image.thumbnailUrl }}"
                 class="w-20 h-20 cursor-pointer {{ loop.first ? 'ring-2' : '' }}">
        {% endfor %}
    </div>

    <p data-gallery-target="counter">1 / {{ images|length }}</p>
</div>
```

### Form Validation Controller

```javascript
// assets/controllers/form_validation_controller.js
import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['input', 'error', 'submit'];

    connect() {
        this.validate();
    }

    validate() {
        let isValid = true;

        this.inputTargets.forEach(input => {
            const error = this.findError(input);

            if (!input.checkValidity()) {
                isValid = false;
                input.classList.add('border-red-500');
                if (error) {
                    error.textContent = input.validationMessage;
                    error.classList.remove('hidden');
                }
            } else {
                input.classList.remove('border-red-500');
                if (error) {
                    error.classList.add('hidden');
                }
            }
        });

        if (this.hasSubmitTarget) {
            this.submitTarget.disabled = !isValid;
        }
    }

    findError(input) {
        const errorId = input.dataset.errorTarget;
        return errorId ? document.getElementById(errorId) : null;
    }
}
```

### Async Loading Controller

```javascript
// assets/controllers/async_content_controller.js
import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['content', 'loading'];
    static values = {
        url: String,
        loaded: { type: Boolean, default: false }
    };

    connect() {
        if (this.urlValue && !this.loadedValue) {
            this.load();
        }
    }

    async load() {
        if (this.hasLoadingTarget) {
            this.loadingTarget.classList.remove('hidden');
        }

        try {
            const response = await fetch(this.urlValue);
            const html = await response.text();
            this.contentTarget.innerHTML = html;
            this.loadedValue = true;
        } catch (error) {
            this.contentTarget.innerHTML = '<p>Error loading content</p>';
        } finally {
            if (this.hasLoadingTarget) {
                this.loadingTarget.classList.add('hidden');
            }
        }
    }
}
```

## Integrating with LiveComponents

Stimulus can complement LiveComponents for client-side interactions:

```twig
{# LiveComponent with Stimulus for UI animations #}
<div {{ attributes }}
     data-controller="animation"
     data-action="addToCart->animation#pulse">

    {# LiveComponent handles data/server logic #}
    {{ component('Flexy:ProductCard', {product: product}) }}
</div>
```

### Listening to LiveComponent Events

```javascript
// assets/controllers/cart_animation_controller.js
import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    connect() {
        // Listen for LiveComponent events
        document.addEventListener('addToCart', this.handleAddToCart.bind(this));
    }

    disconnect() {
        document.removeEventListener('addToCart', this.handleAddToCart.bind(this));
    }

    handleAddToCart(event) {
        // Animate cart icon
        const cartIcon = document.querySelector('[data-cart-icon]');
        cartIcon.classList.add('animate-bounce');
        setTimeout(() => cartIcon.classList.remove('animate-bounce'), 500);
    }
}
```

## Flexy Theme Controllers

The Flexy theme includes several Stimulus controllers:

| Controller | Purpose |
|------------|---------|
| `drawer` | Sidebar/modal panels |
| `dropdown` | Dropdown menus |
| `tabs` | Tab navigation |
| `accordion` | Collapsible sections |
| `gallery` | Image galleries |
| `quantity` | Quantity input +/- |

Location: `vendor/thelia/flexy/assets/controllers/`

## Creating Custom Controllers

### 1. Create Controller File

```javascript
// assets/controllers/my_controller.js
import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['output'];
    static values = {
        message: String
    };

    greet() {
        this.outputTarget.textContent = this.messageValue;
    }
}
```

### 2. Register in controllers.json

```json
// assets/controllers.json
{
    "controllers": {
        "@symfony/stimulus-bundle": {
            "enabled": true
        }
    }
}
```

Stimulus automatically loads controllers from `assets/controllers/` using the naming convention.

### 3. Use in Templates

```twig
<div data-controller="my" data-my-message-value="Hello World!">
    <button data-action="my#greet">Greet</button>
    <p data-my-target="output"></p>
</div>
```

## Best Practices

### 1. Keep Controllers Small

```javascript
// Good - focused controller
export default class extends Controller {
    toggle() {
        this.element.classList.toggle('open');
    }
}

// Avoid - too many responsibilities
export default class extends Controller {
    toggle() { /* ... */ }
    validate() { /* ... */ }
    submit() { /* ... */ }
    animate() { /* ... */ }
    // ...
}
```

### 2. Use CSS Classes for State

```javascript
static classes = ['active', 'loading', 'error'];

show() {
    this.element.classList.add(this.activeClass);
}
```

### 3. Prefer Data Attributes over Global State

```twig
{# Good - data in attributes #}
<button data-controller="like"
        data-like-product-id-value="{{ product.id }}"
        data-like-liked-value="{{ isLiked }}">

{# Avoid - global variables #}
<script>window.productId = {{ product.id }};</script>
```

### 4. Clean Up in disconnect()

```javascript
connect() {
    this.observer = new IntersectionObserver(/*...*/);
    this.observer.observe(this.element);
}

disconnect() {
    this.observer.disconnect();
}
```

## Next Steps

- [Turbo](./turbo) - SPA-like navigation
- [LiveComponents](./live-components) - Server-side reactivity
- [Flexy Theme](./flexy-theme/) - See controllers in action
