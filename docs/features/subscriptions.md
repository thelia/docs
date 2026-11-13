---
title: Subscriptions
sidebar_position: 14
---

# Subscriptions

Added in Thelia 3.4.

A shop can sell a product by subscription. The customer pays the first installment at the checkout,
as for any order. The shop then charges each following installment on its own, to a payment method
the customer stored, and keeps the calendar, the retries and the states of the subscription. The
customer follows it from their account.

Each installment is an ordinary order, with its own reference, invoice, stock movement and
confirmation e-mail. Orders, exports and accounting keep working without a change.

## Plans

A merchant sells a product through one or more **plans**. A plan holds:

| Field | Meaning |
| --- | --- |
| Title | One per language. |
| Price | One per currency, for one installment, excluding tax. A price in the default currency is required. |
| Period | What an installment pays for: `week`, `month`, `quarter` or `year`, times a count. Every 2 weeks is `week` with a count of 2. |
| Trial | A number of days served before the first charge. `0` means no trial. |
| Installments | How many installments are billed in all. Empty means until the customer cancels. |
| Commitment | How many installments the customer owes even if they cancel. Empty means none. |
| Pausable | Whether the customer may pause the subscription. |
| Visible | Whether the plan is offered in the shop. |

The plan is copied onto the subscription when the customer takes it: price, currency, period and
commitment. Editing or deleting the plan later changes nothing for a subscription that runs.

A subscription is one sale element, a quantity and a plan.

## What the customer sees in the shop

- A product with a visible plan offers the plans on its page. The customer picks one and adds it to the cart.
- The customer must be signed in. A visitor who is not signed in cannot subscribe.
- A cart that holds a plan holds nothing else, and holds one plan line only. Adding anything else is refused with a message. This is deliberate: one order takes one subscription, with the payment method its installments will be charged to.
- A product whose price is on request offers no plan. A visitor who may not see a product, or its price, does not see its plans, or their price, either.
- With a trial, the first order is at zero. Without one, the first installment is charged at the checkout.
- With a trial, the cart and the payment step give the date of the first charge: the date the billing will use, if the order is paid that day.
- Only the payment methods that can charge a stored method without the customer are offered. A shop with no such module cannot sell a subscription. See [Charging a stored method off session](../modules/recurring-payments.md).
- The subscription is created when the first order turns paid.

In their account, at **My subscriptions**, a customer sees each subscription with its status,
its next payment date and its installments, and can:

- change the payment method, to one of the methods they stored, until the subscription is cancelled;
- pause an active subscription, when the plan allows it, and resume it;
- cancel.

Resuming only undoes a pause. A suspended subscription comes back when the installment it owes is
paid, and a trial ends with its first charge: neither can be resumed.

Cancelling takes effect at the end of the paid period. If the plan has a commitment, the
installments still owed are billed until it is reached. The subscription is served until then.

## States

| State | Meaning |
| --- | --- |
| `trial` | Waiting for the first charge, after the trial days. |
| `active` | Running and paid up. |
| `payment_failed` | An installment was declined. The shop tries again. |
| `suspended` | The retries ran out. Nothing is charged until someone acts. |
| `paused` | Stopped by the customer or the merchant. Nothing is charged. |
| `cancelled` | Cancelled, still served until its paid period or its commitment ends. |
| `ended` | Over. Final. |

What moves a subscription from one state to another:

| From | To | What does it |
| --- | --- | --- |
| `trial` | `active` | The first charge is paid. |
| `trial`, `active` | `payment_failed` | A charge is declined, or the bank asks the customer to confirm it. |
| `payment_failed` | `active` | A retry is paid. |
| `payment_failed` | `suspended` | The attempts are used up. |
| `suspended` | `active` | The customer gives another method, or the shop reactivates, and the charge is paid. A new period starts on the day of the payment. |
| `active` | `paused` | The customer or the merchant pauses (plan must be pausable for the customer). |
| `paused` | `active` | Resume. The paused weeks are not charged: a new period starts at that date. |
| `trial`, `active`, `payment_failed`, `suspended`, `paused` | `cancelled` | The customer or the merchant cancels. |
| `cancelled` | `ended` | The paid period or the commitment is over. |
| any billing state | `ended` | Every installment of the plan is billed. |

Every change leaves a line in the history of the subscription, with who did it: the customer, an
administrator, or the system (the shop itself, from the billing).

A state refuses what its table does not allow. Through the API the answer is `409`.

## Billing and retries

The shop bills each subscription when its next billing date is reached. For each installment it:

1. places the order of the installment;
2. asks the payment module to charge the stored method, without the customer;
3. turns the order paid and moves the next billing date forward, or records the failure.

An installment is at most one order, whatever the retries: a declined charge is tried again on the
same order, never on a new one.

A declined charge, or one where the bank asks the customer to confirm the payment, counts as a
failed attempt. It is tried again after a few days, up to a number of attempts. Then the
subscription is suspended, the order of the installment is cancelled and its stock goes back.

| Setting | Default | Meaning |
| --- | --- | --- |
| `subscription_retry_attempts` | `3` | How many declined charges of an installment suspend the subscription. |
| `subscription_retry_interval_days` | `2` | Days between two charges of a declined installment. |

