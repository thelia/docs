---
title: Order Returns
sidebar_position: 4
---

# Order Returns

Added in Thelia 3.1.

A customer can ask to return what they ordered, and the shop follows the request through to the
refund. The feature covers the request, the review, the reception of the parcel, the restocking
and the paperwork.

## Turning it on

Returns ship switched off. Two settings drive them:

| Setting | Default | Meaning |
| --- | --- | --- |
| `order_return_enabled` | `0` | `1` turns returns on. |
| `order_return_window_days` | `14` | How long after the order a return can be asked for. |
| `order_return_restock_mode` | `resellable` | What reception puts back in stock: `auto` (every received line), `resellable` (only the lines marked resellable) or `never`. |

While the feature is off, the whole API surface of returns answers 404 rather than 403, so an
integration cannot tell a disabled feature from a missing resource.

## What the customer does

A customer opens a request from their account, on an order that is paid and still inside the
return window. The request carries the lines to send back, a reason chosen from a list the
merchant manages, and an optional comment.

Eligibility is checked line by line: the quantity asked for cannot exceed what was ordered minus
what previous requests already hold, and a virtual product is never returnable. The postage can
be included in one request only.

A customer can open at most twenty return requests an hour, through the
`order_return_request_per_client` rate limiter.

Each request gets a reference of its own, `RET` followed by a gapless twelve-digit number, and a
PDF document rendered in the language of the order rather than of the administrator.

## The state machine

A return moves through seven statuses, and the graph is fixed:

| From | To |
| --- | --- |
| `requested` | `refused`, `accepted`, `info_awaited` |
| `info_awaited` | `requested` |
| `accepted` | `received`, `expired` |
| `received` | `settled` |
| `refused`, `settled`, `expired` | Terminal. |

A merchant can add a status of their own, which follows the graph of the canonical status it
stands for, through its `equivalent_code`.

Every status change mails the customer, from the `order_return_status_changed` message, with the
return reference, the order reference, the new status code and, when there is one, the reason
for the refusal.

## What the merchant does

The back office lists the requests at `/admin/returns` and opens one at
`/admin/return/{order_return_id}`, where a status change, a reception and the refund amount are
handled. The list of reasons is managed at `/admin/configuration/order-return-reason`.

Receiving a parcel is a screen of its own: quantity received per line, the condition it came back
in, and whether it can be resold. That last answer is what the `resellable` restock mode reads
before putting anything back in stock. The stock is incremented atomically, in the same
transaction as the reception.

The refund amount is computed from the order rather than typed: the taxed unit price of each
line, times the quantity (requested, or received once the parcel arrived), plus the postage and
its tax when the request includes it, with the order discount pro-rated over the lines.

## API

The resources are read and written like any other, admin side and customer side:

| Resource | Admin | Front (customer account) |
| --- | --- | --- |
| Returns | `/api/admin/order_returns`, `/api/admin/order_returns/{id}` | `/api/front/account/order_returns`, `/api/front/account/order_returns/{id}` |
| Lines | `/api/admin/order_return_lines`, `/api/admin/order_return_lines/{id}` | |
| Reasons | `/api/admin/order_return_reasons`, `/api/admin/order_return_reasons/{id}` | `/api/front/account/order_return_reasons` |
| Statuses | `/api/admin/order_return_statutes`, `/api/admin/order_return_statutes/code/{code}` | `/api/front/account/order_return_statutes` |

A status change goes through a dedicated operation rather than a plain write:

```http
POST /api/admin/order_returns/{id}/transition
```

## Personal data

Returns are part of what the shop knows about a customer. The export carries the reference, the
order reference, the status, the reason, the comment, the refund amount and the lines.
Anonymization clears the free text, the customer comment and the refusal reason, and deletes the
version history that would otherwise still hold it, while keeping the return and its lines, which
are an accounting record. See [Personal data](../security/personal-data.md).

## For developers

| Piece | Where |
| --- | --- |
| Statuses and their canonical codes | `Thelia\Model\OrderReturnStatus` |
| The transition graph | `Thelia\Domain\OrderReturn\OrderReturnStateMachine` |
| Eligibility, window, remaining quantity, postage | `Thelia\Domain\OrderReturn\Service\ReturnEligibilityChecker` |
| Refund computation | `Thelia\Domain\OrderReturn\Service\RefundAmountCalculator` |
| Restocking | `Thelia\Domain\OrderReturn\Service\StockIncrementer` |
| Reference generation | `OrderReturnRefGeneratorInterface`, default `SequenceOrderReturnRefGenerator` |
| The PDF | `Thelia\Domain\OrderReturn\Service\OrderReturnPdfService`, template `order_return` |
| The feature switch on the API | `Thelia\Api\EventListener\OrderReturnFeatureListener` |

A shop that numbers its returns its own way replaces `OrderReturnRefGeneratorInterface` with a
service of its own. The reference is drawn inside the write transaction, from a gapless sequence,
so two concurrent requests never share a number.
