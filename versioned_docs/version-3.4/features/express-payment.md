---
title: Express Payment
sidebar_position: 16
---

# Express Payment

Added in Thelia 3.4.

A wallet such as Google Pay or Apple Pay can take the payment of the checkout. The buyer goes
through the checkout as usual: they sign in or order as a guest, then choose the addresses and
the carrier. At the payment step the wallet is listed among the payment methods. Once the buyer
chooses it, the wallet's own button takes the place of the order button. The wallet only pays
for what the checkout already wrote on the cart.

Thelia knows nothing of any wallet. It provides the place, the amount the sheet charges, the
confirmation route and the order. A payment module provides the button, its script and the
conversation with its provider.

## Turning it on

Express payment is off in every shop until the merchant turns it on, so an updated shop shows
nothing new. The setting `express_payment_zones` is a comma separated list of zones. It is empty
by default. The only zone today is `checkout`. Unknown entries are dropped.

A button shows only where the merchant turned the zone on and the module declared the zone.

## What the buyer sees

- The wallet appears in the list of payment methods.
- Once chosen, its button replaces the order button. It stays inactive while the order button
  would be inactive, for example while a consent is not ticked.
- When the buyer clicks, the wallet sheet opens with the grand total of the cart, postage and
  gift wrapping included.
- Once the wallet confirms and the provider vouches for the payment, the order is placed and the
  buyer lands on the confirmation page.

A module that only offers its wallet (`isAlsoOfferedAtCheckout()` answers `false`) cannot be used
through the ordinary order button. The ordinary placement refuses it, in the front office and
through the front API, so a forged request cannot mark an order paid with nothing taken.

## The two routes of the shop

The shop owns the two routes the button's script calls. Both are `POST` and answer JSON. A token
signed for the cart and the module guards them. It travels in the `X-Express-Confirmation-Token`
header or in the `express_confirmation_token` field.

| Route | Answer |
| --- | --- |
| `/checkout/express/{moduleCode}/amount` (`express_checkout_amount`) | `deliveryChosen` and `totalTaxIncluded`. `deliveryChosen` is `false` until a carrier and a delivery address are on the cart. |
| `/checkout/express/{moduleCode}/confirm` (`express_checkout_confirm`) | `orderId`, `orderReference`, `orderStatus`, `paid`, `alreadyPlaced`, `nextUrl` and `paymentAction`. |

The confirmation places the order through `CheckoutPlacementService::place()`, the same door as
the ordinary checkout. It compares the total the sheet showed with the total of the shop, to the
cent. A difference places nothing.

| Status | Meaning |
| --- | --- |
| 403 | The token is not the one issued for this cart and module, or the module takes no express payment. |
| 409 | A placement of this cart is already running, or the stock ran out meanwhile. |
| 422 | A refusal whose message gives the reason: no carrier yet, a total that differs, a buyer nobody identified, nothing to pay. |

A decoupled front lists the buttons with `GET /api/front/payment/express-buttons?zone=checkout`.
The answer carries the routes and the token of the shop for the cart in hand.

## Writing a wallet module

The module implements `Thelia\Module\ExpressPaymentModuleInterface`. The interface does not
extend `PaymentModuleInterface`: a wallet module implements both, and every module written
before express payment keeps working untouched.

| Method | What the module answers |
| --- | --- |
| `expressPaymentZones(): array` | The `ExpressPaymentZone` cases it can fill. Today only `ExpressPaymentZone::Checkout`. |
| `isAlsoOfferedAtCheckout(): bool` | `false` for a wallet. `true` for a module that also takes a card through the ordinary checkout. |
| `expressPaymentButton(Cart $cart, ExpressPaymentZone $zone): ?ExpressPaymentButton` | The button for this cart, or `null` to show nothing. It is called on every render of the payment step, so it must not call the provider. |
| `readExpressPaymentConfirmation(Request $request, Cart $cart): ExpressWalletAnswer` | What the wallet handed back, once the provider vouches for it. Throws `ExpressCheckoutRefusedException` otherwise. |

`ExpressWalletAnswer` holds `totalTaxIncludedShownToTheBuyer` and an optional `consentAnswers`
array. It names neither the cart nor the buyer: the shop already holds both.

`ExpressPaymentButton` holds `paymentModuleId`, `paymentModuleCode`, `code`, `label`, an optional
`logo` and `attributes`. The shop adds `confirmationUrl`, `confirmationToken` and `amountUrl`. A
module never builds these itself.

To render the button, register a theme hook on `checkout.express-payment`. The Flexy payment step
renders that hook. Read the buttons with
`ExpressPaymentButtonCollector::collect($cart, ExpressPaymentZone::Checkout)` and put
`data-express-payment-module="<module code>"` on the root element of each one.

In the script:

1. Ask the amount route on load, and again on the `checkout:summary-changed` browser event, which
   the theme dispatches whenever the summary changes. Keep the button disabled while
   `deliveryChosen` is `false`.
2. Open the wallet sheet inside the click, with the total from the amount route.
3. Post the wallet data to the confirmation route with the token, then follow `nextUrl`.

### Releasing an authorization that was not used

The module reads its provider's answer before the order exists, and the placement can still fail
after that: the stock ran out, a placement is already running, or the total differs. The shop then
dispatches `Thelia\Core\Event\Checkout\ExpressPaymentNotPlacedEvent`.

| Method | Returns |
| --- | --- |
| `getPaymentModuleCode()` | The code of the module, to filter on. |
| `getCart()` | The cart the module was handed. |
| `getAnswer()` | The `ExpressWalletAnswer` the module returned. |
| `getReason()` | The exception, or `null`. |
| `wasAlreadyPlaced()` | `true` when `getReason()` is `null`: an earlier confirmation already placed the order. |

A module whose provider takes the money in two steps should authorize in
`readExpressPaymentConfirmation()`, capture in `pay()`, and release on this event the
authorization it still holds. Do not release what `pay()` already captured. A refusal the module
made itself is not reported, and a listener that fails is logged without changing the answer.
