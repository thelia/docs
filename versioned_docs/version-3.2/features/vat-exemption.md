---
title: Intra-Community VAT Exemption
sidebar_position: 9
---

# Intra-Community VAT Exemption

Added in Thelia 3.2.

A business buyer established in another member state of the European Union can order without VAT
once their intra-community VAT number has been verified. The buyer then accounts for the VAT in
their own country (reverse charge). The order stays exempt after it is placed, and the checkout,
the account and the documents say so.

Thelia does not call the verification service (VIES) itself. The core decides what a verification
means and what it changes; the call belongs to a module, which plugs into one contract (see
[For developers](#for-developers)). Without such a module, no address is ever verified and no
order is ever exempted.

## Turning it on

The feature ships switched off, so an upgraded shop keeps its prices. Two variables drive it:

| Variable | Default | Meaning |
| --- | --- | --- |
| `vat_exemption_mode` | `disabled` | `disabled` taxes every order. `verified_vat_number` exempts an order billed to a verified VAT number. |
| `vat_verification_lifetime_days` | `90` | How long a verification stays valid. A value of 0 or less falls back to 90, so a typo cannot switch the expiry off. |

In the back office, the mode is the "Intra-community VAT exemption" choice of the store
configuration screen. Its help reminds the merchant that a verification module is required.

The screen refuses to turn the exemption on for a shop declared out of the VAT scope (article
293 B of the French tax code): such a shop charges no VAT, so it has none to reverse onto its
buyers.

## When an order is exempt

An order is exempt when all of these hold:

- the mode is `verified_vat_number`;
- the shop is not itself out of the VAT scope;
- the billing address carries a VAT number;
- the country of the billing address is in the European Union and is not the shop's country;
- the billing address carries a verification that has not expired.

The rule follows the billing address, not the delivery one: goods can ship to a warehouse
anywhere, the invoice is what the tax follows.

When the order is exempt, the products, the postage and the discounts all go through a calculator
that charges no VAT. A percentage discount is taken on the untaxed amount. Changing the billing
address during checkout recomputes the postage tax as well.

## How an address becomes verified

A verification module reports its answer, and Thelia records it on the address:

- A confirmed number records the date of the verification and, when the service gives one, the
  business name.
- A refused number clears any earlier verification.
- An unanswered check (service down, throttled, number out of its scope) changes nothing. A
  verification still valid keeps exempting until it expires, and none is granted while the service
  is down.

Changing the VAT number or the country of an address drops its verification, whichever way the
address is written: the forms, the admin and front API, a profile update. An answer is recorded
only while the address still carries the number and the country that were checked.

No form or API operation can write the verification. A buyer cannot declare themselves exempt.

## What the buyer sees

- Payment step: the tax line of the summary is replaced by "VAT exempted (reverse charge),
  buyer VAT number …", so the buyer knows before paying that the total is VAT free.
- When the number does not exempt: the summary says why: the number is not verified, or its
  verification has expired.
- Order page and confirmation: the order summary carries the same reverse charge line.
- Address card: a "VAT verified on [date]" tag appears. On an address of the customer account
  it disappears once the verification has expired, because the address no longer exempts. On the
  address frozen on an order it stays, as a record of what was true when the order was placed.

## What the order keeps

At placement the decision is written on the billing order address: `vat_exempted`, and the VAT
the order would have carried (`vat_exempted_amount`, computed with the standard calculator).
Revoking the number, letting it expire or turning the setting off afterwards changes nothing on a
placed order.

An order that reuses an existing order address is never exempted, since nothing proves that
address was checked. On the invoice address of an exempt order, the company, the registration
number and the VAT number can no longer be edited from the back office.

## Documents

The invoice and the delivery note state "Reverse charge: VAT due by the customer" in the legal
mentions they already print, in the page footer and in the shop block. The invoice also prints
the buyer's VAT number ("Customer VAT") next to the shop's. The delivery note leaves the number
out, since it is not the document that bills.

Both read the exemption frozen on the invoice order address, so revoking the number later does
not change a document already issued. The mention follows the language of the order.

## In the back office

- Store configuration: the mode, as described above.
- Address edit screen: the state of the VAT number: a green notice with the date and the
  business name while the verification is valid, a grey one saying the address "no longer
  exempts" once it is older than `vat_verification_lifetime_days`.
- "Verify the VAT number again": a button on that screen. It appears only when the address has
  a number and a verification module is installed. It requires the update permission on
  addresses, and it is limited to 30 calls per administrator over a sliding 15 minutes, because
  each call reaches the verification service.
- Order sheet: the billing address card of an exempt order shows a "VAT exempted" badge, the
  VAT the order did not charge ("Exempted VAT"), the number used, and the date and business name
  of its verification. None of it is recomputed.
- Customer list: a filter on "Verified address": with, without, or any. An expired
  verification counts as without.

## For developers

### The verification contract

`Thelia\Domain\Legal\Service\VatNumberVerifierInterface` has one method:

```php
public function verify(string $vatNumber, string $countryIsoAlpha2): VatVerificationResult;
```

The result carries a `VatVerificationStatus` (`verified`, `refused` or `undetermined`), the date
of the verification and, when the service discloses it, the business name. Only `verified` opens a
right. An implementation answers about existence, not shape: format and checksum are settled
before the call. It must not throw when the service is unreachable; an outage is `undetermined`.

The core aliases the interface to `NullVatNumberVerifier`, which answers `undetermined` to
everything. The alias is declared in `Config/Resources/services/core/legal.php`, not with
`#[AsAlias]`, so a module can declare its own. SiretManagement, from version 2.1.0, is the module
that does so with VIES. It triggers the verification when an address is created or updated and
when a billing address is chosen in checkout, and it does not call VIES again while a
verification is within `vat_verification_lifetime_days`.

### Events

| Event | Purpose |
| --- | --- |
| `TheliaEvents::VAT_NUMBER_VERIFIED` (`action.vatNumberVerified`) | Sent by a verification module with a `VatNumberVerifiedEvent` (the address and the result). Thelia records the answer. Listen to it to tell an accounting system or a CRM. |
| `TheliaEvents::TAX_GET_CART_CALCULATOR` (`action.getCartTaxCalculator`) | Sent with a `CartTaxCalculatorEvent` to obtain the tax calculator of one cart. The exemption answers with an `ExemptTaxCalculator`. |

A module never writes the verification columns itself.

### Resolver

`VatExemptionResolver` takes a cart and answers `isExemptedForCart()`, or `stateForCart()` with a
`VatExemptionState`: `exempted`, `not_applicable`, `not_verified` or `verification_expired`. It
reads no session, so it gives the same answer from a request, a command or a test.

### Data model

Eight columns, added by `setup/update/sql/3.2.0.sql` (replayable):

| Table | Columns |
| --- | --- |
| `address` | `vat_verified_at`, `vat_verified_name` |
| `cart_address` | `vat_verified_at`, `vat_verified_name` |
| `order_address` | `vat_verified_at`, `vat_verified_name`, `vat_exempted`, `vat_exempted_amount` |

The customer anonymizer clears the verification columns.

### API

All of these are read-only:

| Resource | Fields |
| --- | --- |
| `Address` | `vatVerifiedAt`, `vatVerifiedName`, `vatVerificationValid` (aware of the expiry). Admin and front. |
| `CartAddress` | `vatVerifiedAt`, `vatVerifiedName`. |
| `OrderAddress` | `vatVerifiedAt`, `vatVerifiedName`, `vatExemptedAmount`. |
| `Cart` | `isVatExempted`. |
| `Order` | `vatExempted`. |

`Cart.postage` and `Cart.postageTax` follow the exemption. `Cart::getPostage()` and
`getPostageTax()` hold the quote of the delivery module; what the buyer owes is read from
`getTaxedPostage()`, `getUntaxedPostage()` and `getPostageTaxAmount()`.

### Templates

The `is_vat_exempted` and `invoice_vat_number` attributes of `AttributeAccessService` serve the
Flexy summary. The PDF templates read `VAT_EXEMPTED` on the `order_address` loop.
