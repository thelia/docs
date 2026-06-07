---
title: Smarty Plugins
sidebar_position: 3
---

# Smarty Plugins

:::caution Legacy — Smarty back-office theme
Smarty plugins belong to the **legacy Smarty back-office theme**, which is **no longer recommended and will likely be dropped in Thelia 3.1**. The reference back-office is the **Twig** theme (`default-twig` bundle), where you use Twig functions and extensions instead of Smarty plugins.

Keep reading this section only if you maintain a Smarty back-office template. For the Twig back-office, use the mapping below.
:::

## Migrating from Smarty plugins to Twig

The Twig back-office replaces the most common Smarty plugins with Twig functions and filters. Most are registered by extensions inside the `default-twig` bundle (`BackOfficeDefaultTwigBundle\Twig\*`); `path()`, `url()` and `|trans` come from Symfony's standard Twig bridge.

| Smarty plugin | Twig equivalent | Provided by |
|---|---|---|
| `{url}` / `{token_url}` | `path()` / `url()`, and `token_url()` for CSRF-protected GET links | Symfony Twig bridge; `token_url()` from `BackOfficeUrlExtension` |
| `{config}` | `thelia_config('key', default)` | `ConfigExtension` |
| `{hook}` / `{hookblock}` | `safe_hook('name', {...})`, `hook_block('name', {...})`, `has_hook('name', {...})` | `HookExtension` (see [Hooks](/docs/back-office/hooks)) |
| `{intl l="..."}` | the `\|trans` filter | Symfony translator |

```twig
{# templates/backOffice/default-twig — Twig back-office #}

{# {url path="..."} → path()/url() #}
<a href="{{ path('admin.products.default') }}">{{ 'Products'|trans }}</a>

{# {token_url} → token_url() (adds the CSRF _token query parameter) #}
<a href="{{ token_url('admin.products.delete', { product_id: product.id }) }}">{{ 'Delete'|trans }}</a>

{# {config key="..."} → thelia_config() #}
<title>{{ thelia_config('store_name', 'Thelia') }}</title>

{# {hook name="..."} → safe_hook() #}
{{ safe_hook('main.head-css') }}

{# {hookblock} → hook_block() (returns a FragmentBag you iterate; fragment values are read as attributes) #}
{% for block in hook_block('home.block') %}
    <div class="{{ block.class|default('col-md-4') }}">
        {% if block.title %}<h2>{{ block.title }}</h2>{% endif %}
        {{ block.content|raw }}
    </div>
{% endfor %}
```

:::note
`token_url()` reuses the per-session CSRF token, so concurrent AJAX fragments rendered on the same page do not invalidate links already rendered. `safe_hook()` swallows listener errors (returns an empty string and logs a warning) so a faulty module hook cannot break the page. See [Hooks](/docs/back-office/hooks) for the full hook reference.
:::

## Authoring a Smarty plugin (legacy)

Smarty plugins extend the Smarty template engine with custom functions, modifiers, and blocks. To create a Smarty plugin in Thelia, create a class that extends `TheliaSmarty\Template\AbstractSmartyPlugin` and implement the `getPluginDescriptors()` method.     
A smarty plugin is described like this :
```php
new SmartyPluginDescriptor(
    'function',
    'myFunction',
    $this,
    'doMyFunction'
)
```

First parameter is the type of the plugin, more information [here](https://smarty-php.github.io/smarty/programmers/plugins.html).    
Second parameter is the name you have to put in your templates to call your plugin.     
Third parameter is location of the Class of your function, in general it's `$this` because you write function in the same class as the declaration.    
Fourth parameter is the name of the function you want to call.

Declaration of your plugins :
```php 
class MyProjectPlugin extends AbstractSmartyPlugin
{
    public function getPluginDescriptors()
    {
        return [
            new SmartyPluginDescriptor(
                'function',
                'lower',
                 $this,
                'lowerString'
            ),
            new SmartyPluginDescriptor(
                'function',
                'bestProduct',
                $this,
                'getBestProduct'
            )
        ];
    }
    
    public function lowerString($params)
    {
        return strtolower($params['string']);
    }
    
    public function getBestProduct($params)
    {
        // Do a query to find your best product and return it
    }
}
```

Usage :
```smarty
    {lower string="A String THAT need to be LOWERCASE"} // Some plugins needs params
    
    {bestProduct} // Other don't
```
