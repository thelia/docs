---
title: Hooks
sidebar_position: 2
toc_max_heading_level: 4
---

# Hooks

Hooks are extension points in templates. Modules use them to inject markup and add features to a page without editing the template itself.

A template declares a hook by its name. When the page is rendered, that name is turned into an event and dispatched. Modules that listen to the event generate content and add it to the event. The collected content is then injected in place of the hook.

```twig
{# templates/backOffice/default-twig/catalog/product/edit.html.twig #}
{% for block in hook_block('product.tab', { product_id: product.id }) %}
    <li><a href="{{ block.href }}">{{ block.title }}</a></li>
{% endfor %}
```

:::info Hooks are the back-office extension mechanism
In Thelia 3, hooks remain the way modules extend the back-office UI. The back-office is now the `default-twig` bundle (Bootstrap 5 / Twig / Stimulus), so hook content is consumed through Twig functions (`hook()`, `hook_block()`, and so on), not the Smarty `{hook}` tag.

For the front-office (Flexy theme), prefer [LiveComponents](/docs/front-office/live-components) or override Twig templates directly.
:::

## Consuming hooks in Twig

The back-office exposes two kinds of functions: single hooks return a concatenated string, and block hooks return iterable fragments.

### Single hooks (concatenated string)

The `hook()` function dispatches a `HookRenderEvent`. Each listener appends a fragment of HTML; the function returns the concatenation.

```twig
<section id="product-details">
    {{ hook('product.details.top', { product: product.id }) }}
</section>
```

`hook()` is provided by the `TwigEngine` module
(`TwigEngine\Extension\HookExtension`) and is output-safe (`is_safe: html`).

The `default-twig` bundle adds a tolerant variant, `safe_hook()`
(`BackOfficeDefaultTwigBundle\Twig\HookExtension`). It catches listener exceptions and logs
a warning instead of breaking the page. This helps while a third-party module still ships only
Smarty templates during the cohabitation phase.

```twig
{{ safe_hook('main.head-css') }}
```

### Block hooks (iterable fragments)

A block hook dispatches a `HookRenderBlockEvent`. Each listener adds an associative array; the function returns an iterable of fragments you loop over to keep full control of the markup.

```twig
{# from BackOfficeDefaultTwigBundle\Twig\HookExtension #}
{% if has_hook('product.tab') %}
  <ul>
    {% for block in hook_block('product.tab', { product_id: product.id }) %}
      <li><a href="{{ block.href }}">{{ block.title }}</a></li>
    {% endfor %}
  </ul>
{% endif %}
```

- `hook_block(name, params)` returns a `Thelia\Core\Hook\FragmentBag` (iterable). Each fragment exposes its keys as Twig properties (`block.title`, `block.content`, `block.href`, and so on).
- `has_hook(name, params)` returns `true` when at least one listener contributed a fragment. Use it to skip empty wrappers.

:::tip Render `block.content` as raw HTML
Fragment values produced by listeners are already HTML. Output them with `|raw`:

```twig
{% for block in hook_block('home.block', { foo: bar }) %}
    <h2>{{ block.title }}</h2>
    {{ block.content|raw }}
{% endfor %}
```
:::

### PDF hooks

The PDF template family has its own functions, dispatching with the `PDF` template type:

- `pdf_hook(name, params)`: single hook, returns an output-safe string.
- `pdf_hook_block(name, params)`: block hook, returns a `FragmentBag`.
- `has_pdf_hook(name, params)`: returns `true` when a listener contributed.

The six functions `hook_block`, `has_hook`, `safe_hook`, `pdf_hook`, `pdf_hook_block`, and `has_pdf_hook` are registered in `BackOfficeDefaultTwigBundle\Twig\HookExtension::getFunctions()`; `hook()` comes from the `TwigEngine` module.

## Declaring a hook listener

A listener generates the content injected into a hook. You can declare one in two ways.

### Core listener (`BaseHook` + `getSubscribedHooks()`)

This is the portable, framework-level mechanism. Extend `Thelia\Core\Hook\BaseHook` and implement `getSubscribedHooks()` to declare which hooks the class listens to, mapping each hook name to one or more `[type, method]` entries.

