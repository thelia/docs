---
title: API Addons
sidebar_position: 6
---

# API Addons

API Addons enrich existing resources with additional data without modifying core code. They're ideal for adding custom fields, calculated values, or related data to Thelia's built-in resources like Product, Customer, or Order.

## When to Use Addons

| Use Case | Example |
|----------|---------|
| Custom fields on core entities | Add "warranty_period" to Product |
| Calculated data | Real-time stock, promotional prices |
| Related data from other tables | Customer family, loyalty points |
| External data | ERP sync status, external IDs |

## Creating an Addon

### Step 1: Define Your Data

Decide what data you want to add to an existing resource. For this example, we'll add a "customer family" field to the Customer resource.

### Step 2: Create the Addon Class

**Api/Addon/CustomerCustomerFamily.php**:
```php
<?php

declare(strict_types=1);

namespace MyProject\Api\Addon;

use MyProject\Model\CustomerFamilyQuery;
use MyProject\Model\Map\CustomerCustomerFamilyTableMap;
use Propel\Runtime\ActiveRecord\ActiveRecordInterface;
use Propel\Runtime\Map\TableMap;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\Ignore;
use Thelia\Api\Resource\Customer as CustomerResource;
use Thelia\Api\Resource\Order as OrderResource;
use Thelia\Api\Resource\PropelResourceInterface;
use Thelia\Api\Resource\ResourceAddonInterface;
use Thelia\Api\Resource\ResourceAddonTrait;

class CustomerCustomerFamily implements ResourceAddonInterface
{
    use ResourceAddonTrait;

    public ?int $id = null;

    /**
     * The customer family code.
     * Visible when reading customers or orders.
     */
    #[Groups([
        CustomerResource::GROUP_ADMIN_READ,
        CustomerResource::GROUP_ADMIN_WRITE,
        CustomerResource::GROUP_FRONT_READ_SINGLE,
        OrderResource::GROUP_ADMIN_READ,
    ])]
    public ?string $familyCode = null;

    /**
     * Discount percentage for this customer family.
     * Read-only, calculated from the family.
     */
    #[Groups([
        CustomerResource::GROUP_ADMIN_READ,
        CustomerResource::GROUP_FRONT_READ_SINGLE,
    ])]
    public ?float $discountPercent = null;

    /**
     * Returns the parent resource class this addon extends.
     */
    #[Ignore]
    public static function getResourceParent(): string
    {
        return CustomerResource::class;
    }

    /**
     * Returns the Propel TableMap for automatic query building.
     */
    #[Ignore]
    public static function getPropelRelatedTableMap(): ?TableMap
    {
        return new CustomerCustomerFamilyTableMap();
    }

    /**
     * Build addon data from a Propel model (when reading).
     */
    public function buildFromModel(
        ActiveRecordInterface $activeRecord,
        PropelResourceInterface $resource
    ): ResourceAddonInterface {
        // $activeRecord is the Customer Propel model
        $customerFamily = \MyProject\Model\CustomerCustomerFamilyQuery::create()
            ->filterByCustomerId($activeRecord->getId())
            ->findOne();

        if ($customerFamily === null) {
            return $this;
        }

        $family = $customerFamily->getCustomerFamily();
        if ($family) {
            $this->familyCode = $family->getCode();
            $this->discountPercent = $family->getDiscountPercent();
        }

        return $this;
    }

    /**
     * Build addon data from request array (when writing).
     */
    public function buildFromArray(
        array $data,
        PropelResourceInterface $resource
    ): ResourceAddonInterface {
        $this->familyCode = $data['familyCode'] ?? null;

        return $this;
    }

    /**
     * Persist addon data when the parent resource is saved.
     */
    public function doSave(
        ActiveRecordInterface $activeRecord,
        PropelResourceInterface $resource
    ): void {
        if ($this->familyCode === null) {
            return;
        }

        // Find the family by code
        $family = CustomerFamilyQuery::create()
            ->findOneByCode($this->familyCode);

        if (!$family) {
            return;
        }

        // Find or create the association
        $customerFamily = \MyProject\Model\CustomerCustomerFamilyQuery::create()
            ->filterByCustomerId($activeRecord->getId())
            ->findOneOrCreate();

        $customerFamily
            ->setCustomerId($activeRecord->getId())
            ->setCustomerFamilyId($family->getId())
            ->save();
    }

    /**
     * Clean up addon data when the parent resource is deleted.
     */
    public function doDelete(
        ActiveRecordInterface $activeRecord,
        PropelResourceInterface $resource
    ): void {
        \MyProject\Model\CustomerCustomerFamilyQuery::create()
            ->filterByCustomerId($activeRecord->getId())
            ->delete();
    }
}
```

### Key Methods

| Method | Purpose | When Called |
|--------|---------|-------------|
| `getResourceParent()` | Declares which resource this addon extends | Registration |
| `getPropelRelatedTableMap()` | Links to Propel table for auto-joins | Query building |
| `buildFromModel()` | Populates addon from database | GET requests |
| `buildFromArray()` | Populates addon from request data | POST/PUT requests |
| `doSave()` | Persists addon data | After parent save |
| `doDelete()` | Cleans up addon data | Before parent delete |

## Auto-Registration

Addons are automatically discovered and registered when they implement `ResourceAddonInterface`. The system uses:
- `thelia.api.resource.addon` service tag
- `RegisterApiResourceAddonPass` compiler pass

No manual configuration needed in `config.xml`.

## Using ResourceAddonTrait

The `ResourceAddonTrait` provides default implementations using Propel virtual columns:

