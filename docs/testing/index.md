---
title: Testing
sidebar_position: 1
---

# Testing

This guide covers testing strategies for Thelia 3 applications, including unit tests, integration tests, and API tests.

## Testing Stack

| Tool | Purpose |
|------|---------|
| PHPUnit | Unit and integration tests |
| Symfony Test Pack | Functional testing utilities |
| API Platform Test | API endpoint testing |
| Prophecy/Mockery | Mocking dependencies |

## Setup

### PHPUnit Configuration

**phpunit.xml.dist**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="vendor/autoload.php"
         colors="true"
         executionOrder="depends,defects"
         beStrictAboutOutputDuringTests="true"
         failOnRisky="true"
         failOnWarning="true">
    <php>
        <env name="APP_ENV" value="test"/>
        <env name="KERNEL_CLASS" value="Thelia\Core\Thelia"/>
    </php>
    <testsuites>
        <testsuite name="Unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="Integration">
            <directory>tests/Integration</directory>
        </testsuite>
        <testsuite name="Api">
            <directory>tests/Api</directory>
        </testsuite>
    </testsuites>
    <coverage processUncoveredFiles="true">
        <include>
            <directory suffix=".php">src</directory>
            <directory suffix=".php">local/modules</directory>
        </include>
    </coverage>
</phpunit>
```

### Directory Structure

```
tests/
├── Unit/
│   ├── Service/
│   │   └── PriceCalculatorTest.php
│   └── Model/
│       └── ProductTest.php
├── Integration/
│   ├── Repository/
│   │   └── ProductRepositoryTest.php
│   └── Service/
│       └── CartServiceTest.php
├── Api/
│   ├── ProductApiTest.php
│   └── OrderApiTest.php
└── bootstrap.php
```

## Unit Tests

Unit tests verify individual classes in isolation.

### Service Test

```php
<?php

declare(strict_types=1);

namespace MyModule\Tests\Unit\Service;

use MyModule\Service\PriceCalculator;
use PHPUnit\Framework\TestCase;

final class PriceCalculatorTest extends TestCase
{
    private PriceCalculator $calculator;

    protected function setUp(): void
    {
        $this->calculator = new PriceCalculator();
    }

    public function testCalculatePriceWithoutDiscount(): void
    {
        $result = $this->calculator->calculate(100.00, 0);

        $this->assertEquals(100.00, $result);
    }

    public function testCalculatePriceWithPercentageDiscount(): void
    {
        $result = $this->calculator->calculate(100.00, 10);

        $this->assertEquals(90.00, $result);
    }

    public function testCalculatePriceWithMaxDiscount(): void
    {
        $result = $this->calculator->calculate(100.00, 100);

        $this->assertEquals(0.00, $result);
    }

    public function testThrowsExceptionForNegativePrice(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Price cannot be negative');

        $this->calculator->calculate(-10.00, 0);
    }

    /**
     * @dataProvider discountDataProvider
     */
    public function testCalculateWithVariousDiscounts(
        float $price,
        int $discount,
        float $expected
    ): void {
        $result = $this->calculator->calculate($price, $discount);

        $this->assertEquals($expected, $result);
    }

    public static function discountDataProvider(): array
    {
        return [
            'no discount' => [100.00, 0, 100.00],
            '10% off' => [100.00, 10, 90.00],
            '25% off' => [200.00, 25, 150.00],
            '50% off' => [50.00, 50, 25.00],
        ];
    }
}
```

### Mocking Dependencies

```php
<?php

declare(strict_types=1);

namespace MyModule\Tests\Unit\Service;

use MyModule\Repository\ProductRepository;
use MyModule\Service\ProductService;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Thelia\Model\Product;

final class ProductServiceTest extends TestCase
{
    private ProductService $service;
    private MockObject&ProductRepository $repository;
    private MockObject&LoggerInterface $logger;

