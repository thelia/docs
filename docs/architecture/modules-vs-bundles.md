---
title: Modules vs Bundles
sidebar_position: 4
---

# Modules vs Bundles

Thelia 3 uses two extension mechanisms: **Thelia Modules** and **Symfony Bundles**. Understanding the difference is essential for effective development.

## Quick Comparison

| Aspect | Thelia Module | Symfony Bundle |
|--------|---------------|----------------|
| **Structure** | `Config/`, `Controller/`, etc. (flat) | `src/`, standard Symfony structure |
| **Purpose** | E-commerce features | Generic Symfony functionality |
| **Examples** | Payment gateways, shipping, promotions | Flexy theme, third-party libraries |
| **Location** | `local/modules/` or `vendor/thelia/modules/` | `vendor/` |
| **Registration** | `module.xml` + database | `bundles.php` |
| **Templates** | `templates/frontoffice/`, `templates/backoffice/` | Symfony bundle conventions |

## Thelia Modules

Modules are the primary way to extend Thelia's e-commerce functionality.

### Directory Structure

```
local/modules/MyModule/
├── Config/
│   ├── module.xml          # Module metadata
│   ├── config.xml          # Services, listeners, tags
│   ├── routing.xml         # Routes
│   └── schema.xml          # Propel schema (optional)
├── Controller/
│   ├── Front/              # Front-office controllers
│   └── Back/               # Back-office controllers
├── Api/
│   ├── Resource/           # API Platform resources
│   └── Addon/              # Resource addons
├── LiveComponent/          # Symfony UX LiveComponents
├── Service/                # Business logic services
├── EventListeners/         # Event subscribers
├── Hook/                   # Back-office hooks
├── Loop/                   # Smarty loops (back-office)
├── Form/                   # Form types
├── Model/                  # Propel models (generated)
├── templates/
│   ├── frontoffice/        # Twig templates
│   └── backoffice/         # Smarty templates
├── I18n/                   # Translations
└── MyModule.php            # Module bootstrap class
```

### Module Locations

#### Vendor Modules (Official)

```
vendor/thelia/modules/
├── CustomerFamily/
├── Carousel/
├── HookAdminHome/
└── ...
```

These are installed via Composer and should not be modified directly.

#### Local Modules (Custom)

```
local/modules/
├── MyCustomModule/
├── ClientSpecificFeature/
└── ...
```

**Priority**: Local modules override vendor modules with the same name.

### Module Registration

**module.xml:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<module xmlns="http://thelia.net/schema/dic/module"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://thelia.net/schema/dic/module
        http://thelia.net/schema/dic/module/module-2_1.xsd">
    <fullnamespace>MyModule\MyModule</fullnamespace>
    <descriptive locale="en_US">
        <title>My Module</title>
        <description>A custom module for Thelia</description>
    </descriptive>
    <version>1.0.0</version>
    <author>
        <name>Your Name</name>
        <email>your@email.com</email>
    </author>
    <type>classic</type>
    <required>2.5.0</required>
</module>
```

### Module Activation

```bash
# Refresh module list
php Thelia module:refresh

# Activate module
php Thelia module:activate MyModule

# Deactivate module
php Thelia module:deactivate MyModule
```

## Symfony Bundles

Bundles follow standard Symfony conventions and are used for generic functionality.

### Example: Flexy Theme Bundle

The Flexy theme is implemented as a Symfony bundle, not a Thelia module:

```
vendor/thelia/flexy/
├── src/
│   ├── Flexy.php                    # Bundle class
│   ├── UiComponents/                # LiveComponents
│   │   ├── Pages/
│   │   │   ├── Product/
│   │   │   ├── Category/
│   │   │   └── Checkout/
│   │   ├── CartWidget/
│   │   └── Navigation/
│   └── Twig/
│       └── Extension/
├── assets/
│   └── controllers/                 # Stimulus controllers
├── templates/
│   └── components/                  # Component templates
└── composer.json
```

### Why Flexy is a Bundle

1. **LiveComponents** - Native Symfony UX integration
2. **Stimulus controllers** - Asset management through Symfony Encore
3. **No module.xml** - Not registered in Thelia's module system
4. **Template override** - Uses Symfony's bundle template override mechanism

### Bundle Registration

Bundles are registered in `config/bundles.php`:

```php
return [
    // Symfony bundles
    Symfony\Bundle\FrameworkBundle\FrameworkBundle::class => ['all' => true],

    // Thelia bundles
    Thelia\Flexy\Flexy::class => ['all' => true],
];
```

## When to Use Which

### Use a Thelia Module When:

- Adding payment gateway integration
- Creating shipping method providers
- Building promotion/coupon systems
- Extending product functionality (attributes, features)
- Adding back-office administration pages
- Creating Propel model extensions
- Implementing hooks for back-office templates

### Use a Symfony Bundle When:

- Building a complete front-office theme
- Creating reusable Symfony components
- Integrating third-party Symfony packages
- Building LiveComponent libraries
- Packaging Stimulus controllers

## Hybrid Approach

Some features may require both. For example, a complex marketplace module might:

1. **Thelia Module** (`local/modules/Marketplace/`)
   - Propel models for vendors, commissions
   - API resources for marketplace entities
   - Back-office admin pages
   - Event listeners for order processing

2. **Symfony Bundle** (`local/bundles/MarketplaceTheme/`)
   - LiveComponents for vendor dashboards
   - Stimulus controllers for complex UI
   - Twig extensions for marketplace-specific functions

## Template Override Patterns

### Overriding Module Templates (Thelia Module)

Place overrides in your theme directory:

```
templates/frontOffice/myTheme/
└── modules/
    └── CustomerFamily/
        └── customer-family-selector.html.twig
```

### Overriding Bundle Templates (Symfony Bundle)

Use Symfony's template override mechanism:

```
templates/bundles/
└── Flexy/
    └── components/
        └── ProductCard.html.twig
```

## Module Communication

### Accessing Module Services

```php
// In a controller or service
public function __construct(
    private CustomerFamilyService $customerFamilyService, // From CustomerFamily module
) {}
```

### Module Events

```php
// Listen to module events
use MyModule\Event\ProductReviewCreated;

class ReviewNotificationListener implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            ProductReviewCreated::class => 'onReviewCreated',
        ];
    }
}
```

## Best Practices

1. **Start with modules** - Most Thelia extensions should be modules
2. **Consider bundles for themes** - Front-office themes with LiveComponents work better as bundles
3. **Avoid mixing concerns** - Keep module responsibilities focused
4. **Use local/ for customization** - Override vendor modules in `local/modules/`
5. **Document dependencies** - List required modules in your module.xml

## Next Steps

- [Module Development](/docs/modules) - Complete guide to creating modules
- [API Resources](/docs/api/resources) - Adding API endpoints in modules
- [LiveComponents](/docs/front-office/live-components) - Building reactive components
