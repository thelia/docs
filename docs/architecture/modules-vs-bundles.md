---
title: Modules vs Bundles
sidebar_position: 5
---

# Modules vs Bundles

Thelia 3 extends in two ways: **Thelia Modules** and **Symfony Bundles**. A module is the e-commerce extension unit. It lives in the database, can be activated or deactivated at runtime, and plugs into the checkout, hooks and API. A bundle is a standard Symfony bundle loaded at boot from `config/bundles.php`, which is how the front-office and back-office themes ship.

This page explains when to reach for each, and what a Thelia 3 module actually contains now that almost all of the old XML wiring is gone.

## Quick comparison

| Aspect | Thelia Module | Symfony Bundle |
|--------|---------------|----------------|
| **Registration** | `Config/module.xml` + a row in the `module` database table | `config/bundles.php` |
| **Runtime toggle** | Activated/deactivated through the back-office or `module:activate` | Always loaded, no runtime toggle |
| **Purpose** | E-commerce features (payment, delivery, catalog, hooks, API) | Generic Symfony functionality, themes |
| **Examples** | Payment gateways, shipping providers, promotions | `FlexyBundle` (front theme), `BackOfficeDefaultTwigBundle` (BO theme) |
| **Location** | `local/modules/` or `vendor/thelia/modules/` | Any autoloaded namespace, registered in `bundles.php` |
| **Service wiring** | `static configureServices()` in the module class | `loadExtension()` in the bundle class |

