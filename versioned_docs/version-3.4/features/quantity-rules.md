---
title: Quantity rules and units of measure
sidebar_position: 17
---

# Quantity rules and units of measure

Added in Thelia 3.4.

Each combination can set rules on the quantity a customer may buy, and a unit of measure. This
covers a product sold by the lot ("by 6"), a product with a minimum order, and a product sold by
weight, volume or length ("1.25 kg").

A shop changes nothing until a combination is given rules. The defaults are the behaviour every
combination already had: a minimum of 1, a step of 1, sold by the piece.

## Rules of a combination

In the **Combinations** tab of a product, each combination has these fields:

| Field | Column | Default | Meaning |
| --- | --- | --- | --- |
| Minimum quantity | `min_quantity` | 1 | The smallest quantity sold. |
| Sold by | `quantity_step` | 1 | Every quantity is a multiple of it. |
| Decimals of a quantity | `quantity_decimals` | 0 | From 0 to 3. `0` is sold by the piece. More than 0 is sold by measure. |
| Unit | `unit_code` | none | One of `pc`, `kg`, `g`, `l`, `ml`, `m`, `cm`, `m2`, `m3`. |
| Content of one unit sold | `unit_quantity` | none | What one unit sold contains, in the unit: 0.75 for a 75 cl bottle sold in litres. |
| Price shown per | `reference_unit_quantity` | none | The quantity the reference price is given for: 1 for a price per litre. |

The form shows the resulting **Price per reference unit, incl. tax**. A bottle of 75 cl at 9.99
gives 13.32 per litre. The button **Apply these settings to every combination and save** copies the
rules to all the combinations of the product.

Changing a rule adjusts the quantities of the carts in progress, the next time they are read.

Examples:

- A pack sold by 6, at least 6: minimum 6, step 6, 0 decimals. Valid quantities are 6, 12, 18.
- Cheese sold by weight, to the gram, from 100 g: unit `kg`, 3 decimals, minimum 0.1, step 0.001.
- A bottle of 0.75 l sold by the piece with a price per litre: 0 decimals, unit `l`, content 0.75,
  reference 1.

A rule that cannot decide a quantity is refused: a step or a minimum that is not positive, more than
3 decimals, a step or a minimum with more decimals than the combination allows, a unit quantity
that is not positive, or an unknown unit.

## What the customer sees

The rules hold everywhere a quantity is written.

- **Adding to the cart**: a quantity off the rules is refused with a message that gives the valid
  quantities ("Sold by 6: 6, 12, 18..."). A quantity that is zero or less is refused too. The check
  is made on what the line will hold once the addition joins it.
- **Reading a cart back** (restored from its cookie, merged at sign-in, rules changed since): the
  cart does not refuse. It brings a line down to the valid quantity below it, or removes it when
  even that is under the minimum. The checkout then stops once, so the customer sees the new
  quantities before paying.
- **Offered lines** (a promotion, a free product coupon) are held to no rule.
- The **quick order** and **purchase lists** refuse a line off the rules and a combination sold by
  measure, which has to be ordered from its product page.

On an order, the unit and the decimals are frozen on each line when the order is placed. Totals are
charged in cents, as the cart rounds them: 1.25 kg at 14.82 is charged 18.53.

Stock moves on the thousandth, so ten orders of 10 g taken from 10 tonnes leave exactly 9999.9 kg.
A stock written by the back office, an import, the generation of combinations or the API holds the
decimals of its combination. 12.5 pieces of a combination sold by the piece is refused. The minimum
and the step apply to a cart line, not to a stock.

The Flexy theme sells by these rules from the Flexy release that follows Thelia 3.4: the product
sheet starts at the minimum, offers a lot as a list, steps a quantity by its step, and shows the
price per reference unit ("13,32 EUR / l") on the sheet and the product card. A custom theme does
this with the classes below.

## Developer reference

### API

`/api/admin/product_sale_elements`, and the combinations of `/api/admin/products`, write
`minQuantity`, `quantityStep`, `quantityDecimals`, `unitQuantity`, `referenceUnitQuantity` and
`unitCode`. A refused rule answers 422. The front API reads them.

