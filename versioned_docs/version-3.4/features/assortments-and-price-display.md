---
title: Assortments and Price Display
sidebar_position: 17
---

# Assortments and Price Display

Added in Thelia 3.4.

Two features decide who sees which part of the catalog, and who sees prices:

- **Assortments** open or close categories, brands and products to a customer group or to a single
  customer.
- **Price display** hides prices from visitors, or from everyone, and replaces them with a login
  invitation or a price request.

## Assortments

An assortment rule is one line: a customer group or a customer, a category, a brand or a product,
and a direction.

| Direction | Effect |
| --- | --- |
| Allow | The target is open. Whatever no allow rule opens is closed. |
| Deny | The target is closed, whatever an allow rule says. |

A category stands for its whole subtree. A rule names exactly one customer group or one customer,
and exactly one category, brand or product.

### How the rules combine

A customer is bound by the rules of their group and by their own rules, taken together. A visitor,
a guest account and a console command use the rules of the default group.

- A deny wins over an allow.
- A customer with no allow rule sees everything that no deny rule closes.
- Once a customer has an allow rule, everything that no allow rule opens is closed.
- A product filed in no category is opened only by an allow rule on the product or on its brand.
- A brand stays listed while it carries a product the customer can see.

Assortments add to the list of categories of a [customer group](./customer-groups.md#restricting-the-catalog-and-the-payment-methods).
A product is visible when both open it.

The rules apply wherever the catalog is read: listings, search, the sitemap, the front API (404 on
an item), the `brand` loop and the cart. A closed product cannot be added to the cart. A product
that became closed is removed when the cart is loaded again. The back office and the admin API are
never narrowed.

### In the back office

Open **Prices and assortments > Assortments**, then create a rule. It needs the `admin.pricing`
right. Choose who the rule applies to (customer groups, one rule per group, or a customer you
search by name, e-mail or reference), what it is about (a category, a brand or a product), and the
direction.

On a product page, the **Effective prices** panel tells you when the product is outside the
assortment of a customer you search.

### Through the API

`/api/admin/catalog_restrictions` has a collection, an item, creation, `PUT`, `PATCH` and deletion.
A rule has `customerGroup` or `customer`, one of `category`, `brand` or `product`, and `mode`
(`allow` or `deny`). It can be filtered by `mode`, `customerGroup.id` and `customer.id`. The rules
are never disclosed to the storefront.

### For developers

`Thelia\Domain\Catalog\Restriction\CatalogRestrictionResolver` reads the rules that bind a customer,
once per request. `Thelia\Domain\Catalog\Product\ProductVisibility` takes it as a constructor
argument. It is not a tagged `ProductVisibilityRuleInterface`, so `hasModuleRules()` still answers
for the rules of modules only.

## Price display

The way prices show is a mode:

| Mode | Behaviour |
| --- | --- |
| `visible` | Every visitor sees the prices and may buy. This is the default. |
| `logged_in` | A visitor sees no price and no add-to-cart button, and is invited to sign in. A signed-in customer sees prices as usual. |
| `on_request` | Nobody sees a price. A **Request a price** button leads to the contact form. |

An unknown value falls back on `visible`.

### Setting the mode

The shop default is the **Display of the prices** setting in **Configuration > Store**
(`price_display_mode`). A product can override it. On the product page, **Display for this product**
offers **Like the shop**, or one of the three modes.

The contact form opens with the references only (`product_ref` and `pse_ref`), never a price.

### What a hidden price means

When a price cannot be shown, it is `null` wherever the core publishes it: in the front API, in
`ProductSaleElementsAccessService::psesByProduct()`, in the `product` and `product_sale_elements`
loops, and in the quick order. The sale elements of the front API also carry `priceDisplayMode` and
`purchasable`.

- Sorting and filtering by price do not reveal the hidden price.
- Adding such an element to the cart is refused, even by a direct call.

### Shared cache

A shop that hides its prices from visitors should review its shared cache. Anonymous pages are not
shared while a price is hidden. The data access cache keys the price paths by signed-in or
anonymous visitor while some price is hidden. Writing a price display mode flushes it and the
shared cache.

### For developers

`Thelia\Domain\Pricing\PriceVisibility\PriceDisplayMode` is the enum behind the modes, with
`showsPrice()` and `purchasable()`. `PriceVisibilityResolver` is the one place every reader of a
price and every door of the cart ask: it answers from the mode of the product, else the one of the
shop. A shop where every price is visible pays no extra query.

Several services take new constructor arguments with no default, after their existing ones. A
module that extends or decorates one of them passes the new arguments:

- `Thelia\Api\EventListener\EffectivePriceListener` and
  `Thelia\Api\Service\DataAccess\ProductSaleElementsAccessService`: `PriceVisibilityResolver`, then
  `PriceTierPublisher`.
- `Thelia\Api\EventListener\EffectivePriceCollectionWarmer` and
  `Thelia\Api\Bridge\Propel\Filter\CustomFilters\ProductFilter\ProductPriceOrderFilter`:
  `PriceVisibilityResolver`.
- The `brand` loop `Thelia\Core\Template\Loop\Brand`: `CatalogRestrictionResolver` and
  `CurrentCustomerProvider`.
