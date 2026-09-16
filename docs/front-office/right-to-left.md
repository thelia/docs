---
title: Right-to-Left Languages
sidebar_position: 9
---

# Right-to-Left Languages

A shop served in Arabic, Hebrew or Persian reads from right to left. Thelia deduces
the reading direction from the language of the request and exposes it to your
templates. There is nothing to configure: no setting in the back office, no column
in the database, and no migration on an existing shop.

:::info What this covers
The core tells you the direction, and the shipped themes — Flexy and the Twig back
office — use it. PDF documents and transactional e-mails are **not** covered.
:::

## The direction is deduced, never chosen

A language is written right to left because of its script, not because a merchant
decided so. Thelia therefore keeps the list in the core, next to the list of
European Union member states, and reads it from the language code:

```
ar   arc   ckb   dv   fa   he   ku   ps   sd   ug   ur   yi
```

The match uses the **language code alone**, so `ar_SA` and `ar_MA` behave the same.
Anything the list does not know answers `ltr`. Adding such a language to your shop
is what it always was: create it in the back office and make it visible.

## Using it in a template

A single global is available on every render, next to `lang_code`:

```twig
<html lang="{{ lang_code }}" dir="{{ lang_direction|default('ltr') }}">
```

`lang_direction` is exactly `ltr` or `rtl`. Always write the fallback: a shop whose
TwigEngine module predates this feature then degrades to left-to-right instead of
breaking.

Set the attribute **once, on the page shell**. It is inherited by the whole
document, it drives the browser's own behaviour, and it enables the `rtl:` variants
of Tailwind. Do not recompute it deeper in the page: the global is not set when a
LiveComponent re-renders on its own.

:::warning Never build the attribute from the URL
The direction comes from the core's list. Deriving it from a query parameter would
let a visitor inject an attribute value.
:::

## Using it in PHP

```php
use Thelia\Domain\Localization\LocalizationFacade;

$facade->getCurrentLangDirection();   // 'ltr' | 'rtl'
$facade->getLangDirection($lang);     // for a language you already hold
```

Both are safe outside an HTTP request — in a command or a worker they answer for the
shop's default language. They never throw and never return null.

## Writing styles that follow the reading direction

The rule that runs through the shipped themes:

| The direction comes from… | Write |
|---|---|
| the reading direction | a logical property — `margin-inline-start`, `padding-inline`, `inset-inline-end`, `border-inline-start`, `text-align: start` |
| a graphic choice — an oriented gradient, a drop shadow, a computed position, an icon rotation | an explicit `rtl:` variant |

In Tailwind, that means `ms-` `me-` `ps-` `pe-` `start-` `end-` `text-start`
`text-end` `border-s` `border-e` `rounded-s` `rounded-e` instead of their
left/right counterparts.

A centring rule such as `left: 50%` paired with a `translate(-50%)` is **not** a
side: leave it alone, the value is the same both ways.

### Directional icons

An icon whose meaning comes from the reading direction is mirrored with a class on
the element wrapping it:

```twig
<span class="rtl:-scale-x-100">{{ ux_icon('chevron-left') }}</span>
```

Never ship a second set of SVG files. In Flexy, the `Button`, `Link` and
`Tabulation` components add the class on their own as soon as the icon name ends in
`-left` or `-right`.

Vertical icons — a caret that opens a panel, a sort arrow — are not directional.
Leave them.

### Values that must not flip

A price, a phone number, a product reference, a tracking number, an e-mail address:
these keep their own order inside right-to-left text.

```twig
<span dir="ltr">{{ order.ref }}</span>
```

Two traps worth knowing:

- `dir="ltr"` on a **block** element makes it re-resolve its own `text-align:
  start/end`, which pulls the value back to the wrong side. Put the attribute on an
  inline element, or wrap just the value in a `<span dir="ltr">`.
- Text typed by the merchant or the customer — a postal address, a company name —
  may itself be in Arabic. Use `<bdi>` rather than `dir="ltr"`: it isolates the
  fragment and detects its direction instead of forcing one.

### JavaScript widgets

A carousel or a slider usually reads its direction from its own options, not from
the DOM. Pass it explicitly, reading the attribute rather than the global:

```js
direction: document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
```

Reading the DOM keeps working after a component re-renders.

## Why there is no second stylesheet

Some platforms compile a mirrored stylesheet next to the normal one. Thelia does
not: two artefacts have to be built and maintained, and the drift between them is
invisible until a customer sees it. One sheet, driven by the `dir` attribute, costs
nothing to keep in step.

Automatic flipping through a PostCSS plugin is avoided for the same reason — it also
flips what must not be flipped, and the result is not readable in the source file.

## Checking your own theme

- Serve a page in a right-to-left language and confirm `<html dir="rtl">`.
- Walk the home page, a category, a product, the cart, the checkout and the customer
  account, at desktop and mobile widths.
- Confirm no page scrolls horizontally: compare `document.body.scrollWidth` with
  `clientWidth`.
- Switch back to a left-to-right language and confirm the rendering is unchanged.
- Grep your stylesheets: no `margin-left`, `margin-right`, `padding-left`,
  `padding-right`, `border-left`, `border-right`, and no unjustified `left:` /
  `right:`.
