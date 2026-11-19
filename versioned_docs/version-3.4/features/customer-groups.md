---
title: Customer Groups
sidebar_position: 15
---

# Customer Groups

Added in Thelia 3.4.

A customer group is a class of customers that a shop prices, serves and restricts as one. Wholesale
buyers pay 15% less and see prices without tax. A trade partner has its own price on a range and
can pay by bank transfer only. Members of a closed club browse a few categories that nobody else
sees.

Every customer belongs to exactly one group. A visitor who is not signed in, a console command and
a guest account (checkout without an account) are all treated as members of the default group.

## What a group holds

| Setting | Effect |
| --- | --- |
| Code | A stable machine name, unique. Letters, digits, dots, dashes and underscores, starting with a letter or a digit, 64 characters at most. A deployment or an API client may refer to the group by this code. |
| Title, description | Free text, translatable. |
| Discount (%) | Between 0 and 100. Taken off the prices the members pay. |
| Show prices with taxes | Whether the members see prices with or without tax. |
| Default group | Exactly one group is the default. Ticking this on another group releases the previous one. |
| Payment modules | The payment methods the members may use. Empty means all of them. |
| Categories | The categories the members may browse. Empty means the whole catalog. |
| Registration link | A secret link that signs new customers up into the group. |

The update to 3.4 creates a group with the code `default` and puts every existing customer in it.

## Managing groups in the back office

Open **Configuration > Customer groups**. The screen needs the `admin.customer.group` right. The
update gives it to no existing profile, so only super administrators reach the screen until you
grant it.

Create a group by typing its code and title, then fill in the other settings on its edit page.

### The default group

New accounts join the default group unless an administrator picks another one or the customer signs
up through a registration link. The default group can be neither deleted nor stop being the
default. To change the default, tick **Default group** on another group.

### Moving a customer to another group

On the customer's edit page, change the **Customer group** field. A new account created from the
back office joins the default group when the field is left on **Default group**.

A customer cannot change their own group. An administrator restricted to a sale unit can read
groups and the group of a customer, but cannot change them.

### Deleting a group

Deleting a group moves its customers to the default group. The orders already placed keep the group
they were placed under: the group, its discount rate and its display mode are frozen on the order,
so an invoice does not change when the group does.

## Prices for a group

