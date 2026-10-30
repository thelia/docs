---
title: Accessibility
sidebar_position: 10
---

# Accessibility

**In short.** Flexy is audited against RGAA 4.1, the French reference built on WCAG 2.1 level AA.
On 30 October 2026, 24 of the 70 criteria that apply to the theme are decided: 23 conforming,
1 not conforming (the border colour of the form fields). The other 46 still need a manual check.
The core runs an automated measure on every pull request so that what has been fixed stays fixed.
A theme derived from Flexy keeps these results only if it follows the rules below and runs the
same measure.

## Accessibility statement of the theme

This statement covers the Flexy theme as shipped. A shop publishes its own statement: its
content, its modules and its changes to the theme are its own.

### Conformance status

Flexy is **not yet assessed as a whole** against RGAA 4.1. The audit below is partial: it decides
every criterion that an automated tool or a keyboard test can settle, and leaves to a manual
audit the criteria that need a screen reader or a judgement on content.

| | Criteria |
|---|---|
| Conforming | 23 |
| Not conforming | 1 |
| Not applicable on the audited pages | 36 |
| Not tested yet (manual check) | 46 |

The grid, criterion by criterion with the evidence for each status, is on the
[audit grid](./accessibility-audit.md) page.

### Not conforming

- **RGAA 3.3, colour of interface components.** The border of the text fields, the selects and
  the search box uses `--color-medium` (#ffb698), at 1.69:1 against a white background where
  3:1 is required. Changing it changes the look of every field of every theme derived from
  Flexy; the new colour is to agree with the design of the theme before it ships.

No derogation is claimed.

### Fixed during this audit

| Defect | Criterion |
|---|---|
| No link to skip to the main content, and nothing for it to target | 12.7 |
| The logo link of the checkout header had no accessible name | 6.2 |
| The copyright line of the checkout footer and the crossed-out price of the cart were at 4.2:1 | 3.2 |
| The variant selector of the product page took the focus without showing it, and stayed a tab stop on desktop where it does nothing | 10.7 |
| The account page was 330px wide in a 320px viewport | 10.11 |
| The home page had no heading; sign-in, sign-up and contact started at level 2; the filled cart had no heading | 9.1 |
| The name field of the contact form did not declare its purpose for autofill | 11.13 |

### How the audit was made

| | |
|---|---|
| Date | 30 October 2026 |
| Reference | RGAA 4.1, 106 criteria, WCAG 2.1 A and AA |
| Theme | Flexy `main` (`1.4.x-dev`), demo data |
| Tools | axe-core 4.13 through Playwright 1.59, Chromium; keyboard and reflow tests of `tests/Playwright/specs/accessibility.spec.ts` |
| Viewports | 1440px, and 320px for reflow |

Pages audited: home, a category (`/chairs.html`), a product (`/barbara-1.html`), search results,
a content page (`/a-propos.html`), contact, sign-in, sign-up, the account, its addresses, orders
and purchase lists, then the cart, delivery, payment and confirmation steps of the checkout.

The payment and confirmation steps are measured by the core's `accessibility` workflow on every
pull request; they were not part of the manual pass of this audit.

### Report a problem

Open an issue on [thelia-templates/flexy](https://github.com/thelia-templates/flexy/issues) and
name the page, the browser and, when there is one, the assistive technology. A problem met on a
shop goes to that shop first: its statement gives its own contact and the means of redress.

## Rules for a theme derived from Flexy

What Flexy guarantees holds as long as a child theme does not undo it.

1. Keep the skip link at the top of `base.html.twig` and `id="main-content" tabindex="-1"` on
   `<main>`. A layout that overrides the `body` of the base template has to carry both.
2. Start every page on one `h1`, visible or `sr-only`, then title each section with a heading of
   the next level. A styled `div` is not a heading.
3. Give every link and button a name a screen reader can read. A link or button that only shows
   an icon carries an `aria-label`; the icon itself stays `aria-hidden`.
4. Never remove the focus outline without replacing it. `outline: none` is allowed only next to
   a `:focus-visible` rule that draws something at least 3:1 against its background.
5. Keep text at 4.5:1 against its background (3:1 from 24px, or 18.66px bold), and borders and
   icons that identify a control at 3:1. Check a new colour on each background it is used on:
   `--color-grey` passes on white and fails on `--color-lightest`.
6. Let content shrink. A grid that changes column count at a breakpoint declares its single
   column below it (`grid-cols-1 md:grid-cols-2`), and a button that sizes to its text also
   gets `max-w-full`.
7. Render form fields through the theme's form theme: it associates the label, marks the field
   `aria-invalid` and points `aria-describedby` at the error, and `Molecules:FormErrors` moves
   the focus to the error summary. Give each personal data field its `autocomplete` value.
8. A control that only exists on mobile (a drawer trigger) is a `<button>` and is hidden with
   `display: none` where it does nothing, so that it leaves the tab order.

## Measure a derived theme

The spec of the core runs against any served shop. From a checkout of `thelia/thelia`, with your
theme active on the shop:

```bash
cd tests/Playwright
npm ci
npx playwright install chromium
BASE_URL=https://my-shop.ddev.site npx playwright test specs/accessibility.spec.ts
```

The page list comes from `setup/audit/lighthouserc.default.yaml`; point it at your own URLs if
your catalogue differs from the demo. Each page logs a line such as
`a11y /chairs.html: 25 rules checked, 39 not applicable, 0 rules violated, 0 blocking node(s)`.
A page where no rule was checked fails: an audit that measured nothing is not a pass.

The measure settles only part of RGAA. The criteria marked NT in the
[grid](./accessibility-audit.md) still need a person, a keyboard and a screen reader.
