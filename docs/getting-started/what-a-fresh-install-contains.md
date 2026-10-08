---
title: What a fresh install contains
sidebar_position: 2.5
---

# What a fresh install contains

A new shop created with `composer create-project thelia/thelia-project` comes with the core, four themes (Flexy for the front office, the Twig back office, the e-mail and PDF templates) and the modules listed below. The project depends on a single package, [thelia/thelia-skeleton](https://github.com/thelia/thelia-skeleton/blob/main/composer.json), and the list is declared in two places you can read without installing anything: the `require` section of the skeleton for the modules the distribution ships on its own, and the `composer.json` of each theme for the modules its rendering depends on.

## Shipped and active are two different things

Every module below is installed on disk and registered in the shop. Whether it is active right after the installation is declared by the module itself, in its `Config/module.xml`, through the optional `<enabled-by-default>` element. A module that says nothing, or says `1`, is active as soon as the shop is installed. A module that says `0` is registered inactive: it appears in the modules list of the back office, does nothing until you activate it, and its configuration screen opens once it is active.

To activate a module, open **Modules** in the back office and click **Activate** on its row, or run:

```bash
php Thelia module:activate <ModuleCode>
```

An update never rewrites the state you chose. A module you activated stays active, a module you deactivated stays inactive.

## Modules declared by the distribution

These modules are useful to the shop whatever theme it uses, so the skeleton declares them directly. Changing the front theme does not remove them.

The modules that need a key from a third party ship inactive. How to configure each of them, and what the shop does while a key is missing, is described by function in [Shipped Modules](../features/shipped-modules/index.md).

| Code | What it does | Default state | Source |
|------|--------------|---------------|--------|
| Cheque | Payment by cheque | Active | [thelia-modules/Cheque](https://github.com/thelia-modules/Cheque) |
| FreeOrder | Confirms an order with nothing left to pay (fully discounted cart) | Active | [thelia-modules/FreeOrder](https://github.com/thelia-modules/FreeOrder) |
| CustomDelivery | Delivery with prices you configure yourself | Active | [thelia-modules/CustomDelivery](https://github.com/thelia-modules/CustomDelivery) |
| VirtualProductDelivery | Delivery of virtual products, no shipping | Active | [thelia-modules/VirtualProductDelivery](https://github.com/thelia-modules/VirtualProductDelivery) |
| HeaderHighlights | Promotional messages and images in the header of the front office | Active | [thelia-modules/HeaderHighlights](https://github.com/thelia-modules/HeaderHighlights) |
| RecentlyViewed | Records the products a customer viewed and exposes them to the front | Active | [thelia-modules/RecentlyViewed](https://github.com/thelia-modules/RecentlyViewed) |
| WireTransfer | Payment by bank transfer, shows the shop's bank details to the customer | Active | [thelia-modules/WireTransfer](https://github.com/thelia-modules/WireTransfer) |
| PayPal | Payment through PayPal, needs PayPal API credentials | Inactive | [thelia-modules/PayPal](https://github.com/thelia-modules/PayPal) |
| StripePayment | Payment through Stripe, needs Stripe API keys | Inactive | [thelia-modules/StripePayment](https://github.com/thelia-modules/StripePayment) |
| LocalPickup | Store pickup as a delivery method | Active | [thelia-modules/LocalPickup](https://github.com/thelia-modules/LocalPickup) |
| AdminOrderCreation | Creates an order for a customer from the back office | Active | [thelia-modules/AdminOrderCreation](https://github.com/thelia-modules/AdminOrderCreation) |
| DuplicateOrder | Lets a customer reorder the products of a past order | Active | [thelia-modules/DuplicateOrder](https://github.com/thelia-modules/DuplicateOrder) |
| RewriteUrl | Redirects old URLs to the new ones, manual redirect rules | Active | [thelia-modules/RewriteUrl](https://github.com/thelia-modules/RewriteUrl) |
| Sitemap | Priorities, change frequencies and language alternates of the XML sitemap | Active | [thelia-modules/Sitemap](https://github.com/thelia-modules/Sitemap) |
| GoogleTagManager | Loads a Google Tag Manager container and sends e-commerce events, needs a container ID | Inactive | [thelia-modules/GoogleTagManager](https://github.com/thelia-modules/GoogleTagManager) |
| WishList | Wish lists for customers and guests | Active | [thelia-modules/WishList](https://github.com/thelia-modules/WishList) |
| StockAlert | Back-in-stock and price-drop e-mail alerts | Active | [thelia-modules/StockAlert](https://github.com/thelia-modules/StockAlert) |
| TntSearch | Full-text search tolerant to typos | Active | [thelia-modules/TntSearch](https://github.com/thelia-modules/TntSearch) |
| BestSellers | Best sellers sort and statistics | Active | [thelia-modules/BestSellers](https://github.com/thelia-modules/BestSellers) |
| SiretManagement | SIRET and intra-community VAT number of business customers | Active | [thelia-modules/SiretManagement](https://github.com/thelia-modules/SiretManagement) |
| ReCaptcha | Anti-spam check on the customer forms, needs reCAPTCHA keys | Inactive | [thelia-modules/ReCaptcha](https://github.com/thelia-modules/ReCaptcha) |

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

The distribution ships what most shops need on day one and leaves the rest to Composer, so that a shop does not carry code it will never use.

Two modules stay out on purpose: CustomerFamily and TheliaGiftCard. Each one adds a notion to the data model of the shop: CustomerFamily introduces price segments per customer family, TheliaGiftCard introduces credit notes that carry a value. Notions of that kind call for a place in the core, not for a silent addition to every shop through the distribution. Until then, install them when the shop needs them:

| Module | Package | Install |
|--------|---------|---------|
| [CustomerFamily](https://github.com/thelia-modules/CustomerFamily) | `thelia/customer-family-module` | `composer require thelia/customer-family-module` |
| [TheliaGiftCard](https://github.com/thelia-modules/TheliaGiftCard) | `thelia/thelia-gift-card-module` | `composer require thelia/thelia-gift-card-module` |

Payment connectors other than the ones listed above are not shipped either: each shop picks the ones matching its contracts.

Adding a module is one Composer command, run at the root of the project, followed by its activation:

```bash
composer require thelia/<module-name>-module
php Thelia module:activate <ModuleCode>
```

The list of official modules and their package names is on [Packagist](https://packagist.org/packages/thelia/) and in the [thelia-modules](https://github.com/thelia-modules) organization.

## Shops installed before skeleton 3.2

Until skeleton 3.2, Cheque, CustomDelivery, FreeOrder, VirtualProductDelivery, HeaderHighlights and RecentlyViewed reached a shop through the `composer.json` of the themes. They now come from the skeleton, and the themes no longer require them.

A project created with `thelia/thelia-project` depends on `thelia/thelia-skeleton`, so a full update brings skeleton 3.2 and the six modules with it. The shop keeps them, and their active or inactive state is not touched:

```bash
composer update
```

Update the whole project rather than a theme alone. A theme that no longer requires these modules declares a conflict with any skeleton older than 3.2, so `composer update thelia/flexy` on a project still on skeleton 3.1 keeps the current theme version instead of removing modules. The new theme version comes with the full update that also brings skeleton 3.2.

## Shops installed with skeleton 3.2.0 or earlier

WireTransfer, PayPal, StripePayment, LocalPickup, AdminOrderCreation, DuplicateOrder, RewriteUrl, Sitemap, GoogleTagManager, WishList, StockAlert, TntSearch, BestSellers, SiretManagement and ReCaptcha are declared by the skeleton releases that follow 3.2.0. A full update of the project brings them:

```bash
composer update
```

A module the shop already had keeps its state. Check the state of the others with `php Thelia module:list` and activate the ones the shop needs.

## Checking your own install

On an installed shop, the effective list is:

```bash
php Thelia module:list
```

On a fresh install it matches the two tables above, module for module. A difference means a module was added, removed or toggled after the installation.
