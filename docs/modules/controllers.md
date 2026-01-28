---
title: Controllers
sidebar_position: 4
---

# Controllers

Controllers handle HTTP requests in your module. Thelia provides two base controller types optimized for front-office and back-office contexts.

## Controller Types

| Type | Base Class | Template Engine | Auto-Security |
|------|------------|-----------------|---------------|
| Front | `BaseFrontController` | Twig | No |
| Admin | `BaseAdminController` | Smarty | Yes (admin required) |

## Front Controllers

Front controllers serve public-facing pages using Twig templates.

### Basic Front Controller

```php
<?php

declare(strict_types=1);

namespace MyProject\Controller\Front;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Thelia\Controller\Front\BaseFrontController;

final class PageController extends BaseFrontController
{
    #[Route('/my-feature', name: 'myproject.front.index')]
    public function indexAction(): Response
    {
        return $this->render('my-page');
    }

    #[Route('/my-feature/{id}', name: 'myproject.front.show', requirements: ['id' => '\d+'])]
    public function showAction(int $id): Response
    {
        return $this->render('my-page-detail', [
            'item_id' => $id,
        ]);
    }
}
```

### Template Location

Templates are resolved from:
1. `templates/frontOffice/{active_template}/modules/MyProject/`
2. `local/modules/MyProject/templates/frontOffice/default/`

### Injecting Services

```php
<?php

declare(strict_types=1);

namespace MyProject\Controller\Front;

use MyProject\Service\ProductService;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Thelia\Controller\Front\BaseFrontController;

final class ProductController extends BaseFrontController
{
    public function __construct(
        private readonly ProductService $productService,
    ) {}

    #[Route('/featured-products', name: 'myproject.front.featured')]
    public function featuredAction(): Response
    {
        $products = $this->productService->getFeaturedProducts();

        return $this->render('featured-products', [
            'products' => $products,
        ]);
    }
}
```

### Accessing Request Data

```php
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

#[Route('/search', name: 'myproject.front.search')]
public function searchAction(Request $request): Response
{
    $query = $request->query->get('q', '');
    $page = $request->query->getInt('page', 1);

    $results = $this->searchService->search($query, $page);

    return $this->render('search-results', [
        'query' => $query,
        'results' => $results,
        'page' => $page,
    ]);
}
```

### JSON Responses

```php
use Symfony\Component\HttpFoundation\JsonResponse;

#[Route('/api/check-availability/{productId}', name: 'myproject.front.check_availability')]
public function checkAvailabilityAction(int $productId): JsonResponse
{
    $stock = $this->stockService->getAvailableStock($productId);

    return new JsonResponse([
        'available' => $stock > 0,
        'quantity' => $stock,
    ]);
}
```

### Redirects

```php
use Symfony\Component\HttpFoundation\RedirectResponse;

#[Route('/old-page', name: 'myproject.front.old_page')]
public function oldPageAction(): RedirectResponse
{
    return $this->generateRedirect(
        $this->getRouteUrl('myproject.front.new_page')
    );
}
```

## Admin Controllers

Admin controllers serve back-office pages. All routes are automatically secured - only authenticated administrators can access them.

### Basic Admin Controller

```php
<?php

declare(strict_types=1);

namespace MyProject\Controller\Admin;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Thelia\Controller\Admin\BaseAdminController;

final class ConfigController extends BaseAdminController
{
    #[Route('/admin/module/MyProject', name: 'myproject.admin.config')]
    public function indexAction(): Response
    {
        return $this->render('module-config');
    }
}
```

### Template Location

Admin templates are resolved from:
1. `templates/backOffice/{active_template}/modules/MyProject/`
2. `local/modules/MyProject/templates/backOffice/default/`

### Form Handling

```php
<?php

declare(strict_types=1);

namespace MyProject\Controller\Admin;

use MyProject\Form\ConfigurationForm;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Thelia\Controller\Admin\BaseAdminController;
use Thelia\Core\Security\AccessManager;
use Thelia\Model\ConfigQuery;

final class ConfigController extends BaseAdminController
{
    #[Route('/admin/module/MyProject', name: 'myproject.admin.config', methods: ['GET'])]
    public function indexAction(): Response
    {
        return $this->render('module-config', [
            'api_key' => ConfigQuery::read('myproject_api_key', ''),
            'enabled' => ConfigQuery::read('myproject_enabled', '1'),
        ]);
    }

    #[Route('/admin/module/MyProject', name: 'myproject.admin.config.save', methods: ['POST'])]
    public function saveAction(): Response
    {
        // Check authorization
        if (null !== $response = $this->checkAuth([], [], AccessManager::UPDATE)) {
            return $response;
        }

        $form = $this->createForm(ConfigurationForm::getName());

        try {
            $data = $this->validateForm($form)->getData();

            ConfigQuery::write('myproject_api_key', $data['api_key']);
            ConfigQuery::write('myproject_enabled', $data['enabled'] ? '1' : '0');

            return $this->generateSuccessRedirect($form);
        } catch (\Exception $e) {
            $this->setupFormErrorContext(
                'Configuration',
                $e->getMessage(),
                $form
            );

            return $this->render('module-config', [
                'api_key' => ConfigQuery::read('myproject_api_key', ''),
                'enabled' => ConfigQuery::read('myproject_enabled', '1'),
            ]);
        }
    }
}
```

