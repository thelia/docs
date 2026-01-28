---
title: Translatable Resources
sidebar_position: 4
---

# Translatable Resources

Many e-commerce entities (products, categories, content) require multilingual support. Thelia provides `AbstractTranslatableResource` for resources with i18n data.

## AbstractTranslatableResource

Extend this class instead of implementing `PropelResourceInterface` directly:

```php
use Thelia\Api\Resource\AbstractTranslatableResource;

class Product extends AbstractTranslatableResource
{
    // Resource properties...

    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE])]
    public I18nCollection $i18ns;

    public static function getI18nResourceClass(): string
    {
        return ProductI18n::class;
    }

    public static function getPropelRelatedTableMap(): ?TableMap
    {
        return new ProductTableMap();
    }
}
```

## I18nCollection

The `I18nCollection` holds translations for all locales:

```php
#[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE, self::GROUP_FRONT_READ])]
public I18nCollection $i18ns;
```

### JSON Structure

```json
{
    "id": 1,
    "ref": "PROD-001",
    "i18ns": {
        "en_US": {
            "title": "Product Title",
            "description": "Product description in English",
            "chapo": "Short description",
            "postscriptum": "Additional notes"
        },
        "fr_FR": {
            "title": "Titre du produit",
            "description": "Description du produit en français",
            "chapo": "Description courte",
            "postscriptum": "Notes additionnelles"
        }
    }
}
```

## Creating the I18n Resource

Each translatable resource needs a corresponding I18n resource:

```php
<?php

declare(strict_types=1);

namespace MyModule\Api\Resource;

use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints\NotBlank;
use Thelia\Api\Resource\I18n;

class ProductReviewI18n extends I18n
{
    #[Groups([
        ProductReview::GROUP_ADMIN_READ,
        ProductReview::GROUP_ADMIN_WRITE,
        ProductReview::GROUP_FRONT_READ,
        ProductReview::GROUP_FRONT_WRITE,
    ])]
    #[NotBlank(groups: [ProductReview::GROUP_ADMIN_WRITE])]
    public ?string $title = null;

    #[Groups([
        ProductReview::GROUP_ADMIN_READ,
        ProductReview::GROUP_ADMIN_WRITE,
        ProductReview::GROUP_FRONT_READ,
        ProductReview::GROUP_FRONT_WRITE,
    ])]
    public ?string $content = null;
}
```

## Complete Example

### Main Resource

```php
<?php

declare(strict_types=1);

namespace MyModule\Api\Resource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use Propel\Runtime\Map\TableMap;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints\NotBlank;
use Thelia\Api\Bridge\Propel\Validator\I18nConstraint;
use Thelia\Api\Resource\AbstractTranslatableResource;
use Thelia\Api\Resource\I18nCollection;
use MyModule\Model\Map\FaqItemTableMap;

#[ApiResource(
    operations: [
        new Post(uriTemplate: '/admin/faq_items'),
        new GetCollection(uriTemplate: '/admin/faq_items'),
        new Get(uriTemplate: '/admin/faq_items/{id}'),
        new Put(uriTemplate: '/admin/faq_items/{id}'),
        new Delete(uriTemplate: '/admin/faq_items/{id}'),
    ],
    normalizationContext: ['groups' => [self::GROUP_ADMIN_READ]],
    denormalizationContext: ['groups' => [self::GROUP_ADMIN_WRITE]],
)]
#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/front/faq_items'),
        new Get(uriTemplate: '/front/faq_items/{id}'),
    ],
    normalizationContext: ['groups' => [self::GROUP_FRONT_READ]],
)]
class FaqItem extends AbstractTranslatableResource
{
    public const GROUP_ADMIN_READ = 'admin:faq_item:read';
    public const GROUP_ADMIN_WRITE = 'admin:faq_item:write';
    public const GROUP_FRONT_READ = 'front:faq_item:read';

    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_FRONT_READ])]
    public ?int $id = null;

    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE])]
    public ?int $position = null;

    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE])]
    public bool $visible = true;

    #[I18nConstraint(groups: [self::GROUP_ADMIN_WRITE])]
    #[Groups([
        self::GROUP_ADMIN_READ,
        self::GROUP_ADMIN_WRITE,
        self::GROUP_FRONT_READ,
    ])]
    public I18nCollection $i18ns;

    public static function getI18nResourceClass(): string
    {
        return FaqItemI18n::class;
    }

    public static function getPropelRelatedTableMap(): ?TableMap
    {
        return new FaqItemTableMap();
    }
}
```

