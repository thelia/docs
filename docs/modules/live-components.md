---
title: LiveComponents
sidebar_position: 7
---

# LiveComponents

Symfony UX LiveComponents enable interactive front-office interfaces without writing JavaScript. Components re-render automatically when their state changes, providing a reactive experience.

## Overview

LiveComponents are server-rendered Twig components that:
- Update via AJAX when properties change
- Handle user interactions with PHP methods
- Maintain state between re-renders
- Communicate via browser events

## Creating a LiveComponent

### Basic Component

**LiveComponent/ProductQuantitySelector.php**:
```php
<?php

declare(strict_types=1);

namespace MyProject\LiveComponent;

use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\DefaultActionTrait;

#[AsLiveComponent(
    name: 'MyProject:ProductQuantitySelector',
    template: '@MyProject/live-component/product-quantity-selector.html.twig'
)]
final class ProductQuantitySelector
{
    use DefaultActionTrait;

    #[LiveProp]
    public int $productId;

    #[LiveProp(writable: true)]
    public int $quantity = 1;

    #[LiveProp]
    public int $maxQuantity = 99;

    #[LiveAction]
    public function increment(): void
    {
        if ($this->quantity < $this->maxQuantity) {
            $this->quantity++;
        }
    }

    #[LiveAction]
    public function decrement(): void
    {
        if ($this->quantity > 1) {
            $this->quantity--;
        }
    }
}
```

**templates/frontOffice/default/modules/MyProject/live-component/product-quantity-selector.html.twig**:
```twig
<div {{ attributes }}>
    <button
        type="button"
        data-action="live#action"
        data-live-action-param="decrement"
        {% if quantity <= 1 %}disabled{% endif %}
    >
        -
    </button>

    <input
        type="number"
        data-model="quantity"
        value="{{ quantity }}"
        min="1"
        max="{{ maxQuantity }}"
    />

    <button
        type="button"
        data-action="live#action"
        data-live-action-param="increment"
        {% if quantity >= maxQuantity %}disabled{% endif %}
    >
        +
    </button>
</div>
```

### Using the Component

In any Twig template:
```twig
{{ component('MyProject:ProductQuantitySelector', {
    productId: product.id,
    quantity: 1,
    maxQuantity: product.stock
}) }}
```

## LiveProp Options

### Writable Props

Allow users to modify values:

```php
// User can change this via data-model binding
#[LiveProp(writable: true)]
public string $searchQuery = '';

// Read-only - set once on mount
#[LiveProp]
public int $categoryId;
```

### Hydration

For complex objects:

```php
use Symfony\UX\LiveComponent\Attribute\LiveProp;

// Dehydrate to ID, rehydrate from database
#[LiveProp(hydrateWith: 'hydrateProduct', dehydrateWith: 'dehydrateProduct')]
public ?Product $product = null;

public function hydrateProduct(int $id): ?Product
{
    return ProductQuery::create()->findPk($id);
}

public function dehydrateProduct(?Product $product): ?int
{
    return $product?->getId();
}
```

## LiveActions

Handle user interactions:

```php
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\Attribute\LiveArg;

#[LiveAction]
public function addToCart(): void
{
    $this->cartFacade->addItem(new CartItemAddDTO(
        productId: $this->productId,
        quantity: $this->quantity,
    ));

    // Emit event for other components
    $this->emit('cart:updated');
}

// With arguments from the template
#[LiveAction]
public function selectVariant(#[LiveArg] int $variantId): void
{
    $this->selectedVariantId = $variantId;
    $this->updatePrice();
}
```

Template:
```twig
<button
    data-action="live#action"
    data-live-action-param="addToCart"
>
    Add to Cart
</button>

<button
    data-action="live#action"
    data-live-action-param="selectVariant(variantId={{ variant.id }})"
>
    Select {{ variant.name }}
</button>
```

## Fetching Data

### Using DataAccessService