Both are configuration variables, read and written with `thelia:config`. A value that is not a whole
number of one or more falls back to the default.

When the provider cannot be reached (a timeout, an outage), nothing is declined. The charge is tried
again an hour later and does not count as a failed attempt.

To get a suspended subscription going again, the customer gives another payment method, or the
merchant reactivates it. The installment that is due is then charged at once, on a new order. Once it
is paid, a new period starts on the day of the payment, and the next installment falls one period
later, on that day of the month. The months of the suspension are not billed and place no order.
The same goes for any installment paid once the period it was due for is over: the next billing date
is never in the past.

A physical product takes its stock with each installment order. A virtual product takes it once, with
the first order.

## E-mails

Three messages are sent, in the language the subscription was taken in:

| Message | Sent to | When |
| --- | --- | --- |
| `subscription_payment_failed` | The customer | A charge is declined or needs the customer's confirmation, and the shop will try again. Not sent when the provider could not be reached. |
| `subscription_suspended` | The customer, and the notification addresses of the shop | The retries ran out. The shop copy is addressed to the merchant. |
| `subscription_cancelled` | The customer | The customer or an administrator cancels. Not sent when the system cancels, as when the customer data is erased. |

They are rendered from the active e-mail template. The default template ships all three. A shop with a
template of its own adds `subscription_payment_failed`, `subscription_suspended` and
`subscription_cancelled` as `.html.twig` and `.txt.twig` files. Until it does, the mail is logged and
not sent. Billing is never affected.

All three receive the subscription (`subscription_id`, `subscription_ref`, `subscription_status`,
`customer_id`), its plan as copied (`product_title`, `quantity`, `unit_price`, `currency_code`,
`period_unit`, `period_count`), the label of the payment method (`payment_method_label`) and
the dates `next_billing_date`, `current_period_end_date` and `cancel_at_date`, formatted `Y-m-d` or
empty. `order_id` and `order_ref` come with them when the installment has an order. Each message adds
its own:

| Message | Extra variables |
| --- | --- |
| `subscription_payment_failed` | `installment_number`, `failure_count`, `failure_kind` (`declined` or `action_required`), `retry_date` |
| `subscription_suspended` | `failure_count`, `recipient` (`customer` or `shop`) |
| `subscription_cancelled` | `actor_type` (`customer`, `admin` or `system`) |

A template must handle an empty date and an absent order. See also
[Emails and PDF](../reference/emails-and-pdf.md).

## The scheduled task

`subscription:bill-due` bills what is due. It sends one job per subscription that has something
due, on the `async` queue. Each job locks its subscription and reads it again, so two runs at once
never bill an installment twice.

The scheduler of the shop runs it every 15 minutes. Change it with `THELIA_SCHEDULE_SUBSCRIPTION_BILLING`
(a cron expression). An empty value turns it off, for a shop that runs the command from a crontab.
See [Running the workers](../getting-started/background-workers.md) and the
[background jobs reference](../reference/background-jobs.md).

Without the scheduler, run it from a crontab, every few minutes:

```shell
*/5 * * * * cd /var/www/shop && php Thelia subscription:bill-due
```

Without a queue worker, the jobs run at once, inside the command. To see what is due without billing
anything:

```shell
php Thelia subscription:bill-due --dry-run
```

## What the merchant does in the back office

A merchant with the `admin.subscription` right sees the subscriptions of the shop. The right is granted
profile by profile: existing profiles do not have it until it is given.

- List the subscriptions and filter them by state, plan, next billing date, or a search on the
  reference and the customer's name or e-mail. The active and payment-failed subscriptions are
  counted above the list.
- Open one to read its terms, its payment method (by its label), its installments with their
  orders, and its history.
- With the update right: cancel, pause (when the plan allows it), resume, or reactivate a
  suspended subscription or one whose payment failed. Reactivating charges the failed
  installment again at once; the subscription becomes active when that charge is paid.
- Read the monthly recurring revenue on the dashboard, and the subscriptions of a customer on
  the customer sheet.

Plans are set up in the **Subscription plans** tab of the product sheet, with the product right
(a plan belongs to the catalogue): title per language, price per currency (the default currency
is required), period, trial, number of installments, commitment, pausable, online.

Whatever an administrator does is recorded in the history with the administrator as the actor.

## API

The customer account, the administration and the plans are exposed by the API. See
[Subscriptions in the endpoints reference](../api/endpoints/index.md#subscriptions).

## Personal data

The export of a customer carries a `subscriptions` section: the values of each subscription, its
installments with the reference of their order, its history and the label of its payment method.
Never the token.

The anonymization of a customer cancels and ends their running subscriptions, as the system, so
nothing is left to bill. The orders already emitted stay as they are. A customer who has orders,
which every subscriber has, cannot be deleted. See [Personal data](../security/personal-data.md).

## Known limits

- No proration when a plan changes.
- No usage based tiers.
- No deferred revenue accounting.
- One line per subscription, and one subscription per cart, alone in it.
- A customer who is not signed in cannot subscribe.
- The unpaid order of an installment of a customer who is erased is left as it is.
- No payment module of the core charges a stored method without the customer yet. A module has to
  implement the interface described in [Charging a stored method off session](../modules/recurring-payments.md).
