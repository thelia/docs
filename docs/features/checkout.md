---
title: Checkout
sidebar_position: 1
---

# Checkout

Added in Thelia 3.1: ordering without an account, a tunnel described by configuration rather
than by theme code, and consent boxes the merchant manages.

## Ordering without an account

A visitor can place an order without opening an account. The guest is a `customer` row like any
other, with no password, marked by `customer.is_guest`, so everything an order hangs off (the
addresses, the invoice, the history) keeps working unchanged.

The feature ships switched off. `guest_checkout_mode` decides, and a shop that updates keeps
the tunnel it had:

| Value | Behaviour |
| --- | --- |
| `disabled` | The default. An account is required, as before. |
| `enabled` | A visitor can order as a guest. |
| `enabled_unless_product_forbids` | A visitor can order as a guest unless the cart holds a product that forbids it. |

A value the shop cannot read falls back to `disabled`.

In the third mode, a product is kept out of the guest tunnel by the
`product.guest_checkout_forbidden` column, which the back office exposes on the product sheet.
It is what a subscription, a downloadable licence or anything whose after-sales needs an
account should carry.

In the back office, the `guest_checkout_mode` field is on the Store info screen, under
Configuration > System.

### Finding the order again

A guest has no account to sign into, so the order confirmation carries a tracking link under
`/order/track/<token>`. The token is a signed three-part string, `orderId.expiresAt.signature`,
whose HMAC-SHA256 signature covers the order id, the expiry, the customer email and whether the
row is still a guest. It is built by
`Thelia\Domain\Order\Service\GuestOrderAccessService::createToken()` and keyed off the
application secret, so it cannot be forged and stops working the moment the guest becomes a
full customer.

The link lives for thirty days by default, which the `guest_order_tracking_link_lifetime`
setting changes, in seconds.

### Turning the purchase into an account

A guest can open an account afterwards, keeping the orders already placed. The front API
operation is:

```http
POST /api/front/guest-customers/{id}/convert
```

It answers `202 Accepted`. The conversion sets the password but leaves `is_guest` at 1 until an
activation code is answered, through the same mechanism a normal registration uses
(`CustomerCodeManager::activateCustomerByCode()`).

For developers, creating a guest dispatches `TheliaEvents::CUSTOMER_GUEST_CREATE`
(`action.create.customer.guest`) with a `CustomerGuestCreateEvent`.

## Configurable checkout steps

The checkout used to be written into the theme: three pages plus a confirmation, each page
checking the cart by hand and redirecting on its own. It is now described by configuration, in
the `checkout_step` table, which carries the order, the activation and the wording of each step.

Four steps are seeded, with the codes `cart`, `delivery`, `payment` and `confirmation`. A
merchant can turn off a step the shop does not use, and a download-only shop drops the delivery
step, which is why `delivery` is the only one of the four that is not mandatory.

Turning a step off removes its screen while its check still runs. When the order is placed, the
check of every registered step provider runs, in declared-position order, whatever the `active`
flag says. A shop cannot sell its way around a guard by hiding a screen.

The tunnel keeps a shape: the cart opens it, the payment comes next to last, the confirmation
closes it. The back office refuses any other arrangement, and a configuration broken behind its
back falls back to the steps the code declares, with a warning in the log, rather than refusing
to render.

A cart with nothing to ship no longer sees the delivery screen, and still gets the carrier the
order cannot be placed without:
`CheckoutFacade::settleVirtualDeliveryIfNeeded()` settles it once, and does nothing to any
other cart.

:::caution Deploy the SQL before the code
`checkout_step` is read on every page of the tunnel. A missing table falls back to the
providers' defaults with a log warning rather than breaking the checkout, but a shop should not
run on that fallback.
:::

The back-office screen is at `/admin/configuration/checkout-step`, behind the
`admin.configuration.checkout-step` resource.

### Display mode

`checkout_display_mode` picks the form the theme renders:

| Value | Form |
| --- | --- |
| `steps` | The default. One page per step, with a progress trail. |
| `one_page` | Every step stacked on a single screen, in an accordion, with no progress trail: the sections themselves say what is settled and what is left. |

A value the shop cannot read falls back to `steps`. In the single-page form, a locked section is
an unrendered section, and unlocking is display only: the refusal at placement stays on the
server.

### Shipping a step from a module

A step row carries the merchant's choices. What a step *does* lives in code, on a service
implementing `Thelia\Domain\Checkout\Service\Step\CheckoutStepProviderInterface`, autoconfigured
under the `thelia.checkout.step_provider` tag:

```php
namespace Thelia\Domain\Checkout\Service\Step;

interface CheckoutStepProviderInterface
{
    public function code(): string;
    public function defaultPosition(): int;
    public function isMandatory(): bool;
    public function isSkippedFor(Cart $cart): bool;
    public function check(Cart $cart): void;   // throws CheckoutException
    public function componentName(): ?string;
}
```

Ship one such service and the row appears on the back-office screen at the next visit. A row
whose provider is gone, because the module was uninstalled, is kept but left out of the tunnel.

`componentName()` is a hint and nothing more: the four core providers answer `null`, since
naming a component is the theme's business. It earns its place when a module ships a step no
theme has heard of.

`CheckoutProgressionService` is the single authority on where a cart stands, with
`activeSteps()`, `firstIncompleteStep()` and `isReachable()`. It never reads the session, so the
console and the front API consume it the same way a theme does.

## Consents at payment

The buyer accepts the terms and conditions before paying, and the merchant manages further
consent boxes from the back office.

A consent carries a stable code, a translated title and description, an optional link to a
content, a mandatory or optional flag and a position. It can be deactivated without being
deleted.

The `terms_and_conditions` consent is created on install and on update, taking over the content
the `terms_conditions_content_id` setting points at, so a shop that already had terms keeps
them. A fresh install creates it mandatory; a shop updating from 3.0 gets it optional, so that
a theme which does not render the consent box yet cannot block the checkout. Switch it to
mandatory from the consent screen once the theme shows it.

A mandatory active consent left unanswered stops the order: `ConsentGuard` throws a
`MissingConsentException` naming the consent by the wording the buyer was shown, rather than by
its code.

In the back office, the consents are managed under Configuration > Order path > Checkout
consents, at `/admin/configuration/consent`.

### What the order keeps

One `order_consent` row is written per active consent, inside the order transaction. It freezes
the wording as it was displayed, the answer, the date and the buyer's IP address, so rewording a
consent later never rewrites what was accepted. The row stores the consent *code*, not a foreign
key: the consent may be deleted, the proof stays.

Orders created from the back office or from the console record nothing, since nobody was asked.

The IP address travels with the customer's personal data export, because it is half of what
makes the acceptance evidence. Anonymization erases it and keeps the wording, the answer and the
date. See [Personal data](../security/personal-data.md).