```php
use Thelia\Api\Resource\ResourceAddonTrait;

class MyAddon implements ResourceAddonInterface
{
    use ResourceAddonTrait;

    // The trait provides:
    // - extendQuery(): Adds LEFT JOIN and virtual columns
    // - buildFromModel(): Maps virtual columns to properties
    // - Default doSave()/doDelete() implementations
}
```

### How the Trait Works

The trait uses reflection to:
1. **Extend queries** with LEFT JOINs based on `getPropelRelatedTableMap()`
2. **Add virtual columns** for each property
3. **Map virtual columns** to resource properties

For custom logic, override the specific methods you need.

## Custom Query Extension

Override `extendQuery()` for complex joins:

```php
use ApiPlatform\Metadata\Operation;
use Propel\Runtime\ActiveQuery\ModelCriteria;

public static function extendQuery(ModelCriteria $query, ?Operation $operation = null): void
{
    // Add custom join
    $query
        ->leftJoin('Customer.CustomerCustomerFamily')
        ->leftJoin('CustomerCustomerFamily.CustomerFamily')
        ->withColumn('CustomerFamily.Code', 'customer_family_code')
        ->withColumn('CustomerFamily.DiscountPercent', 'customer_family_discount');
}

public function buildFromModel(
    ActiveRecordInterface $activeRecord,
    PropelResourceInterface $resource
): ResourceAddonInterface {
    // Use virtual columns from the query
    $this->familyCode = $activeRecord->getVirtualColumn('customer_family_code');
    $this->discountPercent = $activeRecord->getVirtualColumn('customer_family_discount');

    return $this;
}
```

## API Response Example

When fetching a customer:

```json
GET /api/admin/customers/123

{
    "id": 123,
    "email": "customer@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "customerCustomerFamily": {
        "familyCode": "wholesale",
        "discountPercent": 15.0
    }
}
```

The addon data appears as a nested object named after the addon class (camelCase).

## Multiple Addons

You can create multiple addons for the same resource:

```php
// Addon 1: Customer family
class CustomerCustomerFamily implements ResourceAddonInterface { /* ... */ }

// Addon 2: Loyalty points
class CustomerLoyalty implements ResourceAddonInterface
{
    #[Ignore]
    public static function getResourceParent(): string
    {
        return CustomerResource::class;
    }

    #[Groups([CustomerResource::GROUP_ADMIN_READ])]
    public int $loyaltyPoints = 0;

    // ...
}
```

Response:
```json
{
    "id": 123,
    "email": "customer@example.com",
    "customerCustomerFamily": {
        "familyCode": "wholesale"
    },
    "customerLoyalty": {
        "loyaltyPoints": 2500
    }
}
```

## Common Parent Resources

You can extend any core resource:

| Resource | Class | Common Use Cases |
|----------|-------|------------------|
| Product | `Thelia\Api\Resource\Product` | Custom attributes, stock info, external IDs |
| Customer | `Thelia\Api\Resource\Customer` | Loyalty, family, B2B data |
| Order | `Thelia\Api\Resource\Order` | Tracking, external status, custom fields |
| Category | `Thelia\Api\Resource\Category` | SEO data, custom attributes |
| Cart | `Thelia\Api\Resource\Cart` | Promotions, custom calculations |

## Serialization Groups

Use the parent resource's groups to control visibility:

```php
// Product groups
Product::GROUP_ADMIN_READ      // Admin list/detail
Product::GROUP_ADMIN_WRITE     // Admin create/update
Product::GROUP_FRONT_READ      // Front list
Product::GROUP_FRONT_READ_SINGLE // Front detail

// Customer groups
Customer::GROUP_ADMIN_READ
Customer::GROUP_ADMIN_WRITE
Customer::GROUP_FRONT_READ_SINGLE
```

## Read-Only Addons

For calculated data that shouldn't be written:

```php
class ProductStock implements ResourceAddonInterface
{
    use ResourceAddonTrait;

    // Only in read groups - no write group
    #[Groups([
        Product::GROUP_ADMIN_READ,
        Product::GROUP_FRONT_READ_SINGLE,
    ])]
    public int $availableStock = 0;

    #[Groups([
        Product::GROUP_ADMIN_READ,
        Product::GROUP_FRONT_READ_SINGLE,
    ])]
    public bool $inStock = false;

    #[Ignore]
    public static function getResourceParent(): string
    {
        return Product::class;
    }

    public function buildFromModel(
        ActiveRecordInterface $activeRecord,
        PropelResourceInterface $resource
    ): ResourceAddonInterface {
        // Calculate real-time stock
        $this->availableStock = $this->calculateStock($activeRecord->getId());
        $this->inStock = $this->availableStock > 0;

        return $this;
    }

    // No doSave() needed for read-only data
    public function doSave(
        ActiveRecordInterface $activeRecord,
        PropelResourceInterface $resource
    ): void {
        // Do nothing - read-only addon
    }

    private function calculateStock(int $productId): int
    {
        // Your stock calculation logic
        return 0;
    }
}
```

## Best Practices

### Do

- **Use `#[Ignore]` on interface methods** to exclude them from serialization
- **Use parent resource groups** for consistent visibility
- **Implement `doDelete()`** to clean up data when parent is deleted
- **Keep addons focused** - one addon per concern

### Don't

- **Don't modify parent resource data** in addon methods
- **Don't create circular dependencies** between addons
- **Don't perform heavy operations** in `buildFromModel()` - it's called for every item
- **Don't skip `doDelete()`** - it prevents orphaned data
