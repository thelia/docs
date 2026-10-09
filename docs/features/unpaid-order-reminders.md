---
title: Unpaid Order Reminders
sidebar_position: 10
---

# Unpaid Order Reminders

Added in Thelia 3.3.

An order still waiting for its payment is reminded by mail on a schedule the merchant sets,
then cancelled if the merchant wants, without anyone watching the list of unpaid orders.

## Turning it on

The feature ships switched off: a shop that updates does not start reminding on its own. The
merchant writes a schedule in the back office, under Configuration > Unpaid order reminders:
up to five steps, each a number of hours after the creation of the order and what happens
then, sending a mail or, last, cancelling the order. The payment modules whose orders are
legitimately paid days later, a bank transfer or a cheque, are left out of it.

The schedule is applied by a task the host runs every fifteen minutes or every hour:
[`order:remind-unpaid`](../reference/cli/order_remind_unpaid.md).

## What a run does

An order is reminded while its status means "waiting for its payment": `not_paid`, or a status
of the shop declared equivalent to it.

- **One step at a time.** An order is in the last step it reached, and only that step is
  done. The steps it is past are not sent late: switched on in a shop holding old unpaid
  orders, a schedule `24 h mail, 72 h mail, 7 days cancel` sends a four-day-old order the
  72 hour mail only, and cancels a two-month-old one without mailing it.
- **Once.** Each step done is written to the order history, `payment_reminder_sent` or
  `payment_reminder_failed`, and is never done again: a run replayed sends nothing twice, and
  a mail that cannot leave (an address the mailer refuses) is not retried at every run.
- **The cancellation** is the one any cancellation goes through: the status transitions are
  asked, the stock is given back, and the history shows the status change.
- **Bounded.** A run acts on 200 orders at most (`--limit`), oldest first; the next run goes
  on. `--dry-run` lists what it would do.

The dashboard alert on unpaid orders, and the urgent marker of the order list, follow the
first step of the schedule instead of a fixed 48 hours.

## The mail

The mail is `order_payment_reminder`, a template of the mail theme the merchant edits like
any other, under Configuration > Mailing templates; a step can send another message of the shop.
It carries the reference of the order and `payment_url`, a link back to its payment.

The link is signed: it names the order, the moment it expires, the customer's address and the
cart the order was placed from, and nothing is stored. It stops working when the order is paid
or cancelled, the address changes, or the time runs out: at the cancellation step when the
schedule has one, thirty days after the mail otherwise.

In the Flexy theme, the link (`/order/pay/{token}`) puts the cart of the order back in the
session and opens the payment step, where paying again goes to the same order. A guest order
opens directly. An order placed from an account asks for that account first: the link never
signs anybody in, so a reminder forwarded to someone else does not hand them the account.

A payment reminder is part of the order the customer placed, not marketing: it is sent
whatever the customer chose about newsletters.

## For developers

- `Thelia\Domain\Order\Reminder\UnpaidOrderReminderRunner` applies the schedule;
  `UnpaidOrderReminderSettings` reads and writes it.
- `UnpaidOrderPaymentLink` signs and reads the token. A front theme other than Flexy declares
  the route `order_payment_resume` with a `token` parameter; without it the mail links to the
  home page.
- The order history types `payment_reminder_sent` and `payment_reminder_failed` carry the step,
  in hours, in their payload.
