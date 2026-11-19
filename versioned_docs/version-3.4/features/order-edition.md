---
title: Order Edition
sidebar_position: 15
---

# Order Edition

Added in Thelia 3.4.

A merchant can change an order after it was placed. The lines can be resized, repriced, removed
or added, and the discount and the postage can be changed. The taxes are computed again, the
stock follows the lines, the change is written in the order history, and the customer can be told
by e-mail.

An edit is applied whole or not at all.

## When an order can be edited

The order sheet of the back office shows an **Edit order** button. When the order cannot be
edited, a short line says why instead. An order can be edited when all of this holds:

- Its status is editable. The setting `order_editable_status_codes` lists the status codes,
  comma separated. The default is `not_paid,paid,processing`. A shop can add or remove codes.
- It has no invoice number. Once an invoice number was allocated, whoever allocated it
  (automatic numbering, a status action or an invoicing module), the order is no longer edited.
  Changing what was sold then needs a credit note.
- The administrator holds the right `admin.order.edit`. It is separate from the right to
  update orders. It is granted profile by profile, and existing profiles do not have it until it
  is granted.

A line cannot be changed when it is a service line (gift wrapping), a bundle or one of its
components, or when it is already in a shipment or a return. An order always keeps at least one
product.

## What an edit does

The edit panel lists the lines with their quantity and their unit price excluding tax. Each line
has a field for each, and a checkbox to remove it. The panel also has a search field to add a
product by title or reference, the discount, and the postage. Nothing is written until the
merchant saves. While the merchant types, the panel shows the totals before and after the edit.

- A line added takes the title and the price of the catalogue at that moment, in the currency
  of the order and with the discount of the customer. A price typed for it replaces the catalogue
  price. At most 50 products can be added at once.
- A price typed on an existing line replaces the price the line was written with. The line is
  then treated as a promotional line, so totals, invoices, exports and refunds all use the new
  price. A price of zero is allowed: it makes a free line.
- The taxes of a changed line are computed again for the delivery country of the order. When
  the invoice address was frozen as VAT exempt, no tax is added, and the exempted VAT amount of
  the order moves by the difference.
- The discount typed replaces the discount of the order. It is entered with tax and cannot
  be higher than the total of the goods: the postage does not absorb it.
- The postage is left alone unless the merchant types a new amount, excluding tax. The
  delivery module of the order then taxes it again for the delivery country.
- The stock moves by the difference only, as a change of status would. An order that holds
  its stock gives back or takes again the units that changed.
- A quantity must be above zero and at most 9,999,999. A price cannot be negative or have more
  than six decimals.

If the order changed between the moment the screen was opened and the save, the save is refused
instead of overwriting that change.

An edit does not refund or charge anything. The merchant settles the difference with the customer
through the payment module or by hand.

### Why an edit is refused

The service answers with an `OrderEditRefusedException`. Its `refusal` property is a case of
`Thelia\Domain\Order\Enum\OrderEditRefusal`:

| Refusal | Meaning |
| --- | --- |
| `status_not_editable` | The status is not in `order_editable_status_codes`. |
| `invoice_issued` | The order carries an invoice number. |
| `nothing_to_edit` | The edit moves nothing. Values equal to the stored ones are ignored. |
| `last_line` | The edit would remove the last line. |
| `unknown_line`, `unknown_product` | A line or a sale element does not exist, or is offline. |
| `service_line`, `bundle_line` | The line is a service, a bundle or a bundle component. |
| `line_in_use` | The line is already in a shipment or a return. |
| `invalid_quantity`, `invalid_price`, `invalid_discount`, `invalid_postage` | A figure is out of range, or the discount is above the goods. |
| `postage_tax_unknown` | The delivery module cannot quote the tax of the new postage. |
| `stale_state` | The order changed since the edit was computed. |

## Telling the customer

An edit sends no e-mail by default. An order status can carry automatic actions, and they have a
third trigger, **When an order in this status is edited (e-mail only)**. An action set on it runs
once an edit of an order in that status is committed. Only e-mail actions run on this trigger.
The message you pick receives the variable `order_edit`, which lists what changed (`added`,
`removed`, `quantities`, `prices`, `discount`, `postage`), as written in the order history.

Core ships no message for it: write the message you want in the e-mail templates, then select it
in the action. See [Order Status Transitions](./order-status-transitions.md).

## For developers

| Need | Where |
| --- | --- |
| Apply an edit | `Thelia\Domain\Order\Service\OrderEditor::edit(Order $order, OrderEdit $edit): void` |
| Preview an edit | `OrderEditor::simulate(Order $order, OrderEdit $edit): OrderEditPreview` |
| Read the state an edit was computed on | `OrderEditor::stateOf(Order $order): string`, passed back as `OrderEdit::$expectedState` |
| Describe an edit | `Thelia\Domain\Order\DTO\OrderEdit` and `AddedOrderLine` (sale element id, quantity, optional unit price) |
| React to an edit | `TheliaEvents::ORDER_BEFORE_EDIT` and `ORDER_AFTER_EDIT`, with an `OrderEditEvent` |
| Which statuses are editable | `Thelia\Domain\Order\Service\EditableOrderStatuses` |

The service takes no request, so a console command can call it. It writes nothing in the
administration log: the screen or the command that calls it does.

```php
use Thelia\Domain\Order\DTO\AddedOrderLine;
use Thelia\Domain\Order\DTO\OrderEdit;

$editor->edit($order, new OrderEdit(
    addedLines: [new AddedOrderLine(productSaleElementsId: 42, quantity: 2.0)],
    quantities: [$orderProductId => 3.0],
    discount: '5.00',
));
```

`ORDER_BEFORE_EDIT` is dispatched inside the transaction: a listener that throws stops the edit.
`ORDER_AFTER_EDIT` is dispatched after the commit: a listener that fails is logged and the edit
stands. `OrderEditEvent::getSummary()` holds what changed, and is empty before the edit is
applied.

`simulate()` runs the same checks and writes as `edit()`, takes them all back, and returns the
totals before and after. It writes no history and sends neither event, so a listener that refuses
an edit refuses it at `edit()` only. It still dispatches `VIRTUAL_PRODUCT_ORDER_HANDLE`, whose
listeners must not act outside the database. It holds the row lock of the order until it ends.

A line whose price was forced keeps the price it was written with: the new price goes in
`promo_price` and the line is marked `was_in_promo`. Core readers that tell a promotional line
from a plain one use the forced price. A template that reads the raw `PRICE` fields of the
`order_product` loop without `WAS_IN_PROMO` still shows the original price.
