---
title: Emails and PDF
sidebar_position: 4
---

# Emails and PDF

Thelia sends its transactional emails and generates its order documents (invoice, delivery slip) from Twig templates. Both are rendered through the same engine as the rest of the site: the `TwigParser` from the `TwigEngine` module, selected by the `ParserResolver`. There is no Smarty in the shipped email and PDF themes anymore.

## Theme location

An email theme and a PDF theme are two Thelia template packages, installed under `templates/`:

```
templates/
├── email/
│   └── default/          # thelia/email-default-template
└── pdf/
    └── default/          # thelia/pdf-default-template
```

The active theme is chosen at install time (`--email_theme`, `--pdf_theme`) or switched later with `template:set`:

```bash
php Thelia template:set email default
php Thelia template:set pdf default
```

Each package carries a `template.xml` (title, supported languages, version), the templates themselves, an `assets/` folder for images, and its translation catalogs (see [Translations](#translations)).

## Email templates

An email message is a pair of Twig files that share a base name: a `.html.twig` for the HTML body and a `.txt.twig` for the plain-text body. The base name matches the message file name configured for the mail (for `order_confirmation`, the theme ships `order_confirmation.html.twig` and `order_confirmation.txt.twig`).

```
templates/email/default/
├── email-layout.html.twig          # shared HTML layout
├── default-html-layout.html.twig   # fallback layout for DB-stored bodies (HTML)
├── default-text-layout.txt.twig    # fallback layout for DB-stored bodies (text)
├── order_confirmation.html.twig
├── order_confirmation.txt.twig
├── password.html.twig
├── password.txt.twig
└── …
```

The HTML body extends the shared layout and fills its blocks:

```twig
{% extends "email-layout.html.twig" %}

{% block email_subject %}{{ 'Your order confirmation Nº %ref%'|trans({'%ref%': order_ref}, 'email', locale) }}{% endblock %}

{% block email_title %}{{ 'Thank you for your order!'|trans({}, 'email', locale) }}{% endblock %}

{% block email_content %}
    {% for order in loop('order.invoice', 'order', {id: order_id, customer: '*'}) %}
        <p>{{ 'Order Total:'|trans({}, 'email', locale) }} {{ format_money(order.TOTAL_TAXED_AMOUNT, order.CURRENCY) }}</p>
    {% endfor %}
{% endblock %}
```

The text body is a flat Twig file with no HTML. It is **not** auto-escaped, so translated strings print as they are:

```twig
{{ 'Hello,'|trans({}, 'email', locale) }}

{{ 'Your new password is %pass%'|trans({'%pass%': password|default('')}, 'email', locale) }}
```

:::note Why `.txt.twig` matters
`TwigParser` resolves a template name ending in `.txt` to a `.txt.twig` file, and everything else to a `.html.twig` file (`getFileExtensions()` returns `['html.twig', 'txt.twig']`). The mailer asks for both bodies, so the text template is rendered on its own instead of falling back to the HTML one.
:::

### Parser selection by file extension

The mailer renders through the `ParserResolver`, which picks a parser by asking each one whether it supports the template path and name. `TwigParser` (priority 10) claims `.html.twig` / `.txt.twig`; the legacy `SmartyParser` (priority 0) claimed `.html` / `.tpl`. Because the choice is made per file, a Twig theme and a Smarty theme can coexist during a migration without touching the core.

## PDF templates

The PDF theme ships one Twig file per document, `invoice.html.twig` and `delivery.html.twig`:

```
templates/pdf/default/
├── invoice.html.twig
└── delivery.html.twig
```

A PDF template is a normal HTML document rendered by Twig, then converted to PDF by dompdf (LGPL-2.1). It uses the same helpers as an email (`loop`, `format_money`, `format_date`, `config`, `hook`, and `|trans` with the `pdf` domain):

```twig
{% for order in loop('order.invoice', 'order', {id: order_id, customer: '*'}) %}
    <h2>{{ 'Invoice'|trans({}, 'pdf', locale) }} {{ order.INVOICE_REF }}</h2>
    <p>{{ format_date(order.INVOICE_DATE, 'date') }}</p>
{% endfor %}
```

### Page layout with CSS

dompdf lays out pages from CSS, so the html2pdf tags from Thelia 2 are ported to plain CSS:

| Thelia 2 (html2pdf) | Thelia 3 (dompdf / CSS) |
|---------------------|-------------------------|
| `<page backtop="…" backbottom="…">` | `@page { margin: … }` |
| `<page_header>` / `<page_footer>` | a `div` with `position: fixed` |
| `[[page_cu]]` (current page) | `content: counter(page)` in CSS |

```css
@page { margin: 10mm 10mm 22mm 10mm; }

.pdf-footer { position: fixed; bottom: 0; left: 0; right: 0; }
.pdf-footer .page-counter:after { content: counter(page); }
```

```twig
<div class="pdf-footer">
    {{ config('store_name') }}
    <span class="page-counter"></span>
</div>
```

:::caution The page total is not available
dompdf 3.1 resolves `counter(page)` (the current page) but leaves `counter(pages)` (the total number of pages) at `0`. The shipped footer prints the current page number without a total. dompdf can compute the total through inline PHP (`isPhpEnabled` + `{PAGE_COUNT}`), but that is left **disabled** on purpose: a merchant-controlled string such as a product title could inject `<script type="text/php">` and run arbitrary code.
:::

## Available Twig functions

Emails and PDF have no HTTP request behind them (they can be rendered from a worker or the console), so they rely on the CLI-safe helpers exposed by the `TwigEngine` module rather than on request-bound functions:

| Function | Role | Smarty equivalent |
|----------|------|-------------------|
| `loop(name, type, params)` | Run a Thelia loop, returns rows keyed by uppercase output names | `{loop}` |
| `loopCount(type, params)` | Count the rows a loop would return | `{ifloop}` count |
| `format_money(amount, currencyId)` | Format an amount in a currency | `{format_money}` |
| `format_number(number, decimals)` | Format a number for the locale | `{format_number}` |
| `format_date(date, 'datetime')` | Format a date; second argument is `date`, `time` or `datetime` | `{format_date}` |
| `format_address(orderAddressId, locale)` | Format an order address | `{format_address}` |
| `config('store_name', 'fallback')` | Read a store configuration value | `{config}` |
| `thelia_url('/account', {…})` | Build an absolute URL from a raw path | `{url path=…}` |
| `media_url('logo')` | Absolute URL of a store image (logo, banner, favicon) | `{local_media}` |
| `hook('email-html.layout.css', {…})` | Render a hook, so modules can inject content | `{hook}` |
| `hook_block('invoice.information', {…})` | Iterate a block hook's fragments | `{hookblock}` / `{forhook}` |

:::note `format_*` are functions, not filters
`format_money`, `format_number`, `format_date` and `format_address` are registered as Twig **functions**. Symfony's `IntlExtension` already owns the `format_date` and `format_number` filter names with different (ICU) semantics, so registering filters would silently shadow them. The functions keep the Thelia semantics: the admin-configured language format, currency and decimals. See [Internationalization](./internationalization.md).
:::

## Translations

Each template package carries its own Symfony translation catalogs under `translations/`, one file per domain and locale:

```
templates/email/default/translations/
├── email.en_US.php
├── email.fr_FR.php
└── …

templates/pdf/default/translations/
├── pdf.en_US.php
├── pdf.fr_FR.php
└── …
```

A catalog is a plain PHP file returning an array keyed by the source (English) string:

```php
// templates/email/default/translations/email.fr_FR.php
return [
    'Thank you for your order!' => 'Merci pour votre commande !',
    'Your order confirmation Nº %ref%' => 'Confirmation de votre commande Nº %ref%',
];
```

`RegisterTemplateTranslationsPass`, a core compiler pass, globs `templates/{email,pdf}/*/translations/*.php` at container build and registers every file on the framework translator (`translator.default`) with its domain and locale. The catalogs travel with the template package, so a theme is self-contained: no catalog lives in the application skeleton, and adding or removing a file rebuilds the container.

In a template, translate with the native `|trans` filter, passing the domain (`email` or `pdf`) and the target locale explicitly:

```twig
{{ 'Thank you for your order!'|trans({}, 'email', locale) }}
{{ 'Your order confirmation Nº %ref%'|trans({'%ref%': order_ref}, 'email', locale) }}
```

Passing the domain and locale on every call keeps the rendering faithful whether the mail is sent inline during a request or generated later from a worker, where the ambient locale is not the customer's.

:::note Placeholders use `%name%`
The `|trans` filter substitutes `%name%` (wrapped in percent signs), so both the catalog key and the parameter key carry them: `'…%ref%'|trans({'%ref%': order_ref}, …)`. This differs from the legacy Thelia translator, which used a single leading `%` (`%ref`). See [Internationalization](./internationalization.md#placeholders).
:::

## Previewing a rendering

Two console commands render an email or a PDF without the HTTP flow, so you can preview a template or work on it from the CLI.

Render an email to standard output, or to a pair of files with `--out`:

```bash
# to stdout (HTML body)
php Thelia mail:render order_confirmation --order=1 --locale=fr_FR

# to order_confirmation.html and order_confirmation.txt
php Thelia mail:render order_confirmation --order=1 --locale=fr_FR --out=order_confirmation
```

Render an order PDF to a file:

```bash
php Thelia pdf:render invoice --order=1 --locale=fr_FR --out=invoice.pdf
```

See [`mail:render`](./cli/mail_render.md) and [`pdf:render`](./cli/pdf_render.md) for the full options.

## Learn more

- [Internationalization](./internationalization.md): the `|trans` filter, domains, and the base and override translation model
- [`mail:render`](./cli/mail_render.md) / [`pdf:render`](./cli/pdf_render.md): preview commands
- [Templating engines](../architecture/dual-templating.md): how Twig, the `ParserResolver` and the themes fit together
- [Events](./events.md): `GENERATE_PDF` and the mailing events
