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
then joins the coupons the shopper entered before the usual sorting and stacking rules apply.

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
