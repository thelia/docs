---
title: Order History
sidebar_position: 6
---

# Order History

Added in Thelia 3.2.

Every gesture that touches an order is written to a journal the moment it happens, with a
timestamp and an author. The back-office order sheet shows that journal as a timeline, and the
merchant can add notes to it. A note can be made visible to the customer, who then reads it on
their own order page.

## On the order sheet

The History card of the order sheet lists one line per event, with an icon, a translated summary
and the author in clear. The timeline is paginated, ten lines per page. The card is hidden for an
administrator without read access on orders.

The journal records:

| Event | Line |
| --- | --- |
| Order created | "Order … created". |
| Status changed | "Status changed from … to …". A change the status transition graph refuses leaves no line. |
| Address updated | Which address, delivery or invoice, was edited. |
| Tracking reference | Set, changed or cleared. |
| Transaction reference | Set, changed or cleared. |
| Invoice reference | "Invoice reference … allocated", whichever path numbered the invoice. |
| E-mail sent | That a message was sent to the customer, by its message code only, never its body or address. |
| Note | A note written by the merchant. |
| Return opened, status changed, received | The gestures of a [product return](../features/order-returns.md), so the whole history of the order is in one place. |

A line whose type the theme cannot phrase, such as one written by a module, shows a generic icon
and its raw code instead of breaking the sheet.

### Who did it

| Context | Author shown |
| --- | --- |
| An administrator signed in the back office | The administrator's login. |
| A payment module answering, even inside the customer's session | The module code. |
| The customer placing the order on the front | The customer reference, never the e-mail. |
| A console command, a worker or a cron | System. |

The author is kept as a label. It survives the deletion of the administrator.

### Merchant notes

A note is added from the card, with an optional "Visible to the customer" box. A note is limited
to 2000 characters and cannot be empty.

An administrator can edit their own notes in place, and only theirs. The rule is checked on the
server, on the administrator's id rather than on the label. Notes can no longer be edited once
the order is canceled or refunded: nothing is being worked on any more. A note whose author has been deleted belongs to nobody and cannot be edited.

A note visible to the customer carries a "Visible to the customer" badge in the timeline.

## What the customer sees

A note flagged as visible appears on the order page of the customer account, in a "Messages from
the shop" block above the order details. Each message shows its date and its text, with the line
breaks the merchant typed. The block is not displayed when there is no message to show.

Only notes written by the merchant and flagged visible reach the customer. Nothing else of the
journal does: not the other events, not the internal notes, not the author. A guest reading the
order through the tracking link sees the same messages.

## Orders placed before the history

The update script rebuilds the past status changes of existing orders from the order versions.
Each change of status becomes a line dated from the version and authored by the system, since
versioning never recorded a business author. Address or reference edits and deleted statuses are
ignored, and the script is replayable. The invoice numbering left no version, so its past cannot
be recovered.

## Return window

The return window is now counted from the day the order was last moved to the `sent` status in
its history, not from its creation. An order sent again after coming back starts a new window. An
order with no such line, placed before the history existed or not yet sent, falls back to its
creation date, so no window opens or closes because of the upgrade.

## Retention and personal data

- The personal-data export of a customer ships each order with its full history, internal notes
  included and the administrator id left out.
- Anonymizing a customer blanks the author label on their lines.
- Deleting an order deletes its lines.
- `maintenance:purge` prunes the journal, honoring `--dry-run`, driven by the
  `purification_order_history_days` setting. It is `0` by default, which disables the purge:
  only the shop knows its audit obligations.

## For developers

### The `order_history` table

Added by `setup/update/sql/3.2.0.sql`.

| Column | Meaning |
| --- | --- |
| `id` | Primary key. |
| `order_id` | The order, foreign key with `ON DELETE CASCADE`, indexed. |
| `event_type` | A plain code (`VARCHAR(50)`). The core writes the types of `OrderHistoryEventType`, a module can write its own. |
| `actor_type` | `admin`, `customer`, `module` or `system`. |
| `actor_label` | Snapshot of the author: login, customer reference or module code. |
| `admin_id` | The administrator, foreign key with `ON DELETE SET NULL`. |
| `payload` | JSON, codes and references only, never personal data. |
| `comment` | Free text, the whole content of a note. |
| `visible_to_customer` | Notes only, default `0`. |
| `created_at` | Indexed. |

The core writes these types: `order_created`, `status_changed`, `address_updated`,
`delivery_ref_updated`, `transaction_ref_updated`, `invoice_ref_allocated`, `email_sent`, `note`,
`return_opened`, `return_status_changed` and `return_received`.

### Writing to the journal

`Thelia\Domain\Order\Service\OrderHistoryRecorder` is the single write path. Besides the generic
`record()`, it has one method per core event (`recordStatusChanged()`, `recordEmailSent()`,
`recordNote()` and so on). A module calls it to add its own lines:

```php
$orderHistoryRecorder->record(
    orderId: $order->getId(),
    eventType: 'my_module.label_printed',
    payload: ['label' => $reference],
    moduleCode: 'MyModule',
);
```

The recorder:

- resolves the author once: the administrator in session, then the module named by the dispatch,
  then the customer in session, then the system;
- drops an automatic event identical to the latest line of its kind on the same order, because
  payment providers notify twice and browsers reload. The check and the write run inside a named
  database lock, one per order and event type, held for one second at most. On a database other
  than MySQL or MariaDB the guarantee is best-effort. A note is never deduplicated;
- never throws. A journal that cannot be written is logged, so a payment notification or a status
  change never fails on its own audit trail.

The listeners that feed the journal are `RecordOrderHistoryListener` (order creation, payment,
status, delivery and transaction references, address) and `RecordOrderReturnHistoryListener`.
Invoice numbering is recorded where the reference is allocated, by the automatic path
(`invoice_ref_auto`) and by the `allocate_invoice_ref` status action. `MailerFactory` records
`email_sent` when the message parameters carry `order_id` or `order_ref`.

A payment module that dispatches an `OrderEvent` should name itself with
`OrderEvent::setSourceModuleCode()`, so the line is authored by the module. The base payment
module controller does it for `confirmPayment()`, `cancelPayment()` and `saveTransactionRef()`.

### API

`GET /api/admin/orders/{orderId}/history` returns the whole journal of one order, internal notes
included, newest first, 20 lines per page (`itemsPerPage` up to the ceiling every collection
shares). An unknown order answers 404. The permission is the one that guards reading the order
(`admin.order`, view).

A line carries `id`, `eventType`, `actorType`, `actorLabel`, `adminId`, `payload` (decoded),
`comment`, `visibleToCustomer` and `createdAt`; null fields are left out.

The journal has no front resource. The customer notes travel as `customerNotes` on
`GET /api/front/account/orders/{id}`, added by `OrderCustomerNotesAddon`: strictly the entries
that are notes and flagged visible, with their date and text only.

### Back-office routes

Notes are posted by two routes of the `default-twig` theme, both protected by a CSRF token:

| Route | Path |
| --- | --- |
| `admin.order.history.note.add` | `POST /admin/order/{order_id}/history/note` |
| `admin.order.history.note.edit` | `POST /admin/order/{order_id}/history/note/{history_id}` |

### Front-office component

The Flexy component `Organisms:OrderNotes:Block` renders the messages. It checks the ownership of
the order itself and renders nothing when no message is visible.
