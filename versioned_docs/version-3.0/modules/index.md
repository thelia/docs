---
title: Module Development
sidebar_position: 1
---

# Module Development

Modules are the primary way to extend Thelia. Use them to add features, integrate third-party services, and customize behavior, up to building a complete e-commerce solution.

:::tip One module per project
Create a single module for all your project-specific logic. Only split into separate modules if you plan to share them with the community or need distinct functionality boundaries.
:::

## Module Locations

Thelia 3 has two locations for modules:

### Vendor Modules (Official)

Official and community modules installed via Composer:

```
vendor/thelia/modules/
├── CustomerFamily/
├── Carousel/
├── HookAdminHome/
└── ...
```

### Local Modules (Custom)

Your project-specific modules:

```
local/modules/
├── MyProject/
└── ...
```

**Priority**: Modules in `local/modules/` take precedence over `vendor/thelia/modules/`, allowing you to override vendor modules when needed.

## Creating a Module

Use the module generator command:

```bash
php Thelia module:generate MyProject
```

This creates the basic structure in `local/modules/MyProject/`.

## Module Capabilities

Modules can:

| Capability | Description |
|------------|-------------|
| **API Resources** | Expose data via API Platform endpoints |
| **API Addons** | Enrich existing resources with additional data |
| **LiveComponents** | Create interactive front-office components |
| **Controllers** | Handle HTTP requests (front and admin) |
| **Event Listeners** | React to system events |
| **Loops** | `BaseLoop` is the extension point for `{loop}` in Smarty back-office templates; for front-office (Twig) data, prefer API resources |
| **Hooks** | Inject content into back-office templates |
| **Forms** | Create validated forms |
| **Commands** | Add CLI commands |
| **Database Tables** | Define custom Propel schemas |

## Module Structure

```
local/modules/MyProject/
├── MyProject.php              # Main module class (required)
├── composer.json              # For distribution
├── Config/
│   ├── module.xml             # Module metadata (required, XSD module-2_2.xsd)
│   ├── config.xml             # Legacy XML config (stub still required as a file; content optional)
│   ├── routing.xml            # Legacy routes (optional, prefer #[Route] attributes)
│   └── schema.xml             # Database schema (only if you define tables)
├── Api/
│   ├── Resource/              # API Platform resources
│   └── Addon/                 # Resource addons
├── Controller/
│   ├── Front/                 # Front-office controllers
│   └── Admin/                 # Back-office controllers
├── EventListeners/            # Event subscribers
├── Service/                   # Business logic services
├── LiveComponent/             # Symfony UX LiveComponents
├── Hook/                      # Back-office hook handlers
├── Loop/                      # Back-office data loops
├── Form/                      # Form types
├── Command/                   # Console commands
├── Model/                     # Propel models (generated)
├── templates/
│   ├── frontOffice/           # Twig templates (Flexy theme)
│   └── backOffice/            # Back-office template overrides
└── I18n/                      # Translations
```

See [Module Structure](./structure.md) for detailed explanations of each component.

:::note Back-office templates
The reference back-office theme in Thelia 3 is the **default-twig** bundle: a self-contained bundle with its own `#[Route]` controllers, hooks, Twig templates, form themes and assets. The legacy Smarty `default` back-office theme is deprecated and is expected to be dropped in Thelia 3.1. Target the Twig back-office for new module screens.
:::

## PHP Best Practices

:::important Strict types
All PHP files in your module **must** use strict typing:

```php
<?php

declare(strict_types=1);
```

This is mandatory for Thelia 3 modules.
:::

**MyProject.php**:
```php
<?php

declare(strict_types=1);

namespace MyProject;

use Symfony\Component\DependencyInjection\Loader\Configurator\ServicesConfigurator;
use Thelia\Module\BaseModule;

final class MyProject extends BaseModule
{
    public const DOMAIN_NAME = 'myproject';

    public static function configureServices(ServicesConfigurator $servicesConfigurator): void
    {
        $servicesConfigurator->load(self::getModuleCode().'\\', __DIR__)
            ->exclude([__DIR__.'/I18n/*'])
            ->autowire()
            ->autoconfigure();
    }
}
```

**Config/module.xml**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<module xmlns="http://thelia.net/schema/dic/module"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://thelia.net/schema/dic/module http://thelia.net/schema/dic/module/module-2_2.xsd">
    <fullnamespace>MyProject\MyProject</fullnamespace>
    <descriptive locale="en_US">
        <title>My Project</title>
        <description>Custom functionality for my project</description>
    </descriptive>
    <languages>
        <language>en_US</language>
        <language>fr_FR</language>
    </languages>
    <version>1.0.0</version>
    <authors>
        <author>
            <name>Your Name</name>
            <email>you@example.com</email>
        </author>
    </authors>
    <type>classic</type>
    <thelia>2.5.0</thelia>
    <stability>prod</stability>
</module>
```

**Config/config.xml** (legacy stub):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<config xmlns="http://thelia.net/schema/dic/config"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://thelia.net/schema/dic/config http://thelia.net/schema/dic/config/thelia-1.0.xsd">
</config>
```

:::note Services are not declared in config.xml
Your services are registered through `configureServices()` (autowire + autoconfigure), not in `config.xml`. The same applies to hooks, loops, forms and commands: they are auto-discovered from their base class or interface. You only need entries in `config.xml` for legacy declarations the core still reads from it: `<exports>`, `<imports>`, `<parameters>`, and loop name aliases that differ from the auto-generated snake_case name.
:::

:::caution config.xml must still exist as a file
The core kernel (`TheliaKernel`) loads `Config/config.xml` unconditionally for every activated module, and the module installer (`ModuleValidator`) checks the file exists before activation. A missing `config.xml` raises a `FileLocatorFileNotFoundException` at container compile time in debug mode (in production the error is caught and logged, and the module silently fails to load). Keep the empty stub above even when everything is autowired. `php Thelia module:generate` already creates it for you.
:::

:::tip routing.xml is legacy
Declare your routes with `#[Route]` PHP 8 attributes on your controllers. The `ModuleAttributeLoader` auto-scans the module's `Controller/` directory and applies `BaseModule::getRoutePrefix()` to every route. `Config/routing.xml` is only kept for backward compatibility and is not needed for new modules.
:::

## Activating a Module

After creating your module:

1. Refresh the module list:
   ```bash
   php Thelia module:refresh
   ```

2. Activate via CLI:
   ```bash
   php Thelia module:activate MyProject
   ```

   Or activate from the back-office: **Configuration > Modules**.

## Next Steps

### Module Development
- [Module Structure](./structure.md) - Detailed file and directory explanations
- [Module Lifecycle](./lifecycle.md) - Installation, activation, and updates
- [Controllers](./controllers.md) - Handling HTTP requests
- [Delivery Modules](./delivery-modules.md) - Shipping integrations
- [Payment Modules](./payment-modules.md) - Payment gateway integrations

### API Development
- [API Resources](/docs/api/resources) - Creating API endpoints
- [API Addons](/docs/api/addons) - Enriching existing resources
- [Translatable Resources](/docs/api/translatable-resources) - i18n support

### Front-Office Development
- [LiveComponents](/docs/front-office/live-components) - Interactive front-office components
- [Twig Basics](/docs/front-office/twig-basics) - Template development
