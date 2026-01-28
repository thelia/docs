---
title: Domain Facades
sidebar_position: 3
---

# Domain Facades

Facades in Thelia 3 are the primary entry point for business logic. They orchestrate multiple services and provide a clean API for common operations.

## Purpose

Facades serve several purposes:

1. **Simplify complex operations** - Combine multiple service calls into single methods
2. **Encapsulate business rules** - Validation, authorization, and side effects
3. **Provide session helpers** - Easy access to current cart, customer, etc.
4. **Ensure consistency** - Single source of truth for domain operations

## Available Facades

| Facade | Namespace | Purpose |
|--------|-----------|---------|
| `CartFacade` | `Thelia\Domain\Cart` | Cart operations, items, addresses |
| `CustomerFacade` | `Thelia\Domain\Customer` | Authentication, registration, profile |
| `OrderFacade` | `Thelia\Domain\Order` | Order management |
| `CheckoutFacade` | `Thelia\Domain\Checkout` | Checkout process orchestration |

## CartFacade

Manages shopping cart operations.

**Location:** `core/lib/Thelia/Domain/Cart/CartFacade.php`

### Usage

```php
<?php

declare(strict_types=1);

use Thelia\Domain\Cart\CartFacade;
use Thelia\Domain\Cart\DTO\CartItemAddDTO;
use Thelia\Domain\Cart\DTO\CartItemDeleteDTO;
use Thelia\Domain\Cart\DTO\CartItemUpdateQuantityDTO;

final readonly class CartController
{
    public function __construct(
        private CartFacade $cartFacade,
    ) {}

    public function addToCart(int $productId, int $productSaleElementId, int $quantity): void
    {
        $cart = $this->cartFacade->getOrCreateFromSession();

        $dto = new CartItemAddDTO(
            cart: $cart,
            productId: $productId,
            productSaleElementId: $productSaleElementId,
            quantity: $quantity,
        );

        $cartItem = $this->cartFacade->addItem($dto);
    }

    public function removeFromCart(int $cartItemId): void
    {
        $dto = new CartItemDeleteDTO(cartItemId: $cartItemId);
        $this->cartFacade->removeItem($dto);
    }

    public function updateQuantity(int $cartItemId, int $newQuantity): void
    {
        $dto = new CartItemUpdateQuantityDTO(
            cartItemId: $cartItemId,
            quantity: $newQuantity,
        );

        $cartItem = $this->cartFacade->updateItemQuantity($dto);
    }
}
```

### Methods

| Method | Description |
|--------|-------------|
| `addItem(CartItemAddDTO)` | Add product to cart |
| `removeItem(CartItemDeleteDTO)` | Remove item from cart |
| `updateItemQuantity(CartItemUpdateQuantityDTO)` | Update item quantity |
| `setDeliveryAddress(CheckoutDTO)` | Set delivery address |
| `setInvoiceAddress(CheckoutDTO)` | Set invoice address |
| `setDeliveryModule(CheckoutDTO)` | Select shipping method |
| `setPaymentModule(CheckoutDTO)` | Select payment method |
| `recalculatePostage(Cart)` | Force shipping recalculation |
| `reset(bool)` | Reset cart data |
| `getCartFromSession()` | Get current cart (nullable) |
| `getOrCreateFromSession()` | Get or create cart |
| `getDeliveryAddressId()` | Get selected delivery address |
| `getInvoiceAddressId()` | Get selected invoice address |
| `getDeliveryModuleId()` | Get selected shipping module |
| `getPaymentModuleId()` | Get selected payment module |

## CustomerFacade

Manages customer authentication and account operations.

**Location:** `core/lib/Thelia/Domain/Customer/CustomerFacade.php`

### Usage

```php
<?php

declare(strict_types=1);

use Thelia\Domain\Customer\CustomerFacade;
use Thelia\Domain\Customer\DTO\CustomerRegisterDTO;

final readonly class AccountController
{
    public function __construct(
        private CustomerFacade $customerFacade,
    ) {}

    public function getCurrentUser(): ?Customer
    {
        return $this->customerFacade->getCurrentCustomer();
    }

    public function isAuthenticated(): bool
    {
        return $this->customerFacade->isLoggedIn();
    }

    public function register(CustomerRegisterDTO $dto): Customer
    {
        return $this->customerFacade->register($dto);
    }

    public function logout(): void
    {
        $this->customerFacade->logout();
    }
}
```

### Methods

