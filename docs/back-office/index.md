---
title: Back-Office Development
sidebar_position: 1
---

# Back-Office Development

The back-office (admin panel) in Thelia uses **Smarty templates** with **Loops** and **Hooks**. This section covers tools and techniques specific to back-office development.

## Back-Office vs Front-Office

| Aspect | Back-Office | Front-Office |
|--------|-------------|--------------|
| Template Engine | **Smarty** | **Twig** |
| Data Fetching | **Loops** (Propel queries) | **DataAccessService** (API) |
| Extensibility | **Hooks** (Smarty functions) | **LiveComponents** |
| Interactivity | JavaScript | **Stimulus** controllers |

## Technology Stack

### Smarty Templates

The back-office uses Smarty as its template engine, located in:

```
templates/backOffice/default/
├── admin-home.html
├── categories.html
├── products.html
├── orders.html
└── ...
```

### Loops

Loops are Smarty plugins that query the database and iterate over results. They remain the primary way to fetch and display data in the back-office.

```smarty
{loop type="product" name="products" category="3" visible="1"}
    <tr>
        <td>{$ID}</td>
        <td>{$TITLE}</td>
        <td>{$PRICE} {$CURRENCY}</td>
    </tr>
{/loop}
```

See the [Loops Reference](/docs/back-office/loops) for all available loops.

### Hooks

Hooks allow modules to inject content at specific points in back-office templates:

```smarty
{hook name="product.additional-info" product="{$ID}"}
```

See the [Hooks Reference](/docs/back-office/hooks) for all available hooks.

### Smarty Plugins

Custom Smarty functions for common operations:

```smarty
{* URL generation *}
<a href="{url path="/admin/products"}">Products</a>

{* Internationalization *}
<h1>{intl l="Product Management"}</h1>

{* Configuration values *}
{config key="store_name"}
```

See [Smarty Plugins](/docs/back-office/smarty-plugins) for the complete reference.

## Module Back-Office Integration

### Adding Admin Pages

Modules can add their own admin pages:

```php
<?php
// Config/routing.xml
<route id="mymodule.admin.config" path="/admin/module/MyModule">
    <default key="_controller">MyModule\Controller\AdminController::configAction</default>
</route>
```

### Adding to Admin Menu

Use hooks to add entries to the admin menu:

```php
public static function getSubscribedHooks(): array
{
    return [
        'main.top-menu-tools' => [
            ['type' => 'back', 'method' => 'onMainTopMenuTools']
        ],
    ];
}

public function onMainTopMenuTools(HookRenderBlockEvent $event): void
{
    $event->add([
        'id' => 'mymodule-menu',
        'title' => $this->trans('My Module'),
        'url' => URL::getInstance()->absoluteUrl('/admin/module/MyModule'),
    ]);
}
```

### Extending Existing Pages

Add content to existing admin pages via hooks:

```php
public static function getSubscribedHooks(): array
{
    return [
        'product.edit-js' => [
            ['type' => 'back', 'method' => 'onProductEditJs']
        ],
    ];
}

public function onProductEditJs(HookRenderEvent $event): void
{
    $productId = $event->getArgument('product_id');
    $event->add($this->render('product-edit-js.html', [
        'product_id' => $productId
    ]));
}
```

## Directory Structure

### Default Back-Office Theme

```
templates/backOffice/default/
├── admin-home.html           # Dashboard
├── categories.html           # Category management
├── category-edit.html        # Category editor
├── products.html             # Product list
├── product-edit.html         # Product editor
├── orders.html               # Order list
├── order-edit.html           # Order details
├── customers.html            # Customer list
├── customer-edit.html        # Customer details
├── modules.html              # Module management
├── configuration.html        # Configuration pages
├── assets/
│   ├── css/
│   └── js/
├── includes/
│   ├── header.html
│   ├── footer.html
│   └── sidebar.html
└── forms/
    └── standard/
```

### Module Back-Office Templates

```
local/modules/MyModule/
├── templates/
│   └── backOffice/
│       └── default/
│           ├── module-config.html
│           └── includes/
│               └── my-component.html
```

## Back-Office Forms

Use Thelia's form system for admin forms:

```php
<?php
namespace MyModule\Form;

use Thelia\Form\BaseForm;

class ConfigForm extends BaseForm
{
    protected function buildForm(): void
    {
        $this->formBuilder
            ->add('api_key', 'text', [
                'label' => 'API Key',
                'required' => true,
            ])
            ->add('enabled', 'checkbox', [
                'label' => 'Enable Module',
            ]);
    }

    public static function getName(): string
    {
        return 'mymodule_config';
    }
}
```

Render in template:

```smarty
<form method="post" action="{url path="/admin/module/MyModule/save"}">
    {form name="mymodule_config"}
        {form_field field="api_key"}
            <div class="form-group">
                <label>{$label}</label>
                <input type="text" name="{$name}" value="{$value}" class="form-control" />
                {if $error}<span class="error">{$message}</span>{/if}
            </div>
        {/form_field}

        {form_field field="enabled"}
            <div class="checkbox">
                <label>
                    <input type="checkbox" name="{$name}" {if $value}checked{/if} />
                    {$label}
                </label>
            </div>
        {/form_field}

        <button type="submit" class="btn btn-primary">
            {intl l="Save"}
        </button>
    {/form}
</form>
```

## Best Practices

### Do

- Use **Loops** for data fetching in back-office templates
- Use **Hooks** to extend existing admin pages
- Follow the existing admin UI patterns and CSS classes
- Use `{intl}` for all user-facing strings
- Validate forms server-side

### Don't

- Don't modify core back-office templates directly
- Don't use API calls for simple data fetching in back-office (use Loops)
- Don't hardcode URLs (use `{url}` plugin)
- Don't skip form CSRF tokens

## Reference Documentation

- [Loops Reference](./loops/) - All available loops
- [Hooks Reference](./hooks) - All back-office hooks
- [Smarty Plugins](./smarty-plugins/) - Built-in Smarty functions
- [Forms](/docs/reference/forms) - Form handling

## Next Steps

- [Loops](./loops/) - Learn about data fetching with Loops
- [Hooks](./hooks) - Extend the admin interface
- [Module Development](/docs/modules) - Create back-office modules
