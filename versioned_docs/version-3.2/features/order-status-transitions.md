---
title: Order Status Transitions
sidebar_position: 5
---

# Order Status Transitions

Added in Thelia 3.1.

An order status used to be free: any status could follow any other, and what happened when an
order changed status was hard-wired in the core listeners. A merchant now declares, status by
status, which statuses an order may move to, and what runs when an order enters a status or takes
a given transition.

## Declaring the graph

A transition is a row in `order_status_transition`, a pair of statuses: from, to. The pair is
unique, and both ends point at a real status.

A status with no declared transition stays free. Nothing is forbidden until something is
allowed, so a fresh install and a shop updating from 3.0 behave exactly as they did: the graph
is empty, and every move is permitted.

A custom status follows the graph of the canonical status it stands for, through its
`order_status.equivalent_code`, so a shop that renamed or duplicated a status does not have to
redeclare its transitions.

The guard sits in the core order listener, on the `ORDER_UPDATE_STATUS` event, which is where
every entry point lands: the back office, the admin API, a payment module returning from its
provider and a console command are all held to the same graph. A refused move raises
`OrderStatusTransitionRefusedException`.

Forcing a refused transition is a right of its own, `admin.order.status-force`, and the forced
move is traced in the admin log.

## Declaring what runs

An action is a row in `order_status_action`. It names:

- a trigger: `enter` (the order entered that status) or `transition` (the order took that exact
  from-to move);
- the statuses it watches, `from_status_id` and `to_status_id`;
- an action type, its `payload`, its `position` in the run order, and whether it is `active`.

Five action types ship with the release:

| Action type | Effect |
| --- | --- |
| `send_customer_email` | Mails the customer. |
| `send_shop_managers_email` | Mails the shop managers. |
| `adjust_stock` | Moves the stock. |
| `allocate_invoice_ref` | Allocates the invoice number. |
| `release_coupons` | Releases the coupons the order held. |

Four rows are seeded, all inactive, next to the core listeners that already do the same work:
`allocate_invoice_ref` on entering *paid*, and `release_coupons` on entering *not paid*,
*canceled* and *refunded*. The other action types ship as available services with no row: a
merchant configures them when the shop needs them.

A failing action is journalled, in the log and in the `order_status_action_failure` table, and
skipped. The status change is not undone and the following actions still run, so one broken
mail server cannot leave an order stuck between two statuses.

## Configuring it

The transitions and the actions of a status are edited from the order status screen, at
`/admin/configuration/order-status/update/{order_status_id}`, reached from Configuration > Order
path > Order status.

## For developers

| Piece | Where |
| --- | --- |
| The graph | `Thelia\Domain\Order\Service\OrderStatusTransitionGraph` and its provider |
| The guard | `Thelia\Domain\Order\Service\OrderStatusTransitionGuard` |
| The trigger kinds | `Thelia\Domain\Order\Enum\OrderStatusActionTrigger` |
| The action contract | `Thelia\Domain\Order\StatusAction\OrderStatusActionInterface` |
| The runner | `Thelia\Domain\Order\StatusAction\OrderStatusActionRunner` |

### Shipping an action from a module

Implement `OrderStatusActionInterface` and let autoconfiguration tag the service
`thelia.order_status_action`. The `getType()` return value is the identifier a row stores in
`order_status_action.action_type`, so it has to be stable:

```php
use Thelia\Domain\Order\StatusAction\OrderStatusActionInterface;

final readonly class NotifyWarehouseAction implements OrderStatusActionInterface
{
    public function getType(): string
    {
        return 'notify_warehouse';
    }

    // ...
}
```

The runner catches whatever the action throws. A domain exception meant to be read by a
merchant keeps its message; anything else is logged server-side and stored as a generic message
naming only the exception class, so a transport credential in an exception message never reaches
a screen.

`OrderEvent` carries two additions for this: `getPreviousStatusId()`, which tells a listener
where the order came from, and `isStatusTransitionForced()`, which tells it the move bypassed the
graph.