| Method | Description |
|--------|-------------|
| `login(CustomerLogin)` | Authenticate with credentials |
| `logout()` | End customer session |
| `getCurrentCustomer()` | Get authenticated customer (nullable) |
| `isLoggedIn()` | Check if customer is authenticated |
| `register(CustomerRegisterDTO)` | Create new account |
| `update(CustomerRegisterDTO, Customer)` | Update profile |
| `sendCode(Customer)` | Resend confirmation email |

## Using Facades in LiveComponents

```php
<?php

declare(strict_types=1);

namespace App\LiveComponent;

use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\DefaultActionTrait;
use Thelia\Domain\Cart\CartFacade;
use Thelia\Domain\Cart\DTO\CartItemAddDTO;

#[AsLiveComponent(name: 'AddToCart')]
final class AddToCart
{
    use DefaultActionTrait;

    #[LiveProp]
    public int $productSaleElementId;

    #[LiveProp(writable: true)]
    public int $quantity = 1;

    public function __construct(
        private readonly CartFacade $cartFacade,
    ) {}

    #[LiveProp]
    public int $productId;

    #[LiveAction]
    public function add(): void
    {
        $cart = $this->cartFacade->getOrCreateFromSession();

        $this->cartFacade->addItem(new CartItemAddDTO(
            cart: $cart,
            productId: $this->productId,
            productSaleElementId: $this->productSaleElementId,
            quantity: $this->quantity,
        ));

        $this->emit('cart:updated');
    }
}
```

## Using Facades in Twig

While facades are primarily used in PHP, you can access them in templates through services:

```twig
{# In a LiveComponent template #}
{% if this.customerFacade.isLoggedIn %}
    <p>Welcome, {{ this.customerFacade.currentCustomer.firstname }}!</p>
{% endif %}
```

## DTOs

Facades use Data Transfer Objects for method parameters:

### CartItemAddDTO

```php
readonly class CartItemAddDTO
{
    public function __construct(
        private Cart $cart,
        private int $productId,
        private int $productSaleElementId,
        private int $quantity = 1,
        private bool $append = true,
        private bool $newness = true,
    ) {}
}
```

### CartItemDeleteDTO

```php
final readonly class CartItemDeleteDTO
{
    public function __construct(
        public int $cartItemId,
    ) {}
}
```

### CartItemUpdateQuantityDTO

```php
final readonly class CartItemUpdateQuantityDTO
{
    public function __construct(
        public int $cartItemId,
        public int $quantity,
    ) {}
}
```

### CustomerRegisterDTO

```php
readonly class CustomerRegisterDTO
{
    public function __construct(
        private ?int $id = null,
        private ?string $firstname = null,
        private ?string $lastname = null,
        private ?string $email = null,
        private ?string $password = null,
        private ?int $title = null,
        private ?int $langId = null,
        private ?string $sponsor = null,
        private ?string $ref = null,
        private ?float $discount = null,
        private bool $forceEmailUpdate = false,
        private bool $enabled = false,
        private bool $reseller = false,
    ) {}
}
```

## Creating Custom Facades

For module-specific business logic, create your own facades:

```php
<?php

declare(strict_types=1);

namespace MyModule\Domain;

use MyModule\Service\WishlistService;
use MyModule\Service\WishlistNotificationService;

final readonly class WishlistFacade
{
    public function __construct(
        private WishlistService $wishlistService,
        private WishlistNotificationService $notificationService,
    ) {}

    public function addProduct(int $customerId, int $productId): void
    {
        $this->wishlistService->add($customerId, $productId);
        $this->notificationService->notifyProductAdded($customerId, $productId);
    }

    public function removeProduct(int $customerId, int $productId): void
    {
        $this->wishlistService->remove($customerId, $productId);
    }

    public function getWishlist(int $customerId): array
    {
        return $this->wishlistService->getByCustomer($customerId);
    }
}
```

Register in `config.xml`:

```xml
<service id="MyModule\Domain\WishlistFacade" autowire="true" />
```

## Best Practices

1. **Use DTOs for parameters** - Avoid primitive obsession
2. **Keep facades thin** - Delegate to services, don't implement logic
3. **One responsibility** - Each facade should focus on one domain
4. **Inject dependencies** - Use constructor injection
5. **Use readonly** - Facades should be immutable
6. **Type everything** - Full type hints on all methods

## Next Steps

- [Module Development](/docs/modules) - Creating modules with facades
- [API Resources](/docs/api/resources) - Exposing data via API
- [LiveComponents](/docs/front-office/live-components) - Using facades in components