`POST` and `PUT /api/front/cart_items` judge the quantity by the rules. A quantity of 7 on a
combination sold by 6 answers 422 with the valid quantities. 1.25 on a combination sold to the
hundredth is taken. 1.5 on a combination sold by the piece answers 422.

`quantity` is a float on `ProductSaleElements`, since a stock can carry decimals. On the order lines
of the API, `unitCode` and `quantityDecimals` are read only. `/api/admin/cart_items` does not write
the quantity of a line.

### Classes

All in `Thelia\Domain\Catalog\Quantity`.

| Class | Role |
| --- | --- |
| `UnitCode` | The units, with their symbol and translated name. |
| `QuantityRule::fromProductSaleElements()` | Reads the rules of a loaded combination, without a query. Throws `InvalidQuantityRuleException` for a rule that cannot decide a quantity. |
| `QuantityPolicy::assertAcceptable()` | Returns the quantity, or throws `QuantityRefusedException` with a translated message that lists the valid ones. For paths where the buyer can change the quantity. |
| `QuantityPolicy::normalize()` | Returns a `QuantityDecision`: the valid multiple below the quantity, or the removal of the line (`removesTheLine()`), with the reason and a translated `message()`. |
| `QuantityPolicy::parse()` | Reads "1,25" and "1.25". Refuses an input that could be read two ways, such as "1.250" on a combination sold with fewer than three decimals (`UnreadableQuantityException`). |
| `QuantityPolicy::assertStockFits()` | Judges a stock against the decimals of the combination. |
| `ReferenceUnitPriceCalculator::compute()` | The price per reference unit. |
| `QuantityFormatter::format()`, `formatMeasure()` | Write a quantity with its decimals in a language. `format()` adds the unit only for a combination sold by measure. `formatMeasure()` always adds it. |

`assertAcceptable()`, `normalize()` and `parse()` take a combination or a `QuantityRule`. Both
`assertAcceptable()` and `normalize()` throw `NotPositiveQuantityException` for zero or less.

### Cart

`CartItemAddDTO` and `CartItemUpdateQuantityDTO` take a float quantity, and `CartEvent` keeps it
as it is, where it used to cut it to a whole number. `Action\Cart::addItem()` and `changeItem()`
throw `Thelia\Domain\Cart\Exception\CartQuantityRefusedException`, an `InvalidCartException`, so
every caller (the `CartAdd` form, `CartFacade`, the front API, a theme) gets the same refusal.

`Thelia\Domain\Cart\Service\CartQuantityReconciler` adjusts a cart read back, and dispatches
`TheliaEvents::CART_ITEM_QUANTITY_ADJUSTED` (`CartItemQuantityAdjustedEvent`, with the
`QuantityDecision` and a message). The cart step of the checkout then throws
`CartQuantitiesAdjustedException`, code `cart-quantities-adjusted`.

### Templates and loops

The core declares the `format_quantity` Twig filter, also for the e-mail and PDF templates:

```twig
{{ line.QUANTITY|format_quantity(line.QUANTITY_DECIMALS, line.UNIT_CODE) }}
{# "1,25 kg" in French #}
```

The arguments are `quantity|format_quantity(decimals, unitCode, locale)`. The locale is the one of
the current request when none is given. A theme that declares its own filter keeps it.

The `order_product` loop outputs `UNIT_CODE` and `QUANTITY_DECIMALS` (empty and 0 on a line placed
before). The return document context gains the same two keys on each entry of `lines`.

### Storage

Quantities and stocks are `DOUBLE` columns, where they were single precision `FLOAT`. A stock of
1234.567 kg is read back as 1234.567. The `3.4.0.sql` update script converts the columns. A module
that reads these columns in SQL gets the double precision value. The getters and setters stay
`float`.

### Upgrading

- `CartEvent::getQuantity()` returns `?float` instead of `?int`. A listener that compares it to an
  integer with `===`, or passes it to an `int` parameter, has to follow.
- `Order::getTotalAmount()` and the cart line totals round to the cent, half up. An order with whole
  quantities totals the same amounts.
- A Flexy child theme that reads a quantity or a stock into an `int` has to read a float.
