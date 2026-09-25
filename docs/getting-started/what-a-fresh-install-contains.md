---
title: What a fresh install contains
sidebar_position: 2.5
---

# What a fresh install contains

A new shop created with `composer create-project thelia/thelia-skeleton` comes with the core, four themes (Flexy for the front office, the Twig back office, the e-mail and PDF templates) and the modules listed below. The list is declared in two places you can read without installing anything: the `require` section of [thelia/thelia-skeleton](https://github.com/thelia/thelia-skeleton/blob/main/composer.json) for the modules the distribution ships on its own, and the `composer.json` of each theme for the modules its rendering depends on.

## Shipped and active are two different things

Every module below is installed on disk and registered in the shop. Whether it is active right after the installation is declared by the module itself, in its `Config/module.xml`, through the optional `<enabled-by-default>` element. A module that says nothing, or says `1`, is active as soon as the shop is installed. A module that says `0` is registered inactive: it appears in the modules list of the back office, does nothing until you activate it, and its configuration screen opens once it is active.

To activate a module, open **Modules** in the back office and click **Activate** on its row, or run:

```bash
php Thelia module:activate <ModuleCode>
```

An update never rewrites the state you chose. A module you activated stays active, a module you deactivated stays inactive.

## Modules declared by the distribution

These modules are useful to the shop whatever theme it uses, so the skeleton declares them directly. Changing the front theme does not remove them.

| Code | What it does | Default state | Source |
|------|--------------|---------------|--------|
| Cheque | Payment by cheque | Active | [thelia-modules/Cheque](https://github.com/thelia-modules/Cheque) |
| FreeOrder | Confirms an order with nothing left to pay (fully discounted cart) | Active | [thelia-modules/FreeOrder](https://github.com/thelia-modules/FreeOrder) |
| CustomDelivery | Delivery with prices you configure yourself | Active | [thelia-modules/CustomDelivery](https://github.com/thelia-modules/CustomDelivery) |
| VirtualProductDelivery | Delivery of virtual products, no shipping | Active | [thelia-modules/VirtualProductDelivery](https://github.com/thelia-modules/VirtualProductDelivery) |
| HeaderHighlights | Promotional messages and images in the header of the front office | Active | [thelia-modules/HeaderHighlights](https://github.com/thelia-modules/HeaderHighlights) |
| RecentlyViewed | Records the products a customer viewed and exposes them to the front | Active | [thelia-modules/RecentlyViewed](https://github.com/thelia-modules/RecentlyViewed) |

## Modules required by the themes

These modules stay in the `composer.json` of a theme because the theme cannot render without them. Another theme may require a different set.

| Code | What it does | Required by | Default state | Source |
|------|--------------|-------------|---------------|--------|
| TwigEngine | Twig template engine for Thelia | Flexy, back office, e-mail and PDF templates | Active | [thelia-modules/TwigEngine](https://github.com/thelia-modules/TwigEngine) |
| TheliaLibrary | Media library and image processing | Flexy (also pulled by TheliaBlocks) | Active | [thelia-modules/TheliaLibrary](https://github.com/thelia-modules/TheliaLibrary) |
| TheliaBlocks | Content blocks editor used for CMS content | Flexy | Active | [thelia-modules/TheliaBlocks](https://github.com/thelia-modules/TheliaBlocks) |
| ShortCode | Short codes in content, WordPress syntax | Pulled by TheliaBlocks | Active | [thelia-modules/ShortCode](https://github.com/thelia-modules/ShortCode) |
| Page | CMS pages rendered by the front theme | Flexy | Active | [thelia-modules/Page](https://github.com/thelia-modules/Page) |
| SEOne | SEO tools for the front office | Flexy | Active | [thelia-modules/SEOne](https://github.com/thelia-modules/SEOne) |
| Tiptap | WYSIWYG editor of the back office | Back office | Active | [thelia-modules/Tiptap](https://github.com/thelia-modules/Tiptap) |

## What is not shipped

The distribution ships what most shops need on day one and leaves the rest to Composer, so that a shop does not carry code it will never use. Two families of modules are deliberately absent:

- Structuring modules that change the data model or the checkout for a subset of shops, such as customer families or gift cards. Install them when the shop needs them.
- Online payment connectors. Each shop picks the ones matching its contracts.

Adding a module is one Composer command, run at the root of the project:

```bash
composer require thelia/<module-name>-module
php Thelia module:activate <ModuleCode>
```

The list of official modules and their package names is on [Packagist](https://packagist.org/packages/thelia/) and in the [thelia-modules](https://github.com/thelia-modules) organization.

## Checking your own install

On an installed shop, the effective list is:

```bash
php Thelia module:list
```

On a fresh install it matches the two tables above, module for module. A difference means a module was added, removed or toggled after the installation.
