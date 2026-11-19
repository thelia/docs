---
title: Charging a stored method off session
sidebar_position: 9.5
---

# Charging a stored method off session

Added in Thelia 3.4.

A [subscription](../features/subscriptions.md) bills its installments without the customer. The shop
places the order of each installment, then asks the payment module to charge a payment method the
customer stored earlier. This page is for the author of a payment module that wants to be asked.

No module of the core does it yet. A shop can only sell subscriptions with a module that implements
`Thelia\Module\RecurringPaymentModuleInterface`.

## The contract

The interface extends `PaymentModuleWithStoredMethodsInterface`, so a module that does this already stores
methods with `CustomerPaymentMethodService::register()`, pays with them (`payWithStoredMethod()`) and
forgets them (`forgetStoredMethod()`). It adds two methods:

```php
public function supportsRecurringCharges(): bool;

public function chargeOffSession(Order $order, CustomerPaymentMethod $method, string $idempotencyKey): RecurringChargeResult;
```

- `supportsRecurringCharges()` tells whether the module can charge right now. It may depend on its
  configuration or on the provider account. While it answers `false`, the module is not offered for a
  cart that holds a subscription, and an installment due to it is declined.
- `chargeOffSession()` charges the total of the order to the stored method. The shop calls it outside any
  request and outside any database transaction, once per attempt.

## The four outcomes

The answer is a `Thelia\Domain\Subscription\RecurringChargeResult`, built with one of four factories:

| Factory | Say it when | What the shop does |
| --- | --- | --- |
| `paid($transactionRef)` | The provider took the money. | Turns the order paid, moves the subscription to its next period. |
| `declined($reason)` | The provider refused: insufficient funds, card expired or blocked. | Counts a failed attempt and tries again later. After the last attempt, suspends the subscription. |
| `actionRequired($reason)` | The issuer asks the customer to authenticate. | Treated as a decline. The customer is told by e-mail to act. |
| `retryable($reason)` | The provider could not be reached, or answered an error. | Tries again an hour later. Does not count as a failed attempt. |

The reason is for the merchant and the logs. It is never a token and never a card number.

## An example

The reference implementation used by the tests of the core is
`tests/Support/Payment/RecurringTestPaymentModule.php`. This one talks to a provider through a client of
its own (`MyProviderClient` is a placeholder for the SDK of the provider):

```php
<?php

declare(strict_types=1);

namespace MyPayment;

use Symfony\Component\HttpFoundation\Response;
use Thelia\Core\Event\Order\OrderEvent;
use Thelia\Core\Event\TheliaEvents;
use Thelia\Domain\Subscription\RecurringChargeResult;
use Thelia\Model\CustomerPaymentMethod;
use Thelia\Model\Order;
use Thelia\Model\OrderStatusQuery;
use Thelia\Module\AbstractPaymentModule;
use Thelia\Module\RecurringPaymentModuleInterface;

final class MyPayment extends AbstractPaymentModule implements RecurringPaymentModuleInterface
{
    public function supportsRecurringCharges(): bool
    {
        // The account of the shop at the provider can charge without the customer.
        return $this->client()->isConfigured() && $this->client()->allowsOffSessionCharges();
    }

    public function chargeOffSession(Order $order, CustomerPaymentMethod $method, string $idempotencyKey): RecurringChargeResult
    {
        try {
            $payment = $this->client()->charge(
                token: $method->getToken(),
                amount: $order->getTotalAmount(),
                currency: $order->getCurrency()->getCode(),
                orderRef: $order->getRef(),
                idempotencyKey: $idempotencyKey,
            );
        } catch (ProviderUnreachableException $exception) {
            // Timeout, network error, provider outage: nothing is known, so nothing is declined.
            return RecurringChargeResult::retryable('The provider did not answer.');
        }

        return match ($payment->status) {
            'succeeded' => RecurringChargeResult::paid($payment->id),
            'authentication_required' => RecurringChargeResult::actionRequired('The issuer asks for an authentication.'),
            'declined' => RecurringChargeResult::declined($payment->declineCode),
            // An error code the module does not know is not a refusal: try again.
            default => RecurringChargeResult::retryable('Unexpected answer from the provider.'),
        };
    }

    // The checkout payment of the first order. A trial costs nothing: see "The trial order" below.
    public function pay(Order $order): ?Response
    {
        if (0.0 === round($order->getTotalAmount(), 4)) {
            $this->registerTheMethodAtZero($order);

            $event = (new OrderEvent($order))->setStatus((int) OrderStatusQuery::getPaidStatus()->getId());
            $this->getDispatcher()->dispatch($event, TheliaEvents::ORDER_UPDATE_STATUS);

            return null;
        }

        return $this->redirectToTheProvider($order);
    }

    // supportsStoredMethods(), payWithStoredMethod(), forgetStoredMethod(), isValidPayment() and the
    // rest are those of any module that stores methods.
}
```

## The idempotency key

The shop passes the same key for every attempt of the same installment. It has the form
`subscription-<subscription id>-<installment number>`.

Pass it to the provider when it accepts one, as the idempotency header of its charge request. A charge
that timed out and is tried again an hour later is then recognised by the provider and taken once. Do not
build a key of your own from the time or from a random value: it would change at each attempt and defeat
the purpose.

A provider keeps an idempotency key for a limited time. The shop can try a declined installment again
after days. If your provider forgets keys sooner, look for a payment already made for the order reference
before you charge again.

## The trial order

A plan can offer a trial. The first order of the subscription is then at zero, and nothing is charged. It
must still leave a stored method behind, or the first real charge fails.

So the module does, in `pay()`, for an order whose total is zero:

1. collects the method from the customer at the provider, without an amount;
2. registers it with `CustomerPaymentMethodService::register()` at an amount of zero;
3. turns the order paid itself, through `ORDER_UPDATE_STATUS`, as `FreeOrder` does. No notification
   from the provider will follow, so nobody else will.

The method used for the installments is the one the customer chose in the cart. Failing that, it is the
most recent method of the customer that the module registered since the order was placed. Failing
that, there is none and the first charge is declined until the customer gives one.

## What a module must never do

- Change the status of the order of an installment. The shop moves the order and the subscription from
  your answer.
- Send anything to a browser. There is no browser: no redirect, no 3-D Secure page, no cookie. When the
  bank wants the customer, answer `actionRequired()`.
- Throw. A module that cannot reach its provider answers `retryable()`. An exception that escapes is
  logged without its message and handled as `retryable()`, so you lose the reason.
- Put a token, a card number or a provider message that may quote one in the reason of a result.
- Charge another amount than the total of the order.
- Charge twice for one installment: pass the idempotency key.
- Open a database transaction around the call, or depend on one. The call is made outside any.

## Testing

`tests/Support/Payment/RecurringTestPaymentModule.php` answers the outcome a test chooses and records
every charge with its idempotency key. A module tests its own answers the same way: one test per outcome,
and one that calls `chargeOffSession()` twice with the same key and asserts the provider saw the same key
both times.
