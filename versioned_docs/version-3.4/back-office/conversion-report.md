---
title: Conversion Report
sidebar_position: 6
---

# Conversion Report

Added in Thelia 3.2. The conversion report answers two questions: how many of the carts opened on the shop become paid orders, and at which step the others drop off.

It is rebuilt from the `cart`, `cart_item` and `order` tables for the chosen period. Nothing new is recorded: no tag, no cookie, no page view. The report starts at the first cart row. A shop that wants to know how many visitors reached the cart page still needs a web analytics tool, for instance through the GoogleTagManager module.

## Open the report

In the back office, open **Reports** then **Conversion** (`/admin/reports/conversion`). The report needs the `admin.order` resource. The export button needs `admin.export`.

The period is one of the presets of the dashboard: today, 7 days, 30 days (the default), 90 days, this month, this year.

A second tab, **Searches without result**, needs `admin.product`. It reads the search log of the TntSearch module and is separate from the funnel.

## The six steps

The screen shows six steps. Each one has its count, its share of the step before and its share of the carts holding a line.

| # | Step | Counted as |
|---|------|------------|
| 1 | Carts created | One `cart` row created in the period |
| 2 | Carts with a line | Carts holding at least one line that a promotion did not offer |
| 3 | Delivery module chosen | Carts with a delivery module |
| 4 | Payment module chosen | Carts with a delivery module and a payment module |
| 5 | Orders placed | `order` rows created in the period |
| 6 | Orders paid | Orders whose status is `paid`, `processing` or `sent` |

The four cart steps are nested: a cart reaches a step only if it reached the one before.

The conversion rate is the orders paid divided by the carts with a line (step 6 over step 2). The screen prints the formula next to the figure, because analytics tools do not all define a conversion rate the same way.

How to read the steps:

- Step 1 includes empty carts. A row is written at the first add to cart and also when the cart page is displayed, so a visitor or a bot that never added a line is counted.
- Steps 3 and 4 are lower bounds. The checkout stores the delivery and the payment module when the shopper clicks one, and clears them when the shopper goes back to the cart page, changes the delivery address, or when the postage computation fails. A cart that went through these steps can therefore show as not having reached them. When the period holds more orders than carts carrying a payment module, a note under the table says so.
- Steps 5 and 6 are counted on the orders alone. An order stays counted after its cart is purged, and a cancelled attempt followed by a retry counts as two orders placed. Orders placed from the back office count like the others.
- A custom order status counts as paid when it is given `paid`, `processing` or `sent` as its equivalent code. `refunded` and `canceled` never count.
- A cart that was emptied afterwards looks like it never had a line: step 2 reads what is in the cart now.

## Cart purge and the start of the period

The `maintenance:purge` command deletes the carts that never became an order. Orders, and the carts that led to one, are kept. A period reaching before the purge would compare orders to carts that no longer exist, and the rate would climb above what the shop really converts.

The report therefore never starts before the purge horizon: now minus the retention, to the second. The retention is the shorter of two configuration variables:

| Variable | Default |
|----------|---------|
| `purification_cart_anonymous_days` | 30 days |
| `purification_cart_no_order_days` | 60 days |

When the period starts earlier, the screen computes it from the horizon, prints the effective dates next to the period presets and says so in a notice. A negative value is read as 0: the purge then deletes every cart without an order, and the report starts at the current time.

Nothing runs [`maintenance:purge`](/docs/reference/cli/maintenance_purge) by itself. A shop that never schedules it keeps all its carts, but the report still starts at the horizon, because it reads the configured retention and not whether the command ever ran.

## Export

The export `thelia.export.conversion_funnel`, in the **Reports** category of the export screen, writes the same figures one day at a time.

Each row is a calendar day. A day without any cart is kept, with zeros, so a quiet period gives a file rather than an error. The columns are:

```
date, carts_created, carts_with_items, carts_with_delivery_module, carts_with_payment_module, orders_created, orders_paid
```

The export has no daily rate on purpose: the orders of a day come from carts created on other days, so a daily ratio would mislead. The rate of the period is read on the screen.

The period starts on the purge horizon at the earliest, as on the screen. Without a start date, the export runs from the horizon; without an end date, up to today. A period that ends before the horizon has no data, and the export reports that no data was found.

From the command line, the arguments are the export reference and the serializer. `--start` and `--end` take a date. An `--end` given without a time covers the whole day.

```shell
php Thelia export thelia.export.conversion_funnel thelia.csv --start=2026-01-01 --end=2026-01-31 --locale=en_US
```

The command prints the path of the file it wrote.

## For developers

The calculation is reusable. `Thelia\Domain\Report\ConversionFunnel\ConversionFunnelCalculator` counts a period in two queries, one on `cart` joined to `cart_item` and one on `order`:

| Method | Returns |
|--------|---------|
| `total($from, $to)` | A `ConversionFunnel` holding the six `FunnelStep` objects, each with its count and its ratios |
| `daily($from, $to)` | A list of `DailyFunnelRow`, one per day from `$from` to `$to` included, zero-filled |

Every ratio is `null` when its denominator is zero. `Thelia\Domain\Cart\Service\CartPurgeHorizon` exposes the retention (`fromConfig()`, `earliestSurvivingCartDate()`, `boundedStart()`), for any report that sets carts against orders.

A module can add its own reports under the same menu entry with the `main.top-menu-reports` hook of the `default-twig` theme.

## Limits

- Steps 3 and 4 are lower bounds, as explained above.
- `cart.created_at` has no index, so both queries scan the period. On 200,000 carts, MariaDB 10.11 answers in about 0.3 seconds.
- The report counts carts and orders. It does not know about visits.
