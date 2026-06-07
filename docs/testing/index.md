---
title: Testing
sidebar_position: 1
---

# Testing

Thelia ships a testing infrastructure built on PHPUnit. It boots a real Symfony kernel, wraps each test in a Propel transaction that is rolled back automatically, and provides a fixture factory so you create test data without writing SQL.

Tests run against a dedicated test database (`test`), never your dev or demo data.

## Run the tests

Use the Composer scripts. They unset any shell-injected `DATABASE_*` variables and pin `APP_ENV=test`, so `.env.test` always wins and the test database is used.

```bash
# Prepare the test database, then run all 5 suites
ddev exec composer test
```

`composer test` runs `test:prepare` first, then each suite in order. To run a single suite:

```bash
ddev exec composer test:unit
ddev exec composer test:integration
ddev exec composer test:api
ddev exec composer test:http-flexy
ddev exec composer test:http-backoffice
```

To (re)prepare the test database on its own, after a schema change or on a fresh checkout:

```bash
ddev exec composer test:prepare
```

Each script calls PHPUnit with the matching test suite:

```bash
./vendor/bin/phpunit --testsuite unit
```

:::note
The Composer scripts wrap PHPUnit with `env -u DATABASE_HOST -u DATABASE_PORT -u DATABASE_NAME -u DATABASE_USER -u DATABASE_PASSWORD APP_ENV=test`. This matters under DDEV, where `DATABASE_*` are injected into the shell environment and would otherwise override `.env.test`. Prefer the Composer scripts over calling `./vendor/bin/phpunit` directly.
:::

As a guideline the suite currently holds around 706 tests across the 5 suites. The source of truth is always the output of `composer test`.

## Test suites

The suites are declared in `phpunit.xml.dist`. Each maps to a directory under `tests/`.

| Suite | Directory | Covers |
|-------|-----------|--------|
| `unit` | `tests/Unit/` | Pure logic. No database, no kernel boot required. |
| `integration` | `tests/Integration/` | Full stack: booted kernel, Propel database, event flow. |
| `api` | `tests/Api/` | API Platform endpoints with JWT authentication and JSON-LD assertions. |
| `http-flexy` | `tests/Http/Flexy/` | Front-office HTTP requests against the Flexy Twig theme. |
| `http-backoffice` | `tests/Http/BackOffice/` | Back-office HTTP requests against the default-twig bundle. |

Each suite has a matching base class:

- `unit`: plain `PHPUnit\Framework\TestCase`.
- `integration`: `Thelia\Test\IntegrationTestCase`.
- `api`: `Thelia\Test\ApiTestCase`.
- `http-flexy` and `http-backoffice`: `Thelia\Test\WebIntegrationTestCase`.

## Write an integration test

Extend `IntegrationTestCase` for tests that need the database and the event-driven flow:

```php
// tests/Integration/Catalog/ProductCreationTest.php
<?php

declare(strict_types=1);

namespace Thelia\Tests\Integration\Catalog;

use Thelia\Test\FixtureFactory;
use Thelia\Test\IntegrationTestCase;

final class ProductCreationTest extends IntegrationTestCase
{
    private FixtureFactory $factory;

    protected function setUp(): void
    {
        parent::setUp(); // boots kernel, starts the transaction

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

Every test runs inside a database transaction that is rolled back in `tearDown()`. No test leaks data into another, and you never write manual cleanup.

:::caution Never hardcode IDs
Auto-increment values are not rolled back by the transaction. A row inserted in one test still bumps the sequence for the next. Read IDs from the objects the factory returns; never assume a product will get id `1`.
:::

### `IntegrationTestCase`

**Location:** `core/lib/Thelia/Test/IntegrationTestCase.php`. It extends `Symfony\Bundle\FrameworkBundle\Test\KernelTestCase`.

`setUp()` does, in order:

1. Boots the Symfony kernel.
2. Calls `TheliaKernel::isInstalled()` and skips the test if the test database is not installed (so missing `bin/test-prepare` produces a clear skip, not a fatal error).
3. Initializes the `Translator` and `URL` singletons that legacy business code reads statically.
4. Pushes a minimal `Request` (with a `Session`) onto the request stack so listeners reading the request don't crash.
5. If `$useTransaction` is `true`, opens the `TheliaMain` Propel connection and starts a transaction. It also calls `Propel::disableInstancePooling()` so reads always hit the database.

`tearDown()` rolls the transaction back when `$useTransaction` is `true`.

Helper methods available to your tests:

| Method | Returns | Purpose |
|--------|---------|---------|
| `getService(string $id)` | `object` | Typed access to a container service by id (use the FQCN). |
| `getPropelConnection()` | `ConnectionInterface` | The raw `TheliaMain` Propel connection. |
| `createFixtureFactory()` | `FixtureFactory` | A factory bound to that connection. |

#### Opting out of transactions

DDL statements (such as `TRUNCATE` or `ALTER`) cannot be rolled back. For those tests, disable the transaction wrapper and clean up yourself:

```php
protected bool $useTransaction = false;
```

## Write an API test

Extend `ApiTestCase` for API Platform endpoints. It builds on `WebIntegrationTestCase` (a real HTTP client with transaction rollback) and composes JWT login helpers and JSON-LD assertion traits.

```php
// tests/Api/Catalog/ProductApiTest.php
<?php

