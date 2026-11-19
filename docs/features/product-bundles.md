---
title: Product bundles
sidebar_position: 15
---

# Product bundles

Added in Thelia 3.4.

A **bundle** is a product sold as one line that is made of other products. A cycling kit made of a
bike, two helmets and an optional lock is one product with one price and one cart line. The stock
that moves, the parcel that leaves and the weight that is billed are the ones of its components.

A shop that has no bundle runs exactly as before. The feature only costs something once a product
becomes a bundle.

## Set up a bundle in the back office

1. Open the product, tab **General**, and tick **Product bundle** in the **Bundle** card.
2. Choose the **Bundle price**: **Fixed price** or **Sum of the components** (see [Prices](#prices)).
   With the sum, set a **Bundle discount** and its **Discount type**, **Percent** or **Amount**.
3. Save. A **Composition** tab appears next to **Combinations**.
4. In **Composition**, pick a category, a product, then the combination the bundle is made of, and
   set the **Quantity**, an optional **Minimum** and **Maximum**, and whether the component is
   **Required**. Click **Add**.

The **Composition** tab starts with a summary: the sum of the components, the bundle price, the
discount, the availability, and a warning when the bundle cannot be sold (no component yet, a
required component offline or deleted, a component out of stock). Each component can be edited,
moved or removed from the list below.

### What a component is

A component is one combination of another product, never the product itself. It has:

| Field | Meaning |
| --- | --- |
| Quantity | The quantity in one bundle. It is the fixed quantity when no minimum and no maximum are set. |
| Minimum, Maximum | The bounds a customer may choose within. Both are optional. |
| Required | A required component is always part of the bundle. An optional one can be left out when its minimum is 0. |
| Position | The display order. |

The rules:

- A bundle keeps **one technical combination**. Its stock is ignored. A product that already has
  several combinations cannot become a bundle, and a bundle cannot get a second combination.
- A bundle holds no bundle. A bundle cannot be added as a component, and a product that is already a
  component cannot become a bundle.
- A combination appears once in a bundle.
- A component keeps its combination. To change it, remove the component and add another one.
- Deleting a combination that is a component keeps the line, empty. If that component was required,
  the bundle cannot be sold until the line is removed or replaced. The back office flags it.
- Cloning a product copies its bundle settings and its components.

## Prices

| Mode | Price of the bundle |
| --- | --- |
| `fixed` | The price of the bundle's own combination. Promotions, sales and catalog rules apply as for any product. |
| `computed` | The sum of the components the customer kept, less a discount in percent or in an amount. |

An amount discount is written in the default currency and converted for another currency. The price
never goes below 0.

Example, computed mode, 10 % discount:

| Component | Quantity | Required | Price excl. tax |
| --- | --- | --- | --- |
| Bike | 1 | yes | 500 |
| Helmet | 2 | yes | 30 |
| Lock | 1 (min 0, max 3) | no | 20 |

The customer picks the lock twice. The sum is 500 + 2 x 30 + 2 x 20 = 600. With 10 % off the price
is 540. With an amount discount of 50 it is 550. With the default composition (no lock) the sum is
560, and 504 after 10 %.

The computed price is read from one place, so the product loops, the API, the quick order, the cart
and the order all show the same number. Catalog rules and sales do not stack on a computed bundle.
They apply to a fixed one.

## Availability

The availability is deduced from the components: for each kept component, the stock divided by its
quantity, rounded down, and the smallest result wins. With the example above and the lock chosen
twice, `min(7 / 1, 5 / 2, 10 / 2)` gives 2 bundles. A bundle made only of virtual components is
unlimited.

## What the customer does

The customer picks a composition, within the bounds, and adds the bundle to the cart as one line.
The cart refuses:

- a quantity outside the bounds of a component, or a required component missing;
- a component that is offline, deleted, hidden from the customer, or itself a bundle;
- a quantity the components cannot supply, when the shop checks stock.

The messages are translated and name the component.

Two bundles with a different composition are two lines. The same composition merges into one.

At the order, the bundle is one priced line, and each component is a line with a price and a tax of
0, linked to its bundle line. The stock of the components is taken, never the stock of the bundle's
own combination. Components are shipped, the bundle line is not. A customer returns the bundle
line, refunded at its own price, and the components go back in stock in proportion. A component
cannot be returned alone.

The bundle is taxed with the tax rule of the bundle product. A bundle of components at different
rates is taxed as a whole at the rate of the bundle product: check the consequence for VAT before
selling one.

The weight is the one of the bundle's combination when it is above 0, and the sum of the components
otherwise.

## Developer reference

### API

`Product` gains `isBundle` (read and write on the admin API, read on the front API),
`bundlePriceMode` (`fixed` or `computed`), `bundleDiscount` and `bundleDiscountType` (`percent` or
`amount`). A missing field leaves the stored value alone.

Components are the `product_bundle_items` resource:

| Operation | Route | Access |
| --- | --- | --- |
| Create, list | `POST`, `GET /api/admin/product_bundle_items` | right `product` |
| Read, replace, patch, delete | `GET`, `PUT`, `PATCH`, `DELETE /api/admin/product_bundle_items/{id}` | right `product` |
| Read | `GET /api/front/product_bundle_items` and `/{id}` | public: the sellable components of an online bundle only |

```json
POST /api/admin/product_bundle_items
{
  "bundleProduct": "/api/admin/products/42",
  "productSaleElements": "/api/admin/product_sale_elements/77",
  "quantity": 1,
  "minQuantity": 0,
  "maxQuantity": 3,
  "required": false
}
```

Changing the `productSaleElements` of an existing item answers 422. So does a second combination
posted to `/api/admin/product_sale_elements` for a bundle.

To add a bundle to a cart, `POST /api/front/cart_items` takes `bundleComposition`, a list of
`{bundleItemId, quantity}`. Neither price nor stock is read from the body.

```json
POST /api/front/cart_items
{
  "cart": "/api/front/carts/9",
  "productSaleElements": "/api/front/product_sale_elements/310",
  "quantity": 1,
  "bundleComposition": [
    {"bundleItemId": 12, "quantity": 1},
    {"bundleItemId": 13, "quantity": 2},
    {"bundleItemId": 14, "quantity": 2}
  ]
}
```

`PUT /api/front/cart_items/{id}` refuses a composition different from the one of the line. The cart
line stores the choice as a canonical JSON in `cart_item.bundle_composition`, which is what tells
two lines of the same bundle apart.

### Order lines

`order_product.line_type` is `bundle` on the bundle line and `bundle_component` on each component,
whose `parent` is the id of the bundle line. Other lines are `product`, as before. The
`OrderProduct` model gains `isBundleLine()`, `isBundleComponentLine()`, `isShippableLine()` and
`movesStockOfItsOwn()`.

A module that reads order lines (an invoice, a parcel, a picking list) should:

- show the bundle line and indent its components, using `parent`;
- read the lines where `isShippableLine()` is true to build a parcel, never the bundle line;
- expect a price and a tax of 0 on component lines.

`GET /api/front/account/orders/{id}` exposes `lineType` and `parent` on each order product.

### Events

`BundleCompositionService` is the only writer of components. The back office reaches it through
these events, handled by `Thelia\Action\ProductBundleItem`:

| Constant | Event class |
| --- | --- |
| `TheliaEvents::PRODUCT_BUNDLE_ITEM_ADD` | `ProductBundleItemEvent` |
| `TheliaEvents::PRODUCT_BUNDLE_ITEM_UPDATE` | `ProductBundleItemEvent` |
| `TheliaEvents::PRODUCT_BUNDLE_ITEM_DELETE` | `ProductBundleItemEvent` |
| `TheliaEvents::PRODUCT_BUNDLE_ITEM_UPDATE_POSITION` | `ProductBundleItemPositionEvent` |

A refused change throws `BundleDefinitionException`, with a translated message. The admin API does
not dispatch these events: it calls the service directly.

### Templates

Read the composition of a cart line with `attr('cart', 'cart_items')`: each bundle line carries
`bundle_components`, plus `bundle_orderable` and `bundle_refusal` that say whether the order would
accept the line. The `cart` loop `STOCK` output follows the components.

### Known limits

- SQL sorts and filters on price or stock read the bundle's own combination. A bundle is left out of
  an "in stock" filter and a sort by price does not see the computed price. The price and quantity
  that are displayed are right.
- Reordering from a purchase list takes the default composition.
- The displayed availability ignores a component reserved to a customer group: the addition is
  refused instead.
- A computed bundle takes the national price of its components, even in a sale unit with its own
  prices.
- A pack line that the catalog no longer holds stays in the cart total until the customer removes
  it. The cart step and the order refuse it.
