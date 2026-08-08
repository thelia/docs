---
title: API Resources
sidebar_position: 3
---

# API Resources

API resources are the foundation of Thelia's API. They define how Propel models are exposed through API Platform.

## PropelResourceInterface

All API resources must implement `PropelResourceInterface`:

```php
interface PropelResourceInterface
{
    public function setPropelModel(ActiveRecordInterface $propelModel): self;
    public function getPropelModel(): ?ActiveRecordInterface;
    public function getResourceAddons(): array;
    public function getResourceAddon(string $addonName): ?ResourceAddonInterface;
    public function setResourceAddon(string $addonName, ?ResourceAddonInterface $addon): self;
    public static function getPropelRelatedTableMap(): ?TableMap;
    public function __get(string $property);
}
```

## Creating a basic resource

### 1. Define the Propel Schema

First, create your Propel model in `Config/schema.xml`:

```xml
<table name="my_project_item" namespace="MyProject\Model">
    <column name="id" primaryKey="true" required="true" type="INTEGER" autoIncrement="true"/>
    <column name="code" type="VARCHAR" size="50" required="true"/>
    <column name="price" type="DECIMAL" scale="2"/>
    <column name="is_active" type="BOOLEAN" default="1"/>
    <column name="created_at" type="TIMESTAMP"/>
    <column name="updated_at" type="TIMESTAMP"/>

    <behavior name="timestampable"/>
</table>
```

Generate the Propel models:

```bash
php Thelia module:generate:model MyProject
php Thelia module:generate:sql MyProject
```

### 2. Create the Resource Class

```php
<?php

declare(strict_types=1);

namespace MyModule\Api\Resource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Propel\Runtime\Map\TableMap;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints\NotBlank;
use Thelia\Api\Resource\PropelResourceInterface;
use Thelia\Api\Resource\PropelResourceTrait;
use MyModule\Model\Map\ProductReviewTableMap;

#[ApiResource(
    operations: [
        new Post(uriTemplate: '/admin/product_reviews'),
        new GetCollection(uriTemplate: '/admin/product_reviews'),
        new Get(uriTemplate: '/admin/product_reviews/{id}'),
        new Put(uriTemplate: '/admin/product_reviews/{id}'),
        new Delete(uriTemplate: '/admin/product_reviews/{id}'),
    ],
    normalizationContext: ['groups' => [self::GROUP_ADMIN_READ]],
    denormalizationContext: ['groups' => [self::GROUP_ADMIN_WRITE]],
)]
#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/front/product_reviews'),
        new Get(uriTemplate: '/front/product_reviews/{id}'),
        new Post(uriTemplate: '/front/product_reviews'),
    ],
    normalizationContext: ['groups' => [self::GROUP_FRONT_READ]],
    denormalizationContext: ['groups' => [self::GROUP_FRONT_WRITE]],
)]
class ProductReview implements PropelResourceInterface
{
    use PropelResourceTrait;

    public const GROUP_ADMIN_READ = 'admin:product_review:read';
    public const GROUP_ADMIN_WRITE = 'admin:product_review:write';
    public const GROUP_FRONT_READ = 'front:product_review:read';
    public const GROUP_FRONT_WRITE = 'front:product_review:write';

    #[Groups([
        self::GROUP_ADMIN_READ,
        self::GROUP_FRONT_READ,
    ])]
    public ?int $id = null;

    #[Groups([
        self::GROUP_ADMIN_READ,
        self::GROUP_ADMIN_WRITE,
        self::GROUP_FRONT_READ,
    ])]
    public int $productId;

    #[Groups([
        self::GROUP_ADMIN_READ,
        self::GROUP_FRONT_READ,
    ])]
    public ?int $customerId = null;

    #[Groups([
        self::GROUP_ADMIN_READ,
        self::GROUP_ADMIN_WRITE,
        self::GROUP_FRONT_READ,
        self::GROUP_FRONT_WRITE,
    ])]
    #[NotBlank(groups: [self::GROUP_ADMIN_WRITE, self::GROUP_FRONT_WRITE])]
    public string $content;

    #[Groups([
        self::GROUP_ADMIN_READ,
        self::GROUP_ADMIN_WRITE,
        self::GROUP_FRONT_READ,
        self::GROUP_FRONT_WRITE,
    ])]
    public int $rating;

    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_FRONT_READ])]
    public ?\DateTime $createdAt = null;

    public static function getPropelRelatedTableMap(): ?TableMap
    {
        return new ProductReviewTableMap();
    }
}
```

### 3. PropelResourceTrait

The `PropelResourceTrait` provides default implementations:

- Links the resource to its Propel model
- Manages resource addons
- Provides common getter/setter patterns

```php
use Thelia\Api\Resource\PropelResourceTrait;

class ProductReview implements PropelResourceInterface
{
    use PropelResourceTrait;
    // ...
}
```

## Property attributes

### Groups

Control field visibility:

```php
#[Groups([
    self::GROUP_ADMIN_READ,    // Visible in admin read operations
    self::GROUP_ADMIN_WRITE,   // Writable in admin operations
    self::GROUP_FRONT_READ,    // Visible in front read operations
])]
public string $ref;
```

### Validation

Add validation constraints:

```php
use Symfony\Component\Validator\Constraints as Assert;

#[Assert\NotBlank(groups: [self::GROUP_ADMIN_WRITE])]
#[Assert\Length(min: 3, max: 255, groups: [self::GROUP_ADMIN_WRITE])]
public string $title;

#[Assert\Range(min: 1, max: 5, groups: [self::GROUP_FRONT_WRITE])]
public int $rating;

#[Assert\NotNull(groups: [self::GROUP_ADMIN_WRITE])]
#[Assert\Positive(groups: [self::GROUP_ADMIN_WRITE])]
public float $price;

#[Assert\Email(groups: [self::GROUP_ADMIN_WRITE])]
public ?string $email = null;
```

### Relations

Define related resources:

```php
use Thelia\Api\Bridge\Propel\Attribute\Relation;

#[Relation(targetResource: Category::class)]
#[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE])]
public ?Category $category = null;

#[Relation(targetResource: ProductImage::class)]
#[Groups([self::GROUP_ADMIN_READ])]
public array $images = [];
```

### Column mapping

Map to Propel column names when they differ:

```php
use Thelia\Api\Bridge\Propel\Attribute\Column;

#[Column(propelFieldName: 'productSaleElementss')]  // Note: Propel uses plural
#[Relation(targetResource: ProductSaleElements::class)]
public array $productSaleElements = [];
```

## Operation types

### GetCollection

List resources with filtering and pagination:

```php
new GetCollection(
    uriTemplate: '/admin/products',
    paginationEnabled: true,
    paginationItemsPerPage: 30,
)
```

### Get

Retrieve a single resource:

```php
new Get(
    uriTemplate: '/admin/products/{id}',
    normalizationContext: ['groups' => [self::GROUP_ADMIN_READ, self::GROUP_ADMIN_READ_SINGLE]],
)
```

### Post

Create a new resource:

```php
new Post(
    uriTemplate: '/admin/products',
    validationContext: ['groups' => [self::GROUP_ADMIN_WRITE]],
)
```

### Put / Patch

Update a resource:

```php
new Put(
    uriTemplate: '/admin/products/{id}',
    denormalizationContext: ['groups' => [self::GROUP_ADMIN_WRITE, self::GROUP_ADMIN_WRITE_UPDATE]],
)

new Patch(
    uriTemplate: '/admin/products/{id}',
    denormalizationContext: ['groups' => [self::GROUP_ADMIN_WRITE]],
)
```

### Delete

Remove a resource:

```php
new Delete(
    uriTemplate: '/admin/products/{id}',
)
```

## Custom validation

Use callback constraints for complex validation:

```php
use Symfony\Component\Validator\Constraints\Callback;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

#[Callback(groups: [self::GROUP_ADMIN_WRITE])]
public function validateUniqueRef(ExecutionContextInterface $context): void
{
    $existingProduct = ProductQuery::create()
        ->filterByRef($this->ref)
        ->findOne();

    if ($existingProduct && $existingProduct->getId() !== $this->id) {
        $context->buildViolation('Reference already exists')
            ->atPath('ref')
            ->addViolation();
    }
}
```

## Computed properties

Add properties that are not stored in the database:

```php
#[Groups([self::GROUP_ADMIN_READ, self::GROUP_FRONT_READ])]
public function getPublicUrl(): string
{
    $propelModel = $this->getPropelModel();

    return $propelModel?->getUrl() ?? '';
}
```

## Auto-discovery

Resources are auto-discovered from:

- `core/lib/Thelia/Api/Resource/` (core resources)
- `Api/Resource/` inside any **activated** module's directory

Discovery is driven by the database: Thelia queries activated modules via `ModuleQuery::getActivated()`, resolves each module's base directory (whether in `local/modules/` or `vendor/`), and registers any `Api/Resource/` subdirectory found. Only activated modules are scanned, so placing a resource file in a deactivated module has no effect.

No additional configuration is required beyond activating the module.

## State providers

Thelia uses custom state providers to bridge API Platform with Propel. They all live in the `Thelia\Api\Bridge\Propel\State\` namespace:

| Provider | Purpose |
|----------|---------|
| `PropelCollectionProvider` | Handles GetCollection operations |
| `PropelItemProvider` | Handles Get operations |
| `PropelPersistProcessor` | Handles Post, Put, Patch |
| `PropelRemoveProcessor` | Handles Delete |

These are configured automatically for resources implementing `PropelResourceInterface`.

## Adding filters

Add API Platform filters for searching and filtering:

```php
use ApiPlatform\Metadata\ApiFilter;
use Thelia\Api\Bridge\Propel\Filter\SearchFilter;
use Thelia\Api\Bridge\Propel\Filter\BooleanFilter;

#[ApiResource(/* ... */)]
#[ApiFilter(SearchFilter::class, properties: ['code' => 'partial'])]
#[ApiFilter(BooleanFilter::class, properties: ['isActive'])]
class MyProjectItem implements PropelResourceInterface
{
    // ...
}
```

Query examples:
```
GET /api/admin/my_project_items?code=test
GET /api/admin/my_project_items?isActive=true
```

## Best practices

1. Name serialization groups consistently.
2. Keep admin and front separate, with different routes and groups for each.
3. Add validation constraints to every writable field.
4. Include related data only when you need it.
5. Document the API by adding descriptions to operations and properties.

## Next steps

- [Translatable Resources](./translatable-resources) - Resources with i18n support
- [Addons](./addons) - Extending existing resources
- [Serialization Groups](./serialization-groups) - Advanced group configuration