    protected function setUp(): void
    {
        $this->repository = $this->createMock(ProductRepository::class);
        $this->logger = $this->createMock(LoggerInterface::class);

        $this->service = new ProductService(
            $this->repository,
            $this->logger
        );
    }

    public function testGetProductReturnsProductWhenFound(): void
    {
        $product = $this->createMock(Product::class);
        $product->method('getId')->willReturn(1);
        $product->method('getRef')->willReturn('PROD-001');

        $this->repository
            ->expects($this->once())
            ->method('findById')
            ->with(1)
            ->willReturn($product);

        $result = $this->service->getProduct(1);

        $this->assertSame($product, $result);
    }

    public function testGetProductReturnsNullWhenNotFound(): void
    {
        $this->repository
            ->expects($this->once())
            ->method('findById')
            ->with(999)
            ->willReturn(null);

        $this->logger
            ->expects($this->once())
            ->method('warning')
            ->with('Product not found', ['id' => 999]);

        $result = $this->service->getProduct(999);

        $this->assertNull($result);
    }
}
```

## Integration Tests

Integration tests verify components working together.

### Repository Test

```php
<?php

declare(strict_types=1);

namespace MyModule\Tests\Integration\Repository;

use MyModule\Model\MyProjectItem;
use MyModule\Model\MyProjectItemQuery;
use MyModule\Repository\MyProjectItemRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

final class MyProjectItemRepositoryTest extends KernelTestCase
{
    private MyProjectItemRepository $repository;

    protected function setUp(): void
    {
        self::bootKernel();
        $this->repository = self::getContainer()->get(MyProjectItemRepository::class);

        // Clean test data
        MyProjectItemQuery::create()->deleteAll();
    }

    protected function tearDown(): void
    {
        MyProjectItemQuery::create()->deleteAll();
    }

    public function testSaveAndFind(): void
    {
        $item = new MyProjectItem();
        $item->setCode('TEST-001');
        $item->setIsActive(true);

        $this->repository->save($item);

        $found = $this->repository->findById($item->getId());

        $this->assertNotNull($found);
        $this->assertEquals('TEST-001', $found->getCode());
        $this->assertTrue($found->getIsActive());
    }

    public function testFindActiveItems(): void
    {
        // Create test data
        $active1 = new MyProjectItem();
        $active1->setCode('ACTIVE-1');
        $active1->setIsActive(true);
        $active1->save();

        $active2 = new MyProjectItem();
        $active2->setCode('ACTIVE-2');
        $active2->setIsActive(true);
        $active2->save();

        $inactive = new MyProjectItem();
        $inactive->setCode('INACTIVE');
        $inactive->setIsActive(false);
        $inactive->save();

        // Test
        $results = $this->repository->findActive();

        $this->assertCount(2, $results);
        $this->assertContains('ACTIVE-1', array_map(fn($i) => $i->getCode(), $results));
        $this->assertContains('ACTIVE-2', array_map(fn($i) => $i->getCode(), $results));
    }
}
```

### Service Integration Test

```php
<?php

declare(strict_types=1);

namespace MyModule\Tests\Integration\Service;

use MyModule\Service\CartService;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Thelia\Model\Cart;
use Thelia\Model\CartQuery;

final class CartServiceTest extends KernelTestCase
{
    private CartService $cartService;

    protected function setUp(): void
    {
        self::bootKernel();
        $this->cartService = self::getContainer()->get(CartService::class);
    }

    public function testAddItemToCart(): void
    {
        // Create test cart
        $cart = new Cart();
        $cart->save();

        // Add item
        $cartItem = $this->cartService->addItem($cart, 1, 2);

        // Verify
        $this->assertNotNull($cartItem);
        $this->assertEquals(2, $cartItem->getQuantity());

        // Cleanup
        $cart->delete();
    }
}
```

## API Tests

Test API endpoints with API Platform's test client.

:::note
`ApiTestCase` uses `application/ld+json` (JSON-LD) format by default. This is API Platform's test client behavior, not the API's default format.
:::

### Product API Test

```php
<?php

declare(strict_types=1);

