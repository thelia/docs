---
title: Module Development
sidebar_position: 1
---

# Module Development

Modules are the primary way to extend Thelia. They allow you to add new features, integrate third-party services, customize behavior, and build complete e-commerce solutions.

:::tip One Module Per Project
We recommend creating a single module for all your project-specific logic. Only create separate modules if you plan to share them with the community or need distinct functionality boundaries.
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
| **Loops** | Query data for back-office templates |
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
│   ├── module.xml             # Module metadata (required)
│   ├── config.xml             # Service configuration (required)
│   ├── routing.xml            # Route definitions
│   └── schema.xml             # Database schema
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
│   ├── frontOffice/           # Twig templates
│   └── backOffice/            # Smarty templates
└── I18n/                      # Translations
```

See [Module Structure](./structure) for detailed explanations of each component.

## Quick Start Example

Here's a minimal module that adds an API endpoint:

## PHP Best Practices

:::important Strict Types
All PHP files in your module **must** use strict typing:

```php
<?php

declare(strict_types=1);
```

This is mandatory for Thelia 3 modules and ensures type safety across your codebase.
:::

**MyProject.php**:
```php
<?php

declare(strict_types=1);

namespace MyProject;

use Thelia\Module\BaseModule;

final class MyProject extends BaseModule
{
    public const DOMAIN_NAME = 'myproject';
}
```

**Config/module.xml**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<module xmlns="http://thelia.net/schema/dic/module"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://thelia.net/schema/dic/module http://thelia.net/schema/dic/module/module-2_1.xsd">
    <fullnamespace>MyProject\MyProject</fullnamespace>
    <descriptive locale="en_US">
        <title>My Project</title>
        <description>Custom functionality for my project</description>
    </descriptive>
    <version>1.0.0</version>
    <author>
        <name>Your Name</name>
    </author>
    <thelia>2.5.0</thelia>
    <stability>stable</stability>
</module>
```

**Config/config.xml**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<config xmlns="http://thelia.net/schema/dic/config"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://thelia.net/schema/dic/config http://thelia.net/schema/dic/config/thelia-config.xsd">
</config>
```

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

- [Module Structure](./structure) - Detailed file and directory explanations
- [Module Lifecycle](./lifecycle) - Installation, activation, and updates
- [API Resources](./api-resources) - Creating API endpoints
- [API Addons](./api-addons) - Enriching existing resources
- [LiveComponents](./live-components) - Interactive front-office components
- [Controllers](./controllers) - Handling HTTP requests
- [Delivery Modules](./delivery-modules) - Shipping integrations
- [Payment Modules](./payment-modules) - Payment gateway integrations
