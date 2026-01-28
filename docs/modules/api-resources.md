---
title: API Resources
sidebar_position: 5
---

# API Resources

API Resources expose your module's data through REST endpoints using API Platform. They bridge Propel models with the API layer.

## Overview

Thelia provides interfaces to integrate Propel ORM with API Platform:

- **`PropelResourceInterface`** - Basic resource for non-translatable entities
- **`AbstractTranslatableResource`** - Resource with i18n support

## Creating a Basic Resource

### Step 1: Define the Propel Schema

**Config/schema.xml**:
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

Generate models:
```bash
php Thelia module:generate:model MyProject
php Thelia module:generate:sql MyProject
```

### Step 2: Create the API Resource

**Api/Resource/MyProjectItem.php**:
```php
<?php

declare(strict_types=1);

namespace MyProject\Api\Resource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use MyProject\Model\Map\MyProjectItemTableMap;
use Propel\Runtime\Map\TableMap;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Thelia\Api\Resource\PropelResourceInterface;
use Thelia\Api\Resource\PropelResourceTrait;

#[ApiResource(
    operations: [
        // Admin endpoints (full CRUD)
        new Post(
            uriTemplate: '/admin/my_project_items',
            normalizationContext: ['groups' => [self::GROUP_ADMIN_READ]],
            denormalizationContext: ['groups' => [self::GROUP_ADMIN_WRITE]],
        ),
        new GetCollection(
            uriTemplate: '/admin/my_project_items',
            normalizationContext: ['groups' => [self::GROUP_ADMIN_READ]],
        ),
        new Get(
            uriTemplate: '/admin/my_project_items/{id}',
            normalizationContext: ['groups' => [self::GROUP_ADMIN_READ]],
        ),
        new Put(
            uriTemplate: '/admin/my_project_items/{id}',
            normalizationContext: ['groups' => [self::GROUP_ADMIN_READ]],
            denormalizationContext: ['groups' => [self::GROUP_ADMIN_WRITE]],
        ),
        new Delete(
            uriTemplate: '/admin/my_project_items/{id}',
        ),
        // Front endpoints (read-only)
        new GetCollection(
            uriTemplate: '/front/my_project_items',
            normalizationContext: ['groups' => [self::GROUP_FRONT_READ]],
        ),
        new Get(
            uriTemplate: '/front/my_project_items/{id}',
            normalizationContext: ['groups' => [self::GROUP_FRONT_READ]],
        ),
    ],
)]
class MyProjectItem implements PropelResourceInterface
{
    use PropelResourceTrait;

    // Serialization groups
    public const GROUP_ADMIN_READ = 'admin:my_project_item:read';
    public const GROUP_ADMIN_WRITE = 'admin:my_project_item:write';
    public const GROUP_FRONT_READ = 'front:my_project_item:read';

    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_FRONT_READ])]
    public ?int $id = null;

    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE, self::GROUP_FRONT_READ])]
    #[Assert\NotBlank(groups: [self::GROUP_ADMIN_WRITE])]
    #[Assert\Length(max: 50, groups: [self::GROUP_ADMIN_WRITE])]
    public string $code;

    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE, self::GROUP_FRONT_READ])]
    #[Assert\PositiveOrZero(groups: [self::GROUP_ADMIN_WRITE])]
    public ?float $price = null;

    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE])]
    public bool $isActive = true;

    #[Groups([self::GROUP_ADMIN_READ])]
    public ?\DateTimeInterface $createdAt = null;

    #[Groups([self::GROUP_ADMIN_READ])]
    public ?\DateTimeInterface $updatedAt = null;

    public static function getPropelRelatedTableMap(): ?TableMap
    {
        return new MyProjectItemTableMap();
    }
}
```

### Key Concepts

#### Serialization Groups

Groups control which properties are exposed in different contexts:

