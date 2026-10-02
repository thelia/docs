---
title: Breaking changes
sidebar_position: 5
---

# Breaking changes

This page lists, release by release, what a module or a theme has to change when it moves to a new Thelia 3 version. It covers constructors you instantiate yourself, methods that changed contract, and behaviors a module may have relied on. Changes that need no action from you are in the CHANGELOG.

For the update procedure itself, see [Update](./update.md).

## Thelia 3.2

A class you read from the container needs nothing when its constructor gains arguments. The "has to pass" cases below concern a module that builds the class with `new`.

### Smarty back office removed

The Smarty back office (`thelia/backoffice-default-template`) is no longer required nor activated. `default-twig` is the only back office the core installs, and the Smarty one is not maintained in 3.x.

| | Before | After |
|---|--------|-------|
| Installed back office | `default-twig`, or the Smarty `default` side by side | `default-twig` only |
| `thelia/hook-admin-home-module` (dashboard of `default-twig`) | Came with the Smarty back office | Required by the root package |
| `thelia/smarty-module`, `thelia/web-profiler-module` | Installed in development | Not installed. The Symfony profiler stays; the Thelia panels it added (Smarty among them) go away |

The update script switches a shop whose `active-admin-template` is still `default` to `default-twig`, and turns off `TheliaSmarty` and `VirtualProductControl`, which only came with it.

A shop that still runs the Smarty back office has to:

1. require `thelia/backoffice-default-template` itself;
2. register `BackOfficeDefaultBundle\BackOfficeDefaultBundle` in `config/bundles.php`;
3. set `active-admin-template` back to `default`;
4. activate `TheliaSmarty` again.

Classes that moved with it:

- `Thelia\Form\Lang\LangUrlEvent` ships with the core, under the same name.
- `CouponAbstract::COUPON_FORM_NAME` names the coupon form the coupon fields are posted under. It replaces `Thelia\Form\CouponCreationForm::COUPON_CREATION_FORM_NAME`; the value is the same, `thelia_coupon_creation`.
- Every other class of `Thelia\Controller\Admin` and `Thelia\Form` that came with the Smarty back office goes away. A module that extends one of them stops loading. This includes the versions of EasyProductManager and EasyCustomerManager written before their Thelia 3 port (they extend `Thelia\Controller\Admin\ProductController`) and Dealer up to 4.0.0 (`Thelia\Controller\Admin\FileController`). EasyProductManager 4.0.0, EasyCustomerManager 3.0.0 and Dealer 4.0.7 onwards no longer use them.
- CustomerFamily reads the form name `thelia_product_creation` only, which `default-twig` builds too.

See [Back-office](../back-office/index.md) for the Twig conventions to port to.

### Payment modules

| | Before | After |
|---|--------|-------|
| Cart during `MODULE_PAY` | Emptied before the module is called: `pay()` read an empty cart | Kept until the payment is confirmed: `pay()` reads the cart the shopper filled. `AbstractPaymentModule::cartItemCount()` still answers 0 without a session |
| `getCurrentOrderTotalAmount($with_tax, $with_discount, $with_postage)` | Read the postage off the session order, which nothing in 3.x writes to: the amount never included the delivery | Counts the postage of the cart when `$with_postage` is `true`, as its signature always said |
| Cart that method prices | The session cart | The cart carried by `MODULE_PAYMENT_IS_VALID` while the module is asked whether it accepts the payment, the cart the order is built from while it is asked to pay (held by `PaymentCartContext`), the session cart only when no payment is under way. Taxed in the country of the delivery address, or of the customer's default address. Answers `0` outside any request instead of throwing |
| New attempt on the same cart | Another order was placed | Depends on `supportsPaymentRetry()`, see below |

What to do:

- A module that compares `getCurrentOrderTotalAmount()` to a minimum or a maximum now compares the amount the order will carry. FreeOrder, which accepted a free cart whose delivery is charged, now refuses it.
- `Thelia\Module\PaymentModuleInterface` declares `supportsPaymentRetry(): bool`. `AbstractPaymentModule` answers `false`, so a module extending it has nothing to do. A module implementing the interface directly has to declare the method. Say `true` only when the provider reference varies at each attempt and the notification finds the order back by the order's own reference.
- A module that relied on the cart being empty during `pay()` has to stop doing so.
- `ORDER_CART_CLEAR` stays declared and listened to, but `Thelia\Action\Order::create()` no longer raises it. A module that raises it itself still empties the cart and still retires the guest.