```php
<?php

declare(strict_types=1);

namespace MyProject\LiveComponent;

use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\DefaultActionTrait;
use Thelia\Api\Service\DataAccess\DataAccessService;

#[AsLiveComponent(
    name: 'MyProject:ProductList',
    template: '@MyProject/live-component/product-list.html.twig'
)]
final class ProductList
{
    use DefaultActionTrait;

    #[LiveProp(writable: true)]
    public int $categoryId = 0;

    #[LiveProp(writable: true)]
    public int $page = 1;

    #[LiveProp(writable: true)]
    public string $sortBy = 'position';

    public function __construct(
        private readonly DataAccessService $dataAccess,
    ) {}

    public function getProducts(): array
    {
        $response = $this->dataAccess->resources('/api/front/products', [
            'productCategories.category.id' => $this->categoryId,
            'page' => $this->page,
            'itemsPerPage' => 12,
            'order[' . $this->sortBy . ']' => 'asc',
        ], 'jsonld');

        return $response['hydra:member'] ?? [];
    }

    public function getTotalPages(): int
    {
        $response = $this->dataAccess->resources('/api/front/products', [
            'productCategories.category.id' => $this->categoryId,
        ], 'jsonld');

        $total = $response['hydra:totalItems'] ?? 0;

        return (int) ceil($total / 12);
    }
}
```

### Using Facades

```php
use Thelia\Domain\Cart\CartFacade;

#[AsLiveComponent(name: 'MyProject:CartWidget')]
final class CartWidget
{
    use DefaultActionTrait;

    public function __construct(
        private readonly CartFacade $cartFacade,
    ) {}

    public function getCart(): ?Cart
    {
        return $this->cartFacade->getCartFromSession();
    }

    public function getItemCount(): int
    {
        $cart = $this->getCart();
        return $cart ? $cart->countCartItems() : 0;
    }

    public function getTotal(): float
    {
        $cart = $this->getCart();
        return $cart ? $cart->getTaxedAmount() : 0.0;
    }
}
```

## Events

### Emitting Events

Notify other components:

```php
use Symfony\UX\LiveComponent\ComponentToolsTrait;

#[AsLiveComponent(name: 'MyProject:AddToCart')]
final class AddToCart
{
    use DefaultActionTrait;
    use ComponentToolsTrait;

    #[LiveAction]
    public function add(): void
    {
        // Add to cart logic...

        // Emit to other LiveComponents
        $this->emit('cart:updated', [
            'itemCount' => $this->cartFacade->getItemCount(),
        ]);

        // Or dispatch browser event for JavaScript
        $this->dispatchBrowserEvent('cart:item-added', [
            'productId' => $this->productId,
        ]);
    }
}
```

### Listening to Events

```php
use Symfony\UX\LiveComponent\Attribute\LiveListener;
use Symfony\UX\LiveComponent\Attribute\LiveArg;

#[AsLiveComponent(name: 'MyProject:CartCounter')]
final class CartCounter
{
    use DefaultActionTrait;

    public int $count = 0;

    #[LiveListener('cart:updated')]
    public function onCartUpdated(#[LiveArg] int $itemCount): void
    {
        $this->count = $itemCount;
    }
}
```

## Forms

### With ComponentWithFormTrait

```php
<?php

declare(strict_types=1);

namespace MyProject\LiveComponent;

use MyProject\Form\ContactFormType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\FormInterface;
use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\ComponentWithFormTrait;
use Symfony\UX\LiveComponent\DefaultActionTrait;

#[AsLiveComponent(
    name: 'MyProject:ContactForm',
    template: '@MyProject/live-component/contact-form.html.twig'
)]
final class ContactForm extends AbstractController
{
    use DefaultActionTrait;
    use ComponentWithFormTrait;

    protected function instantiateForm(): FormInterface
    {
        return $this->createForm(ContactFormType::class);
    }

    #[LiveAction]
    public function submit(): void
    {
        $this->submitForm();

        if ($this->getForm()->isValid()) {
            $data = $this->getForm()->getData();

            // Process form data
            $this->mailer->send($data);

            // Reset form
            $this->resetForm();

            // Notify success
            $this->dispatchBrowserEvent('form:submitted');
        }
    }
}
```

