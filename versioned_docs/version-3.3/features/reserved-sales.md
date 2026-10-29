---
title: Reserved Sales and Countdown
sidebar_position: 3
---

# Reserved Sales and Countdown

Added in Thelia 3.1.

A sale (a commercial operation) used to be public: it activated, wrote its discount into the
catalogue, and every visitor saw it. A sale can now be reserved for named customers, and a
dated sale can display a countdown on the storefront.

## Reserving a sale

`sale.audience_mode` decides who the sale is for:

| Value | Audience |
| --- | --- |
| `0` | Everyone. The historical behaviour, and the default. |
| `1` | The customers named on the sale, stored in the `sale_customer` table. |
| `2` | Customer groups. Modelled, not implemented: customer groups do not exist in the core yet. |

A reserved sale is invisible to anyone it is not open to. Its page answers 404 and its discount
is never served. When the merchant also ticks `sale.hide_products`, the products it covers
disappear from the listings, the front API and the product page for everyone else, instead of
showing at their usual price.

A product covered by two hidden sales stays visible to a customer named on either one.

Guest accounts are never entitled to a reserved sale: a guest row is reusable by email, so it
cannot carry an entitlement.

### What the customer sees

An entitled customer sees the discounted price wherever a price is shown, and only if it beats
the current public price, so nobody entitled ever pays more than a visitor. The price follows
the cart: it is settled when the cart changes, at sign-in and when a cart is restored. A
customer who loses the entitlement falls back to the public price at the next cart refresh.

An order keeps the price it was placed at, in `order_product.promo_price` and
`order_product.was_in_promo`.

## The countdown

`sale.countdown_mode` decides when the storefront starts counting down:

| Value | Countdown shows |
| --- | --- |
| `0` | Never. The default. |
| `1` | From `sale.countdown_lead_hours` hours before the end date. |
| `2` | From the moment the sale opens. |

The decision is taken on the server, by `Sale::shouldDisplayCountdown()`: never without an end
date, and never before the start date. What reaches the browser is a remaining duration in
seconds rather than a date, so a wrong clock on the visitor's machine cannot produce a negative
countdown.

Closing the sale and putting the prices back is still the job of the `sale:check-activation`
command, as for any public sale.

### Configuring it

Back office: **Tools > Sales**, then the targeting block of a sale (public, or named customers
with the customer picker) and the countdown settings. The countdown settings are refused on a
sale with no end date. The list shows the recipient count of every reserved sale, and turns it
into an alert when the count is zero, which happens on its own: both foreign keys of
`sale_customer` cascade, so deleting the last targeted customer empties the audience silently.

## For developers

The reserved price is deliberately absent from the schema. A public sale writes its discount to
`product_sale_elements.promo` and `product_price.promo_price` when it activates; a reserved sale
never does, because those two columns are what every visitor reads. Its price is resolved at
read time, batched, for entitled customers only, and persisted only once the customer acts on
it.

The parts, all under `Thelia\Domain\Sale`:

| Class | Role |
| --- | --- |
| `SaleDiscountCalculator` | The taxed-offset formula, shared by the written path and the resolved path so both agree to the cent. |
| `SaleAudienceChecker` | Is this customer named on that sale, and is any reserved sale running at all. Memoized per request. |
| `ReservedSalePriceResolver`, `ReservedSalePriceCatalog` | Batch resolution. The catalogue memoizes the visitor's entitled set once per request, so a listing costs no query per card. |
| `ReservedSaleVisibility` | The single owner of the hiding rule, applied by the product loops, the front API extensions and the product view check. |
| `CurrentCustomerProvider` | The visitor, read from the session first, then from the JWT token storage for direct `/api/front` calls. |

The shared data-access cache would leak a per-customer price, so the `/api/front/products` and
`/api/front/product_sale_elements` prefixes bypass it while a reserved sale is running, and only
then.

### API

Two read-only resources ship with the release:

- `GET /api/front/sales` and `GET /api/front/sales/{id}`
- `GET /api/admin/sales` and `GET /api/admin/sales/{id}`

They expose `audienceMode`, `hideProducts`, `countdownMode`, `countdownLeadHours`,
`shouldDisplayCountdown`, `countdownRemainingSeconds`, `productIds` and `publicUrl`, alongside
the usual `active`, `startDate`, `endDate`, `displayInitialPrice`, `priceOffsetType` and
`i18ns`. The list of entitled customers never leaves the back office. Reserved sales are absent
from the front collection for anyone not named on them, and the item operation answers 404.

:::note The `sale` loop
The legacy `sale` loop applies the same visibility filters and exposes the countdown outputs,
but price *sorting* still uses the raw catalogue columns, so a reserved price does not take part
in it. See the [Sale loop reference](../reference/loops/Sale.md).
:::
