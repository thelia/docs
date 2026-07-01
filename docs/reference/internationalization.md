---
title: Internationalization
sidebar_position: 3
---

# Internationalization

Thelia is multilingual end to end: the front-office, the back-office, emails and PDF are all translated, and a store can define as many languages as it needs under **Configuration → Languages & URLs**. This page covers how to translate strings in Twig templates and in PHP, and how translations are stored so that a merchant's edits survive a code update.

## In Twig templates

Templates translate with Symfony's native `|trans` filter. The first argument is the source string (the English text doubles as the key), the second is the map of placeholder values, the third is the domain, and the fourth is the target locale:

```twig
{{ 'Welcome!'|trans }}

{# with a placeholder #}
{{ 'Hello, %name%!'|trans({'%name%': customer.firstname}) }}

{# with an explicit domain #}
{{ 'Thank you for your order!'|trans({}, 'email') }}

{# with an explicit domain and locale #}
{{ 'Thank you for your order!'|trans({}, 'email', locale) }}
```

When many strings in a template share the same domain, declare it once at the top with `trans_default_domain` and drop the domain argument on each call:

```twig
{% trans_default_domain 'messages' %}

{{ 'Save'|trans }}
{{ 'Cancel'|trans }}
```

:::note Emails and PDF pass the domain and locale explicitly
The shipped email and PDF templates do not use `trans_default_domain`; they pass the domain (`email` / `pdf`) and the target `locale` on every call: `{{ '…'|trans({}, 'email', locale) }}`. A mail is often rendered outside the customer's request, so pinning the locale on each string keeps the rendering correct. See [Emails and PDF](./emails-and-pdf.md#translations).
:::

### Placeholders

`|trans` substitutes placeholders wrapped in percent signs, `%name%`. The same token appears in the catalog key and in the parameter map:

```twig
{{ 'Your order confirmation Nº %ref%'|trans({'%ref%': order_ref}, 'email', locale) }}
```

```php
// email.fr_FR.php
return [
    'Your order confirmation Nº %ref%' => 'Confirmation de votre commande Nº %ref%',
];
```

