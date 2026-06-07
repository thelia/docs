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

These are the four facades you will use most often in a front office:

| Facade | Namespace | Purpose |
|--------|-----------|---------|
| `CartFacade` | `Thelia\Domain\Cart` | Cart operations, items, addresses |
| `CustomerFacade` | `Thelia\Domain\Customer` | Authentication, registration, profile |
| `OrderFacade` | `Thelia\Domain\Order` | Order creation |
| `CheckoutFacade` | `Thelia\Domain\Checkout` | Checkout process orchestration |

:::note
These four are the most common front-office facades, but they are not the only ones. The core ships around sixteen domain facades. The others are organized by domain under `Thelia\Domain\`:

- `AddressFacade` — `Thelia\Domain\Addressing`
- `ShippingFacade` — `Thelia\Domain\Shipping`
- `ProductFacade` and `PSEFacade` — `Thelia\Domain\Catalog\Product`
- `CategoryFacade` — `Thelia\Domain\Catalog\Category`
- `BrandFacade` — `Thelia\Domain\Catalog\Brand`
- `CurrencyFacade` — `Thelia\Domain\Catalog\Currency`
- `TaxFacade` — `Thelia\Domain\Catalog\Tax`
- `MediaFacade` — `Thelia\Domain\Media`
- `ContentFacade` — `Thelia\Domain\CMS\Content`
- `LocalizationFacade` — `Thelia\Domain\Localization`

Some catalog facades are nested deeper than the top-level domain (for example `Thelia\Domain\Catalog\Product`), so always confirm the exact namespace against the class file before importing it.
:::

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

    public function removeFromCart(Cart $cart, int $cartItemId): void
    {
        $dto = new CartItemDeleteDTO(cart: $cart, cartItemId: $cartItemId);
        $this->cartFacade->removeItem($dto);
    }

    public function updateQuantity(Cart $cart, int $cartItemId, int $newQuantity): void
    {
        $dto = new CartItemUpdateQuantityDTO(
            cart: $cart,
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
| `getOrCreateForCustomer(Customer)` | Get or create a cart for a given customer |
| `getOrCreateFromSession()` | Get or create cart from the current session |
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
| `login(CustomerLogin): void` | Authenticate with credentials, set the session and remember-me cookie |
| `logout(): void` | End customer session |
| `getCurrentCustomer(): ?Customer` | Get authenticated customer (nullable) |
| `isLoggedIn(): bool` | Check if customer is authenticated |
| `register(CustomerRegisterDTO): Customer` | Create new account, returns the created customer |
| `update(CustomerRegisterDTO, Customer): void` | Update an existing customer profile |
| `sendCode(Customer): void` | Resend an account code email |

:::caution
`update()` returns `void`, not `Customer`. The updated state is applied in place on the `Customer` model you pass in. Only `register()` returns a `Customer`.
:::

## CheckoutFacade

Orchestrates the checkout flow: selecting addresses and modules, validating the cart, paying, and cancelling.

**Location:** `core/lib/Thelia/Domain/Checkout/CheckoutFacade.php`

### Usage

```php
<?php

declare(strict_types=1);

use Symfony\Component\HttpFoundation\Response;
use Thelia\Domain\Checkout\CheckoutFacade;
use Thelia\Domain\Checkout\DTO\CheckoutDTO;
use Thelia\Model\Cart;

