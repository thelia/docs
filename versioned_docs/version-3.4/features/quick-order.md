---
title: Quick Order and Purchase Lists
sidebar_position: 10
---

# Quick Order and Purchase Lists

Added in Thelia 3.2.

A signed-in customer can order by reference: they type or paste references and quantities, the
shop checks every line, and the lines it could resolve go to the cart. Orders that come back
regularly are saved as purchase lists and loaded into the same table later.

Both features belong to the customer account. A visitor who is not signed in has neither.

## What the customer does

The table takes one row per reference, with a quantity. Rows come from three places: typed one by
one, pasted from a spreadsheet, or imported from a `.csv` or `.txt` file.

Checking the table writes nothing. Each line comes back with a status, and the customer fixes the
lines that need it before adding anything to the cart. Only the lines the last check called
resolved, and that were not edited since, reach the cart.

A purchase list is filled from the cart, from a past order, or from the quick order table. Opening
a list loads its lines into the table, checked, where they can be edited and saved back. A
reference the shop no longer sells stays on the list and shows as unknown, so the customer sees
which references an old list still carries.

A list can be renamed, duplicated and deleted.

## How a reference is resolved

The shop looks for each reference in this order:

1. On the sale elements, by reference and by EAN code.
2. When no sale element carries it, on the products, by product reference. The line then goes to
   the default sale element of the product, or its first one when none is the default.

Case is ignored. Non-breaking spaces and the invisible characters a copy from a spreadsheet brings
along are removed, and runs of spaces become one. A reference given twice for the same sale
element is kept once, with the quantities added up.

Only visible sale elements of visible products are searched. A product hidden from the customer by
a reserved sale answers as an unknown reference, so the answer never reveals that it exists.

Each line ends up with one of five statuses:

| Status | Meaning |
| --- | --- |
| `resolved` | One sale element, priced and in stock. The line can go to the cart. |
| `ambiguous` | Several sale elements carry the reference. The customer picks one. |
| `unknown` | Nothing the customer may order carries the reference. |
| `unavailable` | The sale element exists but cannot be sold: out of stock, or without a price. |
| `quantity_refused` | The quantity asked for is more than the stock holds. |

The core gives every sale element of a product the product's reference by default, so
`ambiguous` is common. The line then lists its candidates with their attributes. When they all
belong to one product, the default sale element is preselected. The choice is sent back with the
line as a `productSaleElementsId`, which must be one of the candidates.

The stock checks follow the `check-available-stock` setting, and a virtual product is never short
of stock. Prices are unit prices with the customer's discount included.

Adding to the cart resolves the lines again rather than trusting the table the browser holds. The
resolved lines are added in one transaction, which rolls back on an unexpected error. A reference
already in the cart adds to its quantity. A line the cart refuses comes back marked as not added,
and the other lines stay in the cart.

## Limits

| Limit | Value |
| --- | --- |
| Lines checked or added at once | 500 |
| Purchase lists per customer | 100 |
| Lines per purchase list | 500 |
| Quantity per line | 999 999 |
| Length of a reference | 255 characters |
| Length of a list title | 255 characters |
| Quick order requests per customer | 30 a minute |

The last limit is the `quick_order_per_customer` rate limiter, a sliding window declared by the
core. Checking a table, adding it to the cart and loading a list into the table each count as one
request, whether they come from the theme or from the API. Every answer carries titles, prices and
stock levels, and the cap keeps a signed-in account from reading the whole catalog through it.

Flexy adds its own bounds on pasted text and imported files: 100 000 bytes at most, and the 500
line limit above. The file is read in the browser and sent to the server as text, the same way a
paste is.

## In Flexy

Flexy 1.2 renders both features in the customer account, which links to them as "My purchase
lists" and "Quick order":

| Page | Route | Path |
| --- | --- | --- |
| Quick order table | `account_quick_order` | `/account/quick-order` |
| Purchase lists | `account_purchase_lists` | `/account/purchase-lists` |
| One purchase list | `account_purchase_list` | `/account/purchase-lists/{listId}` |

The table is the `QuickOrderTable` live component (`components/Organisms/QuickOrderTable`). It
checks the table only on an explicit action: the check button, the button that imports pasted
lines, or the choice of a file.

The cart page and the order page of the account carry a `SaveToPurchaseList` form, which saves the
cart or the order into a new list or adds it to an existing one.

A pasted line holds a reference then a quantity, separated by a tab (what a spreadsheet copies), a
semicolon or a comma. Blank lines are skipped. A first line of two cells whose quantity is not a
whole number is read as a header. A line that cannot be read is reported with its line number instead of being dropped.

## API

The front API serves both features to a signed-in customer (`ROLE_CUSTOMER`):

| Operation | Purpose |
| --- | --- |
| `POST /api/front/account/quick-order/resolve` | Check lines. Writes nothing. |
| `POST /api/front/account/quick-order/{cartId}/add` | Add the resolved lines to a cart of the account. |
| `GET /api/front/account/purchase-lists` | The lists of the account, without their lines. |
| `POST /api/front/account/purchase-lists` | Create a list, with optional first lines. |
| `GET /api/front/account/purchase-lists/{id}` | A list and its lines. |
| `GET /api/front/account/purchase-lists/{id}/table` | Load a list as a checked table, in the format of `resolve`. |
| `PATCH /api/front/account/purchase-lists/{id}` | Rename a list. |
| `DELETE /api/front/account/purchase-lists/{id}` | Delete a list. |
| `POST /api/front/account/purchase-lists/{id}/duplicate` | Copy a list. |
| `POST /api/front/account/purchase-lists/{id}/items` | Add lines after the current ones. |
| `PUT /api/front/account/purchase-lists/{id}/items` | Replace the lines of a list. |
| `POST /api/front/account/purchase-lists/from-cart/{cartId}` | Save a cart as a new list. |
| `POST /api/front/account/purchase-lists/from-order/{orderId}` | Save a past order as a new list. |

The body of `resolve`, `add` and the two `items` operations is the same:

```json
{
  "lines": [
    { "reference": "TSHIRT-01", "quantity": 3 },
    { "reference": "3760123450012", "quantity": 1 }
  ]
}
```

A cart, an order or a list of another account answers 404, the same answer as one that does not
exist. A request over the rate limit answers 429, and a line the shop cannot take (no reference, a
quantity below one, more than 500 lines) answers 422.

## For developers

| Piece | Where |
| --- | --- |
| Quick order entry point | `Thelia\Domain\QuickOrder\QuickOrderFacade`: `resolve()`, `resolvePurchaseList()`, `addToCart()` |
| Purchase list entry point | `Thelia\Domain\CustomerList\PurchaseListFacade` |
| Resolution rules | `Thelia\Domain\QuickOrder\Service\ReferenceResolver` |
| Line statuses | `Thelia\Domain\QuickOrder\Enum\LineStatus` |
| Input lines and their limits | `Thelia\Domain\Catalog\DTO\ReferenceQuantityLines` |
| Who may read or change a list | `Thelia\Domain\CustomerList\Service\PurchaseListAccessPolicy` |
| List events | `TheliaEvents::PURCHASE_LIST_CREATE`, `PURCHASE_LIST_UPDATE`, `PURCHASE_LIST_DELETE` |

The API and the theme both call the two facades, so they share the rules and the rate limit. The
lists are stored in the `customer_list` and `customer_list_item` tables.
