---
title: Stock, preorder and low stock alerts
sidebar_position: 16
---

# Stock: reservation, preorder and low stock alerts

Added in Thelia 3.4.

Three features sit on top of the stock of a combination:

- **Preorder**: keep selling a combination after its stock reaches zero.
- **Reservation**: hold the stock of a cart while the customer checks out.
- **Low stock alert**: get an e-mail when a combination runs low.

`product_sale_elements.quantity` stays the physical stock. What a customer can buy is computed
beside it, and the cart, the order, the quick order, the loops, the availability facet and the front
API all read that same number. A product page, a product card, the cart and the API show the same
quantity.

The sellable quantity is the physical stock, plus what the combination may sell below zero, less
what other carts hold.

## Preorder

Each combination has an **At zero stock** setting, in the product's **Combinations** tab:

| Value | Back-office label | Effect |
| --- | --- | --- |
| `0` | Refuse the sale | The sale is refused at zero. This is the default and the behaviour of earlier versions. |
| `1` | Keep selling | The sale goes on without limit. The stock can go below zero. |
| `2` | Sell up to a limit (preorder) | The sale goes on until the stock is **Preorder limit** units below zero. With a limit of 10 and a stock of 0, the 11th unit is refused. |

**Restock date** is the date the merchant expects new stock. It is shown to customers and kept on
the orders.

An order line sold above the physical stock is flagged as a preorder, and keeps the restock date of
that moment. The order confirmation and notification e-mails of the default e-mail theme print it.
In the back office, the order list can be filtered on preorder lines (**with** or **without**) and
flags an order that holds one.

### Preorder follow-up

**Catalog > Preorder follow-up** (`/admin/preorders`, view right on products) lists the combinations
whose stock is below zero and that are sold below zero. For each one it shows:

- **To order**: the stock the combination lacks. With a stock of 3 and open orders of 2, 4 and 2,
  the merchant has to order 5.
- **Open orders** that are concerned;
- the **Restock date**.

The list is sorted by restock date, then by shortage, 25 rows per page. The own stock of sale units
is not counted.

## Stock reservation

Reservation is off by default. A shop that does not turn it on runs as before.

Turn it on in **Configuration > Store info**, with these settings:

| Setting | Variable | Default | Meaning |
| --- | --- | --- | --- |
| Reserve the stock of a cart | `stock_reservation_enabled` | `0` | Turns the feature on. |
| The reservation starts | `stock_reservation_scope` | `checkout` | `checkout`: when the customer enters the checkout. `cart`: as soon as an item is added, and after each change of the cart. |
| Reservation duration (minutes) | `stock_reservation_duration` | `15` | How long the lines of a cart are held after the last step. |

While a line is held, until `cart_item.reserved_until`, no other cart can buy that unit. A
reservation past its time is never counted, whether or not the purge ran.

When two customers pay for the last held unit at the same moment, one order is created and the
other is refused with an explicit message (409 on the front API).

A line stays held for at most four reservation durations from its first hold. Past that, holding
it again does not push its date back.