:::caution `%name%` (Symfony) vs `%name` (legacy Thelia)
The Symfony `|trans` filter expects `%name%`. The legacy Thelia translator (used by the old Smarty `{intl}` plugin, and still by the core and modules, see [below](#in-php)) uses a single leading `%`, as in `%ref`. When you migrate a Smarty template to Twig, rewrite the placeholders accordingly.
:::

### Formatting dates, numbers, money and addresses

Locale-aware formatting is done with the Twig **functions** the `TwigEngine` module provides. They mirror the Smarty `{format_*}` plugins and keep the Thelia semantics: the language format configured in the admin, the store currency, the address format for a country:

```twig
{{ format_date(order.CREATE_DATE, 'datetime') }}   {# date, time or datetime #}
{{ format_number(1246.12, 2) }}
{{ format_money(order.TOTAL_TAXED_AMOUNT, order.CURRENCY) }}
{{ format_address(order.DELIVERY_ADDRESS, locale)|raw }}
```

:::note Functions, not filters
`format_date`, `format_number`, `format_money` and `format_address` are Twig **functions** (called as `format_date(...)`), not filters. Symfony's `IntlExtension` already registers `format_date` and `format_number` as filters with ICU semantics; registering Thelia filters under the same names would silently shadow them. Using functions keeps both available and preserves the Thelia formatting rules. The logic lives in the engine-agnostic core `FormatService`, so the values are identical whatever the template engine.
:::

## In PHP

Core code and modules translate through the Thelia `Translator`, a singleton wrapping the Symfony translator:

```php
use Thelia\Core\Translation\Translator;

Translator::getInstance()->trans('A string that needs translation');
```

Pass dynamic values as placeholders (single leading `%`, the legacy Thelia convention):

```php
Translator::getInstance()->trans(
    'A string with %variable',
    ['%variable' => $myVariable],
);
```

The third argument is the domain. In a module, use the module's own domain, stored as a constant on the module base class:

```php
Translator::getInstance()->trans(
    'A string with %variable',
    ['%variable' => $myVariable],
    MyModule::DOMAIN_NAME,
);
```

## Domains

A domain is a named set of messages. Splitting translations by domain keeps a module's strings from colliding with the core's. Thelia defines:

| Domain | Contents |
|--------|----------|
| `core` | Thelia core strings |
| `messages` | Default Symfony domain, used by the Twig front-office and back-office |
| `email` | The active email template's strings |
| `pdf` | The active PDF template's strings |
| `<module_code>` (e.g. `paypal`) | A module's core strings |
| `<module_code>.bo.<template>` | A module's back-office template strings |
| `<module_code>.fo.<template>` | A module's front-office template strings |
| `global` | The local override layer (see [below](#the-base-and-override-model)) |

Two translators coexist in Thelia 3. The Twig front-office and back-office, and the email and PDF templates, use the **Symfony translator** (`|trans`, domains `messages` / `email` / `pdf`). The core and the modules still use the **Thelia translator** (`Translator::getInstance()`, domains `core` / `<module_code>`, and the `global` override layer). Converging on a single translator is planned after the beta.

## The base and override model

Translations come from two layers, and a merchant's edits must never be lost when the code is updated. Thelia separates them:

- **Base layer: versioned, shipped with the code.** The core strings live in `core/lib/Thelia/Config/I18n/{locale}.php`; a template's or a module's strings live in its own `I18n/{locale}.php`; the email and PDF catalogs live in `translations/{domain}.{locale}.php`. These files are part of the package and are overwritten by an update.
- **Override layer: local, not versioned.** Merchant edits made in the back-office are written to `local/I18n/{locale}.php`, loaded as the `global` domain. This directory is `.gitignore`d, so a `git push` or a package update never touches it.

The override layer **wins** at resolution: `Translator::trans()` checks the `global` domain first and returns the override if it finds one, before falling back to the base domain. A translation edited in the back-office therefore takes precedence over the shipped string, and survives the next code update.

### Editing translations in the back-office

Translations are edited under **Configuration → Translation**. The strings are collected automatically from the selected source (the core, a template, a module), and you enter a translation for any language defined in your store. Saving writes to the local override layer (`local/I18n`), not to the versioned files.

### Developer mode

A "developer mode" writes the **versioned** base files instead of the override layer. It is meant for a contributor working on the shipped translations, not for a merchant, so it is available only when the application runs in debug mode (`APP_ENV=dev`). On a production instance the toggle is hidden and every save goes to the override layer, which is what keeps merchant edits and code updates from ever conflicting.

Under the hood, the back-office controller reads `kernel.debug` and sets it on the translation event (`TranslationEvent::setDeveloperMode()`); the core write listener is a no-op for the versioned files unless developer mode is explicitly on.

### Contributing translations upstream

There is no command to promote a local override into the versioned base files. Thelia's shared translations are managed on [translate.thelia.net](https://translate.thelia.net) (Crowdin), and the back-office translation screen links to it. That platform is the path for contributing a translation back to the project; it then ships in a release as a base file.

### Pruning orphaned overrides

When a base string is removed from the code, an override that still references it becomes orphaned: harmless, but dead weight. The `i18n:prune-overrides` command reports these orphans (dry-run by default) and removes them with `--force`:

```bash
# list orphaned overrides across every local locale file
php Thelia i18n:prune-overrides

# restrict to one locale
php Thelia i18n:prune-overrides --locale=fr_FR

# actually remove them
php Thelia i18n:prune-overrides --locale=fr_FR --force
```

An override is reported when its source string is absent from the base catalogs loaded for that locale. Review the list before forcing, especially on a partially translated locale. The command never touches the versioned base files. See [`i18n:prune-overrides`](./cli/i18n_prune_overrides.md).

## Legacy Smarty

The legacy `default` back-office theme (Smarty) translated with the `{intl}` plugin and the `{format_date}` / `{format_number}` / `{format_money}` / `{format_address}` plugins. That theme is transitional and expected to be dropped in Thelia 3.1. For its syntax, see [Smarty plugins](./smarty-plugins/index.md).

## Learn more

- [Emails and PDF](./emails-and-pdf.md): the `email` / `pdf` domains and their catalogs
- [`i18n:prune-overrides`](./cli/i18n_prune_overrides.md): clean up orphaned overrides
- [Smarty plugins](./smarty-plugins/index.md): the legacy `{intl}` / `{format_*}` reference
