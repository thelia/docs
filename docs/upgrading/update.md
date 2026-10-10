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

Read the release notes of the version you move to, and the matching page in
[Notes for each version](#notes-for-each-version). A release can change behaviour a shop
relies on, and a module or a template you depend on may need its own bump in
`composer.json`.

If the shop runs background workers, stop them before you start and restart them at the end, as described in [Deploying](../getting-started/background-workers.md#deploying).

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
beforehand. From 3.2, the script also purges `var/cache/<env>` and `var/propel/<env>` itself,
accepts `-n` or `--no-interaction`, and exits with code 0 when the database is already up to
date. It then reports the version it starts from and the one it moves to, and applies
each database migration in order. Several versions at once are applied in a single run. The
script offers to back the database up first and restores that backup if a migration fails; on
a large database, take the manual `mysqldump` above instead.

The web server user often owns `var/cache/<env>` and `var/propel/<env>`. From 3.2.1, when the
script cannot delete some of their files, it moves the directory aside
(`var/cache/<env>.previous-…`), where nothing loads it, prints the command that deletes it as
its owner, and goes on. When it cannot even move the directory, it stops with code `8` before
touching the database and prints that command: run it, or run the script as the web server
user, then start again.

This does not cover a shop that keeps serving requests during the update: the web server can
recreate `var/cache/prod` between the move and the boot, and the script then dies before
touching the database ([#4055](https://github.com/thelia/thelia/issues/4055)). Until that is
fixed, put the shop in maintenance or stop the web server while `update.php` runs, or run it
as the web server user.

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

## Notes for each version

Each release can ask for something the generic procedure above does not cover: a setting to
change, a module to bump, a behaviour that moves. Read the page for every minor version you
cross, in order:

- [Updating from 3.0 to 3.1](./from-3.0-to-3.1.md), patch releases 3.1.1 and 3.1.2 included.
- [Updating from 3.1 to 3.2](./from-3.1-to-3.2.md), patch release 3.2.1 included.

### Updating to 3.3: background jobs

Thelia 3.3 ships Symfony Messenger and the [background jobs](../architecture/background-jobs.md).
Check these points when you cross it:

- The core requires `symfony/messenger`. When Composer applies the Symfony recipe of that
  package instead of the Thelia one, it writes `config/packages/messenger.yaml` and adds
  `MESSENGER_TRANSPORT_DSN=doctrine://default?auto_setup=0` to `.env`, and every mail then waits
  for a worker. Delete the `config/packages/messenger.yaml` the Symfony recipe wrote: the core
  configures Messenger itself. A `messenger.yaml` of your own, such as one that routes a module
  message, stays. Unless a worker runs, also delete that line, so `async` stays synchronous.
- The Symfony recipe of `symfony/scheduler` writes `src/Schedule.php`. Delete it too: the core
  declares its own `thelia` schedule.
- Going back from a queue to no queue leaves the jobs still waiting in `messenger_messages`.
  Let a worker empty the queues before you empty `MESSENGER_TRANSPORT_DSN`.
- The core configures Messenger for the whole application: its serializer, its bus, its
  `failure_transport` and the routing of its messages come before the configuration of the
  project. An application that already queued messages of its own (`App\Message\…`) gets a
  `LogicException` on dispatch until their classes are listed in the
  `thelia.messenger.allowed_message_classes` parameter. A module message is accepted when it
  lives in the namespace of an active module and has a handler.
- With a queue, the web servers and the workers must share `var/data-transfer/import/` and
  `var/cache/export/`, and a deployment must not empty them while jobs wait. See
  [Running the workers](../getting-started/background-workers.md#deploying).
- On an AMQP queue, set `MESSENGER_HEAVY_TRANSPORT_DSN`: otherwise the exports and imports share
  the queue of `async`, are read by its worker and tried again three times like its jobs.
- Launching an import from the back office takes the `UPDATE` right on `admin.import`; `VIEW`
  now only shows the imports and their jobs. Review the profiles of the administrators who
  import.

## Recommendations

1. Back up your database before updating.
2. Test the update on a staging environment first.
3. Review the release notes for behaviour and breaking changes.
4. Update only modules that are compatible with your Thelia version.
