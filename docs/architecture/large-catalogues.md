---
title: Large catalogues
sidebar_position: 7
---

# Large catalogues

**In short.** We measured a demo shop holding 1,000, 10,000 and 100,000 products, and 10,000
products with 200,000 orders. No page sends more queries to the database as the catalogue or the
order history grows: the storefront, the front API and the back office ask the same number of
questions at every size. Time is another matter. The storefront stays under a second up to 10,000
products, and its category page takes several seconds at 100,000. In the back office, the
dashboard and the lists of orders and customers get slower with every order: about 4 seconds with
100,000 orders, 8 to 12 seconds with 200,000. The figures below say which pages hold, which need
a setting or a component more, and which need a change in Thelia.

These are lab figures, measured on a shared machine. The number of queries does not depend on
the machine and can be compared from one version to the next. The times are an order of
magnitude.

## The shops measured

Each size is a fresh install with the demo data, to which a volume dataset is added by the test
command `thelia:test:volume:generate`.

| Size | Products | Combinations | Customers | Orders | Order lines | URLs |
|---|---:|---:|---:|---:|---:|---:|
| 1k | 1,000 | 2,205 | 500 | 1,000 | 2,460 | 4,620 |
| 10k | 10,000 | 22,033 | 5,000 | 10,000 | 25,012 | 40,620 |
| 100k | 100,000 | 220,710 | 50,000 | 100,000 | 249,883 | 400,620 |
| 10k, many orders | 10,000 | 22,033 | 50,000 | 200,000 | 500,703 | 40,620 |

Every product has a title and a URL in four languages, a price in two currencies, one to three
images, a material and often an origin and a warranty. Three products in five come in two to four
sizes. Products are spread over the 125 categories at the bottom of a tree of 155, unevenly, as in
a real catalogue: the largest category holds about 9,000 products at 100k, and one product in
five is also in a second category. Orders are spread over a year, with one to four lines; a few
customers place many orders.

Images reuse eight source files. A real shop has as many image files as products, and its image
cache is colder than the one measured here.

## Queries and time per page

Each cell gives the number of database queries of the page, then the time to its first byte.
The number of queries is the same in two campaigns on the same shop, and the same on another
machine. Times are medians of three calls after a warm-up call.

| Page | 1k | 10k | 100k | 10k, many orders |
|---|---|---|---|---|
| Home | 75 · 0.30 s | 75 · 0.28 s | 75 · 2.13 s | 75 · 0.35 s |
| Category (the largest) | 128 · 0.92 s | 128 · 1.31 s | 128 · 8.53 s | 128 · 1.40 s |
| Product | 156 · 0.67 s | 163 · 0.66 s | 152 · 0.66 s | 163 · 0.72 s |
| Search | 87 · 0.76 s | 87 · 0.80 s | 87 · 2.42 s | 87 · 0.90 s |
| Sitemap of the products | 8 · 0.03 s | 8 · 0.04 s | 8 · 0.05 s | 8 · 0.04 s |
| Account › orders | 323 · 1.19 s | 360 · 1.26 s | 330 · 1.15 s | 312 · 1.17 s |
| Front API, products | 31 · 0.35 s | 31 · 0.43 s | 31 · 1.50 s | 31 · 0.46 s |
| Back office, dashboard | 104 · 0.21 s | 104 · 0.65 s | 104 · 5.68 s | 104 · 11.51 s |
| Back office, products | 215 · 0.38 s | 215 · 0.42 s | 215 · 1.13 s | 215 · 0.44 s |
| Back office, products, last page | 115 · 0.27 s | 115 · 0.32 s | 115 · 1.05 s | 115 · 0.34 s |
| Back office, product sheet | 122 · 0.47 s | 126 · 0.49 s | 122 · 0.64 s | 126 · 0.50 s |
| Back office, product sheet saved | 26 · 0.11 s | 22 · 0.07 s | 26 · 0.07 s | 22 · 0.07 s |
| Back office, orders | 43 · 0.25 s | 42 · 0.51 s | 42 · 3.75 s | 42 · 7.90 s |
| Back office, orders, last page | 41 · 0.23 s | 41 · 0.51 s | 41 · 4.31 s | 40 · 8.72 s |
| Back office, order sheet | 81 · 0.24 s | 75 · 0.22 s | 78 · 0.24 s | 78 · 0.25 s |
| Back office, customers | 46 · 0.33 s | 46 · 0.55 s | 46 · 3.13 s | 46 · 7.17 s |
| Back office, customers, last page | 46 · 0.29 s | 46 · 0.52 s | 46 · 3.19 s | 46 · 7.58 s |
| Back office, customer sheet | 47 · 0.33 s | 48 · 0.31 s | 49 · 0.33 s | 49 · 0.41 s |

