---
title: Migrating from Thelia 2
sidebar_position: 1
---

# Migrating from Thelia 2

In Thelia 2, a module controller routes with `@Route` annotations, declares its services in `config.xml`, and serves Smarty templates. In Thelia 3, the same controller uses `#[Route]` PHP attributes, registers its services from a static `configureServices()` method, and serves Twig. Most of the `config.xml` is gone. This guide maps every change so you can plan a migration.

## What changed at the platform level

Thelia 3 keeps the Thelia model (Propel ORM, event-driven flow, modules) but rebases the framework underneath it:

| Layer | Thelia 2 | Thelia 3 |
|-------|----------|----------|
| PHP | `>= 8.2` | `>= 8.3` |
| Symfony | 6.4 | 7.4 LTS |
| API Platform | 3.4 (`api-platform/core` metapackage) | 4.3 standalone (`api-platform/symfony`) |
| Front-office templates | Smarty | Twig (FlexyBundle) |
| Back-office templates | Smarty (`default`) | Twig (`default-twig` bundle) |
| Routing | `@Route` annotations + `routing.xml` | `#[Route]` PHP 8 attributes |
| Module DI | `config.xml` (services, hooks, loops, forms) | `configureServices()` + autoconfiguration |
| ORM | Propel | Propel (unchanged) |
| Install | `php Thelia thelia:install` | `php bin/install` (standalone) + `thelia:install` |

:::note
The Thelia version numbers here come from the root `composer.json` (`php: ">= 8.3"`, `symfony/*: 7.4.*`). The `thelia/core` library itself still declares a `>= 8.2` floor, but the project you install requires PHP 8.3.
:::

The two changes that surprise people coming from Thelia 2:

- **The back-office is now Twig, not Smarty.** Thelia 2's `default` Smarty back-office still ships in Thelia 3 *during the transition*, but the reference is the `default-twig` bundle (see below).
- **The API is the same API Platform, upgraded.** Thelia 2 already shipped API Platform 3.4 with the Propel bridge. Thelia 3 does *not* introduce API Platform; it moves it from 3.4 to 4.3 standalone. The work is upgrading existing resources, not rewriting a custom API.

## Front-office: Smarty → Twig (FlexyBundle)

The front-office is served by the **FlexyBundle** (`templates/frontOffice/flexy/`, class `FlexyBundle`). Templates are `.html.twig`, data comes from the API through the `DataAccessService`, and interactivity is built with Symfony UX (Stimulus, TwigComponent, LiveComponent) instead of jQuery.

| Thelia 2 | Thelia 3 |
|----------|----------|
| Smarty `.html` templates | Twig `.html.twig` templates in FlexyBundle |
| `{loop type="product"}...{/loop}` | `resources('/api/front/products', {...})` via `DataAccessService` |
| `{intl l="..."}` | `{{ '...'\|trans }}` |
| `{$VAR}` | `{{ var }}` |
| Custom jQuery scripts | Stimulus controllers |
| Full page reloads | LiveComponents for reactive UI |
| No component system | A set of pre-built Twig/Live components in FlexyBundle |

Data access in a Twig template uses the `resources()` function, which calls the API internally:

```twig
{# templates/frontOffice/flexy/category.html.twig #}
{% for product in resources('/api/front/products', { category: category.id }) %}
    <article>{{ product.title }}</article>
{% endfor %}
```

:::caution Legacy loops are deprecated
`DataAccessService::loop()` and `DataAccessService::loopCount()` (and the matching Twig `loop()` / `loopCount()` helpers) are marked `@deprecated`. They exist only to ease the transition. Migrate to `resources()`.
:::

## Back-office: the `default-twig` bundle

The back-office reference in Thelia 3 is the **`default-twig` bundle** (`templates/backOffice/default-twig/`, class `BackOfficeDefaultTwigBundle`). Its README opens with: *"Modern Bootstrap 5 / Twig / Stimulus port of the legacy Smarty back-office."*

It is a full Symfony bundle, autonomous from the core:

- `src/Controller/`: `#[Route]` controllers, grouped by domain (`Catalog/`, `Customer/`, `Order/`, …)
- `src/Repository/` and `src/Service/`: Propel queries and presenters, kept out of the controllers
- `src/Twig/` and `src/UiComponents/`: Twig extensions plus `AsTwigComponent` / `AsLiveComponent` components
- `src/Form/`: Symfony form types
- `src/Hook/`: back-office hooks, declared with the bundle's `#[AsHook]` attribute (auto-tagged at bundle build)
- `form/bo_form_theme.html.twig`: a Bootstrap 5 form theme
- `assets/`: SCSS, Stimulus controllers, images, built with npm

