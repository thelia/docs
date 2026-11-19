---
title: Automatic Promotions
sidebar_position: 2
---

# Automatic Promotions and "buy X get Y"

Added in Thelia 3.1.

A coupon used to need a code the shopper typed. A promotion can now apply on its own, and a
promotion can offer a product instead of taking money off the total. Both are built on the
coupon engine, so a promotion is created, conditioned, dated and counted exactly like a
coupon.

## Automatic promotions

A coupon carries a trigger mode, stored in `coupon.trigger_mode` and defaulting to `code`:

| Trigger mode | Behaviour |
| --- | --- |
| `code` | The historical one. The shopper types the code, the coupon joins the cart. |
| `automatic` | No code. The promotion is evaluated on every cart change and shows in the cart summary under its public title. |

An automatic promotion is a coupon with no code, so `coupon.code` is nullable from 3.1. It is
kept only when it is enabled, inside its date window, and within the per-customer usage limit,
then joins the coupons the shopper entered before the [stacking rules](#priority-and-stacking) apply.

Since the promotion has no code, the shopper never sees one: the cart shows the public title
the merchant wrote.

### Configuring one

Back office: **Tools > Coupons**, then create or edit a coupon and pick the automatic trigger
mode. The conditions, the date window and the usage limits are the ones any coupon has.

A new condition ships with the release: `MatchDeliveryModules` matches the delivery module the
shopper chose, with the `IN` and `OUT` operators, so a promotion can be reserved for, or kept
away from, a given carrier.

## Buy X get Y

`BuyXGetY` is a coupon effect described entirely in data. Three questions define it:

**What triggers it** (`trigger_scope`), with the triggering quantity in `trigger_quantity`:

| Scope | Triggering lot |
| --- | --- |
| `product` | A quantity of the products listed in `trigger_ids`. |
| `category` | A quantity taken from the categories listed in `trigger_ids`. |
| `selection` | A quantity taken from a selection of products, also listed in `trigger_ids`. |
| `cart` | The whole cart. `trigger_ids` stays empty: the cart names nothing. |

Every scope but `cart` divides: twelve qualifying units with a triggering quantity of three
make four lots. The `cart` scope forms one lot at most and reads the triggering quantity as a
floor, which is how a merchant says "one gift from a spending threshold" without seven
articles producing seven gifts.

**What the offer covers** (`target_mode`):

| Target mode | What is offered |
| --- | --- |
| `same` | Units of the triggering lot itself. |
| `product` | The product named in `target_product_id`, added to the cart. |
| `cheapest` | The cheapest unit of the lot. |

**How much is taken off** (`discount_type` and `discount_value`): `free`, `percentage` (clamped
to 0-100) or `amount`.

### What the shopper sees

The offered line appears in the cart, marked as offered, and cannot be edited: changing its
quantity or deleting it is refused, both through the front office and through the front API,
because the promotion owns the line. It disappears on its own when the promotion stops
applying.

Stock is respected. The offered quantity is reduced to what is left, and a gift with nothing
left in stock never blocks the order: the promotion is skipped and the shopper is told which
promotion could not be granted.

## Priority and stacking

Added in Thelia 3.4.

When several promotions could apply to the same cart, Thelia decides which ones are kept. Three
settings on each promotion drive that choice:

| Setting | Meaning |
| --- | --- |
| Priority | A whole number, `0` by default. The smallest is evaluated first. |
| Combination | One of three choices: **Combines with the others**, **Stops the next promotions**, **Applies alone**. |
| Incompatible promotions | Promotions this one is never applied with. |

### How the cart is evaluated

The promotions of the cart are put in order: by increasing priority, then, at the same priority,
the automatic promotions before the codes, then by increasing promotion id. The order in which the
shopper typed the codes does not matter.

Thelia then goes through them one by one:

1. A promotion whose conditions are not met is ignored.
2. A promotion declared incompatible with one that is already kept is set aside.
3. A promotion that applies alone is set aside when another one is already kept.
4. Otherwise the promotion is kept. If it stops the next promotions, or applies alone, the
   evaluation ends there and the following promotions are set aside.

A promotion that is set aside does not use up its usage limit. Free shipping follows the same
selection as the discount.

An incompatibility works in both directions: declaring A incompatible with B also makes B
incompatible with A. Saving the incompatibilities locks the promotions they touch, and an edit
that still collides with another one is refused.

### Updating from an earlier version

Every existing promotion gets the priority `0` and no incompatibility. A promotion that was not
cumulative now has the choice **Applies alone**. A cart with no code or one code, plus automatic
promotions, keeps its discount as long as none of those promotions has a priority, a stop or an
incompatibility. A cart that held several codes, one of them not cumulative, no longer depends on
the order the codes were typed in.

### In the back office

The promotion form replaces the former cumulative checkbox with the combination choice. It also
has the priority and a filterable list of incompatible promotions. The list of promotions shows
and sorts by priority.

### What the shopper sees

In the Flexy cart summary, a code the shopper typed that was set aside is named, together with
the promotion applied in its place. An automatic promotion that was set aside is never shown.

A theme reads these codes from the cart attribute `excluded_promotions`. Each entry holds `code`,
`title` and `winner_title`.

### For developers

| Piece | Where |
| --- | --- |
| The selection | `Thelia\Domain\Promotion\Coupon\Service\PromotionSelector::select()` |
| The columns | `coupon.priority`, `coupon.stop_processing` and the table `coupon_exclusion`, added by `setup/update/sql/3.4.0.sql` |
| What was set aside | `CouponManager::getSelection()->discarded`, a list of `DiscardedPromotion` with its winner |

`Thelia\Domain\Promotion\Coupon\Type\CouponInterface` declares `getPriority(): int` and
`isStopProcessing(): bool`. A promotion type that extends `CouponAbstract` inherits them, with
priority `0` and no stop. A type that implements the interface directly has to add them.
`CouponManager::__construct()` takes an optional `PromotionSelector` as its last argument.

The priority cannot be read or sorted from the front API. The operations `GET
/api/front/coupons`, `GET /api/front/coupons/{id}` and `GET /api/front/coupons/{code}/by-code`
no longer exist: a customer enters a code through the cart, and `Thelia\Api\Resource\Coupon` is
no longer an API resource.

## What an order keeps

An order freezes the promotion it used, so editing a coupon afterwards never rewrites an order
that is already placed:

- `order_coupon.coupon_id` records which coupon was used, and `order_coupon.serialized_effects`
  the effects as they were evaluated, which is what makes a codeless promotion countable;
- `order_product.is_offered` copies the cart marker, so the back office, the invoice and a
  partial refund all see a gift as a gift.

The promotions are priced again just before the order is written, for the shopper who sat on
the payment page while an automatic promotion expired or its gift ran out of stock.

## For developers

| Piece | Where |
| --- | --- |
| Trigger mode constants | `Thelia\Model\Coupon::TRIGGER_MODE_CODE`, `TRIGGER_MODE_AUTOMATIC` |
| Automatic coupons joined to the cart | `Thelia\Domain\Promotion\Coupon\Service\CouponManager::getCurrentCoupons()` |
| The effect | `Thelia\Domain\Promotion\Coupon\Type\BuyXGetY`, service `thelia.coupon.type.buy_x_get_y` |
| The offered line | `Thelia\Domain\Promotion\Coupon\Service\OfferedCartLineService` |
| The carrier condition | `Thelia\Condition\Implementation\MatchDeliveryModules`, service `thelia.condition.match_delivery_modules` |
| The front API guard on offered lines | `Thelia\Api\Security\CartItemVoter` |

A cart line that a promotion owns is flagged by `cart_item.is_offered`, with
`cart_item.offered_by_coupon_id` naming the promotion that granted it. Anything writing to the
cart outside the core has to leave those lines alone: the core refuses the change on the event
path and the voter refuses it on the API path.

Promotions that could not be granted are published in the session under
`OfferedCartLineService::UNAVAILABLE_PROMOTIONS_SESSION_KEY`, so a theme can tell the shopper
after a redirect.
