---
title: Checkout over the front API
sidebar_position: 9
---

# Checkout over the front API

The whole order tunnel is reachable from the front API, for an authenticated account and
without a session. Six operations live under `/api/front/account/checkout/{cartId}`: the four
choices a buyer makes, the verdict on what is left to settle, and the placement itself.

They are deliberately not writes on the cart resource. The postage, the discount and the totals
are the shop's to compute, so the selection operations carry an identifier and nothing else, and
every amount comes back computed. An amount, a carrier or an address stated at the last moment
is exactly what must not be takeable.

The business rules are the ones the theme tunnel runs: the same step providers, the same guards,
the same `ORDER_PAY` path, so the stock, the consents, the emails and the payment module call are
the same. See [Checkout](../features/checkout.md) for the feature itself.

:::caution Guest checkout is not part of these operations
They require a customer JWT. A visitor ordering without an account goes through the theme
tunnel.
:::

## Operations

| Operation | Method and path | Body | Answers |
| --- | --- | --- | --- |
| Delivery address | `POST …/delivery_address` | `{"addressId": 12}` | The cart, postage requoted |
| Invoice address | `POST …/invoice_address` | `{"addressId": 12}` | The cart |
| Carrier | `POST …/delivery_module` | `{"deliveryModuleId": 3}` | The cart, with the postage that carrier quoted |
| Payment method | `POST …/payment_module` | `{"paymentModuleId": 5}` | The cart |
| Verdict | `GET …/validation` | — | `{ready, violations}` |
| Placement | `POST …/place` | Optional, the consent answers | The order, and what is left for the front to do |

Every one of them is guarded twice. The firewall answers first — `/api/front/account` is
`ROLE_CUSTOMER`, so an anonymous caller never reaches the code — and each operation states the
rule again rather than relying on a path prefix staying what it is. The second barrier is
ownership, and it lives in the processors: **a cart that is not the caller's is answered exactly
as a cart that does not exist**, status and body, word for word. Telling them apart would turn
the endpoints into a way of counting the carts of the shop.

## End to end

The walkthrough below starts from a cart that already holds its lines. See the
[endpoints reference](./endpoints/index.md) for the cart operations, and
[Authentication](./authentication.md) for the login.

```bash
BASE=https://shop.example.com

# 1. Sign in. The answer carries the JWT and an opaque refresh token.
TOKEN=$(curl -s -X POST "$BASE/api/front/login" \
  -H 'Content-Type: application/json' \
  -d '{"username": "customer@example.com", "password": "customer-password"}' \
  | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

AUTH="Authorization: Bearer $TOKEN"
JSON='Content-Type: application/json'
CART=886

# 2. The four choices, each answered with the cart as the shop now prices it.
curl -s -X POST "$BASE/api/front/account/checkout/$CART/delivery_address" \
  -H "$AUTH" -H "$JSON" -d '{"addressId": 12}'

curl -s -X POST "$BASE/api/front/account/checkout/$CART/invoice_address" \
  -H "$AUTH" -H "$JSON" -d '{"addressId": 12}'

curl -s -X POST "$BASE/api/front/account/checkout/$CART/delivery_module" \
  -H "$AUTH" -H "$JSON" -d '{"deliveryModuleId": 3}'

curl -s -X POST "$BASE/api/front/account/checkout/$CART/payment_module" \
  -H "$AUTH" -H "$JSON" -d '{"paymentModuleId": 5}'

# 3. What is left to settle, all of it at once.
curl -s "$BASE/api/front/account/checkout/$CART/validation" -H "$AUTH"

# 4. Place the order, answering the consents the shop asks for.
curl -s -X POST "$BASE/api/front/account/checkout/$CART/place" \
  -H "$AUTH" -H "$JSON" \
  -d '{"consents": [{"code": "terms_and_conditions", "accepted": true}]}'

# 5. The order, read back at any time.
curl -s "$BASE/api/front/account/orders/42" -H "$AUTH"
```

## The four choices