```php
// Only visible in admin read operations
#[Groups([self::GROUP_ADMIN_READ])]
public ?\DateTimeInterface $createdAt = null;

// Visible in admin read/write and front read
#[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE, self::GROUP_FRONT_READ])]
public string $code;

// Only writable in admin context
#[Groups([self::GROUP_ADMIN_WRITE])]
public ?string $internalNotes = null;
```

#### Validation

Use Symfony Validator constraints:

```php
use Symfony\Component\Validator\Constraints as Assert;

#[Assert\NotBlank(groups: [self::GROUP_ADMIN_WRITE])]
#[Assert\Length(min: 2, max: 50, groups: [self::GROUP_ADMIN_WRITE])]
public string $code;

#[Assert\NotNull(groups: [self::GROUP_ADMIN_WRITE])]
#[Assert\Positive(groups: [self::GROUP_ADMIN_WRITE])]
public float $price;

#[Assert\Email(groups: [self::GROUP_ADMIN_WRITE])]
public ?string $email = null;
```

#### TableMap Connection

The `getPropelRelatedTableMap()` method links the resource to its Propel model:

```php
public static function getPropelRelatedTableMap(): ?TableMap
{
    return new MyProjectItemTableMap();
}
```

## Creating a Translatable Resource

For entities with multi-language support:

### Step 1: Schema with i18n Behavior

**Config/schema.xml**:
```xml
<table name="my_project_content" namespace="MyProject\Model">
    <column name="id" primaryKey="true" required="true" type="INTEGER" autoIncrement="true"/>
    <column name="code" type="VARCHAR" size="50" required="true"/>
    <column name="visible" type="BOOLEAN" default="1"/>
    <column name="created_at" type="TIMESTAMP"/>
    <column name="updated_at" type="TIMESTAMP"/>

    <behavior name="timestampable"/>
    <behavior name="i18n">
        <parameter name="i18n_columns" value="title, description, chapo"/>
    </behavior>
</table>
```

### Step 2: Create the I18n Resource

**Api/Resource/MyProjectContentI18n.php**:
```php
<?php

declare(strict_types=1);

namespace MyProject\Api\Resource;

use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Thelia\Api\Resource\I18n;

class MyProjectContentI18n extends I18n
{
    #[Groups([
        MyProjectContent::GROUP_ADMIN_READ,
        MyProjectContent::GROUP_ADMIN_WRITE,
        MyProjectContent::GROUP_FRONT_READ,
    ])]
    #[Assert\NotBlank(groups: [MyProjectContent::GROUP_ADMIN_WRITE])]
    public ?string $title = null;

    #[Groups([
        MyProjectContent::GROUP_ADMIN_READ,
        MyProjectContent::GROUP_ADMIN_WRITE,
        MyProjectContent::GROUP_FRONT_READ,
    ])]
    public ?string $chapo = null;

    #[Groups([
        MyProjectContent::GROUP_ADMIN_READ,
        MyProjectContent::GROUP_ADMIN_WRITE,
        MyProjectContent::GROUP_FRONT_READ,
    ])]
    public ?string $description = null;
}
```

### Step 3: Create the Main Resource

