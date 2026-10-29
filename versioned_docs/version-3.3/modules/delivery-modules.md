---
title: Delivery Modules
sidebar_position: 8
---

# Delivery Modules

Delivery modules handle shipping calculations and integrate with carriers. They determine availability and pricing based on cart contents, customer location, and carrier rules.

## Creating a delivery module

### Main class

Delivery modules extend `AbstractDeliveryModule`:

**MyCarrier.php**:
```php
<?php

declare(strict_types=1);

namespace MyCarrier;

use Thelia\Core\Translation\Translator;
use Thelia\Model\Country;
use Thelia\Model\OrderPostage;
use Thelia\Module\AbstractDeliveryModule;
use Thelia\Module\Exception\DeliveryException;

final class MyCarrier extends AbstractDeliveryModule
{
    public const DOMAIN_NAME = 'mycarrier';

    /**
     * Check if this delivery method is available for the given country.
     */
    public function isValidDelivery(Country $country): bool
    {
        // Check if delivery is available for this country
        $allowedCountries = $this->getAllowedCountries();

        if (!in_array($country->getId(), $allowedCountries)) {
            return false;
        }

        // Check cart weight limit
        $cart = $this->getRequest()->getSession()->getSessionCart($this->getDispatcher());
        $weight = $cart->getWeight();

        if ($weight > $this->getMaxWeight()) {
            return false;
        }

        return true;
    }

    /**
     * Calculate the delivery price for the given country.
     *
     * @throws DeliveryException If price cannot be calculated
     */
    public function getPostage(Country $country): OrderPostage|float
    {
        if (!$this->isValidDelivery($country)) {
            throw new DeliveryException(
                $this->trans('This delivery method is not available for your location.')
            );
        }

        $cart = $this->getRequest()->getSession()->getSessionCart($this->getDispatcher());

        // Calculate based on weight
        $weight = $cart->getWeight();
        $amount = $this->calculatePriceByWeight($weight, $country);

        // Return a tax-aware OrderPostage instead of a raw float.
        $postage = new OrderPostage();
        $postage->setAmount($amount);

        return $postage;
    }

    private function getAllowedCountries(): array
    {
        // Return array of allowed country IDs
        // Could be from configuration or database
        return [64]; // France only for example
    }

    private function getMaxWeight(): float
    {
        return 30.0; // 30 kg max
    }

    private function calculatePriceByWeight(float $weight, Country $country): float
    {
        // Your pricing logic
        $basePrice = 5.00;
        $pricePerKg = 0.50;

        return $basePrice + ($weight * $pricePerKg);
    }

    private function trans(string $message): string
    {
        // The default Thelia translation domain is 'core', so always pass
        // your module domain explicitly.
        return Translator::getInstance()->trans($message, [], self::DOMAIN_NAME);
    }
}
```

:::caution
`BaseModule` has no `getTranslator()` and no `getCart()` method. Read the
current cart with `$this->getRequest()->getSession()->getSessionCart($this->getDispatcher())`,
and translate with `Thelia\Core\Translation\Translator::getInstance()` (or an
injected Symfony `TranslatorInterface` if your module already declares services).
Always pass your module domain (here `self::DOMAIN_NAME`): the default domain
is `core`.
:::

:::note
`getPostage()` may return either a `float` or an `OrderPostage`. Returning an
`OrderPostage` lets you carry the postage tax separately. The `OrderPostage`
constructor does not assign its arguments, so set the amount with
`setAmount()` (and `setAmountTax()` if you compute tax yourself). For
zone/tax-rule-based carriers, prefer `AbstractDeliveryModuleWithState::buildOrderPostage()`,
which builds the `OrderPostage` and applies the configured delivery tax rule
for you.
:::

### module.xml

