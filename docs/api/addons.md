---
title: Resource Addons
sidebar_position: 5
---

# Resource Addons

Addons allow modules to enrich existing API resources with additional data without modifying the core resource classes.

## When to Use Addons

| Scenario | Use |
|----------|-----|
| New entity with its own CRUD | Resource |
| Add fields to Product, Customer, Order... | **Addon** |
| Computed data (stock, discounts) | **Addon** |
| Related data from another table | **Addon** |

## ResourceAddonInterface

```php
interface ResourceAddonInterface
{
    // Parent resource this addon enriches
    public static function getResourceParent(): string;

    // Related Propel table (if any)
    public static function getPropelRelatedTableMap(): ?TableMap;

    // Extend the query (add joins, virtual columns)
    public static function extendQuery(ModelCriteria $query, ?Operation $operation = null, array $context = []): void;

    // Build addon from Propel model
    public function buildFromModel(ActiveRecordInterface $activeRecord, PropelResourceInterface $resource): self;

    // Build addon from array (for write operations)
    public function buildFromArray(array $data, PropelResourceInterface $resource): self;

    // Persist addon data
    public function doSave(ActiveRecordInterface $activeRecord, PropelResourceInterface $resource): void;

    // Delete addon data
    public function doDelete(ActiveRecordInterface $activeRecord, PropelResourceInterface $resource): void;
}
```

## Creating an Addon

### Example: Adding Customer Family to Customer

```php
<?php

declare(strict_types=1);

namespace CustomerFamily\Api\Resource;

use Propel\Runtime\ActiveRecord\ActiveRecordInterface;
use Propel\Runtime\Map\TableMap;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\Ignore;
use Thelia\Api\Resource\Customer as CustomerResource;
use Thelia\Api\Resource\Order as OrderResource;
use Thelia\Api\Resource\PropelResourceInterface;
use Thelia\Api\Resource\ResourceAddonInterface;
use Thelia\Api\Resource\ResourceAddonTrait;
use CustomerFamily\Model\CustomerCustomerFamilyQuery;
use CustomerFamily\Model\CustomerFamilyQuery;
use CustomerFamily\Model\Map\CustomerCustomerFamilyTableMap;

class CustomerCustomerFamily implements ResourceAddonInterface
{
    use ResourceAddonTrait;

    public ?int $id = null;

    #[Groups([
        CustomerResource::GROUP_ADMIN_READ,
        CustomerResource::GROUP_ADMIN_WRITE,
        CustomerResource::GROUP_FRONT_READ_SINGLE,
        OrderResource::GROUP_ADMIN_READ,
    ])]
    public ?string $code = null;

    #[Ignore]
    public static function getResourceParent(): string
    {
        return CustomerResource::class;
    }

    #[Ignore]
    public static function getPropelRelatedTableMap(): ?TableMap
    {
        return new CustomerCustomerFamilyTableMap();
    }

    public function buildFromModel(
        ActiveRecordInterface $activeRecord,
        PropelResourceInterface $resource
    ): ResourceAddonInterface {
        $customerFamily = CustomerCustomerFamilyQuery::create()
            ->filterByCustomerId($activeRecord->getId())
            ->findOne();

        if (null === $customerFamily) {
            return $this;
        }

        $this->setCode($customerFamily->getCustomerFamily()?->getCode());

        return $this;
    }

    public function buildFromArray(
        array $data,
        PropelResourceInterface $resource
    ): ResourceAddonInterface {
        $this->setCode($data['code'] ?? null);

        return $this;
    }

    public function doSave(
        ActiveRecordInterface $activeRecord,
        PropelResourceInterface $resource
    ): void {
        if (null === $this->code) {
            return;
        }

        $customerFamily = CustomerFamilyQuery::create()
            ->findOneByCode($this->code);

        if (null === $customerFamily) {
            return;
        }

        $model = CustomerCustomerFamilyQuery::create()
            ->filterByCustomerId($activeRecord->getId())
            ->findOneOrCreate();

        $model->setCustomerId($activeRecord->getId());
        $model->setCustomerFamilyId($customerFamily->getId());
        $model->save();
    }

    public function doDelete(
        ActiveRecordInterface $activeRecord,
        PropelResourceInterface $resource
    ): void {
        CustomerCustomerFamilyQuery::create()
            ->filterByCustomerId($activeRecord->getId())
            ->delete();
    }

    // Getters and setters
    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(?string $code): self
    {
        $this->code = $code;
        return $this;
    }
}
```