:::note Themes are bundles
Both reference themes are Symfony bundles, not Thelia modules: the Flexy front-office theme is `FlexyBundle\FlexyBundle` and the Twig back-office theme is `BackOfficeDefaultTwigBundle\BackOfficeDefaultTwigBundle`. See [Symfony Bundles](#symfony-bundles) below.
:::

## Thelia modules

Modules are the primary way to extend Thelia's e-commerce functionality. A Thelia 3 module is mostly **plain PHP with attributes**. The XML wiring that older Thelia versions required for services, routes, hooks, loops and forms is gone, because the framework discovers those automatically.

### Directory structure

```
local/modules/MyModule/
├── Config/
│   ├── module.xml          # REQUIRED - metadata, validated against module-2_2.xsd
│   ├── schema.xml          # Only if the module has its own database tables
│   ├── TheliaMain.sql      # SQL applied on first activation (postActivation)
│   ├── update/             # Versioned migration SQL (1.0.1.sql, 1.1.0.sql, ...)
│   └── config.xml          # OPTIONAL - see "What config.xml is still for"
├── Controller/             # #[Route] PHP attributes, auto-scanned (no routing.xml)
├── Api/
│   └── Resource/           # API Platform resources, auto-discovered
├── Hook/                   # extends BaseHook, auto-tagged (no <hooks> XML)
├── Loop/                   # extends BaseLoop, auto-tagged (legacy, prefer API resources)
├── Form/                   # extends BaseForm, auto-tagged (no <forms> XML)
├── EventListener/          # EventSubscriberInterface or #[AsEventListener]
├── Service/                # Business logic services, autowired
├── Model/                  # Propel models (generated from schema.xml)
├── I18n/                   # fr_FR.php, en_US.php
├── templates/
│   ├── frontOffice/flexy/  # Twig overrides
│   └── backOffice/default/ # Back-office hook templates
└── MyModule.php            # Module class: extends BaseModule + configureServices()
```

:::caution Only two files are mandatory
A module only requires `Config/module.xml` and a module class (`MyModule.php`). `Config/schema.xml` is needed **only if** the module declares its own database tables. Everything else is optional and discovered from PHP.
:::

### The module class wires services

There is no `<service>` XML. Services are registered in a static `configureServices()` method on the module class, using the standard Symfony service configurator:

```php
// local/modules/MyModule/MyModule.php
<?php

declare(strict_types=1);

namespace MyModule;

use Symfony\Component\DependencyInjection\Loader\Configurator\ServicesConfigurator;
use Thelia\Module\BaseModule;

final class MyModule extends BaseModule
{
    public const DOMAIN_NAME = 'mymodule';

    public static function configureServices(ServicesConfigurator $services): void
    {
        $services->load(self::getModuleCode().'\\', __DIR__)
            ->exclude([
                __DIR__.'/I18n/*',
                __DIR__.'/Config/**/*.php',
                __DIR__.'/Model/*',
                __DIR__.'/MyModule.php',
            ])
            ->autowire()
            ->autoconfigure();
    }
}
```

The `autoconfigure()` call is what makes auto-discovery work:

- **Controllers** with `#[Route]` attributes are scanned by `ModuleAttributeLoader` (`Thelia\Core\Routing\ModuleAttributeLoader`). No `routing.xml`.
- **Hooks** extending `BaseHook` and declaring `getSubscribedHooks()` are tagged `hook.event_listener`. No `<hooks>` XML.
- **Loops** extending `BaseLoop` are tagged `thelia.loop` with a snake_case name. No `<loops>` XML.
- **Forms** extending `BaseForm` are tagged `thelia.form`. No `<forms>` XML.
- **Event listeners** implementing `EventSubscriberInterface` (or annotated `#[AsEventListener]`) are tagged automatically.

:::caution `configureServices()` is mandatory
Without `configureServices()`, **zero** classes in the module are scanned: no controllers, no hooks, no services. The auto-registration only happens through this method.
:::

### `module.xml` (required)

`module.xml` is the only XML file every module must ship. It holds the metadata Thelia stores in the database. Validate it against `module-2_2.xsd` (the current schema):

```xml
<!-- local/modules/MyModule/Config/module.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<module xmlns="http://thelia.net/schema/dic/module"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://thelia.net/schema/dic/module
        http://thelia.net/schema/dic/module/module-2_2.xsd">
    <fullnamespace>MyModule\MyModule</fullnamespace>
    <descriptive locale="en_US">
        <title>My Module</title>
        <description>A custom module for Thelia</description>
    </descriptive>
    <descriptive locale="fr_FR">
        <title>Mon module</title>
    </descriptive>
    <languages>
        <language>en_US</language>
        <language>fr_FR</language>
    </languages>
    <version>1.0.0</version>
    <authors>
        <author>
            <name>Your Name</name>
            <email>your@email.com</email>
        </author>
    </authors>
    <type>classic</type>
    <thelia>3.0.0</thelia>
    <stability>alpha</stability>
</module>
```

A few rules enforced by the schema (`core/lib/Thelia/Module/schema/module/module-2_2.xsd`):

- `<fullnamespace>` and at least one `<descriptive>` are mandatory.
- `<type>` must be one of: `classic`, `delivery`, `payment`, `marketplace`, `price`, `accounting`, `seo`, `administration`, `statistic`.
- `<thelia>` is the **minimum Thelia version** the module needs (dotted format).
- `<required>` is **not** a version string. It is a container of `<module>` elements listing other modules this one depends on, each with an optional `version` attribute. Do not put the Thelia version there.

:::note Which XSD is accepted
`ModuleDescriptorValidator` tries every bundled XSD (`module.xsd`, `module-2_1.xsd`, `module-2_2.xsd`) and accepts the file if it validates against any of them, so older descriptors still load. Use `module-2_2.xsd` for new modules, since it is the current schema.
:::

### `schema.xml` (only with database tables)

If your module needs its own tables, declare them in `Config/schema.xml` (Propel format). The generated models land in `Model/`. Modules with no custom tables omit this file entirely. See [Propel](./propel.md) for the schema format.

### What `config.xml` is still for

`config.xml` is **optional**. Services, routes, hooks, loops and forms are no longer declared there. Keep it only for the few things that have no PHP attribute equivalent:

- `<exports>` / `<imports>`: registering back-office export/import profiles
- `<parameters>`: container parameters
- A loop `<loop name="...">` alias when you need a name different from the auto-generated snake_case

:::caution Do not re-declare what is auto-discovered
The `config.xml` loader still parses `<services>`, `<hooks>`, `<loops>`, `<forms>` and `<commands>`, but declaring them there duplicates the auto-configuration and is discouraged: hand-declaring a hook or service that is also auto-discovered registers it twice. A module that only contains controllers, hooks, services and forms needs no `config.xml` at all.
:::

### Module locations

Official modules are installed via Composer under `vendor/thelia/modules/`. Custom modules go in `local/modules/`:

```
vendor/thelia/modules/        local/modules/
├── FreeOrder/                ├── MyCustomModule/
├── VirtualProductDelivery/   └── ClientSpecificFeature/
└── ...
```

:::caution Local overrides vendor silently
A `local/modules/Foo` directory takes priority over `vendor/thelia/modules/Foo`. If both exist with the same code, only the local one loads. Use distinct names to avoid shadowing a vendor module by accident.
:::

A module present on disk is invisible until it is registered in the `module` database table. The boot-time source of truth is `ModuleQuery::getActivated()`.

### Activation commands

```bash
# Refresh the module list (scan the filesystem, register new modules in DB)
php Thelia module:refresh

# Activate a module
php Thelia module:activate MyModule

# Deactivate a module
php Thelia module:deactivate MyModule
```

:::note Use `php Thelia`, not `bin/console`
Thelia ships its own console entry point. Run module commands with `php Thelia <command>`.
:::

## Symfony bundles

Bundles follow standard Symfony conventions. In Thelia 3 they are how the themes ship: the front-office theme and the back-office theme are each a bundle, with their own controllers, services, Twig components, Stimulus controllers and assets.

### The front-office theme: FlexyBundle

The Flexy theme lives at `templates/frontOffice/flexy/` and its bundle class is `FlexyBundle\FlexyBundle`:

```
templates/frontOffice/flexy/
├── src/
│   ├── FlexyBundle.php          # extends AbstractBundle
│   ├── Controller/
│   ├── DTO/
│   ├── EventListener/
│   ├── Form/
│   ├── Service/
│   ├── UiComponents/            # Live/Twig components
│   └── Twig/
├── assets/                      # Stimulus controllers, JS/CSS sources
├── components/                  # Twig component templates
└── composer.json                # "type": "thelia-frontoffice-template"
```

`FlexyBundle` wires its services in `loadExtension()` with the same `autowire()->autoconfigure()` pattern modules use:

```php
// templates/frontOffice/flexy/src/FlexyBundle.php
public function loadExtension(array $config, ContainerConfigurator $container, ContainerBuilder $builder): void
{
    $serviceConfigurator = $container->services();

    $resourcePath = $this->getResourcePath();
    if (is_dir($resourcePath)) {
        $serviceConfigurator->load('FlexyBundle\\', $resourcePath)
            ->autowire()
            ->autoconfigure();
    }
    // ...
}
```

### The back-office theme: BackOfficeDefaultTwigBundle

The Twig back-office is also a bundle. It lives at `templates/backOffice/default-twig/`, its class is `BackOfficeDefaultTwigBundle\BackOfficeDefaultTwigBundle`, and it carries its own `composer.json` (`"type": "thelia-backoffice-template"`). It owns its routes (`#[Route]` attributes on its controllers), hooks, Twig templates, forms and compiled assets, following the same "themes are bundles" model.

```
templates/backOffice/default-twig/
├── src/
│   ├── BackOfficeDefaultTwigBundle.php
│   ├── Controller/
│   ├── Form/
│   ├── Hook/
│   ├── Repository/
│   ├── Service/
│   ├── Twig/
│   └── UiComponents/
├── components/
├── dist/                        # Compiled assets (Webpack Encore)
├── composer.json                # "type": "thelia-backoffice-template"
└── README.md
```

:::tip The back-office reference is the Twig bundle
`BackOfficeDefaultTwigBundle` is the recommended back-office. The older Smarty "default" back-office theme is no longer recommended and is expected to be dropped in a future release. New back-office work should target the Twig bundle.
:::

### Bundle registration

Bundles are registered in `config/bundles.php`:

```php
// config/bundles.php
return [
    ApiPlatform\Symfony\Bundle\ApiPlatformBundle::class => ['all' => true],
    BackOfficeDefaultTwigBundle\BackOfficeDefaultTwigBundle::class => ['all' => true],
    FlexyBundle\FlexyBundle::class => ['all' => true],
    Symfony\Bundle\FrameworkBundle\FrameworkBundle::class => ['all' => true],
    // ...
];
```

Note the fully qualified class names: `FlexyBundle\FlexyBundle::class` and `BackOfficeDefaultTwigBundle\BackOfficeDefaultTwigBundle::class`. There is no `vendor/thelia/flexy/` path involved. The theme is referenced by its bundle class, and its sources live under `templates/`.

## When to use which

### Use a Thelia module when you need

- A payment or delivery provider (`AbstractPaymentModule`, `AbstractDeliveryModule`)
- Promotion / coupon logic
- Extra catalog data (attributes, features) with its own Propel tables
- Back-office hooks or admin pages tied to e-commerce
- A feature that must be activated/deactivated at runtime, per installation

### Use a Symfony bundle when you need

- A complete front-office or back-office theme
- A reusable, framework-level component library (Twig/Live components, Stimulus controllers)
- To integrate a third-party Symfony package

## Listening to events

Event listeners in a module are auto-tagged through `autoconfigure()`. The classic Thelia pattern is `EventSubscriberInterface`:

```php
// local/modules/MyModule/EventListener/ReviewNotificationListener.php
<?php

declare(strict_types=1);

namespace MyModule\EventListener;

use MyModule\Event\ProductReviewCreated;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

final class ReviewNotificationListener implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            ProductReviewCreated::class => 'onReviewCreated',
        ];
    }

    public function onReviewCreated(ProductReviewCreated $event): void
    {
        // ...
    }
}
```

The Symfony 7.4-native alternative is the `#[AsEventListener]` attribute on a single method, which also works under `autoconfigure()`:

```php
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

final class ReviewNotificationListener
{
    #[AsEventListener(event: ProductReviewCreated::class)]
    public function onReviewCreated(ProductReviewCreated $event): void
    {
        // ...
    }
}
```

## Accessing another module's services

If a module is active and exposes a public service, you can inject it by type, like any Symfony service:

```php
// Illustrative only - CustomerFamilyService is an example, not a guaranteed API.
public function __construct(
    private readonly CustomerFamilyService $customerFamilyService,
) {}
```

:::caution Depend on active modules explicitly
A service from another module only exists when that module is active. Declare the dependency in your `module.xml` `<required>` block so installation order is enforced, and guard for the module being disabled.
:::

## Learn more

- [Module structure](/docs/modules/structure): full breakdown of a module's files
- [Module lifecycle](/docs/modules/lifecycle): install, activate, update, destroy
- [API resources](/docs/api/resources): exposing API endpoints from a module
- [Live components](/docs/front-office/live-components): building reactive UI inside a theme bundle
- [Propel](./propel.md): the ORM and `schema.xml` format
