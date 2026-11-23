---
title: Customer Loyalty Report
sidebar_position: 6
---

# Customer Loyalty Report

Added in Thelia 3.5. The customer loyalty report shows whether customers come back: the cohort table, the lifetime value of the customers, and the new, returning, lapsing and dormant customers of a period.

## Open the report

In the back office, open **Reports** then **Customer loyalty** (`/admin/reports/customers/cohorts`). The screen has three tabs, and a fourth that leads to the best customers:

| Tab | Address |
|-----|---------|
| Cohorts | `/admin/reports/customers/cohorts` |
| Lifetime value | `/admin/reports/customers/lifetime` |
| Segments | `/admin/reports/customers/segments` |
| Top customers | the **By customer** tab of the [sales report](./sales-report.md), over the days on screen, on the paid orders: its totals are those of the customer list |

The three tabs need `admin.customer`: without it, the menu entry is not shown and the addresses answer 403. The export button needs `admin.export`, and the link to the dormancy setting needs `admin.configuration`.

## Orders counted

By default the report counts every order except the cancelled and refunded ones, a status of the shop standing for one of them included. The sales report counts them: its figures of every order are then higher. A switch counts the paid orders only: those whose status is `paid`, `processing` or `sent`. The screen says which orders it counts.

The amounts are revenue including taxes, not margin: the cost of the goods is not kept with the order. Each order counts what its customer was charged (goods, less the discount, plus the shipping costs), rounded by the rule of the order as its invoice was.

An administrator attached to some sale units sees the orders of those units only, on the screen and in the export.

## Cohorts

A cohort gathers the customers whose first order fell in the same month. The table has a line per month of first order and a column per month elapsed since: column M0 is the month of the first order, M3 the third month after it. Each cell gives the share of the cohort that ordered in that month, and the number of customers below it. M0 is always 100 %.

- A customer belongs to the cohort of their first order, not of their sign-up: an account that never ordered is in no cohort.
- The first order is looked for in the whole history of the shop: a customer who ordered before the first cohort of the table is in none of its cohorts.
- A month that has not come yet is left empty.
- A customer anonymized by the data retention purge keeps their cohort and their amounts; only their name is gone.

The table goes back 12, 24 (by default) or 36 months. A shop with few orders can read it **by quarter**: a cohort is then the customers of a quarter, and a column a quarter elapsed.

## Lifetime value

The tab opens on four figures for the customers of the cohorts of the table:

| Figure | Meaning |
|--------|---------|
| Average lifetime value | What a customer spent on average from their first order to today |
| Average lifespan | Days between the first and the last order, on average; 0 for a customer with a single order |
| Repeat rate | Share of the customers who ordered more than once |
| Customers | Customers whose first order falls in the table |

Below, the table has a line per cohort and a column per month elapsed: what the cohort spent from its first order to the end of that month, per customer. It never goes down from one month to the next. The **Lifetime value** column is the last month that has come.

## Segments

The segments follow the period of the screen, a preset or two free dates as in the sales report:

| Segment | Customers |
|---------|-----------|
| New customers | Their first order falls in the period, and their last order is within the dormancy threshold at its end |
| Returning customers | They ordered in the period and before it, and their last order is within the dormancy threshold at its end |
| Lapsing customers | They did not order in the period, and their last order is within the dormancy threshold at its end |
| Dormant customers | Their last order is older than the dormancy threshold at the end of the period, even when it falls in the period |

Each segment gives its customers, their revenue in the period and its share of the revenue of the period, and their revenue since their first order and its share of what every customer spent up to the end of the period. Each customer who ordered up to the end of the period is in one segment, so both shares add up to 100 %. A customer whose last order is older than the threshold at the end of the period is dormant, even when that order falls in a long period: its revenue in the period then counts in the dormant segment.

The dormancy threshold is the configuration variable `customer_dormant_after_days`, 180 days by default. A value that is not a positive number of days reads as 180. The link beside the table opens the variable in its edit dialog.

## How long it takes

The figures are computed on demand, then kept fifteen minutes; the screen says when they were computed, with a link to compute them again. They are computed again as soon as an order is placed, updated or deleted.

Measured on 60,680 orders of 15,010 customers over five years, in a development environment: the cohort table takes 0.4 s over 24 months and 1.1 s over five years, the lifetime figures 1.1 s, the segments 1.2 s, under 16 MB of memory.

## Export

The export button writes the tab on screen as CSV, in the unit and on the orders on screen. The same exports are in the **Reports** category of the export screen, and can be sent by e-mail as scheduled reports:

| Export | Paid orders only | One line per |
|--------|------------------|--------------|
| `thelia.export.customer_cohorts` | `thelia.export.customer_cohorts_paid` | Cohort, a pair of columns per month elapsed: the customers and their share of the cohort |
| `thelia.export.customer_cohorts_quarter` | `thelia.export.customer_cohorts_quarter_paid` | The same, by quarter |
| `thelia.export.customer_lifetime_value` | `thelia.export.customer_lifetime_value_paid` | Cohort, its lifetime value, then a column per month elapsed |
| `thelia.export.customer_lifetime_value_quarter` | `thelia.export.customer_lifetime_value_quarter_paid` | The same, by quarter |
| `thelia.export.customer_segments` | `thelia.export.customer_segments_paid` | Segment |

The cohort and lifetime value files are the cross table of the screen, and open in a spreadsheet as they are: a month that has not come yet is an empty cell. For them, the period of the export is the period of the first orders, followed up to its end. Without a start date, an export runs from the first order of the shop; without an end date, up to today. A period without any first order has no data.

Sent by e-mail, the cohort report opens on the new customers and the repeat rate, the lifetime value report on the average lifetime value, lifespan and repeat rate, the segment report on the size of each segment.

From the command line:

```shell
php Thelia export thelia.export.customer_cohorts thelia.csv --start=2025-01-01 --end=2026-12-31 --locale=en_US
```

## For developers

`Thelia\Domain\Report\Customer\CustomerLifetimeCalculator` is the one computation the screen and the exports read. It takes a `Thelia\Domain\Report\Sales\SalesReportCriteria` (start, end, `StatusScope`, allowed sale unit ids):

| Method | Returns |
|--------|---------|
| `cohorts($criteria, $granularity)` | A `CohortTable`: a `CohortRow` per cohort whose first order falls between start and end, with a `CohortCell` per month (`CohortGranularity::Month`) or quarter (`CohortGranularity::Quarter`) elapsed, null when it has not come yet |
| `lifetime($criteria)` | A `LifetimeSummary`: customers, orders, revenue, average lifetime value, lifespan in days, repeat rate |
| `segments($criteria, $dormantAfterDays)` | A `SegmentRow` per `CustomerSegment`: new, returning, lapsing, dormant |

`CustomerDormancy::days()` reads the dormancy threshold of the shop.

## Limits

- The figures are revenue, not margin.
- Amounts in several currencies are added up without conversion.
- A refunded order is left out as a whole, in both views; the sales report of every order counts it.
