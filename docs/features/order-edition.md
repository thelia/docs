---
title: Order Edition
sidebar_position: 11
---

# Order Edition

Added in Thelia 3.3.

A merchant can change an order after it was placed: the quantity or the unit price of a line,
a line removed, a product added by its reference or its GTIN, the discount and the postage. The
totals are computed again, the stock follows the lines, the change goes to the order history,
and the customer can be told by mail.

## When an order can be edited

The order sheet of the back office shows an "Edit the lines" button, or the reason the order
cannot be edited:

- **An invoiced order is not edited.** Once the order has an invoice reference, changing what
  was sold needs a credit note.
- **Until it is sent.** The order is `not_paid`, `paid` or `processing`, or in a status of the
  shop declared equivalent to one of them.
- **Not when it is exempt from VAT.** The exemption was granted on the order as it was placed.

Editing the lines is a right of its own, `admin.order.edit`: an administrator who can update
an order (its status, its addresses) does not change its lines without it.

## What an edit does

The edit screen lists the lines with their quantity and unit price excluding tax, a field to
add a product, the discount and the postage. Nothing is written until the merchant saves:
"Preview the totals" shows the totals the order will have.

- **A line added** takes the label and the price of the catalogue at that moment, in the
  currency of the order and with the discount of the customer. Cart price rules are not applied
  again.
- **A price typed by hand** stays as typed and ends the promo of the line.
- **The taxes** of a changed line are computed again for the country of the invoice address.
- **The discount** typed replaces the discount of the order.
- **The postage** is never computed again: the merchant types it if it changes. Its tax keeps
  the rate of the old postage.
- **The stock** moves by the difference when the order holds it, as a change of status would.
- A quantity cannot go below what the customer already returned, and an order keeps at least
  one product.

The edit is applied whole or not at all. If someone changed the order between the moment the
screen was opened and the save, the save is refused instead of overwriting that change.

## A paid order

A paid order is edited like any other. When its total changes, the screen says what is left to
refund to the customer or to collect from them. Nothing is refunded or charged automatically:
the merchant does it through the payment module or by hand.

## Telling the customer

An edit is not mailed by default. The order status screen gains a third trigger for its
actions, "When the lines of an order in this status are edited": a mail action on it sends the
seeded message `order_edited`, which lists what changed and the new total. Only mail actions
run on this trigger. See [Order Status Transitions](./order-status-transitions.md).

## For developers

| Need | Where |
|------|-------|
| Apply or preview an edit | `Thelia\Domain\Order\Edition\OrderEditor` (`apply()`, `preview()`, `refusal()`, `fingerprint()`) |
| Describe an edit | `OrderEdit` and `OrderEditLine` in the same namespace |
| React to an edit | `TheliaEvents::ORDER_BEFORE_EDIT` (in the transaction) and `ORDER_AFTER_EDIT` (after the commit), with an `OrderEditEvent` |
| Read what changed | the `order_edited` line of the order history, or `order_changes` in the mail |

A preview runs the same code as a save and undoes it, without dispatching the events.
