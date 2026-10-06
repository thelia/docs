---
title: Updating from 3.1 to 3.2
sidebar_position: 2.2
---

# Updating from 3.1 to 3.2

This page lists what is specific to the move from Thelia 3.1 to 3.2, patch release 3.2.1
included. The procedure itself (backup, Composer, database script, cache, assets, modules) is
on [Update](./update.md); the steps below come on top of it. If you start from 3.0, apply
[Updating from 3.0 to 3.1](./from-3.0-to-3.1.md) first.

## Before you update

1. Back up the files and the database, as described in [Update](./update.md).
2. If your `composer.json` requires API Platform with `^4.4`, change it to `^4.3`. The 3.2 core
   pins API Platform to 4.3.x and declares a deliberate conflict with 4.4, so the update can
   move API Platform down from 4.4.
3. If you start from 3.1.0 and have not run it since, empty the image cache after the update
   with `php bin/console image-cache:clear`. It is part of the 3.1.1 release, see
   [Updating from 3.0 to 3.1](./from-3.0-to-3.1.md#patch-release-311).
4. List the modules your shop runs that read image files (see
   [Image files per language](#image-files-per-language)) and the modules that handle
   payments (see [Payment modules](#payment-modules)).

## What the update script does now

`php local/setup/update.php` changed in 3.2:

- It accepts `-n` or `--no-interaction`.
- It exits with code 0 when the database is already up to date.
- It purges `var/cache/<env>` and `var/propel/<env>` itself before it starts.

```bash
php local/setup/update.php --no-interaction
```

The script also performs these changes on the database:

- It copies the image file into the translation of each active language, then drops the
  `file` column of the image tables (see [Image files per language](#image-files-per-language)).
- It switches `active-admin-template` to `default-twig` and deactivates TheliaSmarty (see
  [The Smarty back-office is gone](#the-smarty-back-office-is-gone)).

## After the Composer update

Run the module refresh once Composer is done:

```bash
php Thelia module:refresh
```

A module newly shipped with the release is registered inactive. Activate it from the
back-office, or with `php Thelia module:activate <ModuleCode>`.

TheliaCMS (`thelia/cms-module`) is not required by the skeleton. To add it to a project:

```bash
composer require thelia/cms-module
php Thelia module:refresh
```

## Changes that need your attention

### API Platform stays on 4.3

The core pins API Platform to 4.3.x and conflicts with 4.4 on purpose. A project that requires
`^4.4` cannot resolve: set the constraint back to `^4.3` in `composer.json`.

Add one setting to `config/packages/api_platform.yaml`. It removes the "multiple ApiResource
with the same shortName" warnings:

```yaml
# config/packages/api_platform.yaml
api_platform:
    defaults:
        extra_properties:
            deduplicate_resource_short_names: true
```

### Image files per language

The `file` column of `product_image`, `category_image`, `content_image`, `folder_image` and
`brand_image` is removed. Each image now carries its file in its translation, so an image can
differ from one language to the next. The update script copies the existing file into the
translation of every active language.

A module that read the `file` column has to read `file` from the matching `*_image_i18n` table
instead (`product_image_i18n`, `category_image_i18n`, and so on). Check the modules that
export or display images; for example, GoogleShoppingXml and EasyProductManager need their
4.0.0 versions.

### The Smarty back-office is gone

The Smarty back-office is removed. The update script sets `active-admin-template` to
`default-twig` and deactivates TheliaSmarty. A shop that still wants the Smarty back-office
adds `thelia/backoffice-default-template` itself; that package is no longer maintained.

### Back-office CSRF token

The back-office still accepts the CSRF token in the URL, but this is deprecated and 3.3 will
refuse it. A module that builds back-office requests sends the token in the POST body
instead. Toggles, position changes and deletions require the token: a request without a valid
one answers 403.

### Themes

Flexy and default-twig 1.2 are required: the 3.2 core refuses a theme older than 1.2, and the
3.2.1 core a default-twig older than 1.2.2 (see [Patch release 3.2.1](#patch-release-321)).
Updating through `thelia/thelia-skeleton` brings them. If you forked Flexy 1.1:

- Take over the `GuestOrderPlacedSubscriber` fix of Flexy 1.2: the core no longer raises
  `ORDER_CART_CLEAR`.
- Your theme can now read the content slots.

### Payment modules

The payment flow changed: `supportsPaymentRetry()` is a new part of the contract, the cart is
kept until the payment completes, and the amount is checked together with the shipping cost.
Review each payment module of the shop against
[Payment modules](../modules/payment-modules.md).

## Converting a database migrated from Thelia 2 to utf8mb4

Thelia 2 created its tables in `utf8` (`utf8mb3`) and the migration keeps them in it. Thelia 3
connects in `utf8mb4`, and a fresh install creates its tables in `utf8mb4`. On a migrated shop
the database refuses an emoji, or any other character outside the Basic Multilingual Plane,
with error 1366 ("Incorrect string value"), while a fresh install stores it.

The update script does not convert these tables. The conversion rebuilds each table and locks
it for writes while it runs, for a time that grows with its size, so you run it yourself, once,
during a maintenance window. The command arrives with 3.2. List what would change first:

```bash
php bin/console thelia:database:convert-utf8mb4
```

The command lists each table that is not in `utf8mb4` with its columns and approximate size.
It flags the tables it moves from the `COMPACT` to the `DYNAMIC` row format: in `COMPACT`,
InnoDB caps an index at 767 bytes, a `VARCHAR(255)` in `utf8mb4` needs 1020, and the fresh
install creates its tables in `DYNAMIC`. It also names what it cannot convert on its own and
converts nothing until that is settled: a text column used by a foreign key, or an index longer
than the engine accepts. A table in another character set, such as `latin1`, is reported and
left alone, because its bytes may be UTF-8 written through a `latin1` connection.

Back the database up, then convert:

```bash
php bin/console thelia:database:convert-utf8mb4 --force
```

Each table moves to `utf8mb4` with `utf8mb4_general_ci`, the collation of the fresh install,
and its `TEXT` columns stay `TEXT`. The database default follows, so a module installed later
creates its tables in `utf8mb4`. If a table fails, the command stops there and prints the
database error. The tables converted before it stay converted, and the next run picks up the
rest. `--table=<name>`, repeated, converts only the named tables, which lets you spread the
largest ones over several windows.

## Rebuild the assets

Recompile the assets of the themes after the update:

```bash
php Thelia importmap:install
php Thelia tailwind:build
php Thelia sass:build
```

## Patch release 3.2.1

3.2.1 is a security and maintenance release of the 3.2 line, without any breaking change. It
ships `setup/update/sql/3.2.1.sql`, which renames the tax types a shop migrated from Thelia 2
still stores under their Thelia 2 class, declares the back-office hooks the Twig templates call,
and records the new version. `thelia/setup` ships as 3.2.1 with this core; `thelia/config` does
not change and stays at 3.2.0. The full notes are on the
[GitHub release](https://github.com/thelia/thelia/releases/tag/3.2.1).

```bash
composer update thelia/thelia-skeleton --with-all-dependencies
php local/setup/update.php
php Thelia cache:warmup --env=prod
```

The core refuses a back-office theme `thelia/backoffice-default-twig-template` older than 1.2.2.
Update it to 1.2.2, and the front theme `thelia/flexy` to 1.2.1, at the same time: updating
through `thelia/thelia-skeleton` brings both.

When the web server user owns the cache of the previous release, the update script moves it
aside instead of dying, and stops with code `8` only when it cannot even move it. See
[Update](./update.md#2-update-the-database).

### Security fixes

- [GHSA-5524-qfxp-33v9](https://github.com/thelia/thelia/security/advisories/GHSA-5524-qfxp-33v9):
  the upload policy now checks the name a file is stored under as well as the name it was sent
  with, and storage refuses a server-executable name. `MediaFacade::uploadImage()` and
  `MediaFacade::uploadDocument()` apply the upload policy.
- [GHSA-7wrm-pcw6-4g9m](https://github.com/thelia/thelia/security/advisories/GHSA-7wrm-pcw6-4g9m):
  documents with an HTML, XHTML, XML, XSL, JavaScript or compressed SVG extension are refused,
  whatever `document_upload_forbidden_extensions` says; the list is
  `FileConfiguration::BROWSER_ACTIVE_DOCUMENT_EXTENSIONS`. The file endpoints of the API serve a
  document as a download, and the web server has to do the same for the document cache (see
  [Web server](#web-server)).
- [GHSA-gcgv-f8rf-w2wc](https://github.com/thelia/thelia/security/advisories/GHSA-gcgv-f8rf-w2wc):
  a text cell of a CSV export, from the core or from a module, that starts with `=`, `+`, `-`,
  `@`, a tab or a carriage return now gets a leading `'` and stays text. A plain number such as
  `-5.00` or `+33612345678` is written unchanged, and a cell holding `,` or `;` is enclosed in
  quotes. JSON, XML and YAML exports are unchanged. The back-office theme 1.2.2 writes the
  newsletter subscriber export the same way.

### Web server

Thelia publishes the documents under `public/cache/documents/`, and the web server serves them
without going through PHP:

- on nginx, add the `location ^~ /cache/documents/` block given in
  [Nginx configuration](../getting-started/nginx-configuration.md#document-cache) to the server
  block of the shop;
- on Apache, the update script writes `public/cache/documents/.htaccess`. It needs the
  `FileInfo` override that `public/.htaccess` already needs, and `mod_headers`. See
  [Apache configuration](../getting-started/apache-configuration.md#htaccess-files).

### Files uploaded before the update

The update refuses such uploads from now on, but it leaves the files already stored where they
are. Look for an image or a document stored under a name a web server runs
(GHSA-5524-qfxp-33v9), and for a document a browser opens as a page or runs as a script
(GHSA-7wrm-pcw6-4g9m). From the root of the project, with GNU find:

```bash
find local/media public/cache -regextype posix-extended \
  ! -type d ! -path public/cache/documents/.htaccess \
  \( -iregex '.*/[^/]*\.(ph(p[3-8st]?|t(ml?)?|ar)|s(html?|tm)|ht(access|passwd))(\.[^/]*)?' \
  -o -iregex '[^/]+/[^/]+/documents/.*\.(html?|x(ht(ml?)?|ml|slt?|spf|ul)|m(ht(ml)?|ml)|r(df|ss)|atom|kml|svgz|[cm]?js)' \) \
  -print
```

The first pattern finds a server-executable extension anywhere in a file name (`report-1.php`,
`shell.php.jpg`), among images and documents; the second finds an HTML, XML, XSL, JavaScript or
compressed SVG document. The command only lists files. It skips the `.htaccess` the update
writes, and it lists the links of the cache whose target is already gone. If the shop keeps its
media or its document cache elsewhere (`document_cache_dir_from_web_root`), change the paths.

For each file listed under `local/media/`, delete the image or the document from the back
office, on the Images or Documents tab of its product, category, content, folder or brand, so
its row goes too. Then run the command again with `-delete` in place of `-print` to remove the
files left behind.

Deleting an image or a document over the admin API removes its row and leaves its files, and
deleting it from the back office leaves its copy under `public/cache/`. A file deleted that way
is still served at its URL: the command lists it as well, and `-delete` removes it.

### Other fixes

- A shop migrated from Thelia 2 with a fixed amount tax or a feature amount tax (eco-tax)
  prices the products under these taxes again: `3.2.1.sql` moves them to their Thelia 3 class.
  Computing a price failed with "Recorded type ... does not exists".
- The back-office hooks the Twig templates call, `customer.tab`, `customer.tab-content` and
  `customer-edit.actions` among them, are declared. A module subscribing to one of them was
  dropped when the container was built ("Hook customer.tab is unknown."), and its section never
  showed. A hook a module already created keeps its id and its titles.
- The pickup location provider reads its search parameters (radius, address, country, module
  ids) from the filters of the operation context, so `resources()` in a front theme can pass
  them.
- The `/file` endpoints of the front and admin API answer a browser opening the URL; they
  answered 500 when the `Accept` header put `text/html` first.
- The customer export writes the first and last names under their own column labels; they were
  swapped.

## Checklist

1. `composer update thelia/thelia-skeleton --with-all-dependencies`
2. `php local/setup/update.php --no-interaction`
3. `php Thelia cache:warmup --env=prod`
4. `php Thelia importmap:install && php Thelia tailwind:build && php Thelia sass:build`
5. `php Thelia module:refresh`, then activate the new modules you want.
6. `config/packages/api_platform.yaml`: add `deduplicate_resource_short_names`.
7. Check the image-reading modules and the payment modules.
8. If your database comes from Thelia 2: list the tables with `php bin/console thelia:database:convert-utf8mb4`, then convert them during a maintenance window (see [Converting a database migrated from Thelia 2 to utf8mb4](#converting-a-database-migrated-from-thelia-2-to-utf8mb4)).
9. nginx: add the document cache block to the server block (see [Web server](#web-server)).
10. List the files uploaded before the update and remove the ones the command finds (see [Files uploaded before the update](#files-uploaded-before-the-update)).
