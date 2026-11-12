---
title: Sales Report
sidebar_position: 6
---

# Sales Report

Added in Thelia 3.4. The sales report shows what a period sold, by category, by product and by customer, compared with the previous period of the same length. Its figures add up to the revenue of the dashboard.

## Open the report

In the back office, open **Reports** then **Sales** (`/admin/reports/sales/category`). The screen has three tabs:

| Tab | Address | Needs |
|-----|---------|-------|
| By category | `/admin/reports/sales/category` | `admin.order` |
| By product | `/admin/reports/sales/product` | `admin.order` |
| By customer | `/admin/reports/sales/customer` | `admin.order` and `admin.customer` |

A tab the administrator cannot read is not shown, and its address answers 403. The export button needs `admin.export`.

The period is one of the presets of the dashboard (today, 7 days, 30 days by default, 90 days, this month, this year) or two free dates, up to three years apart and not after today. The previous period ends the day before the period starts and has as many days.

## Orders counted

By default the report counts the paid orders: those whose status is `paid`, `processing` or `sent`, as the dashboard revenue does. A custom status counts when it is given one of these codes as its equivalent code.

A switch counts every order created in the period instead, whatever its status. The screen says which orders it counts next to the switch. The export button is offered for the paid orders only.

An administrator attached to some sale units sees the orders of those units only, on the screen and in the export.

## By category

Each line is a category with its revenue including taxes, the revenue of the previous period, the change, the quantity sold, the number of orders and its share of the revenue. A category adds up its subcategories, which are folded under it.

- A product is counted in its default category only, so a product filed in several categories is not counted twice.
- The category is the one of the product today, not the one it had on the day of the sale.
- A deleted product, a product without a category, and the products of a category deleted since, are listed under **Uncategorized**. Their sales stay in the revenue.
- Service lines, such as a gift wrapping, are listed under **Services**.
- The components of a bundle are not counted as sold: the bundle is.

Under the tree, a table goes from the lines to the revenue: the total of the lines, minus the discounts, plus the shipping costs, gives the revenue of the dashboard for the same period. A discount larger than the goods of its order is counted up to the goods only.

## By product

Every product sold in the period, best seller first, 25 per page, with its reference, the quantity, the revenue including taxes, the previous period, the change and the share of the revenue. The amounts are the lines of the orders, before discount and shipping costs. A deleted product keeps the title its order lines stored.

## By customer

Every customer who ordered in the period, with the number of orders, the total including taxes, the average basket, the last order, the previous period and the change. The table is sorted on the total by default, and each column can be sorted. It shows 25 customers per page.

## How the amounts are computed

Each order line is totalled with its taxes by the rounding rule of its order, as its invoice was. The amounts are added up as the orders store them, without converting their currency, as the dashboard does.

Three years of orders take a few seconds to add up. The screen keeps its figures fifteen minutes and says when they were computed, with a link to compute them again. The figures are computed again as soon as an order is placed, updated or deleted. A change that is not an order, such as a product moved to another category, shows once the figures are computed again or have expired.

## Export

The export button writes the tab on screen as CSV, over the exact days on screen. The same exports are in the **Reports** category of the export screen, and can be sent by e-mail as scheduled reports:

| Export | One line per | Ends with |
|--------|--------------|-----------|
| `thelia.export.sales_by_category` | Category, with its path ("Parent > Child") | The discounts, the shipping costs and the total |
| `thelia.export.sales_by_product` | Product sold, best seller first | |
| `thelia.export.sales_by_customer` | Customer who ordered, biggest total first | |

The exports count the paid orders. Each line gives the previous period, the change in percent and, for categories and products, the share of the revenue. What a customer or an administrator typed is written as text, so that a spreadsheet does not run it as a formula.

Without a start date, an export runs from the first order of the shop; without an end date, up to today. A period without any sale has no data, and the export reports that no data was found. Sent by e-mail, the report opens on the revenue, its change and the top category, product or customer of the period.

From the command line:

```shell
php Thelia export thelia.export.sales_by_category thelia.csv --start=2026-01-01 --end=2026-01-31 --locale=en_US
```

An export run by an administrator attached to some sale units covers those units only. An export run from the command line, or sent as a scheduled report, covers the whole shop.

## For developers

`Thelia\Domain\Report\Sales\SalesReportCalculator` is the one computation the screen and the exports read. It takes a `SalesReportCriteria` (start, end, `StatusScope::Paid` or `StatusScope::All`, and the allowed sale unit ids, `null` for all):

| Method | Returns |
|--------|---------|
| `byCategory($criteria, $locale)` | A list of `CategorySalesRow`, a parent before its children |
| `byProduct($criteria, $locale, $page, $perPage)` | A `SalesPage` of `ProductSalesRow` |
| `byCustomer($criteria, $sort, $descending, $page, $perPage)` | A `SalesPage` of `CustomerSalesRow`, sorted on a `CustomerSort` |
| `reconciliation($criteria)` | A `SalesReconciliation`: total of the lines, discounts, shipping costs, revenue and number of orders |

`SalesReportCriteria::previous()` gives the previous period. The SQL of an order line total and of an order total, with its rounding rules, is in `Thelia\Domain\Order\Sql\OrderAmountSql`.

An export restricted to the sale units of the administrator who runs it implements `Thelia\Domain\DataTransfer\Export\SaleUnitScopedExportInterface`. `ExportHandler::export()` hands it the allowed sale unit ids: `null` restricts nothing, and an empty list reaches no order.

## Limits

- The category is the one of the product today.
- Amounts in several currencies are added up without conversion.
- `order.created_at` has no index. On 30,000 orders over three years, the first computation of a tab takes a few seconds, then the figures are kept fifteen minutes.
