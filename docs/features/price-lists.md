---
title: Price Lists
sidebar_position: 16
---

# Price Lists

Added in Thelia 3.4.

A price list is a named set of prices for chosen combinations. Use it for a wholesale tariff, a
negotiated price for one customer, or prices that drop with the quantity ordered. A list is
assigned to customer groups or to single customers, and the customers who match it pay its prices.

## What a list holds

| Field | Meaning |
| --- | --- |
| Code | Unique, up to 64 characters: letters, digits, dots, dashes and underscores. Change it with whoever refers to the list by code. |
| Title | Translatable. |
| Currency | The currency of the prices of the lines. It cannot change once the list has lines. |
| Priority | The list with the smallest number is looked up first. |
| Starts at, ends at | Both optional. The list applies from the start date and stops at the end date. The start must be before the end. |
| Active | A list that is turned off applies to nobody. |
| Exclusive | See [Exclusive lists](#exclusive-lists). |

A list has **lines**. Each line is for one combination (a product sale element) and holds:

- a **minimum quantity**, 1 by default: the line applies from this quantity up;
- either a **price**, without tax, in the currency of the list, or a **discount** in percent of the
  catalog price (more than 0, 100 at most). Never both.

A list has one line per combination and minimum quantity.

## Managing lists in the back office

Open **Prices and assortments > Price lists**. The menu needs the `admin.pricing` right.

1. Create the list with a code and a title, then set its currency, priority, dates and flags.
2. Add lines one by one, or [import them from a CSV file](#importing-and-exporting-lines).
3. Assign the list under **Groups the list is assigned to** and **Customers**. Every customer of a
   selected group gets the list. A list can be assigned once to the same group or the same
   customer. Searching customers needs the right to view them.

To check the result, open a product in **Catalog**. The **Effective prices** panel shows, for a
customer you search or for a visitor, the price of each combination, the list, rule or group that
produced it, whether it can be bought, and the quantity tiers. It needs the right to view
`admin.pricing` and `admin.customer`.

## Which list applies

The lists that apply to a customer are the ones that are active, inside their period, and assigned
to the customer or to their group. They are sorted by priority, lowest first. At equal priority, a
list assigned to the customer comes before one assigned to their group, then the oldest list comes
first. A visitor, a console command and a guest account use the lists of the default group. A guest
account has no list of its own.

For a combination and a quantity, the first list that has a line wins. Inside that list, the line
with the highest minimum quantity that is not above the quantity asked is used.

Example. A group list with priority 30 holds A at 50 and B at 60. A customer list with priority 10
holds A at 45. A customer of that group who has the customer list pays 45 for A, 60 for B, and the
catalog price for any other combination.

A list price is final. No group price, group discount, catalog price rule, reserved sale or
customer discount applies on top of it. A line in percent applies to the catalog price, never to
the promotional price. A list in another currency than the one browsed prices nothing. A bundle
priced by its components ignores price lists.

See [How the price is decided](./customer-groups.md#how-the-price-is-decided) for where the lists
sit among the other prices.

## Exclusive lists

A customer who has an exclusive list can buy only the combinations that list holds. The other
products stay visible with their catalog price, and they cannot be added to the cart. The front API
answers 422 on `POST /api/front/cart_items`.

- This holds in every currency. The list prices its combinations in its own currency. In another
  currency, the lists below it and then the catalog price them.
- A combination that the list holds only for a higher quantity is still held. It is bought at the
  price below.
- A list with a higher priority (a smaller number) that does have a line for the combination
  can still price it and open it. A list ranked after the exclusive one cannot.

## Quantity tiers

The cart prices each line at its quantity, and prices it again when the quantity changes. The front
API publishes `priceTiers` on a sale element, and the Flexy theme shows them as a **Price by
quantity** table on the product page.

## The cart

The cart line keeps the list that priced it (`cart_item.price_list_id`). Turning off or deleting
that list, or signing in a visitor whose customer has a list, prices the cart again before the
payment.

## Importing and exporting lines

A CSV file adds or updates the lines of a list. The file is at most 5 MB. The separator is a
semicolon or a comma, read from the header line. The columns:

| Column | Meaning |
| --- | --- |
| `pse_ref` or `pse_id` | The reference or the id of the combination. One of them is required. |
| `min_quantity` | Optional. |
| `price` or `discount_percent` | One of them is required. A line holds one amount only. |

A line is identified by the combination and the minimum quantity. It is updated if it exists and
created otherwise. A line in error is not written, and the others are. The report gives the line
number of the file and the reason.

In the back office, **Import lines from a CSV file** shows a preview first: how many lines would be
created, how many updated, and the errors with their reason. Nothing is written until you confirm.
**Export CSV** writes the lines in the same columns. The export is logged.

From the command line:

```bash
php Thelia thelia:price-list:import <code> <file>             # write the lines
php Thelia thelia:price-list:import <code> <file> --dry-run   # report only
```

The command exits with a non-zero code when a line is in error or the file is refused. See
[`thelia:price-list:import`](../reference/cli/thelia_price_list_import.md).

## For developers

### The admin API

All of these need the `admin.pricing` right. Each has a collection, an item, creation, `PUT`,
`PATCH` and deletion.

| Route | Holds |
| --- | --- |
| `/api/admin/price_lists` | `code`, `currency`, `priority`, `exclusive`, `startsAt`, `endsAt`, `active`, translated `i18ns`. Filters on `code`, `currency.id`, `active`, `exclusive`; orders on `priority` and `code`. |
| `/api/admin/price_list_items` | `priceList`, `productSaleElements`, `minQuantity`, `price` (without tax, in the currency of the list), `discountPercent`. Filters on `priceList.id` and `productSaleElements.id`. |
| `/api/admin/price_list_assignments` | `priceList`, and exactly one of `customerGroup` or `customer`. |

A line needs a price or a discount, not both, and is unique by list, combination and minimum
quantity. An assignment is refused with a 422 when it names both a group and a customer, or
neither, or when the list is already assigned to that group or customer. Assignments are never
disclosed to the storefront.

On the front API, a sale element publishes `priceTiers`, `purchasable` and `priceDisplayMode`. See
[Price display](./assortments-and-price-display.md#price-display).

### Services

- `Thelia\Domain\Pricing\CustomerPrice\CustomerPriceContextInterface::resolve()` takes an optional
  last argument `array $quantities` (sale element id to quantity). `ResolvedPrice` has `purchasable`,
  `priceListId` and `tiers`.
- `Thelia\Domain\Pricing\PriceList\Import\PriceListLineImport` has `preview()` and `apply()`, as the
  back office and the command use them. Lines are written in batches of 500, each in its own
  transaction.

### Caches

The data access cache keys the price paths by signed-in or anonymous visitor while some price is
hidden. A customer with a list of their own is not served from it. Writing a list, a line, an
assignment or a price display mode flushes it and the shared cache. Anonymous pages are not shared
while a list is assigned to the default group.

A shop without a price list, an assortment rule or a hidden price runs no more queries than before.
