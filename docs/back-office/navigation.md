---
title: Navigation
sidebar_position: 3
---

# Navigation

Added in Thelia 3.2. A module that takes over what a section of the administration menu manages can hide that section. [TheliaCMS](/docs/features/pages-with-theliacms) does it for the Folders section: the CMS entry replaces it, so the content of the site has one place in the menu.

Hiding a section only removes it from the menu. Its routes and the permissions that protect them do not change, so the pages stay reachable by their URL and keep their access rules.

To add an entry to the menu instead of hiding one, use the [hooks](/docs/back-office/hooks) of the back office.

## How it works

```
_side_nav.html.twig                     Core                                    Modules
───────────────────                     ────                                    ───────
backoffice_section_visible('folder') ──► BackOfficeNavigation::isSectionVisible ──► NavigationSectionVoterInterface::hidesSection('folder')
```

A section is shown unless one voter hides it. Voters are asked in turn and the first one answering `true` hides the section. The permission to view the section is checked apart by the theme, with `is_granted()`: a section needs both to appear.

## Hiding a section from a module

Implement `Thelia\Core\Template\BackOffice\NavigationSectionVoterInterface`. The interface is autoconfigured with the `thelia.backoffice_navigation_voter` tag, so a service of an autowired module is enough. The services of a module only exist while it is active, so the voter needs no check of the module state.

```php
use Thelia\Core\Template\BackOffice\NavigationSectionVoterInterface;

final readonly class NavigationSectionVoter implements NavigationSectionVoterInterface
{
    public const string FOLDER_SECTION = 'folder';

    public function hidesSection(string $section): bool
    {
        return self::FOLDER_SECTION === $section;
    }
}
```

This is the voter of [TheliaCMS](/docs/features/pages-with-theliacms). It answers `true` for the `folder` section and `false` for every other one, so it never hides a section it does not own.

## Sections that can be hidden

A section is hidden by the code its theme asks for. The `default-twig` theme checks the voters for one section today:

| Code | Menu entry |
|------|------------|
| `folder` | Folders |

The other entries of the menu do not ask the voters yet, so a voter answering `true` for them has no effect.

## In a back-office theme

A theme asks the core through `Thelia\Core\Template\BackOffice\BackOfficeNavigation::isSectionVisible($section)`. The `default-twig` theme exposes it to Twig as `backoffice_section_visible()`:

```twig
{% if is_granted('VIEW', 'admin.folder') and backoffice_section_visible('folder') %}
    {# the Folders entry #}
{% endif %}
```

A custom back-office theme that renders its own menu can do the same with the function, or by injecting `BackOfficeNavigation`.
