---
title: Updating from 3.2 to 3.3
sidebar_position: 2.3
---

# Updating from 3.2 to 3.3

This page lists what is specific to the move from Thelia 3.2 to 3.3. The procedure itself
(backup, Composer, database script, cache, assets, modules) is on [Update](./update.md); the
steps below come on top of it. If you start from 3.1, apply
[Updating from 3.1 to 3.2](./from-3.1-to-3.2.md) first.

Thelia 3.3 ships Symfony Messenger and the [background jobs](../architecture/background-jobs.md).
Nothing waits for a worker after the update: `MESSENGER_TRANSPORT_DSN` stays empty and every job
runs at once, as before, until you name a queue.

## Symfony recipes

- The core requires `symfony/messenger`. When Composer applies the Symfony recipe of that
  package instead of the Thelia one, it writes `config/packages/messenger.yaml` and adds
  `MESSENGER_TRANSPORT_DSN=doctrine://default?auto_setup=0` to `.env`, and every mail then waits
  for a worker. Delete the `config/packages/messenger.yaml` the Symfony recipe wrote: the core
  configures Messenger itself. A `messenger.yaml` of your own, such as one that routes a module
  message, stays. Unless a worker runs, also delete that line, so `async` stays synchronous.
- The Symfony recipe of `symfony/scheduler` writes `src/Schedule.php`. Delete it too: the core
  declares its own `thelia` schedule.

## Queues and workers

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

## Rights

- Launching an import from the back office takes the `UPDATE` right on `admin.import`; `VIEW`
  now only shows the imports and their jobs. Review the profiles of the administrators who
  import.
- The new screen Configuration > System > Background jobs answers to the resource
  `admin.configuration.background-jobs`, which the update gives to no profile: grant it to the
  profiles that follow the jobs. Until then, only super-administrators see it.

## Dependencies

- The core requires `doctrine/dbal ^4.2`: a project or a module held on DBAL 3 moves to DBAL 4.
