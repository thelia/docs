---
title: Payment Journal and Deferred Capture
sidebar_position: 17
---

# Payment Journal and Deferred Capture

Added in Thelia 3.4.

Every money movement on an order is written to a journal: an authorization, a capture, a refund or
a void. Each line keeps the amount, the currency, the outcome, the reference the provider gave
and who did it. A payment module that reserves the amount first and takes it later can say so.
Thelia then offers the capture in the back office and in the admin API, checks it against what the
authorization holds, and moves the order along.

## The journal

The table is `order_payment_transaction`. One line is one movement.

| Field | Meaning |
| --- | --- |
| Type | `authorization` reserves an amount. `capture` takes it. `void` releases what an authorization still holds. `refund` gives back what was taken. |
| Outcome | `pending` (the provider has not answered), `succeeded` or `failed`. |
| Amount and currency | The amount of the movement, in the currency of the order. |
| Provider reference | The reference the provider gave, 100 characters at most. |
| Error code and message | What the provider answered when the movement failed. For the back office only, never shown to the customer. |
| Author | The payment module, an administrator or the shop, and when. |

Lines are only added. A pending line is settled once, with its answer. Orders placed before the
update show no movement until their next payment event. `order.transaction_ref` is not touched.

### Orders paid at once

A module that takes the price at once, such as Cheque or the free order module, needs no change.
When an order reaches a paid status from an unpaid one, the journal gets a succeeded capture of
the order total. When an administrator marks the order paid by hand, the line names that
administrator. No line is written when the journal already holds an authorization or a capture.

When an order moves to a refunded status, the journal gets a refund of everything it still counts
as taken.

## Capturing a payment

When a module authorizes first, the order sheet of the back office shows a payment card with the
totals, what still waits for the provider, and the journal, newest line first. For a module that
supports deferred capture, the card also has a **Capture payment** button. It opens a dialog
prefilled with what is left to capture. The merchant can capture all of it or a part.

Thelia refuses a capture before anything leaves the shop when:

- the amount is not positive;
- the amount has more decimals than the currency allows;
- the amount is above what the authorization still holds;
- the same amount was asked again within the last minute.

A capture refused by the provider leaves a failed line with the provider's message. When the
provider cannot be reached, the line stays pending, because the money may have been taken. The
provider's notification settles it later. An administrator who read the outcome in the provider's
back office can record it by hand on the pending line. The line is then marked as settled by hand,
and the administration log keeps the gesture.

### What happens to the order

The order status follows the journal:

- A succeeded authorization puts an unpaid order in the status `awaiting_capture`. It is a custom
  status equivalent to `not_paid`, created at install and by the 3.4 update. A shop can rename it.
  It keeps the stock as the placement left it.
- Once the authorization holds nothing more and nothing waits for an answer, the order is `paid`
  if anything was taken, and back to `not_paid` if everything was released.
- Cancelling an order releases what its authorization still holds. An authorization confirmed
  after the cancellation is released as soon as it is recorded.
- An authorization that lapsed at the provider shows as "Authorization expired", not as a failure.
- A payment marked paid by mistake is corrected with a refund, not by setting the order back to
  not paid.

The checkout treats an order that is on hold for capture, or whose journal holds an authorized or
pending amount, as already paid for. Its cart is consumed, and it is never offered to the payment
module again.

### Rights

Reading the journal goes with the right to read orders (`admin.order`). Taking money is a right of
its own: `admin.order.payment-capture`, granted profile by profile. The same right is needed to:

- cancel an order whose authorization still holds an amount;
- record by hand the outcome of a pending line.

## Admin API

The journal is exposed to administrators only. A customer sees whether the order is paid, which
the order already shows.

| Operation | Right | Answer |
| --- | --- | --- |
| `GET /api/admin/orders/{orderId}/payment_transactions` | `admin.order` | The journal, latest first, twenty lines per page. |
| `GET /api/admin/orders/{orderId}/payment` | `admin.order` | The totals, with `pendingCapture` apart, and `supportsCapture`. |
| `POST /api/admin/orders/{orderId}/capture` with `{"amount": 50}` or `{}` | `admin.order.payment-capture` | `201` and the journal line. An empty body captures what is left. |

The capture answers `409` for a repeated amount or a busy journal, `502` when the module could not
reach its provider (the capture stays pending), and `422` for any other payment refusal. Each
administrator account may ask for 10 captures a minute. Past that, the answer is `429` with a
`Retry-After` header.

An order whose authorization still holds an amount can be cancelled through the API only with the
capture right.

## Orders with nothing to pay

An order that a coupon covers entirely does not reach the payment module. See
[Checkout](./checkout.md#orders-with-nothing-to-pay).

## For module developers

The contract a payment module follows is described in
[Payment modules](../modules/payment-modules.md#journal-and-deferred-capture).
