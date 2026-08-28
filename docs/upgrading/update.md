---
title: Update
sidebar_position: 2
---

# Updating Thelia

## Update components

A project depends on `thelia/thelia-skeleton`, which brings in `thelia/core` and the templates. Set
the version you want in your `composer.json`:

```json
"thelia/thelia-skeleton": "^3.0"
```

Then run:

```bash
composer update
```

## Update the database

New files on an old database will break: a release can ship an SQL script that alters the schema.
Run the update script from the root of your installation:

```bash
php local/setup/update.php
```

It reads the `thelia_version` configuration variable from your database and replays every update
script between that version and the one your files are at, in order. Several versions at once are
applied in a single run. The script offers to back up your database first and restores that backup
if a script fails, but on a large database prefer a manual `mysqldump` taken before you start.

:::danger Never run `thelia:install` on an existing shop
That command is the initial installer, not a migration tool. It replays `thelia.sql`, which starts
by dropping every table.
:::

## Update assets

Composer reinstalls the template packages, so whatever they had compiled is gone. Rebuild the
assets:

```bash
php Thelia importmap:install
php Thelia tailwind:build
php Thelia sass:build
```

The first two rebuild the front-office assets, the last one the back-office stylesheet. Skip any
command the console does not carry: each comes from a package the corresponding template requires.

## Clear the cache

In development:

```bash
php Thelia cache:clear
```

In production, delete the directory and warm it up again instead of calling `cache:clear`, which
boots the very container it is about to remove:

```bash
rm -rf var/cache/prod
php bin/console cache:warmup --env=prod
```

Do not skip the warmup. The production kernel does not build the LiveComponent template map on
demand, and every back-office page that renders a live component returns a 500 without it.

## Updating modules

Update modules separately:

```bash
composer update thelia/module-name
```

Then let Thelia compare the version in `module.xml` with the one stored in the database and run the
module's own `update()` method:

```bash
php Thelia module:refresh
php Thelia cache:clear
```

## Recommendations

1. Back up your database before updating.
2. Test updates on a staging environment first.
3. Review the changelog for breaking changes.
4. Update only modules that are compatible with your Thelia version.