namespace MyModule\Tests\Api;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use Thelia\Model\ProductQuery;

final class ProductApiTest extends ApiTestCase
{
    public function testGetProductCollection(): void
    {
        $response = static::createClient()->request('GET', '/api/front/products');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');

        $this->assertJsonContains([
            '@context' => '/api/contexts/Product',
            '@type' => 'hydra:Collection',
        ]);
    }

    public function testGetProduct(): void
    {
        // Get a real product ID
        $product = ProductQuery::create()
            ->filterByVisible(true)
            ->findOne();

        if (!$product) {
            $this->markTestSkipped('No visible product found');
        }

        $response = static::createClient()->request(
            'GET',
            '/api/front/products/' . $product->getId()
        );

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@type' => 'Product',
            'id' => $product->getId(),
        ]);
    }

    public function testGetProductNotFound(): void
    {
        $response = static::createClient()->request('GET', '/api/front/products/999999');

        $this->assertResponseStatusCodeSame(404);
    }
}
```

### Admin API Test with Authentication

```php
<?php

declare(strict_types=1);

namespace MyModule\Tests\Api;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use Thelia\Model\Admin;
use Thelia\Model\AdminQuery;

final class AdminProductApiTest extends ApiTestCase
{
    private ?string $token = null;

    protected function setUp(): void
    {
        // Get admin for authentication
        $admin = AdminQuery::create()->findOne();

        if (!$admin) {
            $this->markTestSkipped('No admin user found');
        }

        // Authenticate and get token
        $response = static::createClient()->request('POST', '/api/login', [
            'json' => [
                'username' => $admin->getLogin(),
                'password' => 'admin_password', // Use test password
            ],
        ]);

        $data = $response->toArray();
        $this->token = $data['token'] ?? null;
    }

    public function testCreateProduct(): void
    {
        if (!$this->token) {
            $this->markTestSkipped('Authentication failed');
        }

        $response = static::createClient()->request('POST', '/api/admin/products', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->token,
            ],
            'json' => [
                'ref' => 'TEST-' . uniqid(),
                'visible' => true,
                'i18ns' => [
                    'en_US' => [
                        'title' => 'Test Product',
                        'description' => 'Test description',
                    ],
                ],
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            '@type' => 'Product',
            'visible' => true,
        ]);
    }

    public function testUnauthorizedAccess(): void
    {
        $response = static::createClient()->request('POST', '/api/admin/products', [
            'json' => [
                'ref' => 'TEST-UNAUTH',
            ],
        ]);

        $this->assertResponseStatusCodeSame(401);
    }
}
```

## Testing LiveComponents

```php
<?php

declare(strict_types=1);

namespace MyModule\Tests\LiveComponent;

use MyModule\LiveComponent\ProductQuantitySelector;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\UX\LiveComponent\Test\InteractsWithLiveComponents;

final class ProductQuantitySelectorTest extends KernelTestCase
{
    use InteractsWithLiveComponents;

    public function testInitialState(): void
    {
        $component = $this->createLiveComponent(
            name: 'MyModule:ProductQuantitySelector',
            data: ['productId' => 1, 'quantity' => 1]
        );

        $this->assertEquals(1, $component->component()->quantity);
    }

    public function testIncrement(): void
    {
        $component = $this->createLiveComponent(
            name: 'MyModule:ProductQuantitySelector',
            data: ['productId' => 1, 'quantity' => 1, 'maxQuantity' => 10]
        );

        $component->call('increment');

        $this->assertEquals(2, $component->component()->quantity);
    }

    public function testIncrementAtMax(): void
    {
        $component = $this->createLiveComponent(
            name: 'MyModule:ProductQuantitySelector',
            data: ['productId' => 1, 'quantity' => 10, 'maxQuantity' => 10]
        );

        $component->call('increment');

        // Should not exceed max
        $this->assertEquals(10, $component->component()->quantity);
    }

