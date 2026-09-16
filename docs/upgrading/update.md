---
title: Update
sidebar_position: 2
---

# Updating Thelia

This guide covers updating an existing Thelia 3 site to a newer Thelia 3 release.

:::note Coming from Thelia 2?
Thelia 3 cannot update a Thelia 2 database in place. The updater refuses any database below
`3.0.0`, and moving a 2.x shop to 3.0 is a guided migration. Follow
[Migrating from Thelia 2](./migrate.md).
:::

## Before you start

Back up your files and your database. `mysqldump` is enough for the database:

```bash
mysqldump -u <user> -p <database> > backup.sql
```

Read the release notes of the version you move to. A release can change behaviour a shop
relies on, and a module or a template you depend on may need its own bump in
`composer.json`.

## 1. Update the code

A project installed with `composer create-project thelia/thelia-project` depends on
`thelia/thelia-skeleton`, which brings in the core packages and the themes. Updating it pulls
the whole set:

```bash
composer update thelia/thelia-skeleton --with-all-dependencies
```

To move the packages one by one instead, name them explicitly. `thelia/core`, `thelia/setup`
and `thelia/config` are the core, and the themes follow it:

```bash
composer update thelia/core thelia/setup thelia/config thelia/flexy \
  thelia/backoffice-default-twig-template thelia/email-default-template \
  thelia/pdf-default-template --with-all-dependencies
```

Drop from the list any theme your project does not use, and add the themes you replaced
them with.

## 2. Update the database

A release can ship an SQL script that alters the schema, so new files on an old database
will break. Run the update script from the root of your project. `thelia/setup` installs
under `local/`, so the script is at `local/setup/update.php`:

```bash
php local/setup/update.php
```

It starts by removing the compiled container and the generated Propel models of the release
you are leaving, so the new schema is the one it reads. There is nothing to purge by hand
beforehand. It then reports the version it starts from and the one it moves to, and applies
each database migration in order. Several versions at once are applied in a single run. The
script offers to back the database up first and restores that backup if a migration fails; on
a large database, take the manual `mysqldump` above instead.

:::danger Never run `thelia:install` on an existing shop
That command is the initial installer, not a migration tool. It replays `thelia.sql`, which
starts by dropping every table.
:::

## 3. Rebuild the cache

Do not run `cache:clear` in production: it empties the cache without rebuilding it, and the
first request then compiles it under load. Remove the compiled cache and the Propel runtime,
then warm the cache back up:

```bash
rm -rf var/cache/prod var/propel/prod
php Thelia cache:warmup --env=prod
```

In development, `var/cache/dev` and `var/propel/dev` are the ones to remove.

Do not skip the warmup. The production kernel does not build the LiveComponent template map
on demand, and every back-office page that renders a live component returns a 500 without it.

## 4. Rebuild the assets

Composer reinstalls the template packages, so whatever they had compiled is gone. Rebuild
the assets:

```bash
php Thelia importmap:install
php Thelia tailwind:build
php Thelia sass:build
```

The first two rebuild the front-office assets, the last one the back-office stylesheet. Skip
any command the console does not carry: each comes from a package the corresponding template
requires.

## 5. Update the modules

Modules keep their own version numbers, so they update separately:

```bash
composer update thelia/module-name
```

Then let Thelia compare the version in `module.xml` with the one stored in the database and
run the module's own `update()` method:

```bash
php Thelia module:refresh
php Thelia cache:clear
```

## Moving from 3.0 to 3.1

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

`thelia/setup` and `thelia/config` ship as 3.1.1 with this core: their 3.1.0 tags were
published early and lack the last tables of the release. Updating through
`thelia/thelia-skeleton` picks the right ones on its own.

The themes follow the core. Flexy 1.1.0, default-twig 1.1.0, email 1.1.0 and pdf 1.1.0 need a
3.1 core: they render the checkout steps, the consent boxes, the offered cart lines, the
reserved sales and the order returns this release adds. Rebuild the cache and the theme
assets as described above.

## Recommendations

1. Back up your database before updating.
2. Test the update on a staging environment first.
3. Review the release notes for behaviour and breaking changes.
4. Update only modules that are compatible with your Thelia version.