A group can pay less in three ways. They combine as described in [How the price is decided](#how-the-price-is-decided).

- **A discount.** The percentage of the group applies to the catalog price. It never applies on top
  of a catalog promotional price. The customer pays the lower of the discounted catalog price and
  the promotional price.
- **A price of its own.** On the product page of the back office, the **Prices per customer group**
  panel lists each combination. Type a price, a sale price, or both, for a group and a currency.
  Prices are without tax. An empty field means the group has no price of its own, and the catalog
  price applies. A price missing in the browsed currency is converted from the one in the default
  currency.
- **A price list.** See [Price Lists](./price-lists.md).

A [catalog price rule](./catalog-price-rules.md) or a [reserved sale](./reserved-sales.md) can also
target customer groups.

### How the price is decided

For one combination, one currency and one customer, the core goes through these steps. Each step
starts from the result of the previous one.

1. **Price list.** If an active [price list](./price-lists.md) assigned to the customer or their
   group has a line for the combination and the quantity, that price is final. No group price,
   group discount, rule, sale or customer discount applies on top of it.
2. **Group or catalog price.**
   - If a sale unit prices the combination, that price is used, less the group discount.
   - Otherwise, if the group has a price of its own, it replaces the catalog price and the catalog
     promotional price.
   - Otherwise the group discount applies to the catalog price. The catalog promotional price is
     kept as it is, and the lower of the two wins.
3. **Rules and sales.** A [catalog price rule](./catalog-price-rules.md) or a
   [reserved sale](./reserved-sales.md) competes with the price from step 2. The lower price wins.
   When the group changes nothing for this combination (no price of its own, no discount), the rule
   replaces the promotional price whatever it was.
4. **Discount of the customer.** The discount set on the customer record applies last, to whatever
   won. It multiplies with the discount of the group.

Coupons and automatic promotions are computed on the cart afterwards, from these line prices.

Nothing is rounded along the way. The price is rounded to 6 decimals when a cart line is written,
and to the cent when it is displayed or added up in an order.

Example: a catalog price of 100.00, a group discount of 15% and a customer discount of 10%.

| Catalog promotional price | Customer pays | Why |
| --- | --- | --- |
| None | 76.50 | 100 less 15% is 85, less 10% is 76.50. |
| 80 | 72.00 | The promotional price beats 85, then the customer discount applies. |
| 90 | 76.50 | The discounted price, 85, beats 90. The line is no longer shown as a promotion. |

A bundle priced by its components is priced as the sum of its components less the discount of the
bundle. The group discount and the customer discount apply to that. A price the group has of its
own, a price list or a rule does not reach it.

The product loops, the front API, the product page, the price facet, the quick order and the cart
all read this one calculation, so a product card, its page and the cart line show the same price.
The `min_price` and `max_price` orders of the `product` loop stay on the public catalog price.

When a group, a group price, a price list, a rule or a sale moves the price of a line after it was
added to the cart, the payment prices the lines again and stops. Through the checkout API this is
a `409`. The same request, posted again, is placed on the new prices.

## Prices with or without tax

A group shows its members prices with tax (the default) or without. The core publishes both
figures wherever a theme prints a price, so a theme does not compute anything.

- The front API `ProductPrice` has `taxedPrice` and `taxedPromoPrice`. They are taxed for the
  delivery country of the visitor.
- Every delivery option has `postageUntaxed`.
- The cart lines of `attr()` have `offered_discount`, `offered_effective_taxed`,
  `offered_effective_untaxed`, `line_total_taxed`, `line_total_untaxed`,
  `line_total_after_discount_taxed` and `line_total_after_discount_untaxed`.
- An order publishes its group and the figures a recap without tax needs. Each one is to the cent
  and they add up. See [Orders](#orders).

## Restricting the catalog and the payment methods

A group can be limited to a list of categories, a list of payment modules, or both.

A group that has a list of categories sees only those categories and their subcategories. The
parent categories of a listed category stay open as a way through, so the customer can reach it,
but the products filed only in a parent are not shown. Every other category is closed. A product is
visible when at least one of its categories is open, or when it has no category at all.

What a group cannot see is left out of the category, product and image loops, of the front API
collections and items, of the listing facets and of the search. The page of a closed category
answers 404. The back office and the admin API are never narrowed.

A group that has a list of payment modules can pay only with the listed ones. The other methods are
left out of the `payment` loop and of the payment options of the API, and the order is refused if
they are used anyway. The list of one group never changes what another group sees or pays with.

For example, a group `pro` that lists the Cheque module and the category Sofas (under Living Room)
sees only Sofas and its subcategories, with Living Room shown as a way through, and pays by cheque
only. The default group, which has no list, sees everything and pays with every module.

### The restriction flag

A list only counts while the group is flagged as restricted. The flag follows the list when you
save the group in the back office or through the API: a non-empty list sets it and an empty list
clears it.

A restricted group sees and pays with what its list holds, an empty list included. If you delete
the only category or payment module a group lists, the group stays restricted with an empty list.
It then sees no category (a product filed in no category stays visible) or cannot pay with any
method, until an administrator edits the list. On the group page, **Lift the restriction** clears
the flag of one list. Unticking every entry of a list does the same.

The flags are read-only in the API: `restrictsCategories` and `restrictsPaymentModules`.

[Assortments](./assortments-and-price-display.md) add per-customer and per-brand rules on top of
the category list. A product is visible when both open it.

## The cart

The cart holds only what the catalog shows its visitor.

- Adding a product the customer's group hides is refused, whatever the path: the cart API, a live
  component or a module dispatching `CART_ADDITEM`. The error is a `ProductNotAvailableException`,
  which the front API answers with a 422.
- When a customer signs in, or when a cart is restored from its cookie, the lines they can no longer
  see are removed and a notice is left in the session. The remaining lines are priced again for the
  customer, then the promotions are computed again.
- A line the customer can no longer see cannot grow. Reducing it or removing it stays allowed.
- A payment module the group does not list is refused when it is chosen (`payment-invalid`, 422)
  and again at the validation.

## Registration link

A group other than the default one can open a secret registration link. Whoever signs up through it
joins the group instead of the default one.

On the group page:

- **Open a registration link** generates the link, `https://<shop>/register/<token>`. Share it only
  with the people it is meant for. Nobody validates the accounts that sign up through it.
- **Regenerate** gives a new token. The links already handed out answer 404.
- **Close** removes the token.

The default group has no link: its members sign up on the standard registration page. The Flexy
theme serves the standard registration form at `/register/<token>`. The token is read from the URL
only, and the group is looked up on the server: it is never a field of the form.

Registration is limited to 5 attempts per e-mail address and 20 per client and per hour. Behind a
proxy or a CDN, declare it in `framework.trusted_proxies` (`TRUSTED_PROXIES`). Without it every
visitor shares the address of the proxy.

## Orders

The order freezes the group, its discount rate and whether it shows taxed prices: `customer_group_id`,
`customer_group_discount_rate` and `customer_group_display_taxed_price`. The group id goes to `NULL`
if the group is deleted later, and the other two values stay.

The `order` loop outputs `CUSTOMER_GROUP_ID`, `CUSTOMER_GROUP_CODE`, `CUSTOMER_GROUP_DISCOUNT_RATE`
and `CUSTOMER_GROUP_DISPLAY_TAXED_PRICE`, with `TOTAL_GOODS_AMOUNT`, `TOTAL_TAXED_GOODS_AMOUNT`,
`TOTAL_AMOUNT_AFTER_DISCOUNT` and `TOTAL_TAXED_AMOUNT_AFTER_DISCOUNT`.

The `customer` loop takes a `customer_group` argument and outputs `CUSTOMER_GROUP_ID`,
`CUSTOMER_GROUP_CODE` and `CUSTOMER_GROUP_TITLE`. The customer export has `customer_group` and
`customer_group_title`. The personal data export of a customer names their group. Anonymizing a
customer puts the account back in the default group.

## For developers

### The admin API

All of these need the `admin.customer.group` right. An administrator restricted to a sale unit can
read but gets a 403 on any write.

| Route | Use |
| --- | --- |
| `/api/admin/customer_groups` | Collection, item, creation, `PUT`, `PATCH` and deletion. |
| `/api/admin/customer_group_product_prices` | The group prices: a group, a combination, a currency, `price` and `promoPrice`. |
| `POST /api/admin/customer_groups/{id}/registration_link` | Opens the link and returns the existing token if one is open. |
| `POST /api/admin/customer_groups/{id}/registration_link/regenerate` | Replaces the token. |
| `DELETE /api/admin/customer_groups/{id}/registration_link` | Closes the link. |

A group has `code`, `position`, `isDefault`, `discount`, `displayTaxedPrice` and translated
`i18ns`. `paymentModules` and `categories` are lists of IRIs (`/api/admin/modules/{id}`,
`/api/admin/categories/{id}`). A list left out of a write keeps its links, and an empty list clears
them. `restrictsCategories` and `restrictsPaymentModules` are read-only. `registrationToken` is
readable on a single item by an unrestricted administrator and is never written with the group.

An invalid `code` or a `discount` outside 0 to 100 is refused with a 422. Deleting the default
group, or setting `isDefault` to `false` on it, answers 409. The registration link routes also
answer 409 for the default group.

On a group price, a `POST` with neither a price nor a promotional price answers 422. A `PUT` or a
`PATCH` that empties both deletes the row and answers 204.

An administrator moves a customer with `customerGroup` on `/api/admin/customers` (`PUT`, `PATCH`).
`customerGroup.id` is an exact filter of the collection.

The customer reads their own group (id, code and title) through `customerGroup` on
`/api/front/account/customers/{id}` and through `GET /api/front/customer_groups/{id}`. The second
route refuses any group other than the one of the signed-in customer. The customer can never write
the group.

`POST /api/front/customers` takes a write-only `registrationToken`. A token that opens no group
(unknown, closed, regenerated or malformed) answers 422 on `registrationToken` with one message for
every case, and creates nothing.

The order API publishes `customerGroupId`, `customerGroupCode`, `customerGroupDiscountRate` and
`customerGroupDisplayTaxedPrice`, with `totalGoodsWithoutTaxes`, `totalGoodsWithTaxes`,
`amountDiscountWithoutTaxes`, `totalAmountWithoutTaxesAfterDiscount`, `totalShippingWithoutTaxes`,
`totalAmountWithoutTaxesWithShipping` and `totalTaxAmount`. An order line has
`unitTaxedPriceBeforePromotion`, `taxedPromoPrice`, `lineTotalWithoutTaxes` and `lineTotalWithTaxes`.

On `/api/front/products`, `untaxed_price_order` sorts on the untaxed price the visitor pays,
group and price list included, in the currency browsed.

### Services

| Need | Use |
| --- | --- |
| Read what a customer pays | `Thelia\Domain\Pricing\CustomerPrice\CustomerPriceContextInterface::resolve()` for a batch of combinations. `customerGroupOf()` and `displaysTaxedPrices()` give the group and the display. A module that builds a feed or an export prices through it and does not read `customer.discount` or the catalog price itself. |
| Know the group of a customer | `Thelia\Domain\Customer\Service\CustomerGroupResolver::groupIdOf()` and `groupOf()`. A signed-in customer is read back from the database once per request. |
| Move a customer | `Thelia\Domain\Customer\Service\CustomerGroupAssignment::assign($customer, $customerGroupId)` returns whether the group changed. |
| Create an account in a group | `CustomerCreateOrUpdateEvent` and `Customer::createOrUpdate()` take an optional last `customerGroupId`. A group the shop does not have throws `UnknownCustomerGroupException` before anything is written. |
| Write the lists of a group | `Thelia\Domain\Customer\Service\CustomerGroupLinks::replace()`, the only writer of the category and payment module lists. |
| Check a payment module | `Thelia\Domain\Customer\Service\CustomerGroupPaymentPolicy`. The check is an explicit call, so a module that stops `MODULE_PAYMENT_IS_VALID` cannot skip it. |
| Open or close a registration link | `Thelia\Domain\Customer\Service\CustomerGroupRegistration` (`open`, `regenerate`, `close`, `groupForToken`). `CustomerFacade::register()` takes an optional `?string $registrationToken`. |

### Events

| Constant | When |
| --- | --- |
| `TheliaEvents::CUSTOMER_GROUP_CHANGED` | An administrator moves a customer, through the API, the back office or `CustomerGroupAssignment::assign()`. The `CustomerGroupChangedEvent` carries the previous and the new group ids. A customer created in a group raises nothing. |
| `TheliaEvents::CART_LINES_REPRICED` | The payment priced the lines again because a price moved. The coupon action computes the discount of the automatic promotions again. |
| `TheliaEvents::CART_LINES_REMOVED` | A cart restored from its cookie lost lines the customer cannot see. The discount and the postage are computed again. |

### Targeting groups from a promotion

The coupon condition `Thelia\Condition\Implementation\ForSomeCustomerGroups` (service
`thelia.condition.for_some_customer_groups`, field `customer_groups`, operators `in` and `out`)
restricts a promotion to some groups, or excludes them.

A catalog price rule and a reserved sale take audience mode 2 (`AUDIENCE_MODE_CUSTOMER_GROUPS`). See
[Catalog Price Rules](./catalog-price-rules.md) and [Reserved Sales](./reserved-sales.md).

### Constraints to know

- `customer.customer_group_id` is required and has no default in the database. A customer created
  through the model gets the default group. A module or an import that inserts into `customer`
  with SQL must set the column.
- A discount rate outside 0 to 100 is refused at write: a 422 on the admin API, an
  `InvalidCustomerDiscountException` on the account events. A rate already stored outside the range
  counts for nothing.
- The discount of a customer is read from the database once per request, not from the copy the
  session keeps since sign-in. A discount an administrator withdraws applies at once.
- The data access cache is keyed by the group of the one asking where the answer depends on it. A
  customer with a discount of their own is not served from it. Writing a group, its prices, its
  categories or its payment modules flushes it. The shared cache (proxy) keeps the pages of
  anonymous visitors, who all belong to the default group.

The full technical reference, with the data model, is `docs/customer-groups.md` in the
`thelia/thelia` repository.
