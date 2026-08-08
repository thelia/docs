---
title: LiveComponents
sidebar_position: 5
---

# LiveComponents

Thelia 3 uses Symfony UX LiveComponents for reactive, server-rendered UI without writing JavaScript. They suit product selectors, filters, forms, and shopping carts.

:::tip Official Documentation
For complete LiveComponents documentation, see [symfony.com/bundles/ux-live-component](https://symfony.com/bundles/ux-live-component/current/index.html).
:::

## How it works

1. Component renders server-side on initial page load
2. User interactions trigger AJAX requests
3. Component re-renders with updated state
4. The DOM updates automatically

## Basic structure

:::info TwigComponent vs LiveComponent
The Flexy theme uses both kinds of component, roughly half and half: `#[AsTwigComponent]` for static, render-once UI (24 components, like `ProductCard`) and `#[AsLiveComponent]` for reactive, AJAX-powered UI (25 components, like `CategoryFilters`, `Pages:Product` and `Checkout:Cart`). Reach for a LiveComponent only when the UI must re-render after the initial load. See [Stimulus](./stimulus) and the [Flexy theme overview](./flexy-theme/) for the static side.
:::

Each component lives in its own folder, which holds both the PHP class and its Twig template:

```
templates/frontOffice/flexy/src/UiComponents/
    CategoryFilters/
        CategoryFilters.php
        CategoryFilters.html.twig
    Pages/Product/
        Product.php
        Product.html.twig
    Checkout/Cart/
        Cart.php
        Cart.html.twig
```

The PHP namespace mirrors that folder layout (`FlexyBundle\UiComponents\<Path>`), and the `template:` option points at the same folder through the `@UiComponents` Twig namespace registered by Flexy.

### PHP component

```php
<?php
// templates/frontOffice/flexy/src/UiComponents/CategoryFilters/CategoryFilters.php

declare(strict_types=1);

namespace FlexyBundle\UiComponents\CategoryFilters;

use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\DefaultActionTrait;

#[AsLiveComponent(
    name: 'Flexy:CategoryFilters',
    template: '@UiComponents/CategoryFilters/CategoryFilters.html.twig'
)]
class CategoryFilters
{
    use DefaultActionTrait;

    #[LiveProp]
    public ?int $categoryId = null;

    #[LiveProp(writable: true)]
    public int $page = 1;

    public ?array $products = [];

    // ...
}
```

### Twig template

```twig
{# templates/frontOffice/flexy/src/UiComponents/CategoryFilters/CategoryFilters.html.twig #}
<div {{ attributes }}>
    <div class="product-grid">
        {% for product in products %}
            <div class="product-card">{{ product.i18ns.title }}</div>
        {% endfor %}
    </div>
    <button data-action="live#action" data-live-action-param="loadMore">
        Load More
    </button>
</div>
```

:::caution Always render `{{ attributes }}` on the root element
LiveComponents need `{{ attributes }}` on the single root tag to wire up the AJAX behavior. Omitting it breaks re-rendering.
:::

### Usage

```twig
{{ component('Flexy:CategoryFilters', {categoryId: categoryId, page: 1}) }}
```

## Key concepts

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

### Data binding

```twig
{# Immediate update #}
<input data-model="searchQuery" type="text">

{# Update on blur #}
<input data-model="on(change)|searchQuery" type="text">

{# Debounced (300ms) #}
<input data-model="debounce(300)|searchQuery" type="text">
```

## Forms integration

Use `ComponentWithFormTrait` to embed a Symfony Form. Build the Thelia form by name through `Thelia\Core\Form\FormServiceInterface`, which the core registers in the container. A no-op default implementation exists so the container builds even when no form renderer is active.

```php
<?php
// templates/frontOffice/flexy/src/UiComponents/Pages/Product/Product.php

declare(strict_types=1);

namespace FlexyBundle\UiComponents\Pages\Product;

use Symfony\Component\Form\FormInterface;
use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\ComponentToolsTrait;
use Symfony\UX\LiveComponent\ComponentWithFormTrait;
use Symfony\UX\LiveComponent\DefaultActionTrait;
use Thelia\Core\Form\FormServiceInterface;
use Thelia\Form\Definition\FrontForm;

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

    public function __construct(
        private readonly FormServiceInterface $formService,
    ) {}

    protected function instantiateForm(): FormInterface
    {
        return $this->formService->getFormByName(FrontForm::CART_ADD, [
            'product' => $this->product['id'],
            'quantity' => 1,
            'append' => 1,
            'newness' => 0,
        ]);
    }

    #[LiveAction]
    public function save(): void
    {
        $this->submitForm();

        if ($this->getForm()->isValid()) {
            // Process the submitted data...
        }
    }
}
```

:::tip Form names are constants
Pass a constant from `Thelia\Form\Definition\FrontForm` rather than a raw string. For a contact form use `FrontForm::CONTACT` (`thelia.front.contact`); for add-to-cart use `FrontForm::CART_ADD` (`thelia.cart.add`).
:::

See [Front-Office Forms](./forms) for detailed form handling.

## Events

LiveComponents talk to each other with `emit()` / `#[LiveListener]`. Flexy uses this to keep independent components in sync without coupling them.

### Emitting events

The product page (`Flexy:Pages:Product`) emits an `addToCart` event after adding the line to the cart:

```php
// templates/frontOffice/flexy/src/UiComponents/Pages/Product/Product.php
use Symfony\UX\LiveComponent\ComponentToolsTrait;

#[AsLiveComponent(
    name: 'Flexy:Pages:Product',
    template: '@UiComponents/Pages/Product/Product.html.twig'
)]
class Product
{
    use ComponentToolsTrait;

    #[LiveAction]
    public function save(): void
    {
        // Add the item to the cart...

        $this->emit('addToCart', [
            'values' => $this->formValues,
        ]);
    }
}
```

### Listening to events

A separate component, `Flexy:AddToCartToast`, listens for that event and refreshes itself to show the confirmation toast:

```php
// templates/frontOffice/flexy/src/UiComponents/AddToCartToast/AddToCartToast.php
use Symfony\UX\LiveComponent\Attribute\LiveArg;
use Symfony\UX\LiveComponent\Attribute\LiveListener;

#[AsLiveComponent(
    name: 'Flexy:AddToCartToast',
    template: '@UiComponents/AddToCartToast/AddToCartToast.html.twig'
)]
class AddToCartToast
{
    use DefaultActionTrait;

    #[LiveListener('addToCart')]
    public function addToCart(#[LiveArg] array $values): void
    {
        // Read $values['quantity'], $values['product_sale_elements_id']...
    }
}
```

:::note Pick a unique event name
The listener name must match the emitted name exactly (`'addToCart'` here). Flexy also uses constants for the checkout flow (see `FlexyBundle\UiComponents\Checkout\CheckoutEvents`) to avoid magic strings between many cooperating components.
:::

### Browser events

To trigger client-side JavaScript (a [Stimulus](./stimulus) controller, for instance) rather than another component, dispatch a browser event. `Flexy:Pages:Product` does this when the selected product sale element changes:

```php
$this->dispatchBrowserEvent('change:pse', ['pseId' => $this->currentPse['id']]);
```

## Loading states

```twig
<div {{ attributes }}>
    <div data-loading>Loading...</div>
    <div data-loading="hide">Content</div>
    <div data-loading="action(save)">Saving...</div>
    <button data-loading="addClass(opacity-50)">Submit</button>
</div>
```

## Using DataAccessService

Components read data from the front API through `Thelia\Api\Service\DataAccess\DataAccessService`:

```php
use Thelia\Api\Service\DataAccess\DataAccessService;

public function __construct(
    private readonly DataAccessService $dataAccessService,
) {}

public function mount(?int $categoryId): void
{
    $this->products = $this->dataAccessService->resources('/api/front/products', [
        'productCategories.category.id' => $categoryId,
    ]);
}
```

See [Data Access](./data-access) for the full service API.

## Creating a component in a module

A module can ship its own LiveComponent. There are two verified approaches.

### Option A: dedicated Twig namespace (canonical, theme-independent)

Register a Twig namespace from the module bundle, then point the component template at it. This keeps the component decoupled from whichever front theme is active.

```yaml
# local/modules/MyModule/config/packages/twig.yaml
twig:
    paths:
        "%kernel.project_dir%/local/modules/MyModule/templates/UiComponents": MyModuleComponents
```

```php
<?php
// local/modules/MyModule/UiComponents/NewsletterForm.php

declare(strict_types=1);

namespace MyModule\UiComponents;

use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\DefaultActionTrait;

#[AsLiveComponent(
    name: 'MyModule:NewsletterForm',
    template: '@MyModuleComponents/NewsletterForm.html.twig'
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

```twig
{# local/modules/MyModule/templates/UiComponents/NewsletterForm.html.twig #}
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

:::caution Components are only scanned if the module registers them
A Thelia 3 module must declare its service namespace via the static `configureServices()` method (`load()->autowire()->autoconfigure()`). Without it, no component class is discovered. See [Creating a Module](../modules/) for the full skeleton.
:::

### Option B: drop into the Flexy theme (simple, theme-coupled)

If you only target the Flexy theme, place the component directly under the theme's `UiComponents` folder so it resolves through the existing `@UiComponents` namespace:

```
templates/frontOffice/flexy/src/UiComponents/NewsletterForm/
    NewsletterForm.php
    NewsletterForm.html.twig
```

This is simpler but couples the component to the `flexy` theme. To override an existing Flexy template from a module instead, drop your file under `local/modules/MyModule/templates/frontOffice/flexy/`. The kernel scans that directory at boot and adds it after the active theme.

### Usage

```twig
{{ component('MyModule:NewsletterForm') }}
```

## Best practices

### Use facades for business logic

Delegate cart, customer, order and checkout operations to the core facades instead of touching models directly. The cart component injects `Thelia\Domain\Cart\CartFacade`:

```php
use Thelia\Domain\Cart\CartFacade;
use Thelia\Domain\Cart\DTO\CartItemDeleteDTO;

public function __construct(
    private readonly CartFacade $cartFacade,
) {}

#[LiveAction]
public function remove(#[LiveArg] int $cartItemId): void
{
    $this->cartFacade->removeItem(new CartItemDeleteDTO(
        cart: $this->cartFacade->getOrCreateFromSession(),
        cartItemId: $cartItemId,
    ));
}
```

### Minimize LiveProp data

```php
// Good - store only IDs
#[LiveProp]
public int $productId;

// Avoid - large serialized objects
#[LiveProp]
public array $fullProductWithAllRelations;
```

## Next steps

- [Stimulus](./stimulus): JavaScript controllers
- [Front-Office Forms](./forms): form handling
- [Data Access](./data-access): reading data from the front API
- [Flexy Theme](./flexy-theme/): see all components