```php
<?php
// local/modules/HookNavigation/src/Hook/FrontHook.php

namespace HookNavigation\Hook;

use Thelia\Core\Event\Hook\HookRenderEvent;
use Thelia\Core\Hook\BaseHook;

class FrontHook extends BaseHook
{
    public function onMainFooterBottom(HookRenderEvent $event): void
    {
        $content = $this->render('my-main-footer-bottom.html');
        $event->add($content);
    }

    public static function getSubscribedHooks(): array
    {
        return [
            'main.footer-bottom' => [
                [
                    'type' => 'front',
                    'method' => 'onMainFooterBottom',
                ],
            ],
        ];
    }
}
```

For a block hook, the listener receives a `Thelia\Core\Event\Hook\HookRenderBlockEvent` and adds an associative array per fragment:

```php
<?php
// local/modules/HookNavigation/src/Hook/FrontHook.php

namespace HookNavigation\Hook;

use Thelia\Core\Event\Hook\HookRenderBlockEvent;
use Thelia\Core\Hook\BaseHook;

class FrontHook extends BaseHook
{
    public function onMainFooterBody(HookRenderBlockEvent $event): void
    {
        $event->add([
            'id' => 'article-footer-body',
            'class' => 'article-links',
            'title' => $this->trans('Latest articles', [], HookNavigation::MESSAGE_DOMAIN),
            'content' => $this->render('article-links.html'),
        ]);
    }

    public static function getSubscribedHooks(): array
    {
        return [
            'main.footer-body' => [
                [
                    'type' => 'front',
                    'method' => 'onMainFooterBody',
                ],
            ],
        ];
    }
}
```

`BaseHook` provides helpers to read the current context (`getCustomer()`, `getCart()`, `getOrder()`, `getCurrency()`, `getLang()`), render a template (`render()`), translate (`trans()`), and inject assets (`addCSS()`, `addJS()`).

:::note Hook services are auto-discovered
A `BaseHook` subclass is wired automatically, with no XML and no manual service tag. Declaring `getSubscribedHooks()` is enough for the listener methods to be registered against the matching hook events.
:::

### Bundle listener (`#[AsHook]` attribute)

The `default-twig` bundle ships a lighter, attribute-based declaration. Annotate any method with `BackOfficeDefaultTwigBundle\Hook\Attribute\AsHook`; the bundle autoconfigures the service and tags the method as a hook listener.

```php
<?php
// local/modules/MyModule/src/Hook/HomeBlockHook.php

namespace MyModule\Hook;

use BackOfficeDefaultTwigBundle\Hook\Attribute\AsHook;
use Thelia\Core\Event\Hook\HookRenderBlockEvent;

final class HomeBlockHook
{
    #[AsHook(event: 'home.block', type: 'back')]
    public function onHomeBlock(HookRenderBlockEvent $event): void
    {
        $event->add([
            'id' => 'my-kpi',
            'title' => 'Sales today',
            'content' => '<p>...</p>',
        ]);
    }
}
```

The `AsHook` constructor signature is:

```php
public function __construct(
    public string $event,         // hook name, e.g. 'home.block'
    public string $type = 'back', // defaults to 'back'
    public ?int $priority = null,
) {}
```

`AsHook` is `IS_REPEATABLE`, so a method may listen to several hooks. The bundle registers the attribute for autoconfiguration in `BackOfficeDefaultTwigBundle::build()`: every annotated method is tagged `hook.event_listener` with its `event`, `type`, `method`, and optional `priority`.

:::caution `#[AsHook]` is back-office only
The attribute lives in the `default-twig` bundle and is autoconfigured only when that bundle is active. For listeners that must work regardless of the active template (front-office, e-mail, PDF, or another back-office theme), use the core `BaseHook` mechanism above.
:::

## Legacy hook aliasing

A few back-office hooks were renamed during the Smarty → Twig migration. To avoid breaking modules that listen on the old Smarty names, the Twig `HookExtension` replays each renamed hook under its legacy name on the same render event, via `BackOfficeDefaultTwigBundle\Service\Hook\LegacyHookAliases`.

A module listening on the old name keeps contributing, with no change required.

| Twig hook (new)              | Replayed legacy Smarty name(s) |
|------------------------------|--------------------------------|
| `attribute.update-form`      | `attribute-edit-form.bottom`   |
| `feature.update-form`        | `feature-edit-form.bottom`     |
| `administrator.edit-form`    | `administrator.update-form`    |
| `advanced-configuration.top` | `advanced-configuration`       |

