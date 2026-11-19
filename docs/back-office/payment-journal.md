---
title: Payment Journal and Capture
sidebar_position: 8
---

# Payment Journal and Capture

Added in Thelia 3.4. Every order keeps a journal of its money movements: authorization, capture, refund and void. The payment card of the order sheet shows it, and lets an administrator take the money a payment module only authorized. The same data is read and written through the [admin API](../api/endpoints/index.md#payment-journal-and-capture).

## The payment card

Open an order in **Orders**. The payment card lists each movement, newest first, with:

- its date, its type and its outcome (pending, succeeded or failed);
- its amount, in the currency of the order, with the decimals of that currency;
- the reference the provider gave it;
- its author: the payment module, an administrator or the shop;
- when it failed, the code and the message of the provider.

An order without a journal, such as every order placed before the update to 3.4, shows "No payment movement recorded for this order".

The card needs the view right on orders (`admin.order`).

## Capturing a payment

A payment module can separate the authorization from the capture. For such an order the card also shows the figures of the journal: **Authorized**, **Captured**, **Awaiting the provider** (when a capture waits for its answer), **Voided**, **Refunded** and **Remaining to capture**.

While the authorization holds an amount on an order that is not paid, a notice says that marking the order paid by hand takes nothing from the buyer. Capture the payment to take the money.

The **Capture payment** button opens a dialog. It is shown only to an administrator who holds the right `admin.order.payment-capture` (create) while something is left to capture. The right is separate from editing orders, so an administrator who edits orders all day does not capture payments.

- The amount is prefilled with what is left, rounded down to the smallest coin of the currency. A smaller amount leaves the rest to capture later.
- When the provider takes a single capture per authorization, the dialog says that what is not captured now is released with it.
- The shop refuses more than the authorization holds, an amount that is not positive, and an amount with more decimals than the currency.

The capture is sent to `POST /admin/order/update/{order_id}/payment-capture` with the form token, and written to the administration log. A failed capture shows the messages of the payment rules only. Any other failure shows as an internal error.

Cancelling an order whose authorization still holds an amount releases that authorization. It needs the capture right too: without it, the order is left as it is and the screen says so.

## A pending movement

A movement stays pending when the provider never answered. An administrator who holds the capture right can record the outcome read at the provider: **Succeeded** or **Failed**, with an optional provider reference. The line is marked as settled by hand.

## Orders paid without a deferred capture

An order that reaches a paid status from an unpaid one gets a succeeded capture line of its total, even when an administrator marks it paid by hand. The line then names that administrator. A payment module that implements `PaymentModuleWithCaptureInterface` and answers `supportsDeferredCapture()` writes its own lines instead.
