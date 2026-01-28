---
title: LiveComponents
sidebar_position: 5
---

# Symfony UX LiveComponents

**LiveComponents** are Symfony UX components that provide reactive, server-rendered UI without writing JavaScript. They're ideal for interactive features like product selectors, filters, forms, and shopping carts.

## Overview

LiveComponents work by:
1. Rendering server-side on initial page load
2. Intercepting user interactions (clicks, form inputs)
3. Making AJAX requests to re-render with updated state
4. Replacing the component's DOM with the new HTML

This provides React/Vue-like reactivity while keeping all logic on the server.

## Basic Structure

### PHP Component

```php
<?php

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

    #[LiveProp(writable: true)]
    public int $quantity = 1;
}
```

### Twig Template

```twig
{# ProductCard.html.twig #}
<div {{ attributes }}>
    <h3>{{ product.i18ns.title }}</h3>
    <p>{{ product.price }} €</p>

    <input
        type="number"
        data-model="quantity"
        value="{{ quantity }}"
        min="1"
    >

    <button data-action="live#action" data-live-action-param="addToCart">
        Add to Cart
    </button>
</div>
```

### Usage in Templates

```twig
{{ component('Flexy:ProductCard', {product: myProduct}) }}
```

## Key Concepts

### LiveProp

`#[LiveProp]` marks properties that should be tracked and serialized between requests:

```php
#[AsLiveComponent(name: 'Flexy:Counter')]
class Counter
{
    use DefaultActionTrait;

    // Read-only prop (default)
    #[LiveProp]
    public int $initialValue = 0;

    // Writable prop - can be modified by user
    #[LiveProp(writable: true)]
    public int $count = 0;

    // Synced with URL query parameter
    #[LiveProp(writable: true, url: true)]
    public ?string $search = null;

    // Dehydrated/hydrated custom objects
    #[LiveProp(dehydrateWith: 'dehydrateProduct', hydrateWith: 'hydrateProduct')]
    public ?Product $product = null;
}
```

### LiveAction

`#[LiveAction]` marks methods that can be called from the template:

```php
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\Attribute\LiveArg;

#[AsLiveComponent(name: 'Flexy:Cart')]
class Cart
{
    use DefaultActionTrait;

    #[LiveProp]
    public array $items = [];

    #[LiveAction]
    public function addItem(#[LiveArg] int $productId, #[LiveArg] int $quantity = 1): void
    {
        // Add item logic
    }

    #[LiveAction]
    public function removeItem(#[LiveArg] int $itemId): void
    {
        // Remove item logic
    }

    #[LiveAction]
    public function updateQuantity(#[LiveArg] int $itemId, #[LiveArg] int $quantity): void
    {
        // Update quantity logic
    }
}
```

Template usage:

```twig
<button
    data-action="live#action"
    data-live-action-param="addItem"
    data-live-product-id-param="{{ product.id }}"
    data-live-quantity-param="1"
>
    Add to Cart
</button>
```

### Mount Method

The `mount()` method initializes the component:

```php
#[AsLiveComponent(name: 'Flexy:CategoryFilters')]
class CategoryFilters
{
    use DefaultActionTrait;

    #[LiveProp]
    public ?int $categoryId = null;

    public array $products = [];

    public function __construct(
        private readonly DataAccessService $dataAccessService,
    ) {}

    public function mount(?int $initialCategoryId): void
    {
        $this->categoryId = $initialCategoryId;
        $this->loadProducts();
    }

    private function loadProducts(): void
    {
        $this->products = $this->dataAccessService->resources('/api/front/products', [
            'productCategories.category.id' => $this->categoryId,
        ]);
    }
}
```

## Data Binding

### Two-Way Binding with `data-model`

```twig
{# Immediate update on each keystroke #}
<input data-model="searchQuery" type="text">

{# Update on change (blur) #}
<input data-model="on(change)|searchQuery" type="text">

{# Debounced update (300ms delay) #}
<input data-model="debounce(300)|searchQuery" type="text">
```

### Binding to Form Fields

```twig
<select data-model="selectedCategory">
    {% for category in categories %}
        <option value="{{ category.id }}">{{ category.i18ns.title }}</option>
    {% endfor %}
</select>

<input type="checkbox" data-model="showOutOfStock">
```

## Forms Integration

LiveComponents integrate seamlessly with Symfony Forms:

```php
use Symfony\Component\Form\FormInterface;
use Symfony\UX\LiveComponent\ComponentWithFormTrait;

#[AsLiveComponent(name: 'Flexy:AddressForm')]
class AddressForm
{
    use DefaultActionTrait;
    use ComponentWithFormTrait;

    #[LiveProp]
    public ?Address $address = null;

    protected function instantiateForm(): FormInterface
    {
        return $this->formFactory->create(AddressType::class, $this->address);
    }

    #[LiveAction]
    public function save(): void
    {
        $this->submitForm();

        if ($this->getForm()->isValid()) {
            $address = $this->getForm()->getData();
            // Save address...
        }
    }
}
```

Template:

```twig
<div {{ attributes }}>
    {{ form_start(form) }}
        {{ form_row(form.firstname) }}
        {{ form_row(form.lastname) }}
        {{ form_row(form.address1) }}
        {{ form_row(form.city) }}
        {{ form_row(form.zipcode) }}

        <button type="submit" data-action="live#action" data-live-action-param="save">
            Save Address
        </button>
    {{ form_end(form) }}
</div>
```

## Events

### Emitting Events

Components can emit events to communicate with each other:

```php
use Symfony\UX\LiveComponent\ComponentToolsTrait;

#[AsLiveComponent(name: 'Flexy:Product')]
class Product
{
    use DefaultActionTrait;
    use ComponentToolsTrait;

    #[LiveAction]
    public function addToCart(): void
    {
        // Add to cart logic...

        // Emit event to other components
        $this->emit('addToCart', [
            'productId' => $this->product['id'],
            'quantity' => $this->quantity,
        ]);
    }
}
```

### Listening to Events

```php
use Symfony\UX\LiveComponent\Attribute\LiveListener;

#[AsLiveComponent(name: 'Flexy:CartWidget')]
class CartWidget
{
    use DefaultActionTrait;

    #[LiveProp]
    public int $itemCount = 0;

    #[LiveListener('addToCart')]
    public function onAddToCart(): void
    {
        // Refresh cart count
        $this->itemCount = $this->cartFacade->getItemCount();
    }
}
```

### Browser Events

Dispatch events to JavaScript:

```php
$this->dispatchBrowserEvent('change:pse', [
    'pseId' => $this->currentPse['id'],
]);
```

Listen in JavaScript:

```javascript
document.addEventListener('change:pse', (event) => {
    console.log('PSE changed:', event.detail.pseId);
});
```

## Real-World Example: Product Page

Here's the actual Product component from Flexy:

```php
<?php

declare(strict_types=1);

namespace FlexyBundle\UiComponents\Pages\Product;

use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\Attribute\LiveArg;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\ComponentToolsTrait;
use Symfony\UX\LiveComponent\ComponentWithFormTrait;
use Symfony\UX\LiveComponent\DefaultActionTrait;
use Thelia\Domain\Cart\CartFacade;
use Thelia\Domain\Cart\DTO\CartItemAddDTO;
use Thelia\Api\Service\DataAccess\DataAccessService;

#[AsLiveComponent(
    name: 'Flexy:Pages:Product',
    template: '@UiComponents/Pages/Product/Product.html.twig'
)]
class Product
{
    use ComponentToolsTrait;
    use ComponentWithFormTrait;
    use DefaultActionTrait;

    #[LiveProp]
    public array $product;

    #[LiveProp]
    public ?array $currentPse = null;

    #[LiveProp]
    public ?array $currentCombination = [];

    public function __construct(
        private DataAccessService $dataAccessService,
        private CartFacade $cartFacade,
    ) {}

    public function mount(array $product): void
    {
        $this->product = $product;
        $this->initializeDefaultPse();
    }

    #[LiveAction]
    public function updateCurrentCombination(
        #[LiveArg] string $attr,
        #[LiveArg] string $value
    ): void {
        $this->currentCombination[$attr] = $value;
        $this->findMatchingPse();

        $this->dispatchBrowserEvent('change:pse', [
            'pseId' => $this->currentPse['id'],
        ]);
    }

    #[LiveAction]
    public function save(): void
    {
        $this->submitForm();
        $formData = $this->getForm()->getData();

        $this->cartFacade->addItem(
            new CartItemAddDTO(
                cart: $this->cartFacade->getOrCreateFromSession(),
                productId: (int) $formData['product'],
                productSaleElementId: (int) $formData['product_sale_elements_id'],
                quantity: (int) $formData['quantity'],
                append: (bool) $formData['append'],
                newness: (bool) $formData['newness'],
            )
        );

        $this->emit('addToCart', [
            'values' => $this->formValues,
        ]);
    }

    private function initializeDefaultPse(): void
    {
        $pses = $this->dataAccessService->resources('/api/front/product_sale_elements', [
            'product.id' => $this->product['id'],
        ]);

        $this->currentPse = array_filter($pses, fn($pse) => $pse['isDefault'])[0] ?? $pses[0];
        $this->currentCombination = $this->currentPse['combination'] ?? [];
    }

    private function findMatchingPse(): void
    {
        // Find PSE matching current combination
    }
}
```

