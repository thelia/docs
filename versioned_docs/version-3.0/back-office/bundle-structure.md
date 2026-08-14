---
title: Bundle structure
sidebar_position: 2
---

# Bundle structure

The Thelia 3 back-office is no longer a folder of templates wired by XML. It is a Symfony bundle,
`BackOfficeDefaultTwigBundle`, that registers its own services, routes, hooks and templates the
idiomatic Symfony way: autowiring, `#[Route]` attributes, autoconfigured tags. It contains no
`services.xml` and no `routing.xml` anywhere.

This page explains how that bundle is wired so you can read its code, extend it, or model your own
admin module on it.

:::note Owner decision
The legacy Smarty `default` back-office theme is no longer recommended and will likely be dropped in
Thelia 3.1. The reference back-office is the `default-twig` bundle described here. It owns its
routes, hooks, templates, forms and assets.
:::

## A Symfony AbstractBundle, activated on demand

The entry point is a single `final` class extending `AbstractBundle`:

```php
// templates/backOffice/default-twig/src/BackOfficeDefaultTwigBundle.php
namespace BackOfficeDefaultTwigBundle;

use Symfony\Component\HttpKernel\Bundle\AbstractBundle;

final class BackOfficeDefaultTwigBundle extends AbstractBundle
{
    public const ACTIVE_TEMPLATE_NAME = 'default-twig';

    private const ADMIN_TEMPLATE_PARAMETER = 'thelia_admin_template';

    // ...

    private function isActive(ContainerBuilder $builder): bool
    {
        if (!$builder->hasParameter(self::ADMIN_TEMPLATE_PARAMETER)) {
            return false;
        }

        return self::ACTIVE_TEMPLATE_NAME === $builder->getParameter(self::ADMIN_TEMPLATE_PARAMETER);
    }
}
```

The bundle is always registered in `config/bundles.php`, but it only loads its services and templates
when it is the active admin template. `isActive()` compares its own name against the
`%thelia_admin_template%` container parameter, which the Thelia kernel sets at boot from the
`active-admin-template` configuration value stored in the database.

Both `loadExtension()` and `prependExtension()` early-return when `isActive()` is `false`. The
back-office you select with `bin/install --backoffice_theme=default-twig` (or
`php Thelia template:set backOffice default-twig`) is the only one whose services enter the
container.

:::tip
This is what lets the Twig and the legacy Smarty back-offices coexist in the same installation during
the transition: only one of them is ever active in the container at a time.
:::

## Service registration: no services XML

All services are discovered by scanning the `src/` tree once, with a handful of folders excluded:

```php
// templates/backOffice/default-twig/src/BackOfficeDefaultTwigBundle.php
public function loadExtension(array $config, ContainerConfigurator $container, ContainerBuilder $builder): void
{
    if (!$this->isActive($builder)) {
        return;
    }

    $resourcePath = $this->getResourcePath();

    $container->services()
        ->load('BackOfficeDefaultTwigBundle\\', $resourcePath)
        ->exclude([
            $resourcePath.'/BackOfficeDefaultTwigBundle.php',
            $resourcePath.'/DTO/',
            $resourcePath.'/Hook/Attribute/',
            $resourcePath.'/DependencyInjection/',
        ])
        ->autowire()
        ->autoconfigure();

    // ...
}
```

This scan registers the following automatically:

- Controllers, repositories, services, Twig extensions, event listeners and UI components. Drop a new
  `final readonly` class under `src/Service/` and it is autowired, with no declaration to add.
- `autoconfigure()` wires Symfony tags by convention: event listeners, Twig extensions, voters, and
  (thanks to a custom attribute registered in `build()`) the `#[AsHook]` back-office hooks.
- The excluded paths are the things that are not services: the bundle class itself, immutable `DTO/`
  value objects, the `#[AsHook]` attribute definition, and the `DependencyInjection/` compiler passes.

There is no `services.xml`, no `services.yaml` listing every class. The only YAML the bundle imports
is `config/packages/twig.yaml`, which registers the back-office form theme. It does so through
`prependExtension()`, the standard Symfony bundle mechanism.

## Routing: `#[Route]` attributes, one controller per domain

Routes are PHP 8 attributes scanned by Symfony, with no `routing.xml`. Each business domain
has one thin `final` controller. The class-level `#[Route]` sets the path prefix and the route-name
prefix, and each method adds its own segment.

```php
// templates/backOffice/default-twig/src/Controller/Catalog/ProductController.php
#[Route('/admin/products', name: 'admin.products.')]
final class ProductController
{
    #[Route('', name: 'default', methods: ['GET'])]
    public function list(Request $request): Response { /* ... */ }

    #[Route('/create', name: 'create', methods: ['POST'])]
    public function create(Request $request): Response { /* ... */ }

    #[Route('/update', name: 'update', methods: ['GET'])]
    public function updateView(Request $request): Response { /* ... */ }

    #[Route('/save', name: 'save', methods: ['POST'])]
    public function processUpdate(Request $request): Response { /* ... */ }

    #[Route('/seo/save', name: 'seo.save', methods: ['POST'])]
    public function processSeo(Request $request): Response { /* ... */ }

    #[Route('/update-position', name: 'update-position', methods: ['GET', 'POST'])]
    public function updatePosition(Request $request): Response { /* ... */ }

    #[Route('/delete', name: 'delete', methods: ['POST', 'GET'])]
    public function delete(Request $request): Response { /* ... */ }
}
```

