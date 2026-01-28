---
title: Payment Modules
sidebar_position: 9
---

# Payment Modules

Payment modules handle the checkout payment process, integrating with payment gateways, managing transactions, and handling callbacks.

## Payment Flow

1. Customer selects payment method at checkout
2. `isValidPayment()` determines if method is available
3. Customer clicks "Pay"
4. `pay()` method is called with the order
5. Customer is redirected to gateway or payment is processed
6. Gateway callback confirms payment
7. Order status is updated

## Creating a Payment Module

### Main Class

Payment modules extend `AbstractPaymentModule`:

**MyPayment.php**:
```php
<?php

declare(strict_types=1);

namespace MyPayment;

use Thelia\Model\Order;
use Thelia\Module\AbstractPaymentModule;
use Symfony\Component\HttpFoundation\Response;

final class MyPayment extends AbstractPaymentModule
{
    public const DOMAIN_NAME = 'mypayment';

    /**
     * Check if this payment method is available.
     */
    public function isValidPayment(): bool
    {
        // Check if module is configured
        if (empty($this->getApiKey())) {
            return false;
        }

        // Check cart total (e.g., minimum order)
        $orderTotal = $this->getCurrentOrderTotalAmount();
        if ($orderTotal < 1.00) {
            return false;
        }

        // Check maximum amount
        if ($orderTotal > 10000) {
            return false;
        }

        return true;
    }

    /**
     * Process the payment.
     */
    public function pay(Order $order): Response
    {
        // Option 1: Redirect to payment gateway
        return $this->redirectToGateway($order);

        // Option 2: Direct API payment
        // return $this->processDirectPayment($order);

        // Option 3: Show payment form (card details)
        // return $this->showPaymentForm($order);
    }

    /**
     * Should stock be decremented when order is created?
     * Return false to decrement only when paid.
     */
    public function manageStockOnCreation(): bool
    {
        return false; // Decrement stock when payment confirmed
    }

    private function redirectToGateway(Order $order): Response
    {
        $gatewayUrl = $this->getGatewayUrl();

        $params = [
            'merchant_id' => $this->getMerchantId(),
            'order_id' => $order->getRef(),
            'amount' => $order->getTotalAmount(),
            'currency' => $order->getCurrency()->getCode(),
            'return_url' => $this->getPaymentSuccessPageUrl($order->getId()),
            'cancel_url' => $this->getPaymentFailurePageUrl($order->getId()),
            'callback_url' => $this->getCallbackUrl(),
        ];

        // Sign the request
        $params['signature'] = $this->generateSignature($params);

        return $this->generateGatewayFormResponse($order, $gatewayUrl, $params);
    }

    private function getApiKey(): string
    {
        return \Thelia\Model\ConfigQuery::read('mypayment_api_key', '');
    }

    private function getMerchantId(): string
    {
        return \Thelia\Model\ConfigQuery::read('mypayment_merchant_id', '');
    }

    private function getGatewayUrl(): string
    {
        $testMode = \Thelia\Model\ConfigQuery::read('mypayment_test_mode', '1');
        return $testMode === '1'
            ? 'https://sandbox.payment.com/pay'
            : 'https://payment.com/pay';
    }

    private function getCallbackUrl(): string
    {
        return $this->getBaseUrl() . '/mypayment/callback';
    }

    private function generateSignature(array $params): string
    {
        $secretKey = \Thelia\Model\ConfigQuery::read('mypayment_secret_key', '');
        $data = implode('', $params);
        return hash_hmac('sha256', $data, $secretKey);
    }
}
```

### module.xml

**Config/module.xml**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<module xmlns="http://thelia.net/schema/dic/module"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://thelia.net/schema/dic/module http://thelia.net/schema/dic/module/module-2_1.xsd">
    <fullnamespace>MyPayment\MyPayment</fullnamespace>
    <descriptive locale="en_US">
        <title>My Payment Gateway</title>
        <description>Accept payments via My Payment</description>
    </descriptive>
    <version>1.0.0</version>
    <type>payment</type>
    <thelia>2.5.0</thelia>
    <stability>stable</stability>