Template:
```twig
<div {{ attributes }}>
    {{ form_start(form) }}

    <div class="form-group">
        {{ form_row(form.name) }}
    </div>

    <div class="form-group">
        {{ form_row(form.email) }}
    </div>

    <div class="form-group">
        {{ form_row(form.message) }}
    </div>

    <button
        type="submit"
        data-action="live#action"
        data-live-action-param="submit"
    >
        Send Message
    </button>

    {{ form_end(form) }}
</div>
```

## Loading States

### During Re-renders

```twig
<div {{ attributes }}>
    {# Show loading indicator during AJAX requests #}
    <div data-loading="show" class="spinner">
        Loading...
    </div>

    {# Hide content while loading #}
    <div data-loading="hide">
        {% for product in this.products %}
            {# Product list #}
        {% endfor %}
    </div>
</div>
```

### Disable Buttons

```twig
<button
    data-action="live#action"
    data-live-action-param="submit"
    data-loading="attr:disabled"
>
    <span data-loading="hide">Submit</span>
    <span data-loading="show">Processing...</span>
</button>
```

## Polling

Auto-refresh components:

```php
#[AsLiveComponent(name: 'MyProject:StockStatus')]
final class StockStatus
{
    use DefaultActionTrait;

    #[LiveProp]
    public int $productId;

    // Refresh every 30 seconds
    #[LiveProp]
    public int $poll = 30000;

    public function getStock(): int
    {
        return $this->stockService->getAvailableStock($this->productId);
    }
}
```

Template:
```twig
<div {{ attributes }} data-poll>
    Stock: {{ this.stock }} units
</div>
```

## Deferred Loading

Load heavy content after initial render:

```php
use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\DefaultActionTrait;

#[AsLiveComponent(
    name: 'MyProject:Reviews',
    template: '@MyProject/live-component/reviews.html.twig',
    method: 'get'
)]
final class Reviews
{
    use DefaultActionTrait;

    #[LiveProp]
    public int $productId;

    #[LiveProp]
    public bool $isLoaded = false;

    public function getReviews(): array
    {
        if (!$this->isLoaded) {
            return [];
        }

        return $this->reviewService->getForProduct($this->productId);
    }

    #[LiveAction]
    public function load(): void
    {
        $this->isLoaded = true;
    }
}
```

Template:
```twig
<div {{ attributes }}>
    {% if not isLoaded %}
        <button data-action="live#action" data-live-action-param="load">
            Load Reviews
        </button>
    {% else %}
        {% for review in this.reviews %}
            {# Display review #}
        {% endfor %}
    {% endif %}
</div>
```

## Template Location

Components look for templates in:

1. Explicit path in `#[AsLiveComponent(template: '...')]`
2. `templates/frontOffice/{theme}/modules/{Module}/live-component/`
3. `local/modules/{Module}/templates/frontOffice/default/`

Convention:
```
@MyProject/live-component/component-name.html.twig
```

## Best Practices

### Do

- **Use `readonly` services** injected via constructor
- **Keep components focused** - one responsibility per component
- **Use `LiveProp(writable: true)`** only when users need to modify values
- **Emit events** for cross-component communication
- **Show loading states** for better UX

### Don't

- **Don't fetch data in constructor** - use getter methods
- **Don't store sensitive data** in LiveProps - they're sent to the client
- **Don't create too many small components** - each has AJAX overhead
- **Don't skip error handling** in LiveActions

## Debugging

Enable Symfony Profiler to see:
- Component render times
- LiveAction calls
- Event emissions

```yaml
# config/packages/dev/ux_live_component.yaml
ux_live_component:
    debug: true
```
