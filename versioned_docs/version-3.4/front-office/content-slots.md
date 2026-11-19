---
title: Content Slots
sidebar_position: 9
---

# Content Slots

Added in Thelia 3.2. A content slot is a named place in a theme that holds a list of links: the header menu, the footer links, the page a consent box points at. The theme asks for a slot by its code. It never names a content or a folder by its id.

The shop decides what a slot holds. By default the core fills it from folders and contents. A module, [TheliaCMS](/docs/features/pages-with-theliacms) for instance, can take a slot over without the theme changing a line.

```
Theme template                       Core                         Resolvers
──────────────                       ────                         ─────────
content_slot('footer_links')  ──►  ContentSlotService  ──►  highest priority first:
                                                              module resolver  (answers or null)
                                                              core resolver    (priority -100)
```

## The slots of the core

| Code | What it holds | Where the shop sets it |
|------|---------------|------------------------|
| `header_links` | The header menu entries, folders and contents, in order | `header_menu_items` configuration variable |
| `footer_links` | The visible contents of one folder, in their position in it | `information_folder_id` configuration variable |
| `consent.<code>` | The content a consent links to, for instance `consent.terms_and_conditions` | The consent screen of the back office |

A slot nobody owns, an unknown code included, is empty. A theme asking for it renders nothing and raises no error.

## Reading a slot in a theme

The `content_slot()` and `content_slot_first()` Twig functions are provided by the TwigEngine module, from version 1.1.0, which requires Thelia 3.2.

| Function | Returns |
|----------|---------|
| `content_slot(code)` | The list of links of the slot, possibly empty |
| `content_slot_first(code)` | The first link, or `null` |

Both read the slot in the locale of the request, or in the default language of the shop when there is no request.

Each link has these properties:

| Property | Type | Meaning |
|----------|------|---------|
| `label` | string | Text to display |
| `url` | string or `null` | Target. `null` for a heading without a link, such as the title of a menu column |
| `source` | string | Where the entry comes from: `content`, `folder`, `cms_page`, `url`, or a code chosen by a module |
| `sourceId` | int, string or `null` | The object the entry points at, so a theme can build more than a link from it (a folder mega-menu, for example) |
| `children` | list of links | Sub-entries, empty for a flat entry |
| `opensInNewWindow` | bool | Whether the link should open in a new tab |

### Footer links

The Flexy footer lists the `footer_links` slot:

```twig
<ul class="Footer-links">
    {% for link in content_slot('footer_links') %}
        <li class="paragraph-5">
            {% if link.url %}
                <a href="{{ link.url }}" class="Footer-link"{% if link.opensInNewWindow %} target="_blank" rel="noopener"{% endif %}>{{ link.label }}</a>
            {% else %}
                <span class="Footer-link">{{ link.label }}</span>
            {% endif %}
        </li>
    {% endfor %}
</ul>
```

Always test `link.url`: an entry without a URL is a heading.

### The page of a consent

`content_slot_first()` fits a slot that holds a single link. The guest checkout form of Flexy shows the terms and conditions link only when the consent points at a visible content:

```twig
{% set terms = content_slot_first('consent.terms_and_conditions') %}
{% if terms and terms.url %}
    <a href="{{ terms.url }}" target="_blank" rel="noopener">{{ terms.label }}</a>
{% endif %}
```

### From PHP

A component can inject `Thelia\Core\Content\Slot\ContentSlotService` and pass the locale itself. The locale is a required argument: a slot reads the same from a console command or a worker as from a request.

```php
use Thelia\Core\Content\Slot\ContentSlots;

$links = $this->contentSlotService->links(
    ContentSlots::HEADER,
    (string) $this->langService->getLocale(),
);
```

`ContentSlots::HEADER`, `ContentSlots::FOOTER` and `ContentSlots::CONSENT_PREFIX` hold the codes of the core. `first($slot, $locale)` returns the first link or `null`.

The Flexy header builds its menu this way. A link that brings `children` is drawn from them. A `folder` link without children keeps the mega-menu built from its `sourceId`. Anything else is a plain link.

## Configuring the native slots

The core resolver reads two configuration variables. Edit them in the back office, or with [`thelia:config`](/docs/reference/cli/thelia_config).

### `header_menu_items`

An ordered, comma-separated list of references, each written `folder:<id>` or `content:<id>`:

```shell
php Thelia thelia:config set header_menu_items "folder:2,content:1"
```

- A reference to a missing or hidden folder or content is left out. So is anything that is not a reference.
- A folder comes without children: the theme builds its menu from the folder id.
- A fresh install starts with an empty list. The demo data writes its Blog folder and its About us page.
- A shop updated from 3.1 receives `folder:2,content:1`, keeping those of the two that exist. This is the header the Flexy theme showed until then.

### `information_folder_id`

The id of the folder whose visible contents form `footer_links`, in their position in the folder.

### The consent page

The terms and conditions have one source: the content of the `terms_and_conditions` consent. The `terms_conditions_content_id` variable is deprecated. The update script copies it onto that consent when the consent names no content. The demo import still writes it for the 1.1 themes that read it, and it will be removed in the next major version. A theme should read `consent.terms_and_conditions`.

## Filling a slot from a module

Implement `Thelia\Core\Content\Slot\ContentSlotResolverInterface`. The interface is autoconfigured with the `thelia.content_slot_resolver` tag, so a service of an autowired module is enough.

```php
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use Thelia\Core\Content\Slot\ContentSlotLink;
use Thelia\Core\Content\Slot\ContentSlotResolverInterface;
use Thelia\Core\Content\Slot\ContentSlots;

#[AsTaggedItem(priority: 100)]
final readonly class ShopMenuResolver implements ContentSlotResolverInterface
{
    public function resolve(string $slot, string $locale): ?array
    {
        if (ContentSlots::HEADER !== $slot) {
            return null;
        }

        return [
            new ContentSlotLink(label: 'Our stores', url: '/stores', source: 'url'),
        ];
    }
}
```

The rules:

- Resolvers are asked from the highest priority down. The first one that does not answer `null` owns the slot.
- An empty list is an answer. The resolver owns the slot and has nothing to put in it, so the resolvers after it are not asked. Answer `null` to leave the slot to the others.
- The core resolver sits at priority `-100`, so any module that declares a higher priority with `#[AsTaggedItem]` answers before it.
- Take the locale from the argument, never from the request.

[TheliaCMS](/docs/features/pages-with-theliacms) works this way. Its resolver (priority `100`) answers `header_links` and `footer_links` from the menus of the CMS as soon as a menu holds an entry. An empty menu returns `null`, which leaves the slot to the folders and contents of the shop. It does not answer the consent slots.

## Related

- [Theme hooks](/docs/front-office/theme-hooks): the other way a module reaches a theme, by injecting HTML.
- [Checkout](/docs/features/checkout): consent boxes and the terms and conditions.
