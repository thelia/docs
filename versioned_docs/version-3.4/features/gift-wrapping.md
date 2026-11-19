---
title: Gift Wrapping
sidebar_position: 8
---

# Gift Wrapping

Added in Thelia 3.2.

A shop can offer a gift wrapping at checkout, and let the buyer write a short note for whoever
receives the parcel. The wrapping is a service the shop sells beside its goods: it has a price, a
tax rule and a place on the invoice. The note travels with the order to the delivery note and to
the confirmation e-mail.

While no wrapping is active, the checkout is exactly the one the shop had before the feature.
Nothing is displayed, not even an empty block.

## Setting up the wrappings

The merchant manages them in the back office, under Configuration > Gift wrappings. Access is
governed by the `admin.configuration.gift-wrapping` resource, which a profile has to be granted
before its administrators see the screen.

A wrapping carries:

| Field | Meaning |
| --- | --- |
| Code | Names the wrapping on the order lines it produces. Chosen when the wrapping is created, read-only afterwards. Unique across the shop. |
| Title and description | Translated, one wording per language. The description is shown under the choice at checkout. |
| Price (tax excluded) | Zero or more. A price of zero is a wrapping the shop offers. |
| Tax rule | The rule that taxes the price, chosen from the shop's tax rules. |
| Active | A wrapping turned off is no longer offered. It is kept, so the orders that carry it keep reading. |
| Position | The order of the choices at checkout, changed from the list. |

The price is a column of the wrapping, not a configuration entry, because the configuration
reads `0` as "not set" and a free wrapping must stay a wrapping.

Deleting a wrapping does not touch the orders already placed: each keeps the line it was given.
A cart that was pointing at the deleted wrapping loses the choice.

## What the buyer sees

The choice sits on the payment step, where the buyer can see what it adds to the total. It is a
list of exclusive options, the first being "No gift wrapping", so a buyer can always go back to
nothing. Each wrapping is listed with its title and its tax-included price, or "Free" when the
price is zero, and its description when it has one.

Once a wrapping is picked, a "Message for the recipient" field appears under the list. The note
is saved on the cart as it is typed, there is nothing to submit, and a counter shows how many
characters are left. The limit is 500 characters. A longer note is refused whole, with a message,
never cut: half a sentence on a parcel is worse than no note.

The wrapping is a line of the order summary, between the delivery and the promotions, in the
checkout and on the order page of the customer account. The note is shown again on that order
page.

A wrapping the shop turns off while a cart still holds it is dropped from that cart, so the shop
never charges for a service that is no longer on sale.

## What the order keeps

When the order is placed, the chosen wrapping becomes a line of the order, of type `service`,
priced and taxed like a product. The line freezes the wording in the language of the order, the
price and the name of the tax rule. Renaming, repricing or deleting the wrapping afterwards leaves
every placed order saying what it said the day it was invoiced.

The note is frozen on the order too.

The wrapping line is not goods:

- it takes no stock;
- it cannot be returned, see [Order Returns](./order-returns.md);
- it does not count towards free shipping.

## Where the note appears

| Document | Behaviour |
| --- | --- |
| Order confirmation e-mail | The note is repeated under the order, in the HTML and in the text version, so the buyer can check what they wrote before the parcel leaves. |
| Delivery note (PDF) | The note is printed in a block of its own, in the language of the order. |
| Invoice | Never printed: the invoice goes to the buyer, not to the recipient. |
| Back office, order sheet | A "Gift" card lists the wrapping and its tax rule, and shows the note. |

## For developers

### Data model

The update script `setup/update/sql/3.2.0.sql` is replayable. It adds:

| Where | What |
| --- | --- |
| `gift_wrapping` | `id`, `code` (unique), `price` (`DECIMAL(16,6)`, tax excluded), `tax_rule_id` (foreign key, `RESTRICT`), `active`, `position`, timestamps. |
| `gift_wrapping_i18n` | `title` and `description` per locale. |
| `cart.gift_wrapping_id` | The wrapping picked, nullable, foreign key with `ON DELETE SET NULL`. |
| `cart.gift_message` | The note while the cart is being written. |
| `order.gift_message`, `order_version.gift_message` | The note frozen on the order. Null on every earlier order, which reads as "no note". |
| `order_product.line_type` | `product` (the default, so nothing is backfilled) or `service`. |

The cart keeps the identifier of the wrapping and nothing else. The price and the wording are read
back from the wrapping at each display, so a repricing before the order is placed charges the new
price, and a price sent by a browser is read by nobody.

### Services and events

- `CartFacade::chooseGiftWrapping(Cart, ?int)` records or clears the choice. It throws
  `UnknownGiftWrappingException` for a wrapping the shop does not offer.
- `CartFacade::writeGiftMessage(Cart, ?string)` records or clears the note. A note of spaces is
  stored as null. The length is counted in characters, not bytes, and a note over
  `GiftWrapping::MAX_GIFT_MESSAGE_LENGTH` throws `GiftMessageTooLongException`.
- `CartFacade::dropGiftWrappingThatIsNoLongerOffered(Cart)` releases a wrapping that was turned
  off.
- `GiftWrappingProvider` lists the active wrappings in position order, memoized for the request.
- `GiftWrappingLineFactory` writes the order line and its taxes when the order is placed.
- The checkout reports `gift-wrapping-unknown` and `gift-message-too-long` as
  `CheckoutViolationCode` cases.
- The back office raises `TheliaEvents::GIFT_WRAPPING_CREATE`, `_UPDATE`, `_DELETE`,
  `_UPDATE_POSITION` and `_TOGGLE_ACTIVE` (`action.createGiftWrapping` and so on).

`Cart::getTaxedAmount()`, `getTotalAmount()` and `getTotalVAT()` take a trailing
`$withGiftWrapping` argument, false by default, so nothing a module already calls changes. The
grand totals the front reads pass true. `OrderFacade` and `CartFacade` have a new constructor
argument; a module that instantiates either has to follow, a module that reads them from the
container has nothing to do.

Code that walks the lines of an order to pick, ship, weigh or count stock reads
`OrderProduct::isProductLine()`. Code that totals money keeps counting every line.

### Templates

- The `order` loop outputs `GIFT_MESSAGE`, and the `order_product` loop outputs `LINE_TYPE`.
- `AttributeAccessService` serves the cart attributes `gift_wrapping_id`, `gift_wrapping_title`,
  `gift_wrapping`, `untaxed_gift_wrapping`, `taxed_gift_wrapping` and `gift_message`.

### API

No API resource is added for the wrappings themselves. The existing resources gain two read-only
fields:

| Resource | Field | Groups |
| --- | --- | --- |
| `Order` | `giftMessage` | Admin and front, single read. |
| `OrderProduct` | `lineType` | Admin read, and the front single reads. |

Both are read-only: an order already shipped must not start saying something else. A theme can
read `lineType` to leave the service lines out of the list of things to ship and state them where
it states the postage.
