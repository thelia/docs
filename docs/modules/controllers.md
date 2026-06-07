---
title: Controllers
sidebar_position: 4
---

# Controllers

Controllers handle HTTP requests in your module. Thelia provides two base controller types optimized for front-office and back-office contexts.

## Controller Types

| Type | Base Class | Template engine | Authorization |
|------|------------|-----------------|---------------|
| Front | `BaseFrontController` | Active front-office template (Flexy / Twig) | Manual — call `checkAuth()` when a page requires a logged-in customer |
| Admin | `BaseAdminController` | Active back-office template | Manual — call `checkAuth($resources, $modules, $accesses)` per action |

:::note The back-office reference is the default-twig bundle
Admin controllers render through the **active back-office template**, resolved by `TheliaTemplateHelper` (via `getActiveAdminTemplate()`). The reference back-office template in Thelia 3 is the `default-twig` bundle (Twig). The legacy Smarty `default` back-office theme is no longer recommended and is expected to be dropped in Thelia 3.1, so target Twig templates for new modules.
:::

:::caution Authorization is not automatic
Extending `BaseAdminController` does **not** secure your routes by itself. You must call `checkAuth()` at the start of each action that needs protection (see [Authorization Checks](#authorization-checks)).
:::

## Front Controllers

Front controllers serve public-facing pages using Twig templates.

### Basic Front Controller

```php
<?php

declare(strict_types=1);

namespace MyProject\Controller\Front;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
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
use Symfony\Component\Routing\Attribute\Route;
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

### Requiring a Logged-In Customer

On the front office, `checkAuth()` takes **no arguments**. It throws a `RedirectException` to the login page when no customer is authenticated:

```php
// core/lib/Thelia/Controller/Front/BaseFrontController.php
public function checkAuth(): void
```

Call it at the start of an action that must only be reachable by a logged-in customer:

```php
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Thelia\Controller\Front\BaseFrontController;

final class AccountController extends BaseFrontController
{
    #[Route('/my-account/orders', name: 'myproject.front.account_orders')]
    public function ordersAction(): Response
    {
        // Redirects to the login page if no customer is logged in
        $this->checkAuth();

        $customer = $this->getSecurityContext()->getCustomerUser();

        return $this->render('account-orders', [
            'customer' => $customer,
        ]);
    }
}
```

:::caution Front vs admin signature
The argument-based form `checkAuth($resources, $modules, $accesses)` exists **only** on `BaseAdminController`. On `BaseFrontController`, `checkAuth()` is argument-less. Do not pass `AccessManager` constants to a front controller's `checkAuth()`.
:::

### Redirects

```php
use Symfony\Component\HttpFoundation\RedirectResponse;

#[Route('/old-page', name: 'myproject.front.old_page')]
public function oldPageAction(): RedirectResponse
{
    // getRoute() turns a route id into a URL string, generateRedirect() wraps it in a RedirectResponse
    return $this->generateRedirect(
        $this->getRoute('myproject.front.new_page')
    );
}
```

:::tip Redirect to a route in one call
`generateRedirectFromRoute()` combines both steps. Pass URL parameters as the second argument:

```php
return $this->generateRedirectFromRoute(
    'myproject.front.show',
    [],            // extra query parameters appended to the URL
    ['id' => 42],  // route parameters (placeholders)
);
```
:::

## Admin Controllers

Admin controllers serve back-office pages, rendered through the active back-office template (the `default-twig` bundle). They run behind the `/admin` firewall, but fine-grained permission checks are **not** automatic: call `checkAuth()` in each action that modifies data or exposes restricted resources.

### Basic Admin Controller

```php
<?php

declare(strict_types=1);

namespace MyProject\Controller\Admin;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
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
use Symfony\Component\Routing\Attribute\Route;
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
    ['MYPROJECT_ADMIN'],     // Resources
    ['MyProject'],           // Modules
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

Declare routes with PHP 8 `#[Route]` attributes directly on your controller methods. Thelia scans every active module's `Controller/` directory at boot through `ModuleAttributeLoader` and registers the routes automatically — there is no XML to write and nothing to import.

```php
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/my-feature/{id}', name: 'myproject.front.show', requirements: ['id' => '\d+'], methods: ['GET'])]
public function showAction(int $id): Response
{
    // ...
}
```

The `#[Route]` attributes shown throughout this page are picked up the same way — no extra registration step.

:::note Route prefix
`ModuleAttributeLoader` prepends each module's route prefix to every path it discovers. The prefix comes from the module's `getRoutePrefix()` method (defined on `BaseModule`). Keep this in mind when you generate URLs or read paths in the route table.
:::

:::caution Legacy `routing.xml`
Older modules declared routes in `Config/routing.xml`. This still works but is no longer the recommended approach for new code — prefer `#[Route]` attributes, which keep the route next to its action and require no XML maintenance.
:::

## Useful Controller Methods

The following methods live on `BaseController` and are available to both front and admin controllers.

### Shared (BaseController)

```php
// Render a template ($args, then optional HTTP status)
$this->render('template-name', ['var' => 'value']);

// Generate a URL string from a route id (ABSOLUTE_URL by default)
$url = $this->getRoute('myproject.front.show', ['id' => 42]);

// Build a RedirectResponse from a URL
$this->generateRedirect($url);

// Build a RedirectResponse directly from a route id
$this->generateRedirectFromRoute('myproject.front.show', [], ['id' => 42]);

// Access the session
$session = $this->getSession();

// Access the security context (current customer or admin)
$securityContext = $this->getSecurityContext();

// Access the current request
$request = $this->getRequest();

// Create and validate a Thelia form
$form = $this->createForm(MyForm::getName());
$validatedForm = $this->validateForm($form);

// Build a RedirectResponse to the form's success_url (null if none defined)
$this->generateSuccessRedirect($form);
```

### Front-specific (BaseFrontController)

```php
// Require a logged-in customer (redirects to login otherwise) — no arguments
$this->checkAuth();

// Get the current customer
$customer = $this->getSecurityContext()->getCustomerUser();
```

### Admin-specific (BaseAdminController)

```php
// Check authorization (arguments: resources, modules, accesses)
// Returns a Response (the error page) when not granted, null when allowed
if (null !== $response = $this->checkAuth($resources, $modules, $accesses)) {
    return $response;
}

// Build the form error context (title, message, form)
$this->setupFormErrorContext($action, $errorMessage, $form);

// Get the current admin
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