:::caution Render arguments follow the new convention
Aliasing replays the hook *name*, not the old argument set. Render arguments follow the new (Twig) convention. A listener that reads a renamed argument must be adapted.
:::

## Hook emission contract

The `default-twig` back-office emits its hooks following fixed conventions, so a module can rely on a predictable set of extension points instead of memorising a per-screen inventory.

| Convention | Emitted from | Example |
|---|---|---|
| `<screen>.top` / `.bottom` | every screen | `attributes.top`, `product-edit.bottom` |
| `<entities>.table-header` / `.table-row` | the list data table (every list) | `attributes.table-row` |
| `<entity>.create-form` | create dialog (derived from `testid`) | `brand.create-form` |
| `<entity>.delete-form` | confirm dialog (derived from `testid`) | `brand.delete-form` |
| `<entity>.update-form` | edit screens | `feature.update-form` |
| `<entity>.tab` / `.tab-content` | tabbed edit screens | `product.tab` |

:::note A non-emitted hook is deprecated for the Twig back-office
The hooks consumed by bundled modules (CustomerFamily, SEOne, HookAdminHome, VirtualProductControl, TheliaBlocks) are all wired. A hook code that is not emitted is considered deprecated for the Twig back-office. The `<screen>.js` / `<entity>.edit-js` script hooks are emitted per screen as screens are migrated. Source: `templates/backOffice/default-twig/README.md`.
:::

<details>
<summary>Legacy Smarty <code>default</code> theme: native-hook inventory (deprecated)</summary>

