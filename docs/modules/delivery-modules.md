---
title: Delivery Modules
sidebar_position: 8
---

# Delivery Modules

Delivery modules handle shipping calculations and integrate with carriers. They determine availability and pricing based on cart contents, customer location, and carrier rules.

## Creating a Delivery Module

### Main Class

Delivery modules extend `AbstractDeliveryModule`:

**MyCarrier.php**:
```php
<?php

declare(strict_types=1);

namespace MyCarrier;

use Thelia\Model\Country;
use Thelia\Model\State;
use Thelia\Module\AbstractDeliveryModule;
use Thelia\Module\Exception\DeliveryException;

final class MyCarrier extends AbstractDeliveryModule
{
    public const DOMAIN_NAME = 'mycarrier';

    /**
     * Check if this delivery method is available for the given country.
     */
    public function isValidDelivery(Country $country, State $state = null): bool
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
    public function getPostage(Country $country, State $state = null): float
    {
        if (!$this->isValidDelivery($country, $state)) {
            throw new DeliveryException(
                $this->trans('This delivery method is not available for your location.')
            );
        }

        $cart = $this->getRequest()->getSession()->getSessionCart($this->getDispatcher());

        // Calculate based on weight
        $weight = $cart->getWeight();
        $price = $this->calculatePriceByWeight($weight, $country);

        return $price;
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
        return $this->getTranslator()->trans($message, [], self::DOMAIN_NAME);
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

## isValidDelivery()

This method determines if the delivery option appears in checkout:

```php
public function isValidDelivery(Country $country, State $state = null): bool
{
    // Check country
    if (!$this->isCountryAllowed($country)) {
        return false;
    }

    // Check cart weight
    $cart = $this->getCart();
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
public function getPostage(Country $country, State $state = null): float
{
    if (!$this->isValidDelivery($country, $state)) {
        throw new DeliveryException(
            $this->trans('Delivery not available')
        );
    }

    $cart = $this->getCart();

    // Price calculation strategies
    return match ($this->getPricingStrategy()) {
        'flat' => $this->getFlatRate($country),
        'weight' => $this->getWeightBasedPrice($cart, $country),
        'price' => $this->getPriceBasedRate($cart, $country),
        'zones' => $this->getZoneBasedPrice($cart, $country, $state),
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

## Price Tables

Store pricing in database for admin configuration:

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

## Free Shipping

Handle free shipping thresholds:

```php
public function getPostage(Country $country, State $state = null): float
{
    $cart = $this->getCart();
    $cartTotal = $cart->getTaxedAmount();

    // Free shipping threshold
    $freeShippingThreshold = $this->getFreeShippingThreshold($country);

    if ($freeShippingThreshold > 0 && $cartTotal >= $freeShippingThreshold) {
        return 0.0;
    }

    return $this->calculateStandardPrice($cart, $country);
}
```

## Pickup Points

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
use Symfony\Component\Routing\Annotation\Route;
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

## API Integration

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
public function getPostage(Country $country, State $state = null): float
{
    $cart = $this->getCart();

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

Create shipments and track orders:

```php
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

## Admin Configuration

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

## Best Practices

### Do

- **Cache API responses** to avoid rate limits and improve performance
- **Log errors** with meaningful messages for debugging
- **Validate all inputs** before API calls
- **Handle API failures gracefully** with fallback pricing if possible
- **Test with various cart scenarios** (empty, heavy, international)

### Don't

- **Don't hardcode prices** - use database or config files
- **Don't skip validation** in `isValidDelivery()`
- **Don't throw generic exceptions** - use `DeliveryException` with helpful messages
- **Don't block checkout** for non-critical API failures