:::caution The Smarty back-office is deprecated
The legacy Smarty back-office (`templates/backOffice/default/`) still ships side by side with `default-twig` during the transition, but it is **no longer recommended** and is expected to be dropped in Thelia 3.1. Build new back-office work on the `default-twig` bundle.
:::

Activate it at install time with `--backoffice_theme=default-twig`:

```bash
php bin/install \
  --frontoffice_theme=flexy --backoffice_theme=default-twig \
  --pdf_theme=default --email_theme=default \
  --with-demo --with-admin
```

## API Platform 3.4 → 4.3 standalone

Thelia 2 ships API Platform 3.4 with the Propel bridge (`PropelResourceInterface` and `ResourceAddonInterface` already exist there). The migration is the API Platform 4.3 upgrade, pulled in through the `api-platform/symfony` package (`^4.3`) instead of the legacy `api-platform/core` metapackage.

If your module exposes or extends API resources, these breaking changes apply:

| Change | Before (AP 3.4) | After (AP 4.3) |
|--------|-----------------|----------------|
| IRI / resource-class / URL interfaces | `ApiPlatform\Api\IriConverterInterface` (and `ResourceClassResolverInterface`, `UrlGeneratorInterface`) | `ApiPlatform\Metadata\IriConverterInterface` (and `…\ResourceClassResolverInterface`, `…\UrlGeneratorInterface`) |
| Exceptions | `ApiPlatform\Exception\InvalidArgumentException` / `RuntimeException` | `ApiPlatform\Metadata\Exception\…` |
| OpenAPI on an operation | `openapiContext: [...]` | `openapi: new Operation(...)` (`ApiPlatform\OpenApi\Model\Operation`) |
| Extending `ObjectNormalizer` | `extends ObjectNormalizer` | `ObjectNormalizer` is now `final`, so use `NormalizerAwareInterface` + `NormalizerAwareTrait` and delegate |
| Declaring property types | `ApiProperty::withBuiltinTypes([...])` | `ApiProperty::withNativeType(Type $type)` |

```php
// Before (API Platform 3.4)
new GetCollection(
    openapiContext: ['parameters' => [['name' => 'foo', 'in' => 'query']]]
)

// After (API Platform 4.3)
use ApiPlatform\OpenApi\Model\Operation;
use ApiPlatform\OpenApi\Model\Parameter;

new GetCollection(
    openapi: new Operation(parameters: [
        new Parameter(name: 'foo', in: 'query', schema: ['type' => 'string']),
    ])
)
```

:::note
`openapiContext` is still supported on `#[ApiProperty]` (only the *operation* form changed). The `ApiPlatform\Metadata\*`, `ApiPlatform\State\*` and `ApiPlatform\OpenApi\*` namespaces are unchanged.
:::

## Routing: `@Route` annotations → `#[Route]` attributes

Symfony 7 removed `AnnotatedRouteControllerLoader`, so Doctrine `@Route` annotations no longer work. Thelia's old `ModuleAnnotationLoader` was deleted and replaced by `ModuleAttributeLoader` (`Thelia\Core\Routing\ModuleAttributeLoader`), which auto-scans each active module's `Controller/` directory for `#[Route]` attributes and prefixes the routes with the module's `getRoutePrefix()`.

```php
// Before - Thelia 2 (Symfony 6.4)
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/my-path", name="my_route", methods="GET", requirements={"id"="\d+"})
 */
public function myAction(): Response { ... }

// After - Thelia 3 (Symfony 7.4)
use Symfony\Component\Routing\Attribute\Route;

#[Route('/my-path', name: 'my_route', methods: ['GET'], requirements: ['id' => '\d+'])]
public function myAction(): Response { ... }
```

Watch the syntax shifts: `methods="GET"` (string) becomes `methods: ['GET']` (array), and `requirements={"id"="\d+"}` becomes `requirements: ['id' => '\d+']` (PHP array).

:::caution
`BaseModule::getAnnotationRoutePrefix()` is `@deprecated`. Override `BaseModule::getRoutePrefix()` instead: same signature, same behavior. `ModuleAttributeLoader` calls `getRoutePrefix()`.
:::