The carriers the shop would offer are at `GET /api/front/delivery_modules`, the payment methods
at `GET /api/front/payment/modules`. Each selection takes one identifier:

```http
POST /api/front/account/checkout/886/delivery_module
Authorization: Bearer <customer JWT>
Content-Type: application/json

{
    "deliveryModuleId": 3
}
```

The answer is the cart, with the amounts the shop computed:

```json
{
    "id": 886,
    "postage": 7.5,
    "postageTax": 1.5,
    "discount": 0,
    "totalWithoutTax": 100.0,
    "taxes": 20.0,
    "total": 127.5,
    "virtual": false
}
```

The postage travels with every answer from the moment it is known, so a front rendering a
checkout never has to ask for the cart again after a choice.

Two things are worth knowing when a client replays a whole checkout rather than posting the step
a buyer just filled in:

- **Posting a choice the cart already holds costs nothing.** The selection is short-circuited, so
  the carriers are not asked for a price again.
- **An address is compared by its content, not by its id.** The cart holds a frozen copy of the
  address, and an account that corrected its postcode gets the copy rewritten and the postage
  requoted, under the very same `addressId`.

## The verdict

`GET …/validation` reports every remaining refusal at once, in the order of the tunnel, so a
client submitting a whole checkout has a form to correct rather than one round trip per field.
Reading it changes nothing.

```json
{
    "ready": false,
    "violations": [
        {
            "stepCode": "delivery",
            "code": "delivery-invalid",
            "message": "Please select a delivery method.",
            "details": []
        }
    ]
}
```

`stepCode` is the `checkout_step` code of the step that refused — `cart`, `delivery`, `payment`
or one a module shipped — so a client can send the buyer back to the right screen. `message` is
written for the buyer and already translated; it gets reworded, and a shop may replace it
altogether. `code` is what a client branches on.

### Violation codes

The values are part of the published contract: they are kebab-case, they never change, and a new
family gets a new case rather than a new meaning for an old one.

| `code` | Usual `stepCode` | Meaning |
| --- | --- | --- |
| `cart-empty` | `cart` | Nothing to order. |
| `address-missing` | `delivery`, `payment` | No delivery or invoice address on the cart, or the one it names is gone. |
| `delivery-invalid` | `delivery` | No carrier chosen, or the one chosen does not serve this address or will not take this cart. |
| `invoice-address-incomplete` | `payment` | The billing address names a company without the legal identifiers an invoice needs. |
| `payment-invalid` | `payment` | No payment method chosen, or the one chosen will not take this cart. |
| `consent-missing` | `payment` | A mandatory consent is unanswered. `details.consentCode` and `details.consentTitle` name it. |
| `consent-unknown` | `payment` | The placement answered a consent the shop is not asking for. `details.consentCode` names it. |
| `guest-checkout-not-allowed` | — | The shop no longer allows this cart to be ordered without an account. Over this API it is answered as a `403`, never as an entry of the list. |
| `checkout-refused` | any | A refusal that names no family of its own: a step shipped by a module, or a core refusal a later version has not given a code to yet. |

A module raising its own refusal answers its own string — prefix it with the module code — and
`checkout-refused` is what a refusal that says nothing more comes back as.

:::note The verdict never sees the consents
`GET …/validation` takes no body, so a shop asking for a mandatory consent — which is how a shop
is installed — is reported as `consent-missing` right up to the placement that carries the
answer. Treat it as the list of boxes to show, not as a refusal to correct before posting.
:::

A cart with nothing to ship is reported as still missing its delivery and is placed all the same:
the placement settles the carrier such an order cannot be written without, and the verdict, which
writes nothing, does not.

## Placing the order

Everything the order is built from was settled by the operations above, except the consents.
There is nowhere to leave an answer between two requests — the shop keeps no record of what a
cart abandoned at the payment step agreed to, and the API firewall is stateless — so the request
that writes the order is the one that carries them.

