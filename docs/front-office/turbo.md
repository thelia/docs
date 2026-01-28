---
title: Turbo Navigation
sidebar_position: 7
---

# Turbo Navigation

**Turbo** is part of the Hotwire stack that provides SPA-like navigation without writing JavaScript. It intercepts link clicks and form submissions, fetches pages via AJAX, and updates the DOM automatically.

## Turbo Drive

Turbo Drive is enabled by default and makes all navigation feel instant:

### How It Works

1. User clicks a link
2. Turbo intercepts the click
3. Fetches the new page via AJAX
4. Replaces the `<body>` content
5. Updates the browser history

No configuration needed - it just works.

### Opting Out

For links that should trigger full page reloads:

```twig
{# Disable Turbo for this link #}
<a href="/download/file.pdf" data-turbo="false">Download PDF</a>

{# Disable for entire section #}
<div data-turbo="false">
    <a href="/external-site">External Link</a>
    <a href="/another-page">Another Link</a>
</div>
```

### Progress Bar

Turbo shows a progress bar during navigation. Customize it with CSS:

```css
.turbo-progress-bar {
    height: 3px;
    background-color: #3b82f6;
}
```

## Turbo Frames

Turbo Frames allow updating only parts of a page:

### Basic Usage

```twig
{# Page 1: List view #}
<turbo-frame id="product-list">
    {% for product in products %}
        <div class="product">
            <a href="{{ path('product_show', {id: product.id}) }}">
                {{ product.i18ns.title }}
            </a>
        </div>
    {% endfor %}
</turbo-frame>

{# Pagination links inside frame #}
<turbo-frame id="product-list">
    <a href="?page=2">Next Page</a>
</turbo-frame>
```

When clicking "Next Page", only the frame content is updated.

### Targeting Different Frames

```twig
{# Click in one frame, update another #}
<turbo-frame id="sidebar">
    <a href="{{ path('product_show', {id: product.id}) }}"
       data-turbo-frame="main-content">
        {{ product.i18ns.title }}
    </a>
</turbo-frame>

<turbo-frame id="main-content">
    {# This content will be replaced #}
</turbo-frame>
```

### Lazy Loading Frames

```twig
{# Load content lazily #}
<turbo-frame id="comments" src="{{ path('product_comments', {id: product.id}) }}" loading="lazy">
    <p>Loading comments...</p>
</turbo-frame>
```

The frame content loads only when it becomes visible in the viewport.

### Breaking Out of Frames

```twig
<turbo-frame id="modal">
    {# This link replaces the whole page #}
    <a href="{{ path('checkout') }}" data-turbo-frame="_top">
        Proceed to Checkout
    </a>
</turbo-frame>
```

## Turbo Streams

Turbo Streams allow server-driven updates to multiple parts of the page:

### Stream Actions

| Action | Description |
|--------|-------------|
| `append` | Add content to the end of target |
| `prepend` | Add content to the beginning |
| `replace` | Replace entire target element |
| `update` | Replace target's innerHTML |
| `remove` | Remove the target element |
| `before` | Insert before target |
| `after` | Insert after target |

### Server Response

Return Turbo Stream responses for form submissions:

```php
// Controller
#[Route('/cart/add', methods: ['POST'])]
public function addToCart(Request $request): Response
{
    // Add to cart logic...

    return new Response(
        $this->renderView('cart/_stream.html.twig', [
            'cart' => $cart,
            'newItem' => $newItem,
        ]),
        200,
        ['Content-Type' => 'text/vnd.turbo-stream.html']
    );
}
```

```twig
{# cart/_stream.html.twig #}
<turbo-stream action="append" target="cart-items">
    <template>
        <div id="cart-item-{{ newItem.id }}">
            {{ newItem.product.i18ns.title }} - {{ newItem.quantity }}
        </div>
    </template>
</turbo-stream>

<turbo-stream action="update" target="cart-total">
    <template>
        {{ cart.total|format_money }}
    </template>
</turbo-stream>

<turbo-stream action="update" target="cart-count">
    <template>
        {{ cart.itemCount }}
    </template>
</turbo-stream>
```

### With LiveComponents

LiveComponents can emit Turbo Streams:

```php
#[LiveAction]
public function addToCart(): void
{
    // Add item...

    // Emit event that triggers stream update
    $this->emit('cart:updated');
}
```

## Practical Examples

### Modal with Turbo Frame

```twig
{# Product list #}
{% for product in products %}
    <div class="product">
        <a href="{{ path('product_quick_view', {id: product.id}) }}"
           data-turbo-frame="modal-content">
            Quick View
        </a>
    </div>
{% endfor %}

{# Modal container #}
<div id="modal" class="hidden" data-controller="modal">
    <turbo-frame id="modal-content">
        {# Loaded dynamically #}
    </turbo-frame>
</div>
```

```twig
{# product_quick_view.html.twig #}
<turbo-frame id="modal-content">
    <div class="modal-body">
        <h2>{{ product.i18ns.title }}</h2>
        <p>{{ product.i18ns.description|raw }}</p>
        {{ component('Flexy:AddToCartButton', {product: product}) }}
    </div>
</turbo-frame>
```

