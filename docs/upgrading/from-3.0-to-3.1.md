---
title: Updating from 3.0 to 3.1
sidebar_position: 2.1
---

# Updating from 3.0 to 3.1

This page lists what is specific to the move from Thelia 3.0 to 3.1, patch release 3.1.1
included. The procedure itself (backup, Composer, database script, cache, assets, modules)
is on [Update](./update.md). Moving on to 3.2 is covered in
[Updating from 3.1 to 3.2](./from-3.1-to-3.2.md).

## Before you update

Two changes of the 3.1.0 release show up in production without anything being asked for, and
both concern integrations that call the API.

The API caps a page at one hundred items. A caller asking for more receives one hundred items
and no error, so an integration that walks a catalogue in a single call has to move to
paginated reads. A project that needs another ceiling redefines
`pagination_maximum_items_per_page` in its own `api_platform` configuration:

```yaml
# config/packages/api_platform.yaml
api_platform:
    defaults:
        pagination_maximum_items_per_page: 500
```

The API also limits its rate: two hundred requests a minute for an anonymous caller, eight
hundred for an authenticated customer, two thousand for the administration, ten failed login
attempts and twenty token refreshes. Each ceiling is set by a `THELIA_API_RATE_LIMIT_*`
environment variable, and a list of addresses and CIDR ranges exempts trusted callers, which
is what a payment gateway or a data feed needs. See
[Rate limiting](https://doc.thelia.net/docs/api/rate-limiting).

Three more points to check before you update:

- An updated shop and a fresh install differ on one row. The terms and conditions consent is
  created mandatory on a fresh install, and optional on an updated shop, so that a theme
  which does not render the consent box yet cannot block the checkout. Switch it to mandatory
  from the consent configuration screen once the theme shows it. See
  [Consents at payment](../features/checkout.md#consents-at-payment).
- The connection now names its character set in the DSN, `utf8mb4`, when the DSN named none.
  A DSN written in a `database.yml` is taken as it is, so a shop that picked its own keeps
  it. A database inherited from a Thelia 2 migration whose tables stayed in `latin1` has to
  name its set in the DSN before updating.
- Every response carries `X-Frame-Options: SAMEORIGIN` unless the shop already sets the
  header. A shop displayed in an iframe on another domain has to write its own value. See
  [Default response headers](../security/http-headers.md).

## Packages and themes

`thelia/setup` and `thelia/config` ship as 3.1.1 with this core: their 3.1.0 tags were
published early and lack the last tables of the release. Updating through
`thelia/thelia-skeleton` picks the right ones on its own.

The themes follow the core. Flexy 1.1.0, default-twig 1.1.0, email 1.1.0 and pdf 1.1.0 need a
3.1 core: they render the checkout steps, the consent boxes, the offered cart lines, the
reserved sales and the order returns this release adds. Rebuild the cache and the theme
assets as described in [Update](./update.md).

## Patch release 3.1.1

3.1.1 is a security release of the 3.1 line, without any breaking change. It ships
`setup/update/sql/3.1.1.sql`, which changes no schema and only records the new version.
`thelia/setup` ships as 3.1.2 with this core, and `thelia/config` does not change and stays at
3.1.1.

- Uploaded SVG images are sanitized more strictly and only reach the image cache once
  sanitized. After the update, empty the image cache:

  ```bash
  php bin/console image-cache:clear
  ```

- Update the back-office theme `thelia/backoffice-default-twig-template` to 1.1.1 at the same
  time. It runs the store logo and banner through the same checks, and the combinations and
  default price forms of a product only save through a POST that carries the form token.
- A fresh install no longer dies at boot on `thelia/thelia-library-module` 2.0.10, which
  relies on a class of the 3.2 core: the core now declares a conflict with that release, so
  Composer keeps 2.0.9.