**Config/module.xml**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<module xmlns="http://thelia.net/schema/dic/module"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://thelia.net/schema/dic/module http://thelia.net/schema/dic/module/module-2_2.xsd">
    <fullnamespace>MyCarrier\MyCarrier</fullnamespace>
    <descriptive locale="en_US">
        <title>My Carrier</title>
        <description>Custom delivery module</description>
    </descriptive>
    <version>1.0.0</version>
    <type>delivery</type>
    <thelia>2.5.0</thelia>
    <stability>stable</stability>
</module>
```

## The abstract surface

Two base classes are available, depending on how your carrier prices delivery.

### AbstractDeliveryModule

`AbstractDeliveryModule` implements `DeliveryModuleInterface`. You must implement
three methods:

- `isValidDelivery(Country $country): bool`: whether the method appears in checkout.
- `getPostage(Country $country): OrderPostage|float`: the delivery price.
- `handleVirtualProductDelivery(): bool`: return `true` if your carrier handles
  virtual products (the base class returns `false`).

It also provides two helpers you can use as is:

- `getAreaForCountry(Country $country): ?Area`: the first geographic area that matches
  the country for this module.
- `getDeliveryMode()`: returns the delivery mode string, defaults to `'delivery'`.

### AbstractDeliveryModuleWithState

For zone/area-based carriers that need state-level (region/province) resolution,
extend `AbstractDeliveryModuleWithState` instead. It adds:

- `getAreaForCountry(Country $country, ?State $state = null): ?Area`: area resolution
  that also accounts for the customer state.
- `buildOrderPostage(float $untaxedPostage, Country $country, $locale, $taxRuleId = null)`:
  builds an `OrderPostage` from an untaxed amount and applies the delivery tax rule
  (`taxrule_id_delivery_module` config, or the `$taxRuleId` you pass). It fills in the
  taxed amount, tax amount and tax rule title for you.

```php
// MyCarrier/MyCarrier.php
public function getPostage(Country $country): OrderPostage|float
{
    $cart = $this->getRequest()->getSession()->getSessionCart($this->getDispatcher());
    $untaxedPostage = $this->calculatePriceByWeight($cart->getWeight(), $country);

    return $this->buildOrderPostage(
        $untaxedPostage,
        $country,
        $this->getRequest()->getSession()->getLang()->getLocale(),
    );
}
```

## isValidDelivery()

This method determines if the delivery option appears in checkout:

```php
public function isValidDelivery(Country $country): bool
{
    // Check country
    if (!$this->isCountryAllowed($country)) {
        return false;
    }

    // Check cart weight
    $cart = $this->getRequest()->getSession()->getSessionCart($this->getDispatcher());
    if ($cart->getWeight() > 30) {
        return false;
    }

    // Check cart total
    if ($cart->getTaxedAmount() < 10) {
        return false; // Minimum order required
    }

    // Check products (e.g., no fragile items)
    foreach ($cart->getCartItems() as $item) {
        if ($this->isFragile($item->getProduct())) {
            return false;
        }
    }

    // Check if carrier is enabled in config
    if (!$this->isEnabled()) {
        return false;
    }

    return true;
}
```

## getPostage()

Calculate the delivery price:

```php
public function getPostage(Country $country): OrderPostage|float
{
    if (!$this->isValidDelivery($country)) {
        throw new DeliveryException(
            $this->trans('Delivery not available')
        );
    }

    $cart = $this->getRequest()->getSession()->getSessionCart($this->getDispatcher());

    // Price calculation strategies
    return match ($this->getPricingStrategy()) {
        'flat' => $this->getFlatRate($country),
        'weight' => $this->getWeightBasedPrice($cart, $country),
        'price' => $this->getPriceBasedRate($cart, $country),
        'zones' => $this->getZoneBasedPrice($cart, $country),
        default => throw new DeliveryException('Invalid pricing strategy'),
    };
}