</module>
```

## isValidPayment()

Determine when the payment method appears:

```php
public function isValidPayment(): bool
{
    // Check configuration
    if (!$this->isConfigured()) {
        return false;
    }

    // Get current cart/order info
    $orderTotal = $this->getCurrentOrderTotalAmount();
    $currency = $this->getRequest()->getSession()->getCurrency();

    // Amount limits
    if ($orderTotal < 1.00 || $orderTotal > 50000) {
        return false;
    }

    // Currency support
    $supportedCurrencies = ['EUR', 'USD', 'GBP'];
    if (!in_array($currency->getCode(), $supportedCurrencies)) {
        return false;
    }

    // Customer requirements
    $customer = $this->getSecurityContext()->getCustomerUser();
    if ($customer && $this->isCustomerBlocked($customer)) {
        return false;
    }

    // IP restrictions for testing
    if ($this->isTestMode()) {
        $allowedIps = explode(',', \Thelia\Model\ConfigQuery::read('mypayment_test_ips', ''));
        if (!in_array($this->getRequest()->getClientIp(), $allowedIps)) {
            return false;
        }
    }

    return true;
}
```

## pay() Method Patterns

### Pattern 1: Gateway Redirect

Submit form data to external gateway:

```php
public function pay(Order $order): Response
{
    $params = $this->buildGatewayParams($order);

    return $this->generateGatewayFormResponse(
        $order,
        'https://gateway.payment.com/checkout',
        $params
    );
}
```

This uses the standard `order-payment-gateway.html` template to submit the form.

### Pattern 2: Direct API Payment

Process payment directly with API:

```php
public function pay(Order $order): Response
{
    try {
        $result = $this->paymentApi->createPayment([
            'amount' => $order->getTotalAmount(),
            'currency' => $order->getCurrency()->getCode(),
            'order_ref' => $order->getRef(),
            'customer_email' => $order->getCustomer()->getEmail(),
            'card_token' => $this->getRequest()->get('card_token'),
        ]);

        if ($result['status'] === 'success') {
            // Payment successful
            $this->confirmPayment($order->getId());
            return $this->generateRedirect($this->getPaymentSuccessPageUrl($order->getId()));
        }

        // Payment failed
        return $this->generateRedirect($this->getPaymentFailurePageUrl($order->getId()));

    } catch (\Exception $e) {
        $this->getLog()->error('Payment failed: ' . $e->getMessage());
        return $this->generateRedirect($this->getPaymentFailurePageUrl($order->getId()));
    }
}
```

### Pattern 3: Hosted Payment Page

Redirect to gateway's hosted page:

```php
public function pay(Order $order): Response
{
    $session = $this->paymentApi->createCheckoutSession([
        'amount' => $order->getTotalAmount(),
        'currency' => $order->getCurrency()->getCode(),
        'order_ref' => $order->getRef(),
        'success_url' => $this->getPaymentSuccessPageUrl($order->getId()),
        'cancel_url' => $this->getPaymentFailurePageUrl($order->getId()),
    ]);

    return $this->generateRedirect($session['checkout_url']);
}
```

## Callback Handling

Process gateway notifications:

**Controller/CallbackController.php**:
```php
<?php

declare(strict_types=1);

namespace MyPayment\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Thelia\Module\BasePaymentModuleController;

final class CallbackController extends BasePaymentModuleController
{
    protected function getModuleCode(): string
    {
        return 'MyPayment';
    }

    #[Route('/mypayment/callback', name: 'mypayment.callback', methods: ['POST'])]
    public function callbackAction(Request $request): Response
    {
        // Log incoming callback
        $this->getLog()->info('Payment callback received', [
            'data' => $request->request->all(),
        ]);

        // Verify signature
        if (!$this->verifySignature($request)) {
            $this->getLog()->error('Invalid callback signature');
            return new Response('Invalid signature', 400);
        }

        // Get order
        $orderRef = $request->request->get('order_ref');
        $order = $this->getOrderByRef($orderRef);

        if (!$order) {
            $this->getLog()->error('Order not found: ' . $orderRef);
            return new Response('Order not found', 404);
        }

        // Process based on status
        $status = $request->request->get('status');

        switch ($status) {
            case 'paid':
            case 'captured':
                $this->confirmPayment($order->getId());
                $this->getLog()->info('Payment confirmed for order: ' . $orderRef);
                break;

            case 'cancelled':
            case 'failed':
                $this->cancelPayment($order->getId());
                $this->getLog()->info('Payment cancelled for order: ' . $orderRef);
                break;

            case 'refunded':
                $this->handleRefund($order, $request);
                break;

            default:
                $this->getLog()->warning('Unknown payment status: ' . $status);
        }

        // Acknowledge receipt
        return new Response('OK', 200);
    }

    private function verifySignature(Request $request): bool
    {
        $receivedSignature = $request->headers->get('X-Signature');
        $payload = $request->getContent();
        $secretKey = \Thelia\Model\ConfigQuery::read('mypayment_secret_key', '');

        $expectedSignature = hash_hmac('sha256', $payload, $secretKey);

        return hash_equals($expectedSignature, $receivedSignature);
    }

    private function getOrderByRef(string $ref): ?\Thelia\Model\Order
    {
        return \Thelia\Model\OrderQuery::create()
            ->filterByRef($ref)
            ->findOne();
    }

    private function handleRefund($order, Request $request): void
    {
        // Update order status or create refund record
        // Implementation depends on your business logic
    }
}
```

### Customer Return Pages

Handle customer returns from gateway:

```php
#[Route('/mypayment/return', name: 'mypayment.return')]
public function returnAction(Request $request): Response
{
    $orderId = $request->query->get('order_id');
    $status = $request->query->get('status');

    if ($status === 'success') {
        return $this->redirectToSuccessPage($orderId);
    }

    return $this->redirectToFailurePage($orderId);
}