## Modules: `config.xml` → `configureServices()` + autoconfiguration

This is the largest change for module authors. In Thelia 3, **`config.xml` is optional**. Services, hooks, loops, forms and commands are registered by autoconfiguration instead of XML.

| Thelia 2 (`config.xml`) | Thelia 3 |
|-------------------------|----------|
| `<services>` business services | static `configureServices()` with `load()->autowire()->autoconfigure()` |
| `<hooks>` | `extends BaseHook` + `getSubscribedHooks()`, **auto-discovered, no XML** |
| `<loops>` | `extends BaseLoop`, **auto-tagged** with a snake_case name, no XML (loops still work, but prefer API resources for new code) |
| `<forms>` | `extends BaseForm` + static `getName()`, **auto-tagged, no XML** |
| `<commands>` | autoconfigured |

Services move out of XML into a static method on your module class:

```php
// Before - Config/config.xml
// <services>
//   <service id="MyModule\Service\Mailer" class="MyModule\Service\Mailer">
//     <argument type="service" id="mailer.mailer"/>
//   </service>
// </services>

// After - local/modules/MyModule/MyModule.php
use Symfony\Component\DependencyInjection\Loader\Configurator\ServicesConfigurator;

public static function configureServices(ServicesConfigurator $servicesConfigurator): void
{
    $servicesConfigurator
        ->load('MyModule\\', __DIR__)
        ->autowire()
        ->autoconfigure();
}
```

Hooks, loops and forms are picked up by their base class. The core registers them for autoconfiguration in `TheliaKernel` (`registerForAutoconfiguration(BaseHookInterface::class)`, `LoopInterface::class`, `FormInterface::class`):

```php
// local/modules/MyModule/Hook/FrontHook.php
use Thelia\Core\Hook\BaseHook;

class FrontHook extends BaseHook
{
    public static function getSubscribedHooks(): array
    {
        return [
            'main.head-bottom' => [
                ['type' => 'front', 'method' => 'onMainHeadBottom'],
            ],
        ];
    }

    public function onMainHeadBottom(/* HookRenderEvent $event */): void { ... }
}
```

:::caution Remove the `<hooks>`, `<loops>` and `<forms>` blocks
A frequent migration mistake is keeping these in `config.xml` *and* extending the base class, which registers the service twice. Delete the XML declarations: the base class is enough.
:::

What `config.xml` is still used for, and only this:

- `<exports>` / `<imports>`: import/export profiles
- `<parameters>`: module parameters
- a `<loop>` alias when you want a loop name **different** from the auto-generated snake_case one

```php
// Before - #[TaggedIterator] / #[TaggedLocator] (deprecated since Symfony 7.1)
use Symfony\Component\DependencyInjection\Attribute\TaggedIterator;
public function __construct(#[TaggedIterator('my.tag')] iterable $handlers) {}

// After
use Symfony\Component\DependencyInjection\Attribute\AutowireIterator;
public function __construct(#[AutowireIterator('my.tag')] iterable $handlers) {}
```

`module.xml` (validated against `module-2_2.xsd`) and `schema.xml` (Propel) remain **required**.

## Installation: `bin/install`

Thelia 2 installs with `php Thelia thelia:install`, which boots the kernel. Thelia 3 adds **`bin/install`**, a standalone script: the database and module phases run on PDO and the filesystem only (no kernel), and it boots `App\Kernel` in-process just for `template:set`, the demo import, `module:post-activate-all` and admin creation. It takes CLI options and environment variables instead of interactive prompts.

```bash
# Recommended in Thelia 3
php bin/install \
  --frontoffice_theme=flexy --backoffice_theme=default-twig \
  --pdf_theme=default --email_theme=default \
  --with-demo --with-admin
```

`thelia:install` still exists in Thelia 3, but `bin/install` is the recommended path.

## Testing

Thelia 3 ships a test framework in `Thelia\Test\` (`core/lib/Thelia/Test/`):

- Extend `IntegrationTestCase` for functional tests (boots the kernel, rolls back the transaction per test).
- Extend `ApiTestCase` for API tests (JWT login + JSON-LD assertions).
- Use `FixtureFactory` to build entities, carts and orders.

```php
// tests/MyModuleTest.php
use Thelia\Test\IntegrationTestCase;