### Authorization Checks

Control access to specific actions:

```php
use Thelia\Core\Security\AccessManager;

// Check for specific permission
if (null !== $response = $this->checkAuth([], [], AccessManager::DELETE)) {
    return $response; // User not authorized
}

// Check for module-specific permission
if (null !== $response = $this->checkAuth(
    ['MyProject'],           // Modules
    ['MYPROJECT_ADMIN'],     // Resources
    AccessManager::UPDATE    // Access type
)) {
    return $response;
}
```

Access types:
- `AccessManager::VIEW` - Read access
- `AccessManager::CREATE` - Create new items
- `AccessManager::UPDATE` - Modify existing items
- `AccessManager::DELETE` - Delete items

### AJAX Actions

```php
use Symfony\Component\HttpFoundation\JsonResponse;

#[Route('/admin/module/MyProject/ajax/toggle/{id}', name: 'myproject.admin.toggle')]
public function toggleAction(int $id): JsonResponse
{
    if (null !== $response = $this->checkAuth([], [], AccessManager::UPDATE)) {
        return new JsonResponse(['error' => 'Unauthorized'], 403);
    }

    try {
        $item = \MyProject\Model\MyProjectDataQuery::create()->findPk($id);

        if (!$item) {
            return new JsonResponse(['error' => 'Item not found'], 404);
        }

        $item->setIsActive(!$item->getIsActive());
        $item->save();

        return new JsonResponse([
            'success' => true,
            'active' => $item->getIsActive(),
        ]);
    } catch (\Exception $e) {
        return new JsonResponse(['error' => $e->getMessage()], 500);
    }
}
```

### Flash Messages

```php
use Thelia\Core\Translation\Translator;

// Success message
$this->getSession()->getFlashBag()->add(
    'success',
    Translator::getInstance()->trans('Configuration saved', [], 'myproject')
);

// Error message
$this->getSession()->getFlashBag()->add(
    'error',
    Translator::getInstance()->trans('An error occurred', [], 'myproject')
);
```

## Route Configuration

### Using routing.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routes xmlns="http://symfony.com/schema/routing"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://symfony.com/schema/routing
        http://symfony.com/schema/routing/routing-1.0.xsd">

    <!-- Front routes -->
    <route id="myproject.front.index" path="/my-feature">
        <default key="_controller">MyProject\Controller\Front\PageController::indexAction</default>
    </route>

    <route id="myproject.front.show" path="/my-feature/{id}">
        <default key="_controller">MyProject\Controller\Front\PageController::showAction</default>
        <requirement key="id">\d+</requirement>
    </route>

    <!-- Admin routes -->
    <route id="myproject.admin.config" path="/admin/module/MyProject">
        <default key="_controller">MyProject\Controller\Admin\ConfigController::indexAction</default>
    </route>

    <route id="myproject.admin.config.save" path="/admin/module/MyProject" methods="POST">
        <default key="_controller">MyProject\Controller\Admin\ConfigController::saveAction</default>
    </route>
</routes>
```

### Using PHP Attributes

```php
use Symfony\Component\Routing\Annotation\Route;

#[Route('/my-feature/{id}', name: 'myproject.front.show', requirements: ['id' => '\d+'], methods: ['GET'])]
public function showAction(int $id): Response
```

## Useful Controller Methods

### From BaseFrontController

```php
// Render a template
$this->render('template-name', ['var' => 'value']);

// Generate URL
$url = $this->getRouteUrl('route.name', ['param' => 'value']);

// Redirect
$this->generateRedirect($url);

// Access session
$session = $this->getSession();

// Get current customer
$customer = $this->getSecurityContext()->getCustomerUser();

// Get request
$request = $this->getRequest();
```

### From BaseAdminController

```php
// All BaseFrontController methods, plus:

// Check authorization
$this->checkAuth($modules, $resources, $accessType);

// Create a form
$form = $this->createForm(FormName::getName());

// Validate form
$validatedForm = $this->validateForm($form);

// Setup error context for form
$this->setupFormErrorContext($title, $message, $form);

// Redirect after successful form submission
$this->generateSuccessRedirect($form);

// Get current admin
$admin = $this->getSecurityContext()->getAdminUser();
```

## Best Practices

### Do

- **Use dependency injection** for services instead of accessing the container directly
- **Use route attributes** for cleaner code
- **Validate all input** from requests
- **Use appropriate response types** (Response, JsonResponse, RedirectResponse)
- **Follow naming conventions**: `{action}Action` for methods, `{module}.{context}.{action}` for routes

### Don't

- **Don't put business logic in controllers** - use services
- **Don't skip authorization checks** in admin controllers
- **Don't return HTML from AJAX endpoints** - use JSON
- **Don't hardcode URLs** - use route generation