In the **Combinations** tab, the sellable quantity is shown under the physical stock ("Sellable:
unlimited" when the combination sells without limit). Hover it to see the quantity held by carts,
the number of carts and the nearest expiry. A bundle shows nothing there.

### Limits on holds

New holds are capped: 60 per hour for a cart and
300 per hour for a client address (no address cap on the command line). Extending or changing a line
already held is free.

Set the caps with the environment variables `THELIA_STOCK_RESERVATION_RATE_LIMIT_PER_CART` and
`THELIA_STOCK_RESERVATION_RATE_LIMIT_PER_CLIENT`.

Over the cap, the checkout API and the express checkout answer 429 with a `Retry-After` header.
A cart change keeps the lines it could not hold unreserved. Flexy shows the delay at the checkout
step. A line that is out of stock is refused as before, not as a rate limit.

### Purge

`stock:reservation:purge` clears the reservations that ran out. See
[stock:reservation:purge](../reference/cli/stock_reservation_purge.md). The schedule runs it every
10 minutes. Change the schedule with `THELIA_SCHEDULE_STOCK_RESERVATION_PURGE`, a cron expression.

### For a theme

A theme that has its own checkout calls `CheckoutFacade::holdStock()` when the customer enters it.

## Low stock alert

The shop-wide **Low stock threshold** is a setting in **Configuration > Store info**
(`low_stock_threshold`, 5 by default). A combination can override it with its own **Low stock
threshold** in the **Combinations** tab. Empty means the shop's threshold applies.

When a stock change crosses the threshold, the shop e-mails the `low_stock_alert` message to its
notification addresses. The **Dashboard** lists the combinations under their threshold. The threshold does
not apply to a bundle, whose stock is the one of its components: a bundle can either be ordered or not.

The message is rendered from the active e-mail template. A shop that uses an e-mail template of its
own must add `low_stock_alert.html.twig` and `low_stock_alert.txt.twig` to it. Until then the alert
is logged and not sent. The order is never affected.

If the StockAlert module also mails the shop owner under its own threshold, the shop gets both
mails. Keep one of the two.

## Developer reference

### API

On the front API, a combination exposes:

| Field | Meaning |
| --- | --- |
| `availableQuantity` | The sellable quantity. Left out when it is unlimited. |
| `isPreorder` | Whether the next unit sold is a preorder. |
| `outOfStockPolicy` | `0`, `1` or `2`. |
| `restockDate` | The restock date. |

`preorderLimit` is also on the product read. These fields are in the listings too.

On the admin API, `/api/admin/product_sale_elements` reads and writes `outOfStockPolicy`,
`preorderLimit`, `restockDate` and `lowStockThreshold`.

### Loops

| Loop | New outputs |
| --- | --- |
| `product_sale_elements` | `OUT_OF_STOCK_POLICY`, `PREORDER_LIMIT`, `RESTOCK_DATE` |
| `order_product` | `IS_PREORDER`, `RESTOCK_DATE` |

### Classes

| Class | Role |
| --- | --- |
| `Thelia\Domain\Catalog\Stock\SellableStock` | The sellable quantity of a combination. |
| `Thelia\Domain\Catalog\Stock\PreorderRule` | The one rule that tells a preorder apart. |
| `Thelia\Domain\Catalog\Stock\OutOfStockPolicy` | The three policies. |
| `Thelia\Domain\Catalog\Stock\StockSettings` | The shop-wide settings. |

### Events

| Constant | Event class | When |
| --- | --- | --- |
| `TheliaEvents::PRODUCT_SALE_ELEMENTS_STOCK_CHANGED` (`thelia.pse.stock_changed`) | `StockLevelChangedEvent` | After a stock change is committed. |
| `TheliaEvents::PRODUCT_SALE_ELEMENTS_LOW_STOCK_REACHED` (`thelia.pse.low_stock_reached`) | `LowStockReachedEvent` | The stock crossed the threshold. The shop mails the alert on this event. A module can plug a restocking. |
| `TheliaEvents::STOCK_RESERVED` (`thelia.pse.stock_reserved`) | `StockReservedEvent` | Lines of a cart are reserved. |
| `TheliaEvents::STOCK_RELEASED` (`thelia.pse.stock_released`) | `StockReleasedEvent` | Lines of a cart are released. |

The stock change event is sent once the transaction is committed. Inside a transaction of the
caller it waits for the end of the request, the command or the message, and it is never sent when
that transaction is rolled back. It is dispatched by an order, a change of order status, the
back-office edit of a combination, `PSEFacade`, the stock import, the reception of an order return,
and a `PUT` or `PATCH` of `/api/admin/product_sale_elements` or of `/api/admin/products/{id}`.

The reservation events are sent once per cart, never on a rollback, with the cart id and the lines
(cart item id, combination id, quantity). A line is told reserved once and released once.
Extending a hold tells nothing. Changing the quantity of a held line tells the old quantity
released, then the new one reserved. A line is released when it is deleted, when its cart is emptied
or purged, when it is ordered, and when `stock:reservation:purge` clears its date. A listener that
fails is logged and stops nothing.