final class MyModuleTest extends IntegrationTestCase
{
    public function testSomething(): void
    {
        $factory = $this->createFixtureFactory();
        $product = $factory->product($factory->category(), $factory->taxRule(), $factory->currency());

        self::assertNotNull($product->getId());
    }
}
```

Bootstrap the isolated test database with `bin/test-prepare`. It creates the test DB, applies the schema, runs `module:post-activate-all`, and generates the JWT keypair (`lexik:jwt:generate-keypair --skip-if-exists --env=test`).

## What stayed the same

You do **not** rewrite these. They carry over unchanged:

- **Propel ORM**: same query API, same models. No `EntityManager`, no `flush()`: every `->save()` persists immediately. Respect the strict native types (`string` for `DECIMAL`, `int` for `tinyint`, so pass `1`/`0`, not `true`/`false`).
- **Event-driven flow**: `Controller → dispatch(Event) → Action listener → Model::save()`. A controller never persists.
- **`TheliaEvents` constants**: event names are unchanged.
- **Module lifecycle methods**: `install()`, `update()`, `preActivation()`, `postActivation()`, etc. on `BaseModule`.
- **`module.xml` + `schema.xml`**: still required, same format.

## Migration checklist

### Front-office templates

- [ ] Convert `.html` Smarty templates to `.html.twig`
- [ ] Replace `{loop}` calls with the `resources()` Twig function (not the deprecated `loop()`)
- [ ] Replace `{intl l="..."}` with `{{ '...'|trans }}`
- [ ] Replace `{$VAR}` with `{{ var }}`
- [ ] Convert jQuery to Stimulus controllers, reactive UI to LiveComponents

### Back-office

- [ ] Rebuild back-office screens on the `default-twig` bundle (the Smarty `default` theme is deprecated)
- [ ] Move controllers to `#[Route]` attributes, queries to `Repository/`, presenters to `Service/`
- [ ] Declare hooks with the bundle's `#[AsHook]` attribute

### Modules

- [ ] Add static `configureServices()` to your module class; remove the `<services>` XML
- [ ] Replace `routing.xml` / `@Route` with `#[Route]` attributes in `Controller/`
- [ ] Remove `<hooks>`, `<loops>`, `<forms>` from `config.xml`; the base classes auto-register them
- [ ] Keep in `config.xml` **only** `<exports>`, `<imports>`, `<parameters>`, and any `<loop>` alias
- [ ] Replace `#[TaggedIterator]` / `#[TaggedLocator]` with `#[AutowireIterator]` / `#[AutowireLocator]`
- [ ] Replace `getAnnotationRoutePrefix()` with `getRoutePrefix()`
- [ ] Audit Propel setter calls for strict types (`setVisible(1)`, not `setVisible(true)`)

### API resources

- [ ] Move `ApiPlatform\Api\*` imports to `ApiPlatform\Metadata\*`
- [ ] Move `ApiPlatform\Exception\*` imports to `ApiPlatform\Metadata\Exception\*`
- [ ] Replace operation `openapiContext` with `openapi: new Operation(...)`
- [ ] If you extend `ObjectNormalizer`, switch to `NormalizerAwareInterface` (it is now `final`)
- [ ] Replace `ApiProperty::withBuiltinTypes()` with `withNativeType()`

### Testing

- [ ] Bootstrap the test DB with `php bin/test-prepare`
- [ ] Extend `IntegrationTestCase` / `ApiTestCase`
- [ ] Use `FixtureFactory` for test data

## Namespace stability

| Class / method | Status in Thelia 3 |
|----------------|--------------------|
| `Thelia\Module\BaseModule` | Stable |
| `Thelia\Controller\Front\BaseFrontController` | Stable |
| `Thelia\Controller\Admin\BaseAdminController` | Stable |
| `Thelia\Core\Event\TheliaEvents` | Stable |
| `Thelia\Core\Hook\BaseHook` | Stable |
| `Thelia\Form\BaseForm` | Stable |
| `Thelia\Core\Template\Element\BaseLoop` | Stable; still supported, but prefer API resources for new code |
| `BaseModule::getAnnotationRoutePrefix()` | **Deprecated**; use `getRoutePrefix()` |

## See also

- [Architecture](/docs/architecture): understand the new system design
- [Front-Office](/docs/front-office): Twig and Symfony UX guide
- [Modules](/docs/modules): modern module development
- [Testing](/docs/testing): new test framework