#[Route('/mypayment/cancel', name: 'mypayment.cancel')]
public function cancelAction(Request $request): Response
{
    $orderId = $request->query->get('order_id');

    return $this->redirectToFailurePage($orderId);
}
```

## Stock Management

Control when stock is decremented:

```php
/**
 * Return true to decrement stock when order is created.
 * Return false to decrement when payment is confirmed.
 */
public function manageStockOnCreation(): bool
{
    // For instant payments (credit card), decrement on creation
    // For delayed payments (bank transfer), decrement when paid
    return false;
}
```

## Refunds

Handle refund requests:

```php
public function refund(Order $order, float $amount): bool
{
    try {
        $result = $this->paymentApi->createRefund([
            'payment_id' => $order->getTransactionRef(),
            'amount' => $amount,
            'reason' => 'Customer request',
        ]);

        if ($result['status'] === 'success') {
            // Log refund
            $this->logRefund($order, $amount, $result['refund_id']);
            return true;
        }

        $this->getLog()->error('Refund failed', $result);
        return false;

    } catch (\Exception $e) {
        $this->getLog()->error('Refund exception: ' . $e->getMessage());
        return false;
    }
}
```

## Logging

Use dedicated log file for debugging:

```php
// In BasePaymentModuleController
$this->getLog()->info('Payment initiated', [
    'order_ref' => $order->getRef(),
    'amount' => $order->getTotalAmount(),
]);

$this->getLog()->error('Payment failed', [
    'order_ref' => $order->getRef(),
    'error' => $errorMessage,
]);
```

Logs are stored in `log/mypayment.log`.

## Admin Configuration

**Controller/Admin/ConfigController.php**:
```php
#[Route('/admin/module/MyPayment', name: 'mypayment.admin.config')]
public function indexAction(): Response
{
    return $this->render('module-config', [
        'api_key' => ConfigQuery::read('mypayment_api_key', ''),
        'merchant_id' => ConfigQuery::read('mypayment_merchant_id', ''),
        'test_mode' => ConfigQuery::read('mypayment_test_mode', '1'),
    ]);
}

#[Route('/admin/module/MyPayment', name: 'mypayment.admin.config.save', methods: ['POST'])]
public function saveAction(): Response
{
    // Validate and save configuration
    $form = $this->createForm(ConfigurationForm::getName());

    try {
        $data = $this->validateForm($form)->getData();

        ConfigQuery::write('mypayment_api_key', $data['api_key']);
        ConfigQuery::write('mypayment_merchant_id', $data['merchant_id']);
        ConfigQuery::write('mypayment_test_mode', $data['test_mode'] ? '1' : '0');

        return $this->generateSuccessRedirect($form);
    } catch (\Exception $e) {
        $this->setupFormErrorContext('Configuration', $e->getMessage(), $form);
        return $this->render('module-config');
    }
}
```

## Security Considerations

### Signature Verification

Always verify webhook signatures:

```php
private function verifyWebhookSignature(Request $request): bool
{
    $signature = $request->headers->get('X-Webhook-Signature');
    $payload = $request->getContent();
    $timestamp = $request->headers->get('X-Webhook-Timestamp');

    // Check timestamp to prevent replay attacks
    if (abs(time() - (int) $timestamp) > 300) {
        return false;
    }

    $expectedSignature = hash_hmac(
        'sha256',
        $timestamp . '.' . $payload,
        $this->getWebhookSecret()
    );

    return hash_equals($expectedSignature, $signature);
}
```

### Secure Configuration

Store sensitive data securely:

```php
// Never log full card numbers or CVV
$this->getLog()->info('Payment attempt', [
    'card_last_four' => substr($cardNumber, -4),
    // Never log: 'card_number' => $cardNumber
]);
```

## Testing

### Test Mode

Support sandbox/test environments:

```php
private function getApiEndpoint(): string
{
    return $this->isTestMode()
        ? 'https://sandbox.api.payment.com'
        : 'https://api.payment.com';
}

private function isTestMode(): bool
{
    return ConfigQuery::read('mypayment_test_mode', '1') === '1';
}
```

### Test Cards

Document test card numbers in your module's README:

```
Test Cards (Sandbox):
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- 3D Secure: 4000 0000 0000 3220
```

## Best Practices

### Do

- **Always verify signatures** on callbacks
- **Log all payment events** for debugging and audit
- **Handle all error cases** gracefully
- **Use HTTPS** for all payment URLs
- **Store transaction references** for reconciliation
- **Implement idempotency** to handle duplicate callbacks

### Don't

- **Never log sensitive data** (full card numbers, CVV)
- **Never trust client-side data** for payment amounts
- **Don't skip callback verification** even in test mode
- **Don't process payments without order validation**