## ExposeInTemplate

Make computed values available in templates:

```php
use Symfony\UX\TwigComponent\Attribute\ExposeInTemplate;

#[AsLiveComponent(name: 'Flexy:CategoryFilters')]
class CategoryFilters
{
    #[ExposeInTemplate]
    public ?array $filters = null;

    #[ExposeInTemplate]
    public function getAvailableColors(): array
    {
        // Computed property
        return ['red', 'blue', 'green'];
    }
}
```

Access in template:

```twig
{# Direct property #}
{% for filter in filters %}...{% endfor %}

{# Computed method (called as this.methodName) #}
{% for color in this.availableColors %}...{% endfor %}
```

## Loading States

Show loading indicators during AJAX requests:

```twig
<div {{ attributes }}>
    {# Show during any loading #}
    <div data-loading>Loading...</div>

    {# Hide during loading #}
    <div data-loading="hide">Content</div>

    {# Show during specific action #}
    <div data-loading="action(save)">Saving...</div>

    {# Add class during loading #}
    <button data-loading="addClass(opacity-50)">Submit</button>
</div>
```

## Best Practices

### 1. Keep Components Focused

```php
// Good - single responsibility
#[AsLiveComponent(name: 'Flexy:AddToCartButton')]
class AddToCartButton { /* ... */ }

#[AsLiveComponent(name: 'Flexy:ProductVariantSelector')]
class ProductVariantSelector { /* ... */ }

// Avoid - too many responsibilities
#[AsLiveComponent(name: 'Flexy:ProductEverything')]
class ProductEverything { /* ... */ }
```

### 2. Use Services for Business Logic

```php
#[AsLiveComponent(name: 'Flexy:Cart')]
class Cart
{
    public function __construct(
        private readonly CartFacade $cartFacade,  // Inject facades
    ) {}

    #[LiveAction]
    public function removeItem(#[LiveArg] int $itemId): void
    {
        $this->cartFacade->removeItem($itemId);  // Delegate to facade
    }
}
```

### 3. Minimize LiveProp Data

```php
// Good - store only IDs
#[LiveProp]
public int $productId;

// Avoid - large serialized objects
#[LiveProp]
public array $fullProductWithAllRelations;
```

### 4. Use Deferred Loading

```php
#[LiveProp]
public bool $isLoaded = false;

public array $heavyData = [];

#[LiveAction]
public function load(): void
{
    if (!$this->isLoaded) {
        $this->heavyData = $this->loadExpensiveData();
        $this->isLoaded = true;
    }
}
```

## Creating a Custom Component

### 1. Create the PHP Class

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

    #[LiveProp]
    public ?string $error = null;

    #[LiveAction]
    public function subscribe(): void
    {
        if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            $this->error = 'Invalid email address';
            return;
        }

        // Subscribe logic...

        $this->submitted = true;
    }
}
```

### 2. Create the Template

```twig
{# local/modules/MyModule/templates/frontoffice/LiveComponent/NewsletterForm.html.twig #}
<div {{ attributes }}>
    {% if submitted %}
        <p class="success">Thank you for subscribing!</p>
    {% else %}
        <form>
            <input
                type="email"
                data-model="email"
                placeholder="Enter your email"
            >

            {% if error %}
                <p class="error">{{ error }}</p>
            {% endif %}

            <button
                type="button"
                data-action="live#action"
                data-live-action-param="subscribe"
            >
                Subscribe
            </button>
        </form>
    {% endif %}
</div>
```

### 3. Register as Service

```yaml
# local/modules/MyModule/Config/config.xml (or services.yaml)
services:
    MyModule\LiveComponent\NewsletterForm:
        autoconfigure: true
        autowire: true
```

### 4. Use in Templates

```twig
{{ component('MyModule:NewsletterForm') }}
```

## Next Steps

- [Stimulus](./stimulus) - JavaScript controllers for custom behavior
- [Forms](./forms) - Form handling in LiveComponents
- [Flexy Theme](./flexy-theme/) - See all available components