### I18n Resource

```php
<?php

declare(strict_types=1);

namespace MyModule\Api\Resource;

use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints\NotBlank;
use Thelia\Api\Resource\I18n;

class FaqItemI18n extends I18n
{
    #[Groups([
        FaqItem::GROUP_ADMIN_READ,
        FaqItem::GROUP_ADMIN_WRITE,
        FaqItem::GROUP_FRONT_READ,
    ])]
    #[NotBlank(groups: [FaqItem::GROUP_ADMIN_WRITE])]
    public ?string $question = null;

    #[Groups([
        FaqItem::GROUP_ADMIN_READ,
        FaqItem::GROUP_ADMIN_WRITE,
        FaqItem::GROUP_FRONT_READ,
    ])]
    #[NotBlank(groups: [FaqItem::GROUP_ADMIN_WRITE])]
    public ?string $answer = null;
}
```

## I18nConstraint

Validate required locales:

```php
use Thelia\Api\Bridge\Propel\Validator\I18nConstraint;

#[I18nConstraint(groups: [self::GROUP_ADMIN_WRITE])]
public I18nCollection $i18ns;
```

This ensures at least one locale has the required fields filled.

## Accessing Translations via DataAccessService

When using `DataAccessService::resources()` (in PHP or via the `resources()` Twig function), the `i18ns` property is **automatically flattened** to the current locale.

:::important
The DataAccessService always returns translations for the **current locale only**. You cannot access other locales via this method.
:::

### In Twig

```twig
{% set product = resources('/api/front/products/' ~ productId) %}

{# Translations are flattened to current locale #}
<h1>{{ product.i18ns.title }}</h1>
<p>{{ product.i18ns.description }}</p>
<p>{{ product.i18ns.chapo }}</p>
```

The returned structure is:

```json
{
    "id": 1,
    "ref": "PROD-001",
    "i18ns": {
        "title": "Product Title",
        "description": "Product description...",
        "chapo": "Short description"
    }
}
```

**Not** a multi-locale structure like the raw API returns.

### In PHP

```php
$product = $this->dataAccessService->resources('/api/front/products/1');

// Access current locale (already flattened)
$title = $product['i18ns']['title'];
$description = $product['i18ns']['description'];
```

## Accessing All Locales (Raw API)

If you need access to all translations, use the HTTP API directly or call the API with appropriate headers:

```http
GET /api/admin/products/1
Accept: application/json
```

Response includes all locales:

```json
{
    "id": 1,
    "ref": "PROD-001",
    "i18ns": {
        "en_US": {
            "title": "Product Title",
            "description": "Product description in English"
        },
        "fr_FR": {
            "title": "Titre du produit",
            "description": "Description du produit en français"
        }
    }
}
```

## Propel I18n Table

Your Propel schema should include an i18n table:

```xml
<table name="faq_item">
    <column name="id" type="INTEGER" primaryKey="true" autoIncrement="true"/>
    <column name="position" type="INTEGER"/>
    <column name="visible" type="BOOLEAN" default="true"/>
</table>

<table name="faq_item_i18n">
    <column name="id" type="INTEGER" primaryKey="true"/>
    <column name="locale" type="VARCHAR" size="5" primaryKey="true"/>
    <column name="question" type="CLOB"/>
    <column name="answer" type="CLOB"/>
    <foreign-key foreignTable="faq_item" onDelete="CASCADE">
        <reference local="id" foreign="id"/>
    </foreign-key>
</table>
```

## Core Translatable Resources

Thelia provides these translatable resources:

| Resource | I18n Fields |
|----------|-------------|
| `Product` | title, description, chapo, postscriptum |
| `Category` | title, description, chapo, postscriptum |
| `Content` | title, description, chapo, postscriptum |
| `Folder` | title, description, chapo, postscriptum |
| `Brand` | title, description, chapo |
| `Feature` | title |
| `FeatureAv` | title |
| `Attribute` | title |
| `AttributeAv` | title |

## Best Practices

1. **Keep i18n fields in separate class** - Cleaner organization
2. **Validate required locales** - Use `I18nConstraint`
3. **Include i18ns in all read groups** - Users need translations
4. **Handle missing translations** - Provide fallbacks

## Next Steps

- [Resources](./resources) - Basic resource creation
- [Addons](./addons) - Extending resources
- [Serialization Groups](./serialization-groups) - Controlling visibility