The final route name is the class prefix plus the method name, for example `admin.products.default`
or `admin.products.seo.save`. The `BrandController` follows the exact same shape with its own prefix:

```php
// templates/backOffice/default-twig/src/Controller/Catalog/BrandController.php
#[Route('/admin/brand', name: 'admin.brand.')]
final class BrandController
{
    #[Route('', name: 'default', methods: ['GET'])]
    public function list(Request $request): Response { /* ... */ }

    #[Route('/update/{brand_id}', name: 'update', methods: ['GET'], requirements: ['brand_id' => '\d+'])]
    public function updateView(int $brand_id, Request $request): Response { /* ... */ }

    // create, save/{brand_id}, seo/save, toggle-online, update-position, delete ...
}
```

:::caution Route names are not all iso with the legacy Smarty back-office
A few route names were renamed during the migration and are not aliased back to the legacy
ones. A module that builds URLs with `path()` / `url()` against an old name must update it. Examples
from the bundle's `README.md`:

| Legacy route name                      | Twig route name           |
|----------------------------------------|---------------------------|
| `admin.sale.reset`                     | `admin.sale.reset-status` |
| `admin.configuration.order-status.*`   | `admin.order-status.*`    |
| `admin.configuration.mailing-system.*` | `admin.mailingSystem.*`   |

Hooks and ACL resources are bridged (no change required); route names are not. Check the bundle's
`README.md` cohabitation table for the full list.
:::

## Controller composition: no base class

Back-office controllers do not extend a `BaseForm`, a Thelia `BaseAdminController`, or an
`AbstractCrudController`. They are plain `final` classes that get everything they need through
constructor injection. They rely on two services:

- `AdminFormAction`, a `readonly` orchestrator that runs the full submit pipeline: ACL check, form
  validation, event dispatch, success logging, redirect, and inline error rendering on failure.
- `AdminAccessChecker`, a `readonly` service that bridges to the Thelia ACL and returns a `403`
  `Response` when access is denied, or `null` when granted.

Everything else is repositories and presenters specific to the domain.

```php
// templates/backOffice/default-twig/src/Controller/Catalog/BrandController.php
#[Route('/admin/brand', name: 'admin.brand.')]
final class BrandController
{
    private const RESOURCE = AdminResources::BRAND;
    private const LIST_ROUTE = 'admin.brand.default';
    private const EDIT_ROUTE = 'admin.brand.update';

    public function __construct(
        private readonly AdminFormAction $action,
        private readonly AdminAccessChecker $access,
        private readonly Environment $twig,
        private readonly FormFactoryInterface $formFactory,
        private readonly UrlGeneratorInterface $urls,
        private readonly TokenProvider $tokens,
        private readonly TranslatorInterface $translator,
        private readonly EditLocaleResolver $editLocale,
        private readonly BrandImagePresenter $brandImages,
        private readonly BrandRepository $brandRepository,
    ) {
    }

    #[Route('', name: 'default', methods: ['GET'])]
    public function list(Request $request): Response
    {
        if ($denied = $this->access->check(self::RESOURCE, [], AccessManager::VIEW)) {
            return $denied;
        }

        return new Response($this->twig->render(self::LIST_TEMPLATE, $this->buildListContext($request)));
    }

    #[Route('/create', name: 'create', methods: ['POST'])]
    public function create(Request $request): Response
    {
        $form = $this->formFactory->createNamed('thelia_brand_creation', BrandType::class, [
            'locale' => $request->getLocale(),
            'visible' => true,
        ], []);

        return $this->action->submit(
            resource: self::RESOURCE,
            access: AccessManager::CREATE,
            form: $form,
            eventName: TheliaEvents::BRAND_CREATE,
            eventFactory: $this->createEvent(...),
            actionLabel: 'Brand creation',
            successRoute: self::EDIT_ROUTE,
            renderError: fn (): RedirectResponse => new RedirectResponse($this->urls->generate(self::LIST_ROUTE)),
            describeForLog: $this->describeCreated(...),
        );
    }
}
```

`AdminFormAction` exposes two entry points:

- `submit(...)` handles form submissions. You hand it the form, the Thelia event name, and an
  `eventFactory` callable that builds the event from the validated form. It validates, dispatches,
  logs and redirects; on any `\Throwable` it re-renders the form with the error.