declare(strict_types=1);

namespace Thelia\Tests\Api\Catalog;

use Thelia\Test\ApiTestCase;

final class ProductApiTest extends ApiTestCase
{
    public function testListProductsAsAdmin(): void
    {
        $token = $this->authenticateAsAdmin();

        $response = $this->jsonRequest('GET', '/api/admin/products', token: $token);

        self::assertJsonResponseSuccessful($response);
        self::assertHydraTotalItems(0, $response);
    }
}
```

**Location:** `core/lib/Thelia/Test/ApiTestCase.php`.

`jsonRequest()` is the single entry point for API calls:

```php
protected function jsonRequest(
    string $method,
    string $uri,
    array $payload = [],
    ?string $token = null,
    string $format = 'jsonld',
): Response
```

It sets the `Content-Type` and `Accept` headers from `$format` (`jsonld`, `json` or `merge-patch+json`), attaches the `Bearer` token when one is passed, and JSON-encodes `$payload` as the request body.

`ApiTestCase` composes three traits from `core/lib/Thelia/Test/Trait/`:

| Trait | Provides |
|-------|----------|
| `LogsInAsAdmin` | `authenticateAsAdmin()` (real `POST /api/admin/login`, returns a JWT) and `loginAsAdminInSession()`. |
| `LogsInAsCustomer` | `authenticateAsCustomer()` (real `POST /api/front/login`) and `loginAsCustomerInSession()`. |
| `AssertsJsonApi` | `assertJsonResponseSuccessful()`, `assertHydraTotalItems()`, `assertJsonCollectionHasCount()`, `assertResourceId()`. |

:::tip Propel assertions
A fourth trait, `PropelAssertions`, lives next to these. It exposes `assertRowExists()`, `assertRowDeleted()`, `assertRowCount()` and `assertI18nValue()`. It is not composed into `ApiTestCase` by default. Add `use` for it in your own test class when you need to assert directly against the database.
:::

## FixtureFactory

**Location:** `core/lib/Thelia/Test/FixtureFactory.php`.

The factory creates test entities through Propel models, so every write goes through the test transaction and is rolled back automatically. A static counter (`N` below) guarantees unique values across the whole run.

Two families of methods:

- **Reference entities** use *find-or-create*: called with no overrides they reuse seeded data when it exists, otherwise they create a row.
- **Other entities** always create a new row.

Every method takes an optional `array $overrides = []` as its last argument. Methods with hard dependencies (a product needs a category, a tax rule and a currency) take them as explicit typed parameters before the overrides.

```php
$factory = $this->createFixtureFactory();

// Reference entities (reused if already seeded)
$currency = $factory->currency();
$taxRule = $factory->taxRule();

