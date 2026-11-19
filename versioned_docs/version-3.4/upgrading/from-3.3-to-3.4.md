---
title: Updating from 3.3 to 3.4
sidebar_position: 2.4
---

# Updating from 3.3 to 3.4

This page lists what is specific to the move from Thelia 3.3 to 3.4. The procedure itself
(backup, Composer, database script, cache, assets, modules) is on [Update](./update.md); the
steps below come on top of it. If you start from 3.2, apply
[Updating from 3.2 to 3.3](./from-3.2-to-3.3.md) first.

## The database script is long

`php local/setup/update.php` runs `setup/update/sql/3.4.0.sql` (about 150 KB). It can be replayed
if it stops. On a large catalog or a long order history, it rebuilds tables:

- `quantity` changes from `FLOAT` to `DOUBLE` on `product_sale_elements`, `cart_item`,
  `order_product`, `order_return_line` and `order_shipment_item`. Each table is copied, then its
  quantities are rounded.
- Every row of `customer` and `customer_version` gets the default customer group, then
  `customer_group_id` becomes `NOT NULL` with a foreign key.
- Indexes and columns are added to `order`.

Back the database up first, and run the update in a maintenance window.

## No new order between the deployment and the script

The script stores the highest order id in `last_float_line_rounding_order_id`: the orders up to it
keep the totals they were invoiced with, and later orders use the new rounding. An order placed
between the deployment of the code and the script would be counted on the wrong side. Put the shop
in maintenance after you deploy the code, and lift it once `php local/setup/update.php` has
finished.

## What the script adds

- 22 tables: customer groups (`customer_group`, `customer_group_i18n`,
  `customer_group_product_price`, `customer_group_payment_module`, `customer_group_category`,
  `sale_customer_group`, `catalog_price_rule_customer_group`), price lists (`price_list`,
  `price_list_i18n`, `price_list_item`, `price_list_assignment`), subscriptions
  (`subscription_plan`, `subscription_plan_i18n`, `subscription_plan_price`, `subscription`,
  `subscription_order`, `subscription_history`), `order_payment_transaction`, `report_mailing`,
  `product_bundle_item`, `coupon_exclusion` and `catalog_restriction`.
- The order status `awaiting_capture`.
- The rights `admin.customer.group`, `admin.order.edit`, `admin.order.payment-capture`,
  `admin.pricing` and `admin.subscription`. **No existing profile receives them**: only super
  administrators reach these screens until you give each right to the profiles that need it, one
  by one, in the back office.

## Scheduled tasks

Three tasks are new: `stock:reservation:purge` (every 10 minutes), `report:send-due` and
`subscription:bill-due` (every 15 minutes).

- If a worker consumes the Thelia scheduler (`messenger:consume scheduler_thelia`), there is
  nothing to do: the tasks are in `Thelia\Scheduler\TheliaSchedule`. See
  [Running the workers](../getting-started/background-workers.md).
- If the shop runs its tasks from a crontab, add three lines for these commands. Use one mode or
  the other, never both: the same task would run twice.

```text
*/10 * * * * php /path/to/shop/Thelia stock:reservation:purge
*/15 * * * * php /path/to/shop/Thelia report:send-due
*/15 * * * * php /path/to/shop/Thelia subscription:bill-due
```

The billing of one subscription installment, `BillSubscriptionInstallment`, goes to the `async`
transport. Without `MESSENGER_TRANSPORT_DSN` that transport is `sync://` and the job runs at once;
a worker is needed only when you configure a queue.

## New environment variables and parameter

All have a default; set them only to change it.

| Name | Default | What it limits |
|---|---|---|
| `THELIA_STOCK_RESERVATION_RATE_LIMIT_PER_CART` | 60 | Stock reservations per cart and per hour |
| `THELIA_STOCK_RESERVATION_RATE_LIMIT_PER_CLIENT` | 300 | Stock reservations per client address and per hour: raise it when many buyers share one address |
| `THELIA_API_RATE_LIMIT_ORDER_CAPTURE` | 10 | Different payment captures one admin account asks for through the API, per minute |
| `THELIA_API_PRODUCT_PRICE_SORT_MAX_PRODUCTS` | 5000 | Products above which the API stops sorting by price |

The parameter `thelia.ai.media_hosts` (empty by default) lists the extra hosts from which the AI
layer accepts media in generated HTML.

**To do if you use an AI connection with its own base URL.** A connection that reads
`THELIA_AI_<X>_KEY` and calls a base URL of its own (an OpenAI-compatible server, a self-hosted
Ollama, a proxy) stops until you set `THELIA_AI_<X>_BASE_URL` next to the key. A connection to the
usual address of its provider needs nothing.

## Themes

Update the four official themes together with the core: Flexy 1.4.0, back-office (`default-twig`)
1.4.0, e-mail 1.4.0 and PDF 1.5.0. All four require `thelia/core ^3.4`.

## What you see in production from the first day

- Customers with a discount, or in a group that has its own prices, see different prices: the
  product loops, the front API and the cart apply the group price, the group discount and the
  customer discount.
- Paying a cart whose line prices changed is refused once with a 409 Conflict; the buyer sees the
  cart again with the new prices and the next attempt goes through. The code
  `cart-prices-changed` and the ids of the lines that moved are available to PHP code that catches
  `CartPricesChangedException`, not in the HTTP response.
- The data access cache starts cold: the keys of the price paths change, so the first requests are
  slower.
- Order totals are rounded to the cent and may differ by a cent from earlier versions; orders
  already placed keep their total.
- The provenance mark of AI-generated content is off by default; turn it on in Configuration >
  Artificial intelligence > Usages.

Each point has its entry under "Breaking changes" or "Behaviour changes" in the 3.4.0 section of
[`CHANGELOG.md`](https://github.com/thelia/thelia/blob/3.4.0/CHANGELOG.md).

## For module and theme developers

The breaking changes of 3.4, with what to do for each, are in
[`UPGRADE-3.4.md`](https://github.com/thelia/thelia/blob/3.4.0/UPGRADE-3.4.md), and in
[Breaking changes](./breaking-changes.md#thelia-34). The full list, with the exact signatures, is
in [`CHANGELOG.md`](https://github.com/thelia/thelia/blob/3.4.0/CHANGELOG.md).