    public function testDecrement(): void
    {
        $component = $this->createLiveComponent(
            name: 'MyModule:ProductQuantitySelector',
            data: ['productId' => 1, 'quantity' => 5]
        );

        $component->call('decrement');

        $this->assertEquals(4, $component->component()->quantity);
    }

    public function testDecrementAtMinimum(): void
    {
        $component = $this->createLiveComponent(
            name: 'MyModule:ProductQuantitySelector',
            data: ['productId' => 1, 'quantity' => 1]
        );

        $component->call('decrement');

        // Should not go below 1
        $this->assertEquals(1, $component->component()->quantity);
    }
}
```

## Test Fixtures

### Creating Test Data

```php
<?php

declare(strict_types=1);

namespace MyModule\Tests\Fixtures;

use Thelia\Model\Category;
use Thelia\Model\Product;
use Thelia\Model\ProductCategory;
use Thelia\Model\ProductSaleElements;

final class ProductFixtures
{
    public static function createProduct(array $data = []): Product
    {
        $product = new Product();
        $product->setRef($data['ref'] ?? 'TEST-' . uniqid());
        $product->setVisible($data['visible'] ?? true);
        $product->save();

        // Add i18n
        $product->setLocale($data['locale'] ?? 'en_US');
        $product->setTitle($data['title'] ?? 'Test Product');
        $product->save();

        // Add PSE
        $pse = new ProductSaleElements();
        $pse->setProductId($product->getId());
        $pse->setRef($product->getRef() . '-PSE');
        $pse->setIsDefault(true);
        $pse->save();

        return $product;
    }

    public static function createCategory(array $data = []): Category
    {
        $category = new Category();
        $category->setParent($data['parent'] ?? 0);
        $category->setVisible($data['visible'] ?? true);
        $category->save();

        $category->setLocale($data['locale'] ?? 'en_US');
        $category->setTitle($data['title'] ?? 'Test Category');
        $category->save();

        return $category;
    }

    public static function assignProductToCategory(Product $product, Category $category): void
    {
        $pc = new ProductCategory();
        $pc->setProductId($product->getId());
        $pc->setCategoryId($category->getId());
        $pc->setDefaultCategory(true);
        $pc->save();
    }
}
```

### Using Fixtures

```php
use MyModule\Tests\Fixtures\ProductFixtures;

public function testProductInCategory(): void
{
    $category = ProductFixtures::createCategory(['title' => 'Electronics']);
    $product = ProductFixtures::createProduct(['title' => 'Laptop']);
    ProductFixtures::assignProductToCategory($product, $category);

    // Test...

    // Cleanup
    $product->delete();
    $category->delete();
}
```

## Running Tests

```bash
# Run all tests
./vendor/bin/phpunit

# Run specific suite
./vendor/bin/phpunit --testsuite Unit
./vendor/bin/phpunit --testsuite Integration
./vendor/bin/phpunit --testsuite Api

# Run specific test
./vendor/bin/phpunit tests/Unit/Service/PriceCalculatorTest.php

# Run with coverage
./vendor/bin/phpunit --coverage-html coverage/

# Run in parallel (with paratest)
./vendor/bin/paratest -p 4
```

## Composer Scripts

Add to `composer.json`:

```json
{
    "scripts": {
        "test": "phpunit",
        "test:unit": "phpunit --testsuite Unit",
        "test:integration": "phpunit --testsuite Integration",
        "test:api": "phpunit --testsuite Api",
        "test:coverage": "phpunit --coverage-html coverage/"
    }
}
```

## Best Practices

### Do

- **Test one thing per test** - Single assertion focus
- **Use descriptive test names** - `testCalculatePriceWithPercentageDiscount`
- **Clean up test data** - Use setUp/tearDown
- **Mock external dependencies** - Don't call real APIs
- **Use data providers** for multiple input variations

### Don't

- **Don't test framework code** - Focus on your logic
- **Don't share state between tests** - Each test should be independent
- **Don't test private methods** - Test through public API
- **Don't skip error cases** - Test failure scenarios too