private function getWeightBasedPrice($cart, Country $country): float
{
    $weight = $cart->getWeight();
    $zones = $this->getWeightZones($country);

    foreach ($zones as $zone) {
        if ($weight >= $zone['min'] && $weight < $zone['max']) {
            return $zone['price'];
        }
    }

    throw new DeliveryException(
        $this->trans('Weight exceeds maximum allowed')
    );
}
```

## Price tables

Store pricing in the database for admin configuration:

**Config/schema.xml**:
```xml
<table name="my_carrier_price" namespace="MyCarrier\Model">
    <column name="id" primaryKey="true" required="true" type="INTEGER" autoIncrement="true"/>
    <column name="country_id" type="INTEGER"/>
    <column name="weight_min" type="FLOAT"/>
    <column name="weight_max" type="FLOAT"/>
    <column name="price" type="DECIMAL" scale="2"/>

    <foreign-key foreignTable="country" onDelete="CASCADE">
        <reference local="country_id" foreign="id"/>
    </foreign-key>
</table>
```

Usage:
```php
private function getWeightBasedPrice($cart, Country $country): float
{
    $weight = $cart->getWeight();

    $priceRecord = MyCarrierPriceQuery::create()
        ->filterByCountryId($country->getId())
        ->filterByWeightMin($weight, Criteria::LESS_EQUAL)
        ->filterByWeightMax($weight, Criteria::GREATER_THAN)
        ->findOne();

    if (!$priceRecord) {
        throw new DeliveryException(
            $this->trans('No price available for this weight')
        );
    }

    return (float) $priceRecord->getPrice();
}
```

## Free shipping

Handle free shipping thresholds:

```php
public function getPostage(Country $country): OrderPostage|float
{
    $cart = $this->getRequest()->getSession()->getSessionCart($this->getDispatcher());
    $cartTotal = $cart->getTaxedAmount();

    // Free shipping threshold
    $freeShippingThreshold = $this->getFreeShippingThreshold($country);

    if ($freeShippingThreshold > 0 && $cartTotal >= $freeShippingThreshold) {
        return 0.0;
    }

    return $this->calculateStandardPrice($cart, $country);
}
```

## Pickup points

For carriers with pickup locations:

**Config/schema.xml**:
```xml
<table name="my_carrier_pickup" namespace="MyCarrier\Model">
    <column name="id" primaryKey="true" required="true" type="INTEGER" autoIncrement="true"/>
    <column name="external_id" type="VARCHAR" size="50"/>
    <column name="name" type="VARCHAR" size="255"/>
    <column name="address" type="VARCHAR" size="255"/>
    <column name="city" type="VARCHAR" size="100"/>
    <column name="zipcode" type="VARCHAR" size="20"/>
    <column name="country_id" type="INTEGER"/>
    <column name="latitude" type="FLOAT"/>
    <column name="longitude" type="FLOAT"/>
</table>
```

**Controller/Front/PickupController.php**:
```php
<?php

declare(strict_types=1);

namespace MyCarrier\Controller\Front;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Thelia\Controller\Front\BaseFrontController;

final class PickupController extends BaseFrontController
{
    #[Route('/my-carrier/pickups', name: 'mycarrier.front.pickups')]
    public function listPickupsAction(Request $request): JsonResponse
    {
        $zipcode = $request->query->get('zipcode');
        $countryId = $request->query->getInt('country');

        $pickups = \MyCarrier\Model\MyCarrierPickupQuery::create()
            ->filterByZipcode($zipcode . '%', \Criteria::LIKE)
            ->filterByCountryId($countryId)
            ->limit(20)
            ->find();

        $data = [];
        foreach ($pickups as $pickup) {
            $data[] = [
                'id' => $pickup->getId(),
                'externalId' => $pickup->getExternalId(),
                'name' => $pickup->getName(),
                'address' => $pickup->getAddress(),
                'city' => $pickup->getCity(),
                'zipcode' => $pickup->getZipcode(),
                'latitude' => $pickup->getLatitude(),
                'longitude' => $pickup->getLongitude(),
            ];
        }

        return new JsonResponse($data);
    }
}
```

## API integration

Integrate with carrier APIs:

```php
<?php