- `tokenAction(...)` handles single-shot CSRF-protected actions (delete, toggle visibility,
  reorder). You hand it a ready-made event and the request; it checks the `_token` (read from the
  request body *or* the query string), dispatches, and redirects.

This keeps the controller thin and matches the core event-driven flow: a controller never calls
`->save()`. It dispatches an event; a core `Action` listener persists the model.

:::note Propel is not Doctrine
There is no `EntityManager` and no `flush()`. The listener that handles the dispatched event calls
`->save()` on a Propel model, which persists immediately. Respect the native Propel types when
building events: `int` for tinyint columns (pass `0`/`1`, never `true`/`false`), `string` for
decimal values.
:::

## ACL: bridging `is_granted()` to Thelia

The bundle ships a custom Symfony voter, `AdminVoter`, that translates standard Symfony
`is_granted(attribute, subject)` calls into Thelia ACL checks by delegating to
`SecurityContext::isGranted()`:

```php
// templates/backOffice/default-twig/src/Security/AdminVoter.php
final class AdminVoter extends Voter
{
    public const ROLE_ADMIN = 'ADMIN';

    /** @var list<string> */
    public const ACCESS_LEVELS = ['VIEW', 'CREATE', 'UPDATE', 'DELETE'];

    // supports() / voteOnAttribute() delegate to SecurityContext::isGranted()
}
```

Because the voter is autoconfigured by the `load()` scan, you use the native Symfony helper in Twig
templates. The attribute is the access level; the subject is the ACL resource string:

```twig
{% if is_granted('UPDATE', 'admin.product') %}…{% endif %}
{% if is_granted('UPDATE', { resource: 'admin.module', module: 'HookAdminHome' }) %}…{% endif %}
{% if is_granted('ADMIN') %}…{% endif %}
```

In a controller you do the same check through `AdminAccessChecker::check()`, which returns a `403`
`Response` to short-circuit on, or `null` when access is granted:

```php
if ($denied = $this->access->check(self::RESOURCE, [], AccessManager::VIEW)) {
    return $denied;
}
```

The resource strings come from the core `AdminResources` class. For example, `AdminResources::PRODUCT`
is `admin.product` and `AdminResources::BRAND` is `admin.brand`:

```php
// core/lib/Thelia/Core/Security/Resource/AdminResources.php
public const BRAND = 'admin.brand';
public const CATEGORY = 'admin.category';
public const CUSTOMER = 'admin.customer';
public const ORDER = 'admin.order';
public const PRODUCT = 'admin.product';
// ...
```

Controllers reference them by constant (`private const RESOURCE = AdminResources::PRODUCT;`) rather
than hardcoding the string, so a typo is a compile-time error.

## Repositories and services, not loops

The Twig back-office does not use Smarty `{loop}`s. Data access lives in plain PHP:

- `src/Repository/` holds one repository per entity (`ProductRepository`, `BrandRepository`,
  `CategoryRepository`, `OrderRepository`, …). Each is a `final readonly` class wrapping Propel
  queries (`ProductQuery::create()->…`) and returning models or scalar rows. This is where pagination,
  search, sorting and previous/next navigation live.
- `src/Service/<Domain>/` holds presenters and domain logic that turn Propel models into
  Twig-friendly arrays (`Service/Catalog/`, `Service/Order/`, `Service/Customer/`, …). The
  `Service/Admin/` folder holds the cross-cutting orchestration (`AdminFormAction`,
  `AdminAccessChecker`, `AdminFormValidator`, `AdminLogger`, `AdminFormErrorRenderer`).

The controller composes these: it asks a repository for rows, asks a presenter to shape them, and
renders a Twig template. No query logic lives in the template.

```php
// excerpt - ProductController list() builds rows via the repository, then renders
$products = $query
    ->offset(($page - 1) * self::PAGE_SIZE)
    ->limit(self::PAGE_SIZE)
    ->find();

$rows = [];
foreach ($products as $product) {
    $product->setLocale($locale);
    $rows[] = $this->productToRow($product);
}
```

## Recap: where each concern lives

| Concern              | Location                                | Mechanism                                   |
|----------------------|-----------------------------------------|---------------------------------------------|
| Bundle activation    | `src/BackOfficeDefaultTwigBundle.php`   | `isActive()` vs `%thelia_admin_template%`   |
| Service registration | whole `src/` tree                       | `load()->autowire()->autoconfigure()`       |
| Routing              | each controller                         | `#[Route]` attributes                       |
| Submit pipeline      | `src/Service/Admin/AdminFormAction.php` | injected orchestrator, no base class        |
| ACL                  | `src/Security/AdminVoter.php`           | `is_granted()` → `SecurityContext`          |
| Data access          | `src/Repository/`, `src/Service/`       | Propel queries + presenters (no loops)      |
| Form theme           | `config/packages/twig.yaml`             | the only YAML, via `prependExtension()`     |

## Learn more

- [Back-Office Development](./index.md): overview of the admin section
- [Hooks](./hooks.md): extension points for modules in the back-office