final readonly class CheckoutController
{
    public function __construct(
        private CheckoutFacade $checkoutFacade,
    ) {}

    public function placeOrder(Cart $cart): ?Response
    {
        $dto = new CheckoutDTO(
            cart: $cart,
            deliveryModuleId: 1,
            deliveryAddressId: 42,
            invoiceAddressId: 42,
            paymentModuleId: 2,
        );

        // Validates the cart, then runs the payment module.
        return $this->checkoutFacade->pay($dto);
    }
}
```

### Methods

| Method | Description |
|--------|-------------|
| `selectDeliveryAddress(CheckoutDTO): void` | Select the delivery address and refresh shipping |
| `selectInvoiceAddress(CheckoutDTO): void` | Select the invoice address and refresh shipping |
| `selectDeliveryModule(CheckoutDTO): void` | Select the delivery module and refresh shipping |
| `selectPaymentModule(CheckoutDTO): void` | Select the payment module and refresh shipping |
| `validateForOrder(Cart): void` | Check the cart is ready for order placement (items, addresses, payment) |
| `pay(CheckoutDTO): ?Response` | Validate then run the payment module, returns the payment `Response` if any |
| `cancelOrder(int): Order` | Cancel an order by its identifier |
| `resetCheckout(): void` | Reset checkout selections on the cart and clear postage |

:::note
`CheckoutDTO` is constructed from a `Cart`. Any identifier you leave `null` (delivery module, delivery/invoice address, payment module) is back-filled from the cart's current selection in the constructor. Pass only what you want to override.
:::

## OrderFacade

Creates an `Order` from a session order and a cart, within a single Propel transaction (stock decrement, taxes, addresses, virtual products).

**Location:** `core/lib/Thelia/Domain/Order/OrderFacade.php`

### Usage

```php
<?php

declare(strict_types=1);

use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Thelia\Domain\Order\OrderFacade;
use Thelia\Core\Security\User\UserInterface;
use Thelia\Model\Cart;
use Thelia\Model\Currency;
use Thelia\Model\Lang;
use Thelia\Model\Order;

final readonly class PlaceOrderHandler
{
    public function __construct(
        private OrderFacade $orderFacade,
        private EventDispatcherInterface $dispatcher,
    ) {}

    public function place(
        Order $sessionOrder,
        Currency $currency,
        Lang $lang,
        Cart $cart,
        UserInterface $customer,
    ): Order {
        return $this->orderFacade->createOrder(
            dispatcher: $this->dispatcher,
            sessionOrder: $sessionOrder,
            currency: $currency,
            lang: $lang,
            cart: $cart,
            customer: $customer,
        );
    }
}
```

### Methods

| Method | Description |
|--------|-------------|
| `createOrder(EventDispatcherInterface, Order, Currency, Lang, Cart, UserInterface, bool): Order` | Persist a placed order from the session order and cart, in one transaction |

:::note
`createOrder()` throws `TheliaProcessException` if the customer, currency, language, or cart has no identifier. The optional last argument `bool $useOrderDefinedAddresses = false`: when `true`, the existing `OrderAddress` rows are reused instead of creating new ones from the chosen addresses.
:::

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
readonly class CartItemDeleteDTO
{
    public function __construct(
        private Cart $cart,
        private int $cartItemId,
    ) {}
}
```

### CartItemUpdateQuantityDTO

```php
readonly class CartItemUpdateQuantityDTO
{
    public function __construct(
        private Cart $cart,
        private int $cartItemId,
        private int $quantity,
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

A module facade placed under `src/` needs no XML. As long as your module declares `configureServices()` with `autowire()` and `autoconfigure()`, the class is registered and its dependencies are injected automatically:

```php
// local/modules/MyModule/MyModule.php
use Symfony\Component\DependencyInjection\Loader\Configurator\ServicesConfigurator;
use Thelia\Module\BaseModule;

final class MyModule extends BaseModule
{
    public static function configureServices(ServicesConfigurator $services): void
    {
        $services->load(self::getModuleCode().'\\', __DIR__)
            ->autowire()
            ->autoconfigure();
    }
}
```

:::note
`configureServices()` is mandatory: without it, no class in the module is scanned at all (auto-registration is reverted). Once it is present, you do not declare individual services such as a facade in `config.xml` — that file is optional in Thelia 3 and only needed for things `configureServices()` cannot express (for example `<exports>`, `<imports>`, `<parameters>`, or a `<loop>` alias).
:::

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
