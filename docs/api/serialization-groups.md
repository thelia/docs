---
title: Serialization Groups
sidebar_position: 6
---

# Serialization Groups

Serialization groups control which fields are included in API responses and accepted in requests. This allows the same resource to expose different data for different contexts.

## Group Naming Convention

Thelia uses a consistent naming pattern:

```
{context}:{resource}:{operation}
```

Examples:
- `admin:product:read` - Admin reading product data
- `admin:product:write` - Admin writing product data
- `front:product:read` - Public front-office reading
- `front:product:read:single` - Front-office single item (more detail)

## Standard Groups

### Admin Groups

| Group | Purpose |
|-------|---------|
| `admin:*:read` | Admin collection and item reads |
| `admin:*:read:single` | Additional fields for single item |
| `admin:*:write` | Admin create/update operations |
| `admin:*:write:update` | Additional fields for updates only |

### Front Groups

| Group | Purpose |
|-------|---------|
| `front:*:read` | Public collection and item reads |
| `front:*:read:single` | Additional fields for single item |
| `front:*:write` | Public write operations (if any) |

## Defining Groups on Resources

### Resource Constants

Define groups as class constants:

```php
class Product extends AbstractTranslatableResource
{
    public const GROUP_ADMIN_READ = 'admin:product:read';
    public const GROUP_ADMIN_READ_SINGLE = 'admin:product:read:single';
    public const GROUP_ADMIN_WRITE = 'admin:product:write';
    public const GROUP_ADMIN_WRITE_UPDATE = 'admin:product:write:update';
    public const GROUP_FRONT_READ = 'front:product:read';
    public const GROUP_FRONT_READ_SINGLE = 'front:product:read:single';

    // ...
}
```

### Applying Groups to Properties

```php
// Always visible to admin
#[Groups([self::GROUP_ADMIN_READ])]
public ?int $id = null;

// Visible to admin and front
#[Groups([self::GROUP_ADMIN_READ, self::GROUP_FRONT_READ])]
public string $ref;

// Writable by admin only
#[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE])]
public bool $visible;

// Only in single item responses (not collections)
#[Groups([self::GROUP_ADMIN_READ_SINGLE, self::GROUP_FRONT_READ_SINGLE])]
public array $featureProducts = [];

// Only writable during updates (not create)
#[Groups([self::GROUP_ADMIN_WRITE_UPDATE])]
public ?\DateTime $updatedAt = null;
```

## Applying Groups to Operations

### Normalization Context (Output)

```php
#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/admin/products',
            normalizationContext: ['groups' => ['admin:product:read']],
        ),
        new Get(
            uriTemplate: '/admin/products/{id}',
            normalizationContext: ['groups' => [
                'admin:product:read',
                'admin:product:read:single',
            ]],
        ),
    ],
)]
```

### Denormalization Context (Input)

```php
#[ApiResource(
    operations: [
        new Post(
            uriTemplate: '/admin/products',
            denormalizationContext: ['groups' => ['admin:product:write']],
        ),
        new Put(
            uriTemplate: '/admin/products/{id}',
            denormalizationContext: ['groups' => [
                'admin:product:write',
                'admin:product:write:update',
            ]],
        ),
    ],
)]
```

## Practical Examples

### Collection vs Single Item

```php
class Product extends AbstractTranslatableResource
{
    // Included in collection AND single
    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_FRONT_READ])]
    public ?int $id = null;

    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_FRONT_READ])]
    public string $ref;

    // ONLY in single item (reduces collection payload)
    #[Groups([self::GROUP_ADMIN_READ_SINGLE, self::GROUP_FRONT_READ_SINGLE])]
    public array $featureProducts = [];

    #[Groups([self::GROUP_ADMIN_READ_SINGLE])]
    public array $images = [];
}
```

**Collection response (JSON, default):**
```json
[
    {"id": 1, "ref": "PROD-001"},
    {"id": 2, "ref": "PROD-002"}
]
```