### Infinite Scroll

```twig
<div id="product-list">
    {% for product in products %}
        {{ include('product/_card.html.twig') }}
    {% endfor %}
</div>

{# Lazy-loading next page #}
{% if hasMorePages %}
    <turbo-frame id="next-page"
                 src="{{ path('category', {id: categoryId, page: nextPage}) }}"
                 loading="lazy">
        <p>Loading more products...</p>
    </turbo-frame>
{% endif %}
```

The next page template:

```twig
{# Returns products + next frame #}
<turbo-frame id="next-page">
    {% for product in products %}
        {{ include('product/_card.html.twig') }}
    {% endfor %}

    {% if hasMorePages %}
        <turbo-frame id="next-page"
                     src="{{ path('category', {id: categoryId, page: nextPage}) }}"
                     loading="lazy">
            <p>Loading more products...</p>
        </turbo-frame>
    {% endif %}
</turbo-frame>
```

### Flash Messages with Streams

```php
// Controller
public function processForm(): Response
{
    // Process...

    $this->addFlash('success', 'Item saved successfully!');

    if ($request->headers->get('Turbo-Frame')) {
        return new Response(
            $this->renderView('_flash_stream.html.twig'),
            200,
            ['Content-Type' => 'text/vnd.turbo-stream.html']
        );
    }

    return $this->redirectToRoute('...');
}
```

```twig
{# _flash_stream.html.twig #}
<turbo-stream action="prepend" target="flash-messages">
    <template>
        {% for message in app.flashes('success') %}
            <div class="alert alert-success">{{ message }}</div>
        {% endfor %}
    </template>
</turbo-stream>
```

## Configuration

### Turbo Settings

```javascript
// assets/app.js
import { Turbo } from '@hotwired/turbo';

// Disable Turbo Drive globally (not recommended)
Turbo.session.drive = false;

// Set progress bar delay
Turbo.setProgressBarDelay(200);
```

### Caching

Turbo caches pages for instant back-button navigation:

```twig
{# Disable cache for this page #}
<meta name="turbo-cache-control" content="no-cache">

{# Or no-preview (don't show cached version) #}
<meta name="turbo-cache-control" content="no-preview">
```

## Events

### JavaScript Events

```javascript
// Before Turbo fetches a page
document.addEventListener('turbo:before-fetch-request', (event) => {
    // Add headers, modify request
    event.detail.fetchOptions.headers['X-Custom-Header'] = 'value';
});

// After page renders
document.addEventListener('turbo:render', () => {
    // Re-initialize third-party scripts
});

// Frame loaded
document.addEventListener('turbo:frame-load', (event) => {
    console.log('Frame loaded:', event.target.id);
});
```

### Common Events

| Event | When |
|-------|------|
| `turbo:click` | Link clicked |
| `turbo:before-visit` | Before navigation |
| `turbo:visit` | Navigation started |
| `turbo:before-fetch-request` | Before AJAX request |
| `turbo:before-fetch-response` | Response received |
| `turbo:render` | Page rendered |
| `turbo:load` | Page fully loaded |
| `turbo:frame-load` | Frame content loaded |

## Best Practices

### 1. Keep Frames Focused

```twig
{# Good - specific frame #}
<turbo-frame id="product-reviews">
    {# Reviews only #}
</turbo-frame>

{# Avoid - too broad #}
<turbo-frame id="page-content">
    {# Entire page #}
</turbo-frame>
```

### 2. Handle Loading States

```twig
<turbo-frame id="search-results">
    <div class="loading-placeholder">
        Searching...
    </div>
</turbo-frame>
```

### 3. Provide Fallbacks

```twig
{# Works without JavaScript #}
<turbo-frame id="comments" src="{{ commentsUrl }}">
    <a href="{{ commentsUrl }}">Load Comments</a>
</turbo-frame>
```

### 4. Use Appropriate Frame IDs

```twig
{# Good - descriptive IDs #}
<turbo-frame id="cart-mini">
<turbo-frame id="product-gallery">
<turbo-frame id="user-dropdown">

{# Avoid - generic IDs #}
<turbo-frame id="frame1">
<turbo-frame id="content">
```

## Turbo vs LiveComponents

| Feature | Turbo | LiveComponents |
|---------|-------|----------------|
| Navigation | Full pages/frames | Single component |
| Server rendering | Yes | Yes |
| Partial updates | Frames/Streams | Component only |
| Form handling | Native | Built-in |
| State management | URL-based | Props-based |
| JavaScript needed | Minimal | None |

**Use Turbo for**: Page navigation, multi-part updates, lazy loading sections

**Use LiveComponents for**: Interactive forms, real-time filtering, complex state

## Next Steps

- [LiveComponents](./live-components) - Server-side reactivity
- [Stimulus](./stimulus) - Client-side behavior
- [Forms](./forms) - Form handling strategies