:::caution Deprecated reference
The list below is the hook inventory of the legacy Smarty `default` back-office and front-office themes. The Smarty back-office is no longer the recommended one and is expected to be dropped in a future release. This inventory is kept only as a migration reference. Do not treat it as the authoritative current hook set. See the [emission contract](#hook-emission-contract) above for what the `default-twig` back-office actually emits.

In a Smarty template, a single hook is `{hook name="hookname" ... }` (dispatching `HookRenderEvent`) and a block hook is `{hookblock name="hookname" ... }...{/hookblock}` iterated with `{forhook rel="hookname"}...{/forhook}` (dispatching `HookRenderBlockEvent`).
:::

### Back-office (Smarty `default` theme)

* **admin-logs.html**: admin-logs.top, admin-logs.bottom, admin-logs.js
* **administrators.html**: administrators.top/.header/.row/.bottom, administrator.create-form/.update-form/.delete-form, administrators.js
* **attribute-edit.html**: attribute-edit.top/.bottom, attributes-value.table-header/.table-row, attribute-value.create-form, attribute.id-delete-form, attribute.edit-js, wysiwyg.js
* **attributes.html**: attributes.top/.table-header/.table-row/.bottom, attribute.create-form/.delete-form/.add-to-all-form/.remove-to-all-form, attributes.js
* **brand-edit.html**: brand-edit.top/.bottom, brand.tab, brand.modification.form-right.top/.bottom, brand.update-form, item.edition.images, brand.edit-js, wysiwyg.js
* **brands.html**: brands.top/.table-header/.table-row/.bottom, brand.create-form/.delete-form, brand.js
* **categories.html**: categories.top/.caption/.header/.row/.bottom/.catalog-bottom, products.caption/.header/.row, category.create-form/.delete-form, product.create-form/.delete-form, categories.js
* **category-edit.html**: category.tab-content, category-edit.top/.bottom, category.tab, category.modification.form-right.top/.bottom, category.contents-table-header/.contents-table-row, item.edition.images, category.edit-js, wysiwyg.js
* **configuration.html**: configuration.top/.bottom/.js, configuration.catalog-top/.catalog-bottom, configuration.shipping-top/.shipping-bottom, configuration.order-path.top/.bottom, configuration.system-top/.system-bottom
* **content-edit.html**: content-edit.top/.bottom, content.tab, content.modification.form-right.top/.bottom, item.edition.images, content.edit-js, wysiwyg.js
* **countries.html / country-edit.html**: countries.top/.table-header/.table-row/.bottom, country.create-form/.delete-form, countries.js, country-edit.top/.bottom, country.edit-js, wysiwyg.js
* **coupon-create / -list / -update.html**: coupon.create-js, coupon.top/.list-caption/.table-header/.table-row/.bottom/.delete-form/.list-js, coupon.update-js, wysiwyg.js
* **currencies.html / currency-edit.html**: currencies.top/.table-header/.table-row/.bottom, currency.create-form/.delete-form, currencies.js, currency-edit.top/.bottom, currency.edit-js
* **customer-edit.html**: customer-edit.top/.bottom, customer.orders-table-header/.orders-table-row, customer.edit, customer.address-create-form/.address-update-form/.address-delete-form, customer.edit-js
* **customers.html**: customer.top/.bottom, customers.caption/.header/.row, customer.create-form/.delete-form, customers.js
* **document / image edit & upload**: document-edit.top/.bottom, document.edit-js, tab-document.top/.bottom, image-edit.top/.bottom, image.edit-js, tab-image.top/.bottom, wysiwyg.js
* **export / import**: export.top/.bottom/.js, exports.top/.bottom/.js, export.table-header/.table-row, exports.row, import.js, imports.top/.bottom/.js, import.table-header/.table-row, imports.row
* **feature-edit.html / features.html**: feature-edit.top/.bottom, features-value.table-header/.table-row, feature.value-create-form, feature.edit-js, features.top/.table-header/.table-row/.bottom, feature.create-form/.delete-form/.add-to-all-form/.remove-to-all-form, features.js, wysiwyg.js
* **folder-edit.html / folders.html**: folder-edit.top/.bottom, folder.tab, folder.modification.form-right.top/.bottom, item.edition.images, folder.edit-js, folders.top/.caption/.header/.row/.bottom, contents.caption/.header/.row, folder.create-form/.delete-form, content.create-form/.delete-form, folders.js, wysiwyg.js
* **home.html**: home.top/.bottom/.js, home.block (block hook, fields: id, title, content, class)
* **hooks.html / hook-edit.html**: hooks.top/.table-header/.table-row/.bottom, hook.create-form/.delete-form, hooks.js, hook-edit.top/.bottom, hook.edit-js, wysiwyg.js
* **languages.html / login.html**: languages.top/.bottom, language.create-form, languages.delete-form, languages.js, index.top/.middle/.bottom
* **main-menu.html**: main.before-top-menu/.after-top-menu/.in-top-menu-items/.topbar-bottom, main.top-menu-customer/-order/-catalog/-content/-tools/-modules/-configuration (block hooks, fields: id, class, url, title)
* **messages / mailing-system**: messages.top/.table-header/.table-row/.bottom, message.create-form/.delete-form, messages.js, message-edit.top/.bottom, message.edit-js, mailing-system.top/.bottom/.js
* **modules**: modules.top/.bottom/.js, modules.table-header/.table-row, module.configuration, module.config-js, module-edit.top/.bottom, module.edit-js, module-hook.create-form/.delete-form/.js, module-hook-edit.top/.bottom, module-hook.edit-js, wysiwyg.js
* **order-edit.html**: order-edit.top/.bottom, order.tab, order-edit.cart-top/.cart-bottom, order-edit.before-order-product-list/.after-order-product-list, order-edit.order-product-table-header/.order-product-table-row, order-edit.before-order-product-row/.after-order-product-row, order-edit.product-list, order-edit.customer-information-bottom, order-edit.payment-module-bottom, order-edit.delivery-module-bottom, order-edit.bill-top/.bill-bottom/.bill-delivery-address, order.edit-js
* **order-status / orders**: order-status-edit.top/.bottom, order-status.tab/.update-form/.edit-js, order-status.top/.table-header/.table-row/.bottom/.js, orders.top/.table-header/.table-row/.bottom/.js, wysiwyg.js
* **product screens**: product-edit.top/.bottom, product.tab, item.edition.images, product.edit-js, product.attributes-table-header/-row, product.features-table-header/-row, product.modification.form_top/.form_bottom, product.modification.form-right.top/.bottom, product.details-pricing-form/.details-details-form/.details-promotion-form, product.before-combinations/.after-combinations, product.combinations-list-caption/.combinations-row, product.combination-delete-form, product.contents-table-header/-row, product.accessories-table-header/-row, product.categories-table-header/-row, wysiwyg.js
* **profiles / sales / search**: profiles.top/.bottom, profile.table-header/.table-row/.create-form/.delete-form, profiles.js, profile-edit.top/.bottom, profile.edit-js, sales.top/.table-header/.table-row/.bottom, sale.create-form/.delete-form, sales.js, sale-edit.top/.bottom, sale.edit-js, search.top/.bottom/.js plus per-entity header/row and delete-form hooks, wysiwyg.js
* **shipping / states**: shipping-configuration.top/.table-header/.table-row/.bottom/.create-form/.delete-form/.js, shipping-configuration-edit.top/.bottom/.edit/.country-delete-form/.edit-js, shipping-zones.top/.table-header/.table-row/.bottom/.js, shipping-zones-edit.top/.bottom, zone.delete-form, shipping-zones.edit-js, states.top/.table-header/.table-row/.bottom, state.create-form/.delete-form, states.js, state-edit.top/.bottom, state.edit-js, wysiwyg.js
* **tax / templates / tools / variables**: tax-edit.top/.bottom, tax.edit-js, tax-rule-edit.top/.bottom, taxes.update-form, tax-rule.edit-js, taxes-rules.top/.bottom, tax.create-form/.delete-form, tax-rule.create-form/.delete-form, taxes-rules.js, templates.top/.table-header/.table-row/.bottom, template.create-form/.delete-form, templates.js, template-edit.top/.bottom, template.edit-js, template.attributes-table-header/-row, template.features-table-header/-row, tools.top/.bottom/.js, tools.col1-top/.col1-bottom, translations.js, variables.top/.table-header/.table-row/.bottom, variable.create-form/.delete-form, variables.js, variables-edit.top/.bottom, variable.edit-js, thelia.blocks.plugincss/.plugins/.variables, wysiwyg.js

### Front-office (Smarty `default` / `modern` themes)

The legacy Smarty front-office themes exposed page-level hooks across the `404`, `account*`, `address*`, `brand`, `cart`, `category`, `contact`, `content`, `currency`, `folder`, `index`, `language`, `login`, `newsletter*`, `order-*`, `password`, `product`, `register`, `sale`, `search`, `single-product`, `sitemap`, and `view_all` templates, following these conventions:

* `<page>.top` / `.bottom`, `<page>.main-top` / `.main-bottom`, `<page>.content-top` / `.content-bottom`, `<page>.form-top` / `.form-bottom`
* `<page>.stylesheet`, `<page>.after-javascript-include`, `<page>.javascript-initialization`
* block hooks: `account.additional`, `product.additional`, `category.sidebar-top/.sidebar-body/.sidebar-bottom`, `brand.sidebar-*`, `content.sidebar-*`
* `home.body` (index), `mini-cart`, `contact.success`, `recaptcha.check` / `recaptcha.js`

In Thelia 3, the front-office is the **Flexy** Twig theme. Front-office customisation is done with [LiveComponents](/docs/front-office/live-components) and Twig template overrides rather than this Smarty hook set.

### PDF (Smarty `default` theme)

* **delivery.html**: delivery.css, delivery.header, delivery.footer-top/.footer-bottom, invoice.imprint, delivery.information/.after-information, delivery.delivery-address, delivery.after-addresses, delivery.product-list, delivery.order-product, delivery.after-delivery-module, delivery.after-summary
* **invoice.html**: invoice.css, invoice.header, invoice.footer-top, invoice.imprint, invoice.information/.after-information, invoice.delivery-address, invoice.after-addresses, invoice.product-list, invoice.order-product, invoice.after-products, invoice.after-payment-module, invoice.after-delivery-module, invoice.after-summary

### E-mail (Smarty `default` theme)

* **order_confirmation.html**: email-html.order-confirmation.before-address/.delivery-address/.after-address/.before-products/.product-list/.order-product/.after-products/.footer
* **order_notification.html**: email-html.order-notification.before-address/.delivery-address/.after-address/.before-products/.order-product/.after-products

</details>

## Learn more

- [Back-office overview](/docs/back-office): the `default-twig` bundle architecture.
- [LiveComponents](/docs/front-office/live-components): the front-office extension mechanism.