**Single item response:**
```json
{
    "id": 1,
    "ref": "PROD-001",
    "featureProducts": [...],
    "images": [...]
}
```

### Admin vs Front

```php
class Customer extends AbstractTranslatableResource
{
    // Visible everywhere
    #[Groups([
        self::GROUP_ADMIN_READ,
        self::GROUP_FRONT_READ,
    ])]
    public ?int $id = null;

    // Admin only - sensitive data
    #[Groups([self::GROUP_ADMIN_READ])]
    public string $email;

    // Admin only - internal notes
    #[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE])]
    public ?string $internalNotes = null;

    // Public profile
    #[Groups([
        self::GROUP_ADMIN_READ,
        self::GROUP_FRONT_READ,
    ])]
    public string $firstname;
}
```

### Create vs Update

```php
class Product extends AbstractTranslatableResource
{
    // Writable on create and update
    #[Groups([self::GROUP_ADMIN_WRITE])]
    public string $ref;

    // Only settable on create (not updateable)
    #[Groups([self::GROUP_ADMIN_WRITE])]
    // Note: Use validation to prevent updates
    public int $creatorId;

    // Only on updates
    #[Groups([self::GROUP_ADMIN_WRITE_UPDATE])]
    public bool $forceReindex = false;
}
```

## Cross-Resource Groups

Sometimes you need to include related resource data:

```php
class OrderProduct
{
    public const GROUP_ADMIN_READ = 'admin:order_product:read';

    #[Groups([
        self::GROUP_ADMIN_READ,
        Order::GROUP_ADMIN_READ,  // Also include when reading Order
    ])]
    public ?int $id = null;
}

class Order
{
    #[Relation(targetResource: OrderProduct::class)]
    #[Groups([self::GROUP_ADMIN_READ_SINGLE])]
    public array $orderProducts = [];
}
```

## Validation Groups

Validation can be tied to serialization groups:

```php
use Symfony\Component\Validator\Constraints\NotBlank;

#[NotBlank(groups: [self::GROUP_ADMIN_WRITE])]
#[Groups([self::GROUP_ADMIN_READ, self::GROUP_ADMIN_WRITE])]
public string $ref;
```

## Best Practices

### 1. Minimize Collection Payload

Only include essential fields in collections:

```php
// Good: Collections are lean
#[Groups([self::GROUP_ADMIN_READ])]
public ?int $id = null;

#[Groups([self::GROUP_ADMIN_READ])]
public string $ref;

// Heavy data only in single
#[Groups([self::GROUP_ADMIN_READ_SINGLE])]
public array $allRelatedData = [];
```

### 2. Separate Admin and Front

Never expose admin-only data to front:

```php
// Bad: Admin data exposed to front
#[Groups([self::GROUP_ADMIN_READ, self::GROUP_FRONT_READ])]
public ?string $internalNotes = null;

// Good: Admin only
#[Groups([self::GROUP_ADMIN_READ])]
public ?string $internalNotes = null;
```

### 3. Use Constants

Always use constants for maintainability:

```php
// Good
#[Groups([self::GROUP_ADMIN_READ, self::GROUP_FRONT_READ])]

// Bad (typos, inconsistency)
#[Groups(['admin:product:read', 'front:product:read'])]
```

### 4. Document Special Groups

Comment non-obvious group usage:

```php
/**
 * Only included when viewing from Order context.
 */
#[Groups([
    self::GROUP_ADMIN_READ,
    Order::GROUP_ADMIN_READ_SINGLE, // Include in order details
])]
public array $details = [];
```

## Debugging Groups

Check which groups are active:

```php
// In a custom normalizer or listener
$context['groups'] // Contains active groups
```

Use API Platform's Swagger/OpenAPI documentation to verify field visibility.

## Next Steps

- [Filters](./filters) - Query and filter API data
- [Resources](./resources) - Creating API resources
- [Addons](./addons) - Extending resources
