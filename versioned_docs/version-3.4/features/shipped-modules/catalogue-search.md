---
title: Catalogue Search
sidebar_position: 6
---

# Catalogue Search

Two modules help a customer find a product: a search that tolerates typing mistakes, and a sort
by best sales. Both are active on a fresh install and need no key.

| Module | What it does | Default state |
| --- | --- | --- |
| TntSearch | Full-text search tolerant to typos | Active |
| BestSellers | "Best sellers" sort in listings and search | Active |

## Typo-tolerant search (TntSearch)

### What it does

When TntSearch is active, the search page of the Flexy theme delegates to it: a query with a typo
still finds the product. The search terms that returned no product are listed in the back office
(see [Conversion report](../../back-office/conversion-report.md)).

### Indexes

The search reads indexes stored on disk. They are built at installation, with the demo data, and
when the module is activated from the back office.

The **update in real time** setting on `/admin/module/TntSearch` is on after a first activation:
the indexes are updated at each change, so a product created or renamed in the back office is found
right away. If the setting was already chosen on the shop, an activation keeps that choice.

When the setting is off, new or changed objects are only found after a rebuild of the indexes, for
instance from a nightly cron job:

```bash
php Thelia tntsearch:indexes
```

Module: [thelia-modules/TntSearch](https://github.com/thelia-modules/TntSearch)

## Sort by best sales (BestSellers)

### What it does

Product listings and search results get a **Best sellers** sort option (value `best_sellers_sales`
in the sort parameter). The back office lists the best-selling products on `/admin/best-sellers`.

### Settings

By default, sales are counted over the whole history of the shop. To count them over a period
only, set it on `/admin/module/BestSellers`.

Module: [thelia-modules/BestSellers](https://github.com/thelia-modules/BestSellers)
