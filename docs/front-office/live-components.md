---
title: LiveComponents
sidebar_position: 5
---

# LiveComponents

Thelia 3 uses **Symfony UX LiveComponents** for reactive, server-rendered UI without writing JavaScript. They're ideal for product selectors, filters, forms, and shopping carts.

:::tip Official Documentation
For complete LiveComponents documentation, see [symfony.com/bundles/ux-live-component](https://symfony.com/bundles/ux-live-component/current/index.html).
:::

## How It Works

1. Component renders server-side on initial page load
2. User interactions trigger AJAX requests
3. Component re-renders with updated state
4. DOM is automatically updated

## Basic Structure

### PHP Component

```php
<?php

declare(strict_types=1);

namespace FlexyBundle\UiComponents\ProductCard;

use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
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

    #[LiveProp(writable: true)]
    public int $quantity = 1;

    #[LiveAction]
    public function addToCart(): void
    {
        // Add to cart logic
    }
}
```

### Twig Template

```twig
<div {{ attributes }}>
    <h3>{{ product.i18ns.title }}</h3>
    <input type="number" data-model="quantity" value="{{ quantity }}" min="1">
    <button data-action="live#action" data-live-action-param="addToCart">
        Add to Cart
    </button>
</div>
```

### Usage

```twig
{{ component('Flexy:ProductCard', {product: myProduct}) }}
```

## Key Concepts

### LiveProp

Properties tracked between requests:

```php
#[LiveProp]                              // Read-only
public int $initialValue = 0;

#[LiveProp(writable: true)]              // User can modify
public int $count = 0;

#[LiveProp(writable: true, url: true)]   // Synced with URL
public ?string $search = null;
```

### LiveAction

Methods callable from templates:

```php
#[LiveAction]
public function addItem(#[LiveArg] int $productId): void
{
    // Action logic
}
```

```twig
<button data-action="live#action"
        data-live-action-param="addItem"
        data-live-product-id-param="{{ product.id }}">
    Add
</button>
```

### Data Binding

```twig
{# Immediate update #}
<input data-model="searchQuery" type="text">

{# Update on blur #}
<input data-model="on(change)|searchQuery" type="text">

{# Debounced (300ms) #}
<input data-model="debounce(300)|searchQuery" type="text">
```

## Forms Integration

Use `ComponentWithFormTrait` for Symfony Forms:

```php
use Symfony\UX\LiveComponent\ComponentWithFormTrait;

#[AsLiveComponent(name: 'Flexy:ContactForm')]
class ContactForm
{
    use DefaultActionTrait;
    use ComponentWithFormTrait;

    protected function instantiateForm(): FormInterface
    {
        return $this->formService->getFormByName(FrontForm::CONTACT);
    }

    #[LiveAction]
    public function save(): void
    {
        $this->submitForm();
        if ($this->getForm()->isValid()) {
            // Process form
        }
    }
}
```

See [Forms](./forms) for detailed form handling.

## Events

### Emitting Events

```php
use Symfony\UX\LiveComponent\ComponentToolsTrait;

#[AsLiveComponent(name: 'Flexy:Product')]
class Product
{
    use ComponentToolsTrait;

    #[LiveAction]
    public function addToCart(): void
    {
        // Add to cart...
        $this->emit('addToCart', ['productId' => $this->product['id']]);
    }
}
```

### Listening to Events

```php
use Symfony\UX\LiveComponent\Attribute\LiveListener;

#[AsLiveComponent(name: 'Flexy:CartWidget')]
class CartWidget
{
    #[LiveListener('addToCart')]
    public function onAddToCart(): void
    {
        $this->itemCount = $this->cartFacade->getItemCount();
    }
}
```

### Browser Events

```php
$this->dispatchBrowserEvent('change:pse', ['pseId' => $this->currentPse['id']]);
```

## Loading States

```twig
<div {{ attributes }}>
    <div data-loading>Loading...</div>
    <div data-loading="hide">Content</div>
    <div data-loading="action(save)">Saving...</div>
    <button data-loading="addClass(opacity-50)">Submit</button>
</div>
```

## Using DataAccessService

```php
public function __construct(
    private readonly DataAccessService $dataAccessService,
    private readonly CartFacade $cartFacade,
) {}

public function mount(?int $categoryId): void
{
    $this->products = $this->dataAccessService->resources('/api/front/products', [
        'productCategories.category.id' => $categoryId,
    ]);
}
```

## Creating a Custom Component

### 1. PHP Class

```php
<?php
// local/modules/MyModule/LiveComponent/NewsletterForm.php

declare(strict_types=1);

namespace MyModule\LiveComponent;

use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\DefaultActionTrait;

#[AsLiveComponent(
    name: 'MyModule:NewsletterForm',
    template: '@MyModule/LiveComponent/NewsletterForm.html.twig'
)]
class NewsletterForm
{
    use DefaultActionTrait;

    #[LiveProp(writable: true)]
    public string $email = '';

    #[LiveProp]
    public bool $submitted = false;

    #[LiveAction]
    public function subscribe(): void
    {
        // Subscribe logic...
        $this->submitted = true;
    }
}
```

### 2. Template

```twig
{# local/modules/MyModule/templates/frontoffice/LiveComponent/NewsletterForm.html.twig #}
<div {{ attributes }}>
    {% if submitted %}
        <p>Thank you for subscribing!</p>
    {% else %}
        <input type="email" data-model="email" placeholder="Your email">
        <button data-action="live#action" data-live-action-param="subscribe">
            Subscribe
        </button>
    {% endif %}
</div>
```

### 3. Usage

```twig
{{ component('MyModule:NewsletterForm') }}
```

## Best Practices

### Use Facades for Business Logic

```php
public function __construct(
    private readonly CartFacade $cartFacade,
) {}

#[LiveAction]
public function removeItem(#[LiveArg] int $itemId): void
{
    $this->cartFacade->removeItem($itemId);  // Delegate to facade
}
```

### Minimize LiveProp Data

```php
// Good - store only IDs
#[LiveProp]
public int $productId;

// Avoid - large serialized objects
#[LiveProp]
public array $fullProductWithAllRelations;
```

## Next Steps

- [Stimulus](./stimulus) - JavaScript controllers
- [Forms](./forms) - Form handling
- [Flexy Theme](./flexy-theme/) - See all components
