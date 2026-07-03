---
title: Theme Hooks
sidebar_position: 7
---

# Theme Hooks

Theme hooks are the extension points a Twig theme exposes so that modules can inject HTML at fixed places, without the theme knowing anything about the modules.

The theme declares a point with the `theme_hook()` Twig function. A module answers it by implementing `Thelia\Core\Hook\Theme\ThemeHookInterface`. Nothing else is wired: the interface is autoconfigured through the `thelia.theme_hook` tag, so implementing it in an autowired module is enough.

## How it works

```
Theme template                 Module
──────────────                 ──────
theme_hook('home.top')  ──►  ThemeHookInterface::supports('home.top') ? 
                             ThemeHookInterface::render('home.top', {})  ──►  HTML
```

At render time the `theme_hook()` function collects every service tagged `thelia.theme_hook`, keeps those whose `supports()` returns `true`, calls `render()` on each, and concatenates the results in tag-priority order.

## Difference with the legacy hook system

Thelia also ships an older hook system based on `BaseHook`, `HookRenderEvent` and the `hook()` Twig function. That system stores hook points and module positions in the database, and the ordering is managed from the back office.

Theme hooks are pure code: no database rows, no administration screen. A module simply implements an interface, and ordering is controlled by the tag priority. The two systems are independent, use them side by side as needed.

## Declaring a point in a theme

Call `theme_hook()` wherever a module should be able to inject content. Pass a name and, optionally, a map of parameters that modules receive in `render()`:

```twig
{# Static point #}
{{ theme_hook('home.top') }}

{# Point with parameters passed to the modules #}
{{ theme_hook('product.details.bottom', {product: product}) }}
```

The name follows a `page.zone.position` convention, kebab-case per segment (`layout.header.bottom`, `product.details.bottom`, ...).

## Answering a point in a module

Implement `ThemeHookInterface`. `supports()` selects the point, `render()` returns the HTML fragment. Dependencies come through the constructor.

```php
<?php

declare(strict_types=1);

namespace Acme\Hook\Theme;

use Thelia\Core\Hook\Theme\ThemeHookInterface;
use Twig\Environment;

final readonly class PromoBannerThemeHook implements ThemeHookInterface
{
    public function __construct(
        private Environment $twig,
    ) {
    }

    public function supports(string $hookName): bool
    {
        return 'home.top' === $hookName;
    }

    public function render(string $hookName, array $parameters): string
    {
        return $this->twig->render('@AcmeModule/theme-hook/promo_banner.html.twig');
    }
}
```

The `@AcmeModule` Twig namespace maps to the module's `templates/` directory, so the template above lives at `templates/theme-hook/promo_banner.html.twig`.

Return an empty string when the module has nothing to show. That keeps the point clean when the module is installed but not configured:

```php
public function render(string $hookName, array $parameters): string
{
    if ([] === $this->banners) {
        return '';
    }

    return $this->twig->render('@AcmeModule/theme-hook/promo_banner.html.twig');
}
```

### Controlling the order

When several modules answer the same point, use the tag priority. A higher priority renders first:

```php
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

#[AutoconfigureTag('thelia.theme_hook', ['priority' => 100])]
final readonly class PromoBannerThemeHook implements ThemeHookInterface
{
    // ...
}
```

### Reusing an existing component

The point does not have to build markup from scratch. If the module already exposes a Twig component, the theme-hook template can simply render it, which keeps the data and rendering logic in one place. The `HeaderHighlights` module does exactly this on `layout.header.bottom`:

```twig
{# templates/theme-hook/header_highlights.html.twig #}
{{ component('HeaderHighlights') }}
```

## Points declared by the Flexy theme

The default Flexy theme declares the following points. Names use the `page.zone.position` convention.

| Point | Location |
|-------|----------|
| `layout.head` | `<head>` of every page |
| `layout.body.top` | Start of `<body>` |
| `layout.header.bottom` | Below the header |
| `layout.footer.top` | Above the footer |
| `layout.body.bottom` | End of `<body>` |
| `home.top` | Top of the homepage |
| `home.bottom` | Bottom of the homepage |
| `product.top` | Top of the product page |
| `product.details.bottom` | Below the product details |
| `product.bottom` | Bottom of the product page |
| `category.top` | Top of the category page |
| `category.bottom` | Bottom of the category page |
| `cart.top` | Top of the cart page |
| `cart.bottom` | Bottom of the cart page |
| `checkout.top` | Top of the checkout page |
| `checkout.bottom` | Bottom of the checkout page |
| `account.top` | Top of the customer account page |
| `account.bottom` | Bottom of the customer account page |
| `order-placed.top` | Top of the order confirmation page |
| `order-placed.bottom` | Bottom of the order confirmation page |

The page-level points pass their main entity as a parameter (`product`, `category`, `customer`), available in `render()` through the `$parameters` argument.

## SEO and analytics

The layout points are designed with tracking and SEO modules in mind:

- `layout.head`: meta tags, JSON-LD structured data, analytics loader scripts (Google Tag Manager, Matomo, ...)
- `layout.body.top`: the `noscript` counterpart a tag manager requires right after the opening `body` tag
- `layout.body.bottom`: deferred scripts

A single handler can answer several points:

```php
final readonly class TagManagerThemeHook implements ThemeHookInterface
{
    public function supports(string $hookName): bool
    {
        return \in_array($hookName, ['layout.head', 'layout.body.top'], true);
    }

    public function render(string $hookName, array $parameters): string
    {
        return match ($hookName) {
            'layout.head' => $this->twig->render('@AcmeTagManagerModule/theme-hook/script.html.twig'),
            'layout.body.top' => $this->twig->render('@AcmeTagManagerModule/theme-hook/noscript.html.twig'),
        };
    }
}
```

The layout points pass no parameters. A handler that needs to know which page is being rendered (an SEO module emitting page-specific tags, for instance) injects Symfony's `RequestStack` and reads the current request itself.