## ResourceAddonTrait

The trait provides default implementations for common patterns:

```php
use Thelia\Api\Resource\ResourceAddonTrait;

class MyAddon implements ResourceAddonInterface
{
    use ResourceAddonTrait;
    // ...
}
```

### Default Behavior

The trait uses Propel virtual columns for automatic mapping:

1. **extendQuery()** - Adds LEFT JOIN and virtual columns based on `getPropelRelatedTableMap()`
2. **buildFromModel()** - Maps virtual columns to addon properties
3. **doSave() / doDelete()** - Uses reflection to persist via Propel relations

Override these methods when you need custom logic.

## Important Annotations

### #[Ignore]

Static methods must be annotated with `#[Ignore]` to prevent serialization errors:

```php
#[Ignore]
public static function getResourceParent(): string
{
    return Customer::class;
}

#[Ignore]
public static function getPropelRelatedTableMap(): ?TableMap
{
    return new MyAddonTableMap();
}
```

### Groups

Use the **parent resource's groups** for addon properties:

```php
#[Groups([
    CustomerResource::GROUP_ADMIN_READ,   // From Customer
    CustomerResource::GROUP_ADMIN_WRITE,  // From Customer
])]
public ?string $customField = null;
```

## Extending Queries

For complex data retrieval, override `extendQuery()`:

```php
public static function extendQuery(
    ModelCriteria $query,
    ?Operation $operation = null,
    array $context = []
): void {
    $query
        ->leftJoinWith('CustomerStock')
        ->withColumn('CustomerStock.Quantity', 'stockQuantity');
}
```

## Computed Data (No Database)

For computed properties without a database table:

```php
class ProductStockAddon implements ResourceAddonInterface
{
    use ResourceAddonTrait;

    #[Groups([Product::GROUP_ADMIN_READ, Product::GROUP_FRONT_READ])]
    public ?int $totalStock = null;

    #[Ignore]
    public static function getResourceParent(): string
    {
        return Product::class;
    }

    #[Ignore]
    public static function getPropelRelatedTableMap(): ?TableMap
    {
        return null; // No related table
    }

    public function buildFromModel(
        ActiveRecordInterface $activeRecord,
        PropelResourceInterface $resource
    ): ResourceAddonInterface {
        // Calculate total stock from all PSEs
        $totalStock = ProductSaleElementsQuery::create()
            ->filterByProductId($activeRecord->getId())
            ->withColumn('SUM(quantity)', 'total')
            ->findOne();

        $this->totalStock = (int) $totalStock?->getVirtualColumn('total');

        return $this;
    }

    public function buildFromArray(array $data, PropelResourceInterface $resource): self
    {
        return $this; // Read-only
    }

    public function doSave(ActiveRecordInterface $activeRecord, PropelResourceInterface $resource): void
    {
        // Nothing to save
    }

    public function doDelete(ActiveRecordInterface $activeRecord, PropelResourceInterface $resource): void
    {
        // Nothing to delete
    }
}
```

## Auto-Discovery

Addons are auto-discovered from:

- `local/modules/*/Api/Resource/` (or `Api/Addon/`)
- `vendor/thelia/modules/*/Api/Resource/`

They are registered via the `thelia.api.resource.addon` tag.

## API Response

Addon fields appear at the root level of the resource:

```json
{
    "id": 1,
    "email": "customer@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "code": "FAMILY_A"  // From CustomerCustomerFamily addon
}
```

## Multiple Addons

A resource can have multiple addons. Each addon's properties are merged into the response:

```json
{
    "id": 1,
    "ref": "PROD-001",
    "title": "Product",
    "code": "FAMILY_A",      // From addon 1
    "totalStock": 42,         // From addon 2
    "customField": "value"    // From addon 3
}
```

## Best Practices

1. **Use parent's groups** - Addon properties should use the parent resource's groups
2. **Mark static methods with #[Ignore]** - Prevents serialization errors
3. **Handle null gracefully** - Related data may not exist
4. **Keep addons focused** - One addon per concern
5. **Override only what you need** - Use trait defaults when possible

## Next Steps

- [Resources](./resources) - Creating standalone resources
- [Serialization Groups](./serialization-groups) - Controlling field visibility
- [Module API Resources](/docs/modules/api-resources) - Module-specific patterns