The product page, the account orders page and the order sheet do not show the same product, the
same customer or the same order at every size: their number of queries follows what the page
shows (combinations, lines of the order), not the size of the shop.

## Long jobs

| Job | 1k | 10k | 100k | 10k, many orders |
|---|---:|---:|---:|---:|
| Export of the product prices (CSV) | 1.3 s | 8.7 s | 85.4 s | 8.6 s |
| Export of the orders (CSV) | 0.4 s | 1.3 s | 11.2 s | 23.0 s |
| Export of the customers (CSV) | 0.3 s | 0.4 s | 2.4 s | 2.5 s |
| Generation of the dataset | 1.1 s | 7.5 s | 72.9 s | 44.3 s |

Exports are run from the console. The generation writes its rows by multi-row inserts, without
the events of the models: it is not the time an import of the same catalogue would take.

## What holds, and what does not

**Holds at every size measured.** The product page, the order and customer sheets, the save of
a product sheet, the sitemap, and the first and last pages of the product list of the back
office. Their number of queries does not grow and their time stays under a second.

**Needs a setting or a component more.**

- Search. The search of the shop reads the catalogue tables directly: 0.8 s at 10,000
  products, 2.4 s at 100,000. Above some tens of thousands of products, plan an external search
  engine.
- The front API and the home page. They take 1.5 s and 2.1 s at 100,000 products, with the same
  number of queries as at 1,000. A shared cache in front of the shop
  ([reverse proxy cache](../getting-started/reverse-proxy-cache.md)) serves the public pages it
  can keep without asking Thelia.
- The export of the product prices. It is linear, about 0.85 ms per product: 85 seconds for
  100,000 products. Run it from the console or as a background job, not in a web request with a
  short time limit.
- The account orders page sends more than 300 queries, whatever the size of the shop. It holds,
  but it is the page of the storefront that asks the most.

**Does not hold, and needs a change in Thelia.**

- The category page. At 100,000 products its largest category, about 9,000 products, takes 5
  to 8.5 seconds, with the same number of queries as at 1,000. Its slowest queries (the URLs and
  the count of the products of the category) take about a second; the rest is being analysed.
- The dashboard of the back office. On every display it computes the sales of six periods, from
  today to the previous year, twice each (with and without shipping), by adding up the order
  lines: 4 to 5.7 s with 100,000 orders, 11.5 to 13 s with 200,000.
- The lists of orders and customers of the back office. On every display they compute the bounds
  of their amount filters over the whole order history: 3 to 4 s with 100,000 orders, 7 to 9 s
  with 200,000. The first page and the last page cost the same.

## How the figures are measured

| | |
|---|---|
| Date | 2026-11-24 |
| Version | Thelia 3.5.0 in development (main branch of the core), Flexy from its development branch |
| Shop | Fresh install with the demo data, then the volume dataset (seed 306, base date 2026-11-01) |
| Mode | `APP_ENV=prod`, assets compiled, shared cache of API resources left as installed (off) |
| Server | Apache and PHP-FPM, PHP 8.3.6, over HTTP/2 with TLS |
| Database | MySQL 8.0.46, as installed on the runner, no tuning |
| Machine | GitHub-hosted runner, 4 vCPU (Intel Xeon 6975P-C or AMD EPYC 9V74), 15 GB; one machine per size |
| Measure | `thelia:test:volume:measure`, three calls per page after a warm-up call, two campaigns compared |

The number of queries of a page is read from the database server itself (its `Questions`
counter) before and after each call, so it counts everything the page asks, including what runs
after the response is sent. It is exact only while nothing else talks to the database server.
The pages measured and their order are in `setup/volume/pages.yaml` of the core.

After the measure, a browser walks each shop as a person would: a category, a product put into
the cart, the cart, then the dashboard, lists and sheets of the back office. Every screen
rendered at every size, without error in the browser console.

## Measure it yourself

The protocol, with its commands, is in
[`setup/volume/README.md`](https://github.com/thelia/thelia/blob/main/setup/volume/README.md)
of the core. In short, on a disposable shop:

```bash
php bin/install --with-demo --with-admin
APP_ENV=dev php bin/console thelia:test:volume:generate --products=10000 --orders=10000 --customers=5000 --force
# serve the shop with APP_ENV=prod, then:
php bin/console thelia:test:volume:measure --base-url=https://my-shop.test --runs=3 --output=var/volume-1.json
php bin/console thelia:test:volume:measure --base-url=https://my-shop.test --runs=3 --skip-jobs --compare=var/volume-1.json
APP_ENV=dev php bin/console thelia:test:volume:purge
```

:::danger Never on a live shop
These commands write hundreds of thousands of rows. They refuse the production environment and a
database holding orders they did not write, unless `--force`. Run them on a copy you can throw
away.
:::