declare(strict_types=1);

namespace MyCarrier\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

final readonly class CarrierApiService
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private string $apiKey,
        private string $apiUrl,
    ) {}

    public function getShippingRates(array $params): array
    {
        $response = $this->httpClient->request('POST', $this->apiUrl . '/rates', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
            ],
            'json' => [
                'origin' => $params['origin'],
                'destination' => $params['destination'],
                'weight' => $params['weight'],
                'dimensions' => $params['dimensions'],
            ],
        ]);

        return $response->toArray();
    }

    public function createShipment(array $orderData): array
    {
        $response = $this->httpClient->request('POST', $this->apiUrl . '/shipments', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
            ],
            'json' => $orderData,
        ]);

        return $response->toArray();
    }

    public function getTrackingInfo(string $trackingNumber): array
    {
        $response = $this->httpClient->request('GET', $this->apiUrl . '/tracking/' . $trackingNumber, [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
            ],
        ]);

        return $response->toArray();
    }
}
```

Use in module:
```php
public function getPostage(Country $country): OrderPostage|float
{
    $cart = $this->getRequest()->getSession()->getSessionCart($this->getDispatcher());

    $rates = $this->carrierApi->getShippingRates([
        'origin' => $this->getStoreAddress(),
        'destination' => [
            'country' => $country->getIsocode(),
            'zipcode' => $this->getCustomerZipcode(),
        ],
        'weight' => $cart->getWeight(),
    ]);

    if (empty($rates)) {
        throw new DeliveryException(
            $this->trans('Unable to get shipping rates')
        );
    }

    return (float) $rates[0]['price'];
}
```

## Tracking

Create shipments and track orders by listening to order status changes. The
listener implements `EventSubscriberInterface`, so it is auto-tagged through
`configureServices()` autoconfiguration. No XML service declaration is needed.

```php
// MyCarrier/EventListener/OrderEventListener.php
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Thelia\Core\Event\Order\OrderEvent;
use Thelia\Core\Event\TheliaEvents;

class OrderEventListener implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            TheliaEvents::ORDER_UPDATE_STATUS => ['onOrderPaid', 128],
        ];
    }

    public function onOrderPaid(OrderEvent $event): void
    {
        $order = $event->getOrder();

        // Only for this delivery module and paid status
        if ($order->getDeliveryModuleId() !== $this->moduleId) {
            return;
        }

        if ($event->getStatus() !== OrderStatusQuery::getPaidStatus()->getId()) {
            return;
        }

        // Create shipment with carrier
        $shipment = $this->carrierApi->createShipment([
            'order_ref' => $order->getRef(),
            'recipient' => [
                'name' => $order->getCustomer()->getFirstname() . ' ' . $order->getCustomer()->getLastname(),
                'address' => $order->getDeliveryAddress(),
            ],
            'weight' => $this->calculateOrderWeight($order),
        ]);

        // Store tracking number
        $order->setDeliveryRef($shipment['tracking_number']);
        $order->save();
    }
}
```

## Admin configuration

Add a configuration page:

**Controller/Admin/ConfigController.php**:
```php
#[Route('/admin/module/MyCarrier', name: 'mycarrier.admin.config')]
public function indexAction(): Response
{
    return $this->render('module-config', [
        'prices' => MyCarrierPriceQuery::create()
            ->orderByCountryId()
            ->orderByWeightMin()
            ->find(),
    ]);
}
```

## Best practices

### Do

- Cache API responses to avoid rate limits and keep checkout fast.
- Log errors with meaningful messages so you can debug them later.
- Validate all inputs before API calls.
- Handle API failures with fallback pricing when possible.
- Test with various cart scenarios: empty, heavy, and international.

### Don't

- Hardcode prices. Use the database or config files instead.
- Skip validation in `isValidDelivery()`.
- Throw generic exceptions. Use `DeliveryException` with a helpful message.
- Block checkout for non-critical API failures.