**Api/Resource/MyProjectContent.php**:
```php
<?php

declare(strict_types=1);

namespace MyProject\Api\Resource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use MyProject\Model\Map\MyProjectContentTableMap;
use Propel\Runtime\Map\TableMap;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Thelia\Api\Resource\AbstractTranslatableResource;
use Thelia\Api\Resource\I18nCollection;
use Thelia\Api\Resource\PropelResourceTrait;

#[ApiResource(
    operations: [
        new Post(uriTemplate: '/admin/my_project_contents'),
        new GetCollection(uriTemplate: '/admin/my_project_contents'),
        new Get(uriTemplate: '/admin/my_project_contents/{id}'),
        new Put(uriTemplate: '/admin/my_project_contents/{id}'),
        new Delete(uriTemplate: '/admin/my_project_contents/{id}'),
        new GetCollection(uriTemplate: '/front/my_project_contents'),
        new Get(uriTemplate: '/front/my_project_contents/{id}'),
    ],
    normalizationContext: ['groups' => [self::GROUP_ADMIN_READ]],
    denormalizationContext: ['groups' => [self::GROUP_ADMIN_WRITE]],
)]
class MyProjectContent extends AbstractTranslatableResource
{
    use PropelResourceTrait;

    public const GROUP_ADMIN_READ = 'admin:my_project_content:read';
    public const GROUP_ADMIN_WRITE = 'admin:my_project_content:write';
    public const GROUP_FRONT_READ = 'front:my_project_content:read';

    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_FRONT_READ])]
    public ?int $id = null;

    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE, self::GROUP_FRONT_READ])]
    #[Assert\NotBlank(groups: [self::GROUP_ADMIN_WRITE])]
    public string $code;

    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE])]
    public bool $visible = true;

    // I18n translations
    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE, self::GROUP_FRONT_READ])]
    public I18nCollection $i18ns;

    public static function getI18nResourceClass(): string
    {
        return MyProjectContentI18n::class;
    }

    public static function getPropelRelatedTableMap(): ?TableMap
    {
        return new MyProjectContentTableMap();
    }
}
```

### API Response Format

```json
{
    "id": 1,
    "code": "example",
    "visible": true,
    "i18ns": {
        "en_US": {
            "locale": "en_US",
            "title": "Example Title",
            "chapo": "Short description",
            "description": "Full description..."
        },
        "fr_FR": {
            "locale": "fr_FR",
            "title": "Titre Exemple",
            "chapo": "Description courte",
            "description": "Description complète..."
        }
    }
}
```

## Adding Filters

Add API Platform filters for searching and filtering:

```php
use ApiPlatform\Doctrine\Orm\Filter\BooleanFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;

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

## Relationships

### One-to-Many

```php
use Symfony\Component\Serializer\Annotation\Groups;

#[Groups([self::GROUP_ADMIN_READ])]
public ?int $categoryId = null;

#[Groups([self::GROUP_ADMIN_READ])]
public ?Category $category = null;
```

### Many-to-Many

```php
use Thelia\Api\Resource\Product;

/** @var Product[] */
#[Groups([self::GROUP_ADMIN_READ])]
public array $products = [];
```

## Custom State Providers

For complex data fetching, create custom providers:

```php
<?php

declare(strict_types=1);

namespace MyProject\Api\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use MyProject\Api\Resource\MyProjectItem;
use MyProject\Model\MyProjectItemQuery;

final class MyProjectItemProvider implements ProviderInterface
{
    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        if (isset($uriVariables['id'])) {
            // Single item
            $model = MyProjectItemQuery::create()->findPk($uriVariables['id']);

            if (!$model) {
                return null;
            }

            return $this->toResource($model);
        }

        // Collection with custom logic
        $query = MyProjectItemQuery::create()
            ->filterByIsActive(true)
            ->orderByCreatedAt('DESC');

        $resources = [];
        foreach ($query->find() as $model) {
            $resources[] = $this->toResource($model);
        }

        return $resources;
    }

    private function toResource($model): MyProjectItem
    {
        $resource = new MyProjectItem();
        $resource->id = $model->getId();
        $resource->code = $model->getCode();
        $resource->price = $model->getPrice();
        $resource->isActive = $model->getIsActive();

        return $resource;
    }
}
```

Register the provider:

```php
#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/front/my_project_items',
            provider: MyProjectItemProvider::class,
        ),
    ],
)]
```

## Best Practices

### Do

- **Separate admin and front endpoints** with different serialization groups
- **Validate input data** using Symfony constraints
- **Use meaningful group names** following the pattern `{context}:{resource}:{operation}`
- **Document your API** with descriptions on operations

### Don't

- **Don't expose sensitive data** on front endpoints
- **Don't skip validation** on admin write operations
- **Don't create resources without proper TableMap** implementation
- **Don't mix concerns** - keep resources focused on data representation