// Business entity with explicit dependencies, then overrides
$category = $factory->category();
$product = $factory->product($category, $taxRule, $currency, [
    'ref' => 'CUSTOM-REF',
    'basePrice' => 29.99,
]);
```

### Available methods

| Method | Signature (after the explicit dependencies) |
|--------|---------------------------------------------|
| `lang` | `lang(array $overrides = [])` |
| `currency` | `currency(array $overrides = [])` |
| `customerTitle` | `customerTitle(array $overrides = [])` |
| `country` | `country(array $overrides = [])` |
| `taxRule` | `taxRule(array $overrides = [])` |
| `category` | `category(array $overrides = [])` |
| `product` | `product(Category $category, TaxRule $taxRule, Currency $currency, array $overrides = [])` |
| `customer` | `customer(CustomerTitle $title, array $overrides = [])` |
| `admin` | `admin(array $overrides = [])` |
| `address` | `address(Customer $customer, ?Country $country = null, ?CustomerTitle $title = null, array $overrides = [])` |
| `brand` | `brand(array $overrides = [])` |
| `folder` | `folder(int $parent = 0, array $overrides = [])` |
| `content` | `content(Folder $folder, array $overrides = [])` |
| `attribute` | `attribute(array $overrides = [])` |
| `attributeAv` | `attributeAv(Attribute $attribute, array $overrides = [])` |
| `feature` | `feature(array $overrides = [])` |
| `featureAv` | `featureAv(Feature $feature, array $overrides = [])` |
| `tax` | `tax(array $overrides = [])` |
| `orderStatus` | `orderStatus(array $overrides = [])` |
| `orderAddress` | `orderAddress(?Country $country = null, ?CustomerTitle $title = null, array $overrides = [])` |
| `coupon` | `coupon(array $overrides = [])` |
| `profile` | `profile(array $overrides = [])` |
| `productSaleElement` | `productSaleElement(Product $product, array $overrides = [])` |
| `cart` | `cart(?Customer $customer = null, array $overrides = [])` |
| `order` | `order(?Customer $customer = null, array $overrides = [])` |

:::note
`productSaleElement()` creates an additional PSE. `product()` already creates the default sale element and its price through `Product::create()`, so never call `productSaleElement()` for the default one.

`order()` builds a minimal order with its mandatory dependencies (customer, invoice and delivery addresses, cart, payment and delivery modules) and puts it in the `not_paid` status. It does not add products, so create your own `OrderProduct` rows when a test needs revenue.
:::

## How the test database is prepared

`bin/test-prepare` builds a clean test database without booting the Symfony kernel for the database and module work. The Composer script `test:prepare` runs it, then warms the test cache.

It performs the following:

1. Forces `APP_ENV=test` and unsets any inherited `DATABASE_*` so `.env.test` is read. The test database is `DATABASE_NAME=test`, on host `db`, never your dev `db` database.
2. Validates `DATABASE_HOST` / `DATABASE_NAME`, then creates the database if it is missing.
3. Applies the core Propel schema and seed data via `DatabaseSetup`.
4. Registers the installed modules and applies their SQL.
5. Wipes `var/propel/test/` so the Propel runtime regenerates with the correct DSN. A stale cache here is the usual cause of tests hitting the wrong database.
6. Runs `module:post-activate-all` so modules that create their tables in `postActivation()` (for example `CustomDelivery`, `ShortCode`) get them in the test database.
7. Generates the JWT key pair with `lexik:jwt:generate-keypair --skip-if-exists`, required by the `/api/admin/login` and `/api/front/login` endpoints the API tests use.

It does not set templates, create an admin, or import demo data. It is the minimal setup a test run needs.

:::caution Stale Propel cache
If tests suddenly hit the wrong database after switching branches or environments, delete `var/propel/test/` and re-run `composer test:prepare`. Step 5 above does this automatically, but a manual run is the quickest fix when a cache survives.
:::

## Best practices

- Use the factory for all test data, and avoid raw SQL inserts.
- Never hardcode IDs. Auto-increment values are not deterministic across tests.
- Keep tests independent. Each test sets up its own data.
- Use `getService()` with a FQCN rather than reaching into the container directly.
- Run the full `composer test` before reporting. A suite green in isolation does not prove non-regression across the shared database state.

## Learn more

- [Modules](../modules/index.md): the event-driven flow your integration tests exercise.
- [API reference](../api/index.md): the endpoints your API tests call.
