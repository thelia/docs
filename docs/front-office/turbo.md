---
title: Turbo Navigation
sidebar_position: 7
---

# Turbo Navigation

Thelia 3 uses **Turbo** for SPA-like navigation without writing JavaScript. Turbo intercepts link clicks and form submissions, fetches pages via AJAX, and updates the DOM automatically.

:::tip Official Documentation
For complete Turbo documentation, see [turbo.hotwired.dev](https://turbo.hotwired.dev/).
:::

## Turbo Drive

Turbo Drive is enabled by default. It makes all navigation feel instant by fetching pages via AJAX and replacing the `<body>` content.

### Opting Out

For links that should trigger full page reloads:

```twig
{# Disable for specific link #}
<a href="/download/file.pdf" data-turbo="false">Download PDF</a>

{# Disable for section #}
<div data-turbo="false">
    <a href="/external-site">External Link</a>
</div>
```

### Progress Bar

Customize the progress bar with CSS:

```css
.turbo-progress-bar {
    height: 3px;
    background-color: #3b82f6;
}
```

## Turbo Frames

Turbo Frames allow updating only parts of a page:

```twig
{# Product list that updates independently #}
<turbo-frame id="product-list">
    {% for product in products %}
        <div class="product">{{ product.i18ns.title }}</div>
    {% endfor %}

    <a href="?page=2">Next Page</a>
</turbo-frame>
```

### Targeting Different Frames

```twig
{# Click in sidebar, update main content #}
<turbo-frame id="sidebar">
    <a href="{{ path('product_show', {id: product.id}) }}"
       data-turbo-frame="main-content">
        {{ product.i18ns.title }}
    </a>
</turbo-frame>

<turbo-frame id="main-content">
    {# Content replaced on click #}
</turbo-frame>
```

### Lazy Loading

```twig
<turbo-frame id="comments"
             src="{{ path('product_comments', {id: product.id}) }}"
             loading="lazy">
    <p>Loading comments...</p>
</turbo-frame>
```

### Breaking Out of Frames

```twig
<turbo-frame id="modal">
    <a href="{{ path('checkout') }}" data-turbo-frame="_top">
        Proceed to Checkout
    </a>
</turbo-frame>
```

## Turbo Streams

Turbo Streams allow server-driven updates to multiple page parts. Return stream responses for form submissions:

```php
#[Route('/cart/add', methods: ['POST'])]
public function addToCart(Request $request): Response
{
    // Add to cart logic...

    return new Response(
        $this->renderView('cart/_stream.html.twig', ['cart' => $cart]),
        200,
        ['Content-Type' => 'text/vnd.turbo-stream.html']
    );
}
```

```twig
{# cart/_stream.html.twig #}
<turbo-stream action="update" target="cart-count">
    <template>{{ cart.itemCount }}</template>
</turbo-stream>

<turbo-stream action="update" target="cart-total">
    <template>{{ cart.total|format_money }}</template>
</turbo-stream>
```

## Turbo vs LiveComponents

| Feature | Turbo | LiveComponents |
|---------|-------|----------------|
| Navigation | Full pages/frames | Single component |
| Partial updates | Frames/Streams | Component only |
| State management | URL-based | Props-based |
| JavaScript needed | Minimal | None |

**Use Turbo for**: Page navigation, multi-part updates, lazy loading sections

**Use LiveComponents for**: Interactive forms, real-time filtering, complex state

## Next Steps

- [LiveComponents](./live-components) - Server-side reactivity
- [Stimulus](./stimulus) - Client-side behavior
- [Forms](./forms) - Form handling strategies