```http
POST /api/front/account/checkout/886/place
Authorization: Bearer <customer JWT>
Content-Type: application/json

{
    "consents": [
        {"code": "terms_and_conditions", "accepted": true},
        {"code": "newsletter", "accepted": false}
    ]
}
```

The body is optional: leave it out entirely on a shop that asks for no consent.

```json
{
    "orderId": 42,
    "orderReference": "ORD123456",
    "orderStatusCode": "not_paid",
    "paid": false,
    "alreadyPlaced": false,
    "paymentAction": {"type": "none", "url": null, "html": null}
}
```

`orderStatusCode` is one of `not_paid`, `paid`, `processing`, `sent`, `canceled` or `refunded`,
read back off the order row after the payment module was called.

### Consents

Each answer carries a non-empty `code` and a boolean `accepted`. A mandatory consent left out of
the body, or answered `false`, refuses the placement with `consent-missing` naming it; a code the
shop is not asking for is refused with `consent-unknown`; an optional one is recorded exactly as
given, refusal included. What is recorded is frozen onto the order — the wording the answer was
given under, the moment it was given, the address it came from — exactly as a theme freezes it.

A body that does not say what a consent answer says is refused with the standard error payload
rather than a violation list: a missing `code`, an `accepted` that is not a boolean, the same
consent answered twice, or `consents` that is not a list.

### Idempotence

**A cart that already has an order gets that order back with `alreadyPlaced: true`**, so a
retried request — a double click, a client that lost the answer — never writes a second order and
never charges the buyer twice.

On such an answer the payment is not raised again and `paymentAction` is always
`{"type": "none", "url": null, "html": null}`, whatever the first call answered. Calling a payment
module a second time is how a buyer ends up with two authorisations, and the shop has no way to
replay the redirection the first call produced. What the order is waiting for is in `paid` and
`orderStatusCode`; the rest is at `GET /api/front/account/orders/{id}`.

A front that lost the answer to a placement therefore reads the order rather than expecting the
payment step again, and a buyer who never reached the gateway has to be sent back through it by
the shop, not by this endpoint.

### `paymentAction`

The three fields always travel, `null` included, so a client reading `url` on a redirection never
has to tell a missing key from a key that is not there yet.

| `type` | What the front does |
| --- | --- |
| `none` | Nothing. The payment was settled on the spot, or it happens off the web — a cheque is posted, a transfer is made at a bank. |
| `redirect` | Send the buyer to `url`. |
| `form` | Render `html`, typically the self-posting form a gateway requires. |

:::caution `html` is third-party markup
`paymentAction.html` is raw HTML written by the payment module, passed on exactly as the module
wrote it, unescaped and unrewritten. Render it only when `type` is `form`, and only on the page
that hands the buyer over to the gateway. Injected into any other screen it is a script the shop
asked a third party to run.
:::

## Errors

| Status | When |
| --- | --- |
| `401` | No token, or a token the firewall will not take. |
| `403` | The shop no longer allows this cart to be ordered without an account. |
| `404` | No such cart, no such address — and the same answer, word for word, for a cart or an address of another account. |
| `409` | Another request is placing this very cart, or the shop no longer holds what the cart asks for. The shortage names the product reference. Both are worth retrying. |
| `422` | On a selection: the identifier names nothing the checkout can take — no such activated module, or none given. On a placement: the cart still has something to settle, a mandatory consent included, and the body is the one the verdict answers with. |
| `400` | The body is not JSON, or is a JSON array where an object is expected. |

Nothing else that goes wrong while placing is answered with a 409. Every other failure inside the
placement — a module that answered nothing, a third-party module raising its own — is a defect of
the shop: it stays a 500 with no message, rather than telling a client to retry something that
will never work.

A refused placement answers in the very shape the verdict answers in, so a client has one payload
to read and one list of codes to branch on, whether it asked before placing or found out while
placing.

## See also

- [Checkout](../features/checkout.md) — the tunnel itself, its steps and its consents
- [Authentication](./authentication.md) — the JWT and its refresh
- [Rate Limiting](./rate-limiting.md) — the ceilings the API applies