See [Payment modules](../modules/payment-modules.md#thelia-32) for the retry rules.

### Constructors that take new arguments

A module that instantiates one of these classes with `new` has to pass the new arguments. A module that reads the service from the container has nothing to do.

| Class | New or replaced arguments |
|-------|---------------------------|
| `Thelia\Action\Order::__construct()` | `PaymentCartContext` |
| `Thelia\Action\Payment::__construct()` | `PaymentCartContext` |
| `Thelia\Domain\Checkout\Service\CheckoutPaymentService::__construct()` | `OrderFacade`, `OrderFingerprint` and `PaymentCartContext`, on top of what it took |
| `Thelia\Controller\Admin\SessionController::__construct()` | `AdminTwoFactorManager` and `TwoFactorChallenge` |
| `Thelia\Core\HttpFoundation\Session\SessionManager::__construct()` | `AdminTwoFactorManager` and `TwoFactorChallenge` |
| `RefreshTokenController::__construct()` | `AdminTwoFactorManager` |
| `AuthenticationSuccessSubscriber::__construct()` | `AdminTwoFactorManager` |
| `Thelia\Core\Template\Loop\Product` | `EffectivePriceCatalog` and `PricingActivityChecker`, in place of `ReservedSalePriceCatalog` |
| `Thelia\Core\Template\Loop\ProductSaleElements` and `ProductSaleElementsAccessService` | `EffectivePriceCatalog`, in place of `ReservedSalePriceCatalog` |
| `Thelia\Action\Cart` | `EffectivePriceResolver` and `PricingActivityChecker`, in place of `ReservedSalePriceResolver` and `SaleAudienceChecker` |
| `Thelia\Domain\Media\MediaFacade::__construct()` | `FileProcessorService` and `ProductMediaOrder`, on top of what it took |
| `BackOfficeDefaultTwigBundle\Service\Dashboard\DashboardStatsProvider::__construct()` | `PeriodOptions`, which now builds the period presets the dashboard and the reports share |

`DashboardStatsProvider` belongs to the `default-twig` back-office theme, not to the core.

### Orders

- `Thelia\Model\Order::setCancelled()` takes the event dispatcher and goes through `ORDER_UPDATE_STATUS` instead of writing the status on the row.

  ```php
  // Before
  $order->setCancelled();

  // After
  $order->setCancelled($dispatcher); // Symfony\Contracts\EventDispatcher\EventDispatcherInterface
  ```

  A caller that cancelled an order by hand has to pass the dispatcher. It gets the restocking and the status listeners it did not have before.
- A stock shortage while an order is being written is raised as `Thelia\Domain\Order\Exception\StockShortageException`, which names the product, rather than as a plain `TheliaProcessException`. The class extends `TheliaProcessException`, so existing `catch` blocks still match. Code that matched the wording of the message to tell a shortage from another failure can match the class instead.
- A cart is turned into an order once, and the database is what says so: the order transaction locks the cart and refuses a second order for it. The guard covers every path that writes an order, `ORDER_CREATE_MANUAL` included. A cancelled order does not count. A shop running on more than one node should point `LOCK_DSN` at a store its nodes share; the shipped default, `flock`, is a file on the local disk.
- An order that carries a currency or a language when `ORDER_PAY` is raised is frozen with them, and the session is only read for what the order leaves unsaid. A module that set a currency on the order and relied on the session overriding it now gets the one it set.

### Pricing

- `Thelia\Api\EventListener\ReservedSalePriceListener` is now `EffectivePriceListener`: it serves the rule price as well as the reserved one.
- `Thelia\Api\Service\API\ResourceCache` reads `thelia.api.data_access.cache.visitor_dependent_price_prefixes` and asks `PricingActivityChecker`. The former `reserved_sale_sensitive_prefixes` parameter is kept as an alias of the new one.
- The front `ProductSaleElements` resource carries `displayInitialPrice`, null unless a rule or a reserved operation priced the sale element on that read.

### API persist and remove processors

The API persist and remove processors dispatch `Thelia\Api\Bridge\Propel\Event\ResourcePersistedEvent` after a write, and the collection provider dispatches `CollectionModelsLoadedEvent` before transforming a page. Nothing listens to them but the core; a module may.

### Image files are stored per language

The `file` column of the `*_image` tables (`product_image`, `category_image`, `content_image`, `folder_image`, `brand_image`, `module_image`) is dropped. The file now lives in `*_image_i18n.file`, nullable, so that each language of an image may show its own file.

| | Before | After |
|---|--------|-------|
| Where the file is stored | `product_image.file` | `product_image_i18n.file` (same for the five other image types) |
| `getFile()` on an image model | The column of the row | The file of the current locale. A language without a file of its own shows the file of the default language when the shop replaces missing translations (`default_lang_without_translation`), and an empty string otherwise |

The model classes use `Thelia\Model\Tools\LocalizedFileTrait`, which also offers `getOwnFile()` (the file of the current locale, or `null`), `getStoredFiles()` and `isFileUsedByAnotherLocale()`.

What to do:

- Read the file through the model (`getFile()`), not through SQL or a query on the image table: `ProductImageQuery` no longer has `filterByFile()`. Query the `*_image_i18n` table (or join it with `joinWithI18n()`) when you need to filter on the file. `setFile()` on an image model writes the file of its current locale.
- A module that creates image rows with its own SQL must write the file into the translation.
- The update script `setup/update/sql/3.2.0.sql` copies the file into every translation of each image, gives the default language a translation when it had none, then drops the column. A shop that came from Thelia 2.6 already holds the files in the translations: they are kept as they are. An empty file name is stored as `NULL`.

### Back-office list actions and CSRF token

- The toggle and position actions of `Thelia\Controller\Admin\AbstractCrudController` (`setToggleVisibilityAction()`, `updatePositionAction()`, `genericUpdatePositionAction()`) answer 403 to a request without the session token. A module whose back-office list toggles or reorders rows through them has to send `_token`.
- `Thelia\Tools\TokenProvider::checkRequestToken()` reads the token from the `_token` body field, then from the `X-CSRF-Token` header, then from the query string.

  | Token sent in | 3.2 |
  |---------------|-----|
  | Request body (`_token`) | Accepted. Use a POST request |
  | `X-CSRF-Token` header | Accepted |
  | Query string | Still accepted, with a deprecation. The same applies to a value a caller read from the URL itself and handed to `checkToken()` |

  A token in the URL leaks through access logs, browser history and Referer headers. Move the action to a POST request that carries the token in the body. Setting the `thelia.token.accept_query_string` parameter to `false` refuses a token in the URL; a later version will make that the default (3.3).

  ```yaml
  # config/services.yaml of the project, to test your module before the default changes
  parameters:
      thelia.token.accept_query_string: false
  ```

### Product media positions

The images and the videos of a product share one sequence of positions. Moving a product image up or down swaps it with the medium right before or after it, whichever table that medium lives in, and deleting one closes the gap in both tables. A module reading `product_image.position` alone may find gaps where the videos sit.

### Admin log and request dump

`Thelia\Core\HttpFoundation\Request::toString()` leaves the `Cookie` and `Authorization` headers out, and the `PHP_AUTH_USER`, `PHP_AUTH_PW` and `PHP_AUTH_DIGEST` values Symfony copies into the headers. A module reading these from the dump, for instance in a custom log, no longer finds them.

### API Platform pinned to 4.3

`thelia/core` declares a Composer `conflict` with `api-platform/symfony` and the split packages `documentation`, `http-cache`, `hydra`, `json-schema`, `jsonld`, `metadata`, `openapi`, `serializer`, `state` and `validator` from 4.4.0 (`>=4.4.0 <5.0`). The line stays on API Platform 4.3.x: the upgrade command of 4.4 breaks the console in a project that does not use Doctrine. A project or a module that requires API Platform 4.4 or later cannot be installed next to Thelia 3.2.
