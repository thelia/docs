---
title: Catalog Filters and Sorts
sidebar_position: 11
---

# Catalog Filters and Sorts

Added in Thelia 3.2: the Promotion and Newness facets, filters on brand pages, and sorts
provided by modules.

A product listing offers facets read from the `tfilters` system described in
[Data access](../front-office/data-access.md#custom-filters-tfilters). This page covers what a
merchant configures and what a theme or a module can rely on.

## Promotion and Newness facets

Two facets filter a listing on the flags a product carries through its sale elements:

| Facet | `tfilters` key | Flag read | Value offered |
| --- | --- | --- | --- |
| Promotion | `promo` | `product_sale_elements.promo` | "On sale" |
| Newness | `new` | `product_sale_elements.newness` | "New" |

A product matches as soon as one of its visible sale elements carries the flag. A hidden sale
element never counts, so a shopper who ticks the box is never handed a product whose only
discounted variant the shop does not show. When both facets are ticked, a product with one
discounted variant and a different new variant matches.

Each facet offers a single value. Leaving it unticked adds no condition: it never asks for the
products that do not carry the flag.

The Newness flag is what the merchant set on the sale element. Nothing clears it with time.

The Promotion facet reads the discount stored in the catalog, the one every visitor sees as a
struck-through price. A price reserved to an audience is served to its own customer when the
page is read and is not stored as a promotion, so the facet does not count it. See
[Reserved Sales](./reserved-sales.md).

### Showing or hiding them

Both facets are listed with the other filters in the filter section of the category edit page
and of the template edit page, in the back office. They are visible by default, and the
Visible column hides them for that category or that template, like any other filter. The same
section sets their position and display type.

A fresh install seeds them in `choice_filter_other` as rows 4 and 5, of types `promo` and `new`.
The 3.2.0 update script inserts the two rows when no row of that type exists yet, with their
titles in eight languages, and keeps a title the merchant already typed.

## Counts

Each value of a facet comes with the number of products it would keep, and the counts follow the
other filters applied. A facet that is part of the selection reads its counts from the listing
narrowed by every other filter but itself, so ticking one value keeps its siblings on offer. A
facet that is not selected reads them from the fully narrowed listing.

A value no product of the narrowed listing holds is not offered, so no filter leads to an empty
list. When the listing is restricted to visible products (`visible=true`), a value held only by
hidden products is not offered either.

## Filters on a brand page

A brand page offers filters too. Thelia configures filters per category, never per brand, so a
brand page takes the filter rows of the categories where the visible products of the brand are
filed, each read the way that category's own page reads it, template included. When two
categories configure the same feature, attribute or other criterion, the visible row with the
lowest position is kept: a brand page offers a filter as soon as one of its categories shows it.

The values and their counts are those of the brand's products. The Brand facet is never offered
on a brand page, since every product of the page belongs to that brand.

A caller declares a brand page with the `scope` parameter, next to `tfilters`:

```twig
{% set filters = resources('/api/front/tfilters/products', {
    'tfilters': {'brand': [[brandId]]},
    'scope': {'brand': brandId},
    'visible': true,
}) %}
```

The `scope` parameter is what tells a brand page with a category ticked from a category page with
a brand ticked: both send a category and a brand in `tfilters`, and they need different filter
columns. A caller that sends no `scope` keeps the earlier reading, where a single brand outside a
category and outside a set of ids is a brand page.

In Flexy, `brand.html.twig` renders the `ProductListing` live component with a `brandId`, and the
component sends the `scope` itself. See [Brand pages](../front-office/flexy-theme/customization.md#brand-pages).

## Sorts

Flexy offers these sorts on a product listing:

| Value | Label | API parameters |
| --- | --- | --- |
| `asc` | Ascending price | `untaxed_price_order=asc` |
| `desc` | Descending price | `untaxed_price_order=desc` |
| `newest` | Newest first | `order[createdAt]=desc` |
| `oldest` | Oldest first | `order[createdAt]=asc` |
| `alpha` | Name A to Z | `order[title]=asc` |
| `alpha_reverse` | Name Z to A | `order[title]=desc` |

Every sort adds `order[ref]=asc` as a tiebreaker, so that pagination stays stable. A sort value the
theme does not know falls back on the merchant's own order rather than answering an error.

### Adding a sort from a module

A sort that reads data a module writes belongs to that module. The module ships a service
implementing `Thelia\Domain\Catalog\Product\ProductSortProviderInterface`, which is autoconfigured
under the `thelia.catalog.product_sort` tag:

| Method | Returns |
| --- | --- |
| `value()` | The value of the sort in the query string. Prefix it with the module code, and never rename it once published. |
| `title()` | The label, already translated by the module. |
| `position()` | Where the entry sits among the theme's sorts. Flexy uses 10, 20, 40, 50, 60 and 70. |
| `parameters()` | The query parameters sent to the product collection, for instance `['order[rating]' => 'desc']`. |

The module also registers the filter that answers those parameters on the product collection.
Only the services of an active module reach the container, so a deactivated module offers no
sort. A provider that reuses a value the theme already declares replaces that sort.

The Comment module ships one: `best_rated`, labelled "Best rated", at position 30.
