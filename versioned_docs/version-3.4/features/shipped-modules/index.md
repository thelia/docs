---
title: Shipped Modules
sidebar_position: 1
---

# Shipped Modules

The distribution ships a set of modules that cover what most shops need on day one: taking a
payment, being found by search engines, measuring the audience, searching the catalogue and so on.
They are installed with every new shop (see
[What a fresh install contains](../../getting-started/what-a-fresh-install-contains.md)).

The pages below are organised by what you want to do, not by module. Each one names the module
that provides the function, where it is configured and what the shop does while a key or a setting
is missing.

| I want to | Page | Modules |
| --- | --- | --- |
| Take a payment | [Payments](payments.md) | Cheque, WireTransfer, PayPal, StripePayment |
| Be found by search engines | [Search engines](search-engines.md) | RewriteUrl, Sitemap |
| Measure the audience | [Tracking](tracking.md) | GoogleTagManager |
| Bring a visitor back | [Keeping visitors](keeping-visitors.md) | WishList, StockAlert |
| Help customers find a product | [Catalogue search](catalogue-search.md) | TntSearch, BestSellers |
| Handle orders and store pickup | [Orders](orders.md) | AdminOrderCreation, DuplicateOrder, LocalPickup |
| Collect business identifiers, block spam on forms | [Customer accounts and forms](customer-accounts-and-forms.md) | SiretManagement, ReCaptcha |

## Active or not after the installation

Modules that work without any setting are active as soon as the shop is installed. Modules that
need a key from a third party (PayPal, StripePayment, GoogleTagManager, ReCaptcha) are installed
but inactive: activate them once you have the keys.

To activate a module, open **Modules** in the back office and click **Activate** on its row, or run:

```bash
php Thelia module:activate <ModuleCode>
```

The settings of a module are on its configuration page, at `/admin/module/<ModuleCode>` in the
back office (the **Configure** button of its row in the modules list).

## Keys and secrets

API keys, client secrets and webhook secrets are entered in the configuration page of the module,
on each environment, and stay in that environment. They never go in the project repository, in a
theme, in a fixture or in a ticket, not even as an example. Use the test keys of the provider on a
development or staging shop, and the live keys on production only.

## What is not shipped

Some modules change the data model of the shop rather than add a function to it. They stay
installable on demand. See
[What is not shipped](../../getting-started/what-a-fresh-install-contains.md#what-is-not-shipped).
