---
title: API Resources
sidebar_position: 3
---

# API Resources

API Resources are the core building blocks of Thelia's API. They define how Propel models are exposed via API Platform.

## PropelResourceInterface

All API resources must implement `PropelResourceInterface`:

```php
interface PropelResourceInterface
{
    public function setPropelModel(ActiveRecordInterface $propelModel): self;
    public function getPropelModel(): ?ActiveRecordInterface;
    public function getResourceAddons(): array;
    public function getResourceAddon(string $addonName): ?ResourceAddonInterface;
    public static function getPropelRelatedTableMap(): ?TableMap;
}
```

## Creating a Basic Resource

### 1. Define the Resource Class

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

### 2. PropelResourceTrait

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

## Property Attributes

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
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\Range;

#[NotBlank(groups: [self::GROUP_ADMIN_WRITE])]
#[Length(min: 3, max: 255, groups: [self::GROUP_ADMIN_WRITE])]
public string $title;

#[Range(min: 1, max: 5, groups: [self::GROUP_FRONT_WRITE])]
public int $rating;
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

### Column Mapping

Map to Propel column names when they differ:

```php
use Thelia\Api\Bridge\Propel\Attribute\Column;

#[Column(propelFieldName: 'productSaleElementss')]  // Note: Propel uses plural
#[Relation(targetResource: ProductSaleElements::class)]
public array $productSaleElements = [];
```

## Operation Types

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

## Custom Validation

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

## Computed Properties

Add properties that are not stored in the database:

```php
#[Groups([self::GROUP_ADMIN_READ, self::GROUP_FRONT_READ])]
public function getPublicUrl(): string
{
    $propelModel = $this->getPropelModel();

    return $propelModel?->getUrl() ?? '';
}
```

## Auto-Discovery

Resources are auto-discovered when placed in:

- `core/lib/Thelia/Api/Resource/` (core resources)
- `local/modules/*/Api/Resource/` (module resources)
- `vendor/thelia/modules/*/Api/Resource/` (vendor module resources)

No additional configuration is required.

## State Providers

Thelia uses custom state providers to bridge API Platform with Propel:

| Provider | Purpose |
|----------|---------|
| `PropelCollectionProvider` | Handles GetCollection operations |
| `PropelItemProvider` | Handles Get operations |
| `PropelPersistProcessor` | Handles Post, Put, Patch |
| `PropelRemoveProcessor` | Handles Delete |

These are configured automatically for resources implementing `PropelResourceInterface`.

## Best Practices

1. **Define clear groups** - Use consistent naming for serialization groups
2. **Separate admin/front** - Use different routes and groups for admin vs front
3. **Validate thoroughly** - Add validation constraints for all writable fields
4. **Use relations wisely** - Only include related data when needed
5. **Document your API** - Add descriptions to operations and properties

## Next Steps

- [Translatable Resources](./translatable-resources) - Resources with i18n support
- [Addons](./addons) - Extending existing resources
- [Serialization Groups](./serialization-groups) - Advanced group configuration
