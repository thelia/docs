---
title: Testing
sidebar_position: 1
---

# Testing

Thelia provides a testing infrastructure built on PHPUnit with Propel-aware integration testing, automatic transaction rollback, and a fixture factory for creating test data.

## Quick Start

```bash
# Prepare the test database (run once, or after schema changes)
ddev exec APP_ENV=test php bin/test-prepare

# Run all tests
ddev exec APP_ENV=test php ./vendor/bin/phpunit

# Run a specific suite
ddev exec APP_ENV=test php ./vendor/bin/phpunit --testsuite functional
ddev exec APP_ENV=test php ./vendor/bin/phpunit --testsuite unit
```

## Test Suites

| Suite | Directory | Purpose |
|-------|-----------|---------|
| `unit` | `tests/Unit/` | Pure logic, no database |
| `functional` | `tests/Functional/` | Full stack with database |

## Writing a Functional Test

Extend `IntegrationTestCase` for tests that need the database:

```php
<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Thelia\Test\FixtureFactory;
use Thelia\Test\IntegrationTestCase;

final class ProductWorkflowTest extends IntegrationTestCase
{
    private EventDispatcherInterface $dispatcher;
    private FixtureFactory $factory;

    protected function setUp(): void
    {
        parent::setUp(); // boots kernel, starts transaction

        $this->dispatcher = $this->getService(EventDispatcherInterface::class);
        $this->factory = $this->createFixtureFactory();
    }

    public function testCreateProduct(): void
    {
        $category = $this->factory->category();
        $taxRule = $this->factory->taxRule();
        $currency = $this->factory->currency();

        $product = $this->factory->product($category, $taxRule, $currency);

        self::assertNotNull($product->getId());
        self::assertStringStartsWith('PROD-', $product->getRef());
    }
}
```

Every test runs inside a database transaction that is rolled back in `tearDown()`. This means:

- Tests are isolated — no test pollutes another
- No manual cleanup needed
- Auto-increment values are **not** rolled back — never hardcode IDs

## IntegrationTestCase

**Location:** `core/lib/Thelia/Test/IntegrationTestCase.php`

Extends `Symfony\Bundle\FrameworkBundle\Test\KernelTestCase`.

### What `setUp()` Does

1. Boots the Symfony kernel
2. Checks that the test database is installed (skips the test if not)
3. Initializes `Translator` and `URL` singletons
4. Pushes a `Request` onto the request stack
5. Opens a Propel connection and starts a transaction

### Helper Methods

| Method | Returns | Purpose |
|--------|---------|---------|
| `getService(string $id)` | `object` | Typed access to the service container |
| `getPropelConnection()` | `ConnectionInterface` | Raw Propel database connection |
| `createFixtureFactory()` | `FixtureFactory` | Create a factory for test data |

### Opting Out of Transactions

Some tests (DDL operations, cascade deletes) cannot run inside a transaction. Set `$useTransaction` to `false`:

```php
protected bool $useTransaction = false;
```

When transactions are disabled, you must clean up test data manually.

## FixtureFactory

**Location:** `core/lib/Thelia/Test/FixtureFactory.php`

The factory creates test entities with sensible defaults and a built-in counter for uniqueness.

### Reference Entities

These methods return an existing seeded entity when called without overrides, or create a new one:

| Method | Key Defaults |
|--------|-------------|
| `lang()` | First available language |
| `currency()` | EUR, symbol €, rate 1.0 |
| `customerTitle()` | First available title |
| `country()` | FR, isoalpha2 FR |
| `taxRule()` | Default tax rule |

### Business Entities

These always create new records:

```php
$factory = $this->createFixtureFactory();

// Category (standalone)
$category = $factory->category();
$category = $factory->category(['visible' => 0]);

// Product (requires dependencies)
$product = $factory->product($category, $taxRule, $currency);
$product = $factory->product($category, $taxRule, $currency, [
    'ref' => 'CUSTOM-REF',
    'basePrice' => 29.99,
]);

// Customer
$customer = $factory->customer($customerTitle);
$customer = $factory->customer($customerTitle, [
    'email' => 'custom@test.com',
]);

// Admin
$admin = $factory->admin();
$admin = $factory->admin(['login' => 'superadmin']);
```

### Factory Defaults

| Method | Generated Values |
|--------|-----------------|
| `product()` | ref: `PROD-N`, price: 10.0, weight: 0.0, quantity: 0 |
| `customer()` | email: `customer-N@test.com`, password: `password` |
| `admin()` | login: `admin-N`, email: `admin-N@test.com` |
| `category()` | position: auto-incremented |

The counter `N` is shared across all methods and increments globally, ensuring unique values across the entire test run.

## Test Database Setup

`bin/test-prepare` is a standalone script that prepares the test database without booting the Symfony kernel:

1. Creates the database if it does not exist
2. Applies the core schema (`thelia.sql` + `insert.sql`)
3. Registers all modules and applies their SQL schemas

It does **not** configure templates, create admin users, or import demo data — it is optimized for CI speed.

Required environment variables:

```bash
DATABASE_HOST=db
DATABASE_PORT=3306
DATABASE_NAME=db
DATABASE_USER=db
DATABASE_PASSWORD=db
```

## Best Practices

- **Use the factory** for all test data — avoid raw SQL inserts
- **Never hardcode IDs** — auto-increment values are not deterministic
- **Keep tests independent** — each test should set up its own data
- **Prefer functional tests** for anything touching events or Propel
- **Use `getService()`** instead of accessing the container directly

{/* Easter Egg #2: The FixtureFactory counter never resets within a test run. If you ever see PROD-42, know that 41 other entities were created before it. The answer to life, the universe, and everything — is test isolation. */}
