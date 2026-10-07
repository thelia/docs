---
title: Background jobs
sidebar_position: 5
---

# Background jobs reference

This page lists the settings and commands of the background jobs, then walks through a
complete module that queues its own work. The model behind it (transports, retries, the
classes a queue accepts) is explained in [Background jobs](../architecture/background-jobs.md).
Running the workers in production is covered in
[Running the workers](../getting-started/background-workers.md).

## Configuration

Every setting is an environment variable, set in `.env.local` or in the environment of the
hosting.

| Variable | Default | Effect |
| --- | --- | --- |
| `MESSENGER_TRANSPORT_DSN` | empty | The queue of the `async` transport, from which the `async_heavy` queue is derived. Empty means no queue: every job runs at once. `doctrine://default`, a Redis DSN or an AMQP DSN names a queue that a worker consumes. |
| `MESSENGER_HEAVY_TRANSPORT_DSN` | derived | Overrides the queue of `async_heavy`. Set it on AMQP: otherwise the exports and imports share the queue of `async` and its three retries. |
| `MESSENGER_FAILURE_TRANSPORT_DSN` | `doctrine://default?queue_name=failed` | Where the jobs that failed every attempt are kept. |
| `THELIA_SCHEDULE_SALE_CHECK` | `* * * * *` | Cron expression of `sale:check-activation`. Empty disables the task. |
| `THELIA_SCHEDULE_MAINTENANCE_PURGE` | `30 3 * * *` | Cron expression of `maintenance:purge`. Empty disables the task. |
| `THELIA_SCHEDULE_FAILED_JOBS_PURGE` | `0 4 * * *` | Cron expression of `thelia:messenger:purge-failed`. Empty disables the task. |
| `THELIA_SCHEDULE_CURRENCY_RATES` | empty | Cron expression of `currency:update-rates`. Off by default. |
| `LOCK_DSN` | `flock` | The lock store that keeps two workers from running the same scheduled task. |

`doctrine://default` is the only Doctrine connection name accepted: it is the shop database,
reached with the settings of the Propel connection. The table `messenger_messages` is created
by the installer and by the 3.3.0 update script.

A Redis or AMQP DSN needs its Messenger bridge, which the core does not ship:
`composer require symfony/redis-messenger` (with the `redis` PHP extension) or
`composer require symfony/amqp-messenger` (with the `amqp` extension).

`async_heavy` takes its DSN from `MESSENGER_TRANSPORT_DSN` through
`Thelia\Messenger\HeavyTransportDsnProcessor`: empty gives `sync://`, a `doctrine://` DSN gives
the same table with `queue_name=heavy`, a Redis DSN gives the stream `<stream>_heavy`
(`messages_heavy` when it names no stream), and any other DSN is used as is, so both transports
share one queue.

The core configures Messenger for the whole application: its serializer, its bus, its
`failure_transport` and the routing of its messages are loaded before the configuration of the
project. The container parameter `thelia.messenger.allowed_message_classes` (an array, empty by
default) lists the exact names of the message classes that a project queues from outside
`Thelia\` and the namespaces of the active modules: an application that queues its own
`App\Message\…` classes gets a `LogicException` on dispatch until they are listed there. Any other message class must also be taken
by a handler, or have a parent or an interface a handler takes: the parameter
`thelia.messenger.handled_message_classes` is filled when the container is built and is not
meant to be set by hand. A handler that takes any message (`*` or `object`) does not count.

### Transports

| Transport | Retries | Notes |
| --- | --- | --- |
| `async` | 3, after 30 s, 2 min and 8 min (multiplier 4, with jitter) | Then the message goes to `failed`. |
| `async_heavy` | none (`max_retries: 0`) | Back-office exports and imports. A job that fails goes to `failed` at once. |
| `failed` | none | Replay with `messenger:failed:retry` or from the back office. |
| `scheduler_thelia` | none | The recurring tasks of the `thelia` schedule. |

The core routes `Symfony\Component\Mailer\Messenger\SendEmailMessage` to `async`, and
`Thelia\Domain\DataTransfer\Job\RunExportJob` and `Thelia\Domain\DataTransfer\Job\RunImportJob`
to `async_heavy`.

## Commands

| Command | Use |
| --- | --- |
| `messenger:consume async async_heavy --time-limit=3600 --memory-limit=256M` | Run a worker. It takes the mails first, then the exports and imports. |
| `messenger:consume scheduler_thelia --time-limit=3600 --memory-limit=256M` | Run the recurring tasks. |
| `messenger:stats` | Count the messages waiting in each transport. |
| `messenger:failed:show` | List the failed jobs, or show one with its error. |
| `messenger:failed:retry` | Replay failed jobs. |
| `messenger:failed:remove` | Delete failed jobs. |
| `messenger:stop-workers` | Ask every worker to stop after its current message. |
| [`thelia:messenger:purge-failed`](./cli/thelia_messenger_purge_failed.md) | Delete the failed jobs set aside for more than `--older-than` days (30 by default). |

All of them run through `php Thelia`, for example `php Thelia messenger:stats`.

## Back office

Configuration > System > Background jobs (`/admin/configuration/background-jobs`) shows:

- whether a queue is configured, and how many jobs wait in it,
- how many jobs failed, and the list of failed jobs, the newest first, with their description,
  the reason of the failure, the date and the number of attempts,
- the recurring tasks whose last run failed, under "Recurring tasks that failed",
- the last 20 exports and the last 20 imports of the administrator looking at it, of every
  administrator for a super-administrator.

The reason of a failed job is shown when it was written for the administrator (an exception
implementing `Thelia\Exception\UserFacingFailure`, `Thelia\Messenger\JobSetAsideException`
among them) or when it is the answer of the mail server, with the credentials of any URL in it
hidden by `Thelia\Mailer\TransportCredentials` (a password holding an `@` is hidden whole).
Either is cut to 2000 characters. Any other reason reads as a server error.

The waiting count adds the jobs of `async` and of `async_heavy`, and counts them once when both
transports have the same DSN. When `failed` is in the shop database, the default, the list is
read in SQL, so the newest failures show however many there are.

Each failed job can be replayed or deleted. Replay takes the job out of `failed` first, then
puts it back on the transport it failed on; if that fails, the job is set aside again. A job
that implements `Thelia\Messenger\Message\ReplayableJob` is put back as `forReplay()` returns
it, so it starts afresh; `Thelia\Messenger\Middleware\ReplayedJobMiddleware`, on the default
bus, does the same for `messenger:failed:retry`. A double
click cannot send it twice. Without a queue, a replayed job runs at once, and a job that fails
again stays in the failed list. A replay that fails shows "The job failed again. The details are
in the server log." and the reason goes to the log. If setting it aside fails too (queue and
database both down), the job is lost from the queues and a critical line of the log names it by
its id and its class, and the two failures by their class, code and place: its description and
its content may name a customer, and the log is kept far longer than the failed jobs.

A job the workers could no longer read (module turned off, class removed, content that no longer
fits) is listed as `Unreadable job: <reason>` with its original class. Replayed, it would fail
the same way, so it has no Replay button (`FailedJob::$replayable` is false); delete it once you
know what it was.

A recurring task of the `thelia` schedule that fails is not set aside in `failed`: it runs again
at its next time. `Thelia\Scheduler\EventListener\RecurringTaskFailureListener` keeps its last
failure in the `cache.app` pool (`Thelia\Scheduler\RecurringTaskFailures`) until a run of the
task goes through, or for a month after the date of that failure, and the screen lists it with the task, the reason and
the date. A command that exits with an error code gives `Command "<input>" exited with code
"<code>".` as its reason.

The "Details" link of an export or import is only shown to the administrator who started the
job and to super-administrators.

The screen answers to the resource `admin.configuration.background-jobs`. Grant `VIEW` to read
it, `UPDATE` to replay and `DELETE` to delete. The description of a mail names its recipient
and a failure reason may quote personal data, so give it only to the profiles that need it.

## Back-office exports and imports

Exports and imports started from the back office are jobs. Both use the status enum
`Thelia\Domain\DataTransfer\Job\JobStatus` (`queued`, `running`, `done`, `failed`).

| | Export | Import |
| --- | --- | --- |
| Transport | `async_heavy` | `async_heavy` |
| Launcher | `ExportJobLauncher::launch(...)` | `ImportJobLauncher::launch(Import $import, File $file, string $originalName, ?Lang $language = null, ?int $adminId = null)` |
| Message | `RunExportJob(int $exportJobId, int $postponements = 0)` | `RunImportJob(int $importJobId, int $postponements = 0)` |
| Row | `export_job` | `import_job`: status, file name, rows imported, refused rows with their reason, error |
| Without a queue | Runs in the request, the file is served at once | Runs in the request, the page shows the rows imported and the rows refused |
| With a queue | `/admin/export/job/{id}`: waiting, running with the rows written, done with the download, failed with the reason | `/admin/import/job/{id}`: waiting, running, done with the rows changed and refused, failed with the reason |
| Replay of a failed job | Starts the export over | Starts over from the first row |
| Files | Deleted after a day | Kept in `var/data-transfer/import/<Ymd>/` until the import is done, kept while it may be replayed |
| `maintenance:purge` | Deletes the done jobs older than 7 days, any other after 30 days | Deletes the done jobs older than 7 days, any other after 30 days, with their files |
| Right to launch | `VIEW` on the export resource | `UPDATE` on the import resource; `VIEW` only shows the imports and their jobs |
| Job page access | The administrator who started it and super-administrators, download included | The administrator who started it and super-administrators |

The classes live in `Thelia\Domain\DataTransfer\Job\`. Both messages implement
`DataTransferJobMessage`, `Thelia\Messenger\Message\ReplayableJob` and
`Thelia\Messenger\Message\DescribedJob` (they are listed as `Export #<id>` and `Import #<id>`
among the failed jobs), and both models (`ExportJob`, `ImportJob`) implement `DataTransferJob`. Both job pages refresh every 3 seconds,
at most 100 times (`JobPageRefresh::MAX_ROUNDS` in the theme), then offer a link to refresh by
hand, and a finished job is never run twice. Other administrators get a 403 on a job page, even with
the export or import right.

An administrator can launch 10 exports and imports in 10 minutes, the two counted together
(rate limiter `admin_data_transfer_launch`, declared in the core `framework` configuration). A
launch is only counted once its form is valid: a form sent without a file, with a file the
server did not receive whole, with a file whose name or content the import refuses, or with an
invalid option is not counted.
Past the limit, the launch is refused with a message asking to wait a few minutes.

Without a queue, an import that refused more than 10 rows leads to its job page, which lists
them all; with fewer, the form page shows them in its message. The description of an export or
an import, written in HTML by its module, keeps only `p`, `br`, `strong`, `b`, `em`, `i`, `u`,
`ul`, `ol`, `li`, `code`, `pre`, `blockquote`, `span` and `a` (with `href` and `title`, and only
`http`, `https` and `mailto` links). Anything else, scripts, styles, media, `id` and `name`
attributes included, is removed.

The reason of a failed job is a whitelist (`Thelia\Messenger\JobFailureMessage::forAdministrator()`).
An exception implementing `Thelia\Exception\UserFacingFailure`, anywhere in the chain of the
failure, gives its message, cut to 2000 characters. The core ones live in
`Thelia\Domain\DataTransfer\Exception`: `UploadRefusedException` (a `FormValidationException`
raised when an uploaded file is refused), `DataTransferNoDataFoundException`,
`HandlerUnavailableException`, `MissingColumnsException` and `JobRefusedException`.
`Thelia\Form\Exception\FormValidationException` itself does not implement it.

An export whose year is not four digits or whose month is not 1 to 12
(`ExportHandler::resolveRangeDate()`, called by the launcher and by the export) is refused with
"The dates of the export are not valid.", and one whose format is no longer available on the
server with `The format "<format>" is no longer available on this server.`. Both are a
`JobRefusedException`, which the administrator reads as it is.

Any other failure is shown as "The job failed because of a server error. The details are in the server
log." (`JobFailureMessage::SERVER_ERROR`), both on the job row and as the error of the failed
job on the Background jobs screen, and the error line the job writes to the log names it by
class, code and file:line (`JobFailureMessage::forLog()`), or by its reason, on one line, when
it was written for the administrator. The job page
passes the reason through the translator, so the fixed messages are shown in the language of
the administrator.

A module whose export or import throws an exception meant for the administrator implements
the interface on it:

```php
final class WarehouseRefusedException extends \RuntimeException implements \Thelia\Exception\UserFacingFailure
{
}
```

`JobLifecycle` dispatches a job, claims it or postpones it
(`claimOrPostpone(DataTransferJob $job, DataTransferJobMessage $message): ClaimOutcome`, the table
coming from `DataTransferJob::tableName()`), sets aside a message that fails before its job is
taken (`reject()`) and records the failure of a job (`fail()`); it reads from `Thelia\Messenger\Transport\ConfiguredQueues` whether the heavy jobs run
without a queue (`heavyJobsRunInline()`). A worker claims a job
atomically (`JobClaim::claim(string $table, int $jobId, bool $allowFailed = true)`, an injected
service) before running it:
two workers handed the same job never run it at the same time. A job left `running` is taken
again once its row has not been updated for one hour (`JobClaim::STALE_AFTER_SECONDS`, 3600). An
export updates it as it reports its progress and an import as it reads its rows, every 500 rows
(`Thelia\Domain\DataTransfer\DataTransferProgress::STEP`) and once at the end
(`ImportHandler::import()` takes an optional `$onProgress` closure), so a long job that is still
working keeps its worker.

A message that finds its job still `running` is dispatched again with a `DelayStamp` of
10 minutes (`JobLifecycle::POSTPONE_DELAY_SECONDS`, 600), at most 72 times
(`JobLifecycle::MAX_POSTPONEMENTS`, 12 hours), each time with `$postponements` one higher. A job
whose worker was killed is therefore taken again once its row is stale. `ClaimOutcome` tells
the handler what happened: `Owned` (it runs the job), `Finished` (the job is over, or no queue
can look at it again) or `Postponed`. After the last check
the message throws `UnrecoverableMessageHandlingException` and is set aside in `failed`;
replaying it from there takes the job over once its worker has gone quiet. `JobLifecycle` passes
`$allowFailed` only for the original message (`$postponements` at 0): a postponed message never
restarts a job that failed in the meantime, while a replayed job, which starts again at 0, takes
a failed job. Without a queue a message is never postponed.

A job whose row was deleted fails for good and stays in `failed`. A message that fails before
its job is taken (the row cannot be read, the claim fails, the look-again message is refused)
goes to `failed` through `JobLifecycle::reject()` with the sanitized reason only, and its row is
left untouched. A job the queue refuses at
dispatch is recorded as failed with "The job could not be queued. The details are in the
server log." (`JobLifecycle::NOT_QUEUED`), and the file of such an import is deleted. Failed
jobs are kept 30 days (`FailedMessagePurger::RETENTION_DAYS`), as long as the failed messages,
so they can still be replayed.

`maintenance:purge` delegates to `Thelia\Domain\DataTransfer\Service\DataTransferJobPurger`:
the `done` jobs created more than 7 days ago (`DataTransferJobPurger::JOB_RETENTION_DAYS`) are
deleted, any other (failed, queued, running) after 30 days. The file of an import is deleted
with its row only when it lies inside `var/data-transfer/import`
(`Thelia\Domain\DataTransfer\Job\ImportStorage`, `ImportStorage::DIRECTORY`). The files of that
directory older than 30 days are removed too,
and its empty directories once they are more than a day old, since a fresh one may be about to
receive an upload.

`ImportJobLauncher::launch()` checks the file in the request through
`ImportHandler::validateUpload(string $fileName, ?File $file = null)`, so a wrong file is
refused before anything is queued. The extension must be one the import handlers accept, and,
when the file is given, its content is read with `finfo`: an archive must match the type of its
archiver, anything else must be text. An archive is also looked into
(`Thelia\Domain\DataTransfer\ArchiveInspector`): it is refused when it holds more than 1000
files (`MAX_ENTRIES`), more than 512 MB once extracted (`MAX_EXTRACTED_BYTES`), or a name that
is absolute or contains `..`, or a link entry, zip and tar alike. A tar, gzip or bzip2 archive
is read header by header through `compress.zlib://` or `compress.bzip2://`, never held in
memory and never copied. GNU long-name and pax records count against the limits like any
entry, a pax record is read record by record, and a header record over 64 KB is refused.
`ImportHandler::import()` checks it again before extracting it, then
measures what the extraction wrote (`ArchiveInspector::assertExtractedSize()`).
`ImportHandler` takes the inspector as an optional constructor argument. A file that does not
parse in its format is refused with an `UploadRefusedException` asking to check its content,
and the import handler only reads a file that lies inside `ImportStorage`.
The file is moved out of the upload directory to `var/data-transfer/import/`
(`ImportStorage::DIRECTORY`), not to the cache, which a deployment empties. Its path is stored
relative to the project, and its name is cut to 100 characters.

An import runs in a single Propel transaction: stopped half way (an error, a killed worker, a
deployment), it leaves the catalog as it was, and replaying it starts over from the first row.
The `done` status, the rows imported and the rows refused are written inside that transaction.
The handler opens and commits the transaction only when the caller holds none; otherwise the
caller commits or rolls back. A row the import refuses (a missing combination, an invalid GTIN)
is listed with the job as a refusal, and the other rows are kept; a refusal that is not valid
UTF-8 is stored with the invalid bytes replaced. The refusals are kept up to 60,000 bytes
(`ImportJob::ROW_ERRORS_MAX_BYTES`), the last line then saying `<n> more rows were refused.`

A row whose save leaves the transaction unable to commit, even when a module catches the
failure, stops the import with `Row <n> could not be saved: nothing was imported.`
(`JobRefusedException`). A stock or a price is read from text or from a number, and must be
below 10^10 in absolute value; a list, an object, a missing price or anything else refuses the
row with its reason, and the price of a row is checked before anything is written for it.

Without a queue, a failed import can never be replayed, so its file is deleted at once
(`JobLifecycle::keepsFailedJobs()`). With a queue, deleting the failed import from the back
office dispatches `Thelia\Messenger\Event\FailedJobRemovedEvent` and its file is deleted with
it, unless the import is still marked running; `messenger:failed:remove` and
`thelia:messenger:purge-failed` leave the file to `maintenance:purge`, 30 days at most. A file that cannot be deleted is
logged and left to the
purge; the job still ends as it did. When the job row cannot record its failure, the error is
logged and the message is set aside in `failed` all the same.

`ImportHandler::import()` removes the extracted
copy of an archive once the import is over, whether it succeeded or not. The sign of life of an import goes through a second database
connection (`JobHeartbeat`), so a long import is never taken from its worker.

## Recurring tasks

The `thelia` schedule runs these commands when a worker consumes `scheduler_thelia`:

| Command | Variable | Default |
| --- | --- | --- |
| `sale:check-activation` | `THELIA_SCHEDULE_SALE_CHECK` | every minute |
| `maintenance:purge` | `THELIA_SCHEDULE_MAINTENANCE_PURGE` | 03:30 |
| `thelia:messenger:purge-failed` | `THELIA_SCHEDULE_FAILED_JOBS_PURGE` | 04:00 |
| `currency:update-rates` | `THELIA_SCHEDULE_CURRENCY_RATES` | off |

`currency:update-rates` is off because it overwrites every rate, including those set by hand.
`sale:check-activation` switches a sale back on when it was turned off by hand inside its
dates, as the command always did.

A shop that keeps these commands in its crontab must not also consume `scheduler_thelia`, or
each task runs twice. Choose one of the two.

A module adds a task to the same schedule with a Symfony Scheduler attribute and
`schedule: 'thelia'`:

- `#[AsCronTask('0 2 * * *', schedule: 'thelia')]` for a cron expression,
- `#[AsPeriodicTask('1 hour', schedule: 'thelia')]` for an interval.

The attribute goes on a console command class, or on a service class with `method:` naming the
method to call. The example below schedules a command.

## A complete module: StockSync

`StockSync` pushes the stock of each product combination to a remote warehouse API. When a
combination is saved in the back office, a listener dispatches a message, and the handler
calls the API. A nightly task pushes every combination again, to catch changes made elsewhere.

With an empty `MESSENGER_TRANSPORT_DSN`, the push happens during the save. With a queue, the
save returns at once and a worker does the push, with retries if the API is down.

Without a queue, an exception thrown by the handler reaches the code that dispatched the
message: the save of the combination in the back office fails with it. A shop that relies on a
remote API this way should run a queue.

```
local/modules/StockSync/
├── StockSync.php
├── composer.json
├── Config/
│   ├── config.xml
│   ├── module.xml
│   ├── schema.xml
│   └── TheliaMain.sql          # generated by module:generate:sql
├── Command/
│   └── PushAllStockCommand.php
├── EventListener/
│   └── StockChangedListener.php
├── Message/
│   └── PushStock.php
├── MessageHandler/
│   └── PushStockHandler.php
└── Model/                       # generated by module:generate:model
```

### The module class

`configureServices()` registers every class of the module, which makes the handler, the
listener and the command discovered. `configureContainer()` routes the message to `async`, in the
same way the core routes its own messages. `postActivation()` creates the tables.

```php
// local/modules/StockSync/StockSync.php
<?php

declare(strict_types=1);

namespace StockSync;

use Propel\Runtime\Connection\ConnectionInterface;
use StockSync\Message\PushStock;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\DependencyInjection\Loader\Configurator\ServicesConfigurator;
use Thelia\Core\Install\Database;
use Thelia\Module\BaseModule;

final class StockSync extends BaseModule
{
    public const DOMAIN_NAME = 'stocksync';

    public static function configureServices(ServicesConfigurator $servicesConfigurator): void
    {
        $servicesConfigurator->load(self::getModuleCode().'\\', __DIR__)
            ->exclude([
                __DIR__.'/I18n/*',
                __DIR__.'/Model/*',
                __DIR__.'/Message/*',
                __DIR__.'/StockSync.php',
            ])
            ->autowire()
            ->autoconfigure();
    }

    public static function configureContainer(ContainerConfigurator $containerConfigurator): void
    {
        $containerConfigurator->extension('framework', [
            'messenger' => [
                'routing' => [
                    PushStock::class => 'async',
                ],
            ],
        ], prepend: true);
    }

    public function postActivation(?ConnectionInterface $con = null): void
    {
        if (!self::getConfigValue('is_initialized', false)) {
            (new Database($con))->insertSql(null, [__DIR__.'/Config/TheliaMain.sql']);

            self::setConfigValue('is_initialized', true);
        }
    }
}
```

`Message/` is excluded from the service scan: a message is data, not a service.

A shop can also route the message itself, in `config/packages/messenger.yaml`, which takes
precedence over the prepended module configuration:

```yaml
# config/packages/messenger.yaml
framework:
    messenger:
        routing:
            'StockSync\Message\PushStock': async
```

### A queue of its own

Routed to `async`, the pushes wait behind the mails of the shop. A module whose work is
plentiful can give it a transport of its own, still synchronous by default:

```php
public static function configureContainer(ContainerConfigurator $containerConfigurator): void
{
    $containerConfigurator->parameters()->set('stock_sync.inline_transport_dsn', 'sync://');
    $containerConfigurator->extension('framework', [
        'messenger' => [
            'transports' => [
                'stock_sync' => '%env(default:stock_sync.inline_transport_dsn:STOCK_SYNC_TRANSPORT_DSN)%',
            ],
            'routing' => [
                PushStock::class => 'stock_sync',
            ],
        ],
    ], prepend: true);
}
```

With `STOCK_SYNC_TRANSPORT_DSN` empty or unset, the pushes stay synchronous. A shop that wants
them queued sets, for instance, `STOCK_SYNC_TRANSPORT_DSN=doctrine://default?queue_name=stock_sync`
and runs a worker with `php Thelia messenger:consume stock_sync`. Pushes that fail every
attempt still go to the `failed` transport of the shop.

### Metadata and dependencies

```xml
<!-- local/modules/StockSync/Config/module.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<module xmlns="http://thelia.net/schema/dic/module"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://thelia.net/schema/dic/module http://thelia.net/schema/dic/module/module-2_2.xsd">
    <fullnamespace>StockSync\StockSync</fullnamespace>
    <descriptive locale="en_US">
        <title>Stock sync</title>
        <subtitle>Pushes the stock of each combination to a warehouse API</subtitle>
    </descriptive>
    <languages>
        <language>en_US</language>
    </languages>
    <version>1.0.0</version>
    <author>
        <name>Your Name</name>
        <email>you@example.com</email>
    </author>
    <type>classic</type>
    <thelia>3.3.0</thelia>
    <stability>prod</stability>
</module>
```

```json
{
    "name": "your-vendor/stock-sync-module",
    "type": "thelia-module",
    "license": "MIT",
    "require": {
        "thelia/installer": "~1.1",
        "symfony/http-client": "^7.4"
    },
    "extra": {
        "installer-name": "StockSync"
    },
    "autoload": {
        "psr-4": {
            "StockSync\\": ""
        }
    }
}
```

`Config/config.xml` declares nothing, since `configureServices()` registers the services, but
the `module:generate:*` commands refuse a module without it:

```xml
<!-- local/modules/StockSync/Config/config.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<config xmlns="http://thelia.net/schema/dic/config"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://thelia.net/schema/dic/config http://thelia.net/schema/dic/config/thelia-1.0.xsd">
</config>
```

### The tables

`stock_sync_state` remembers the last quantity pushed for each combination; it is what makes
the handler idempotent. `stock_sync_log` keeps one line per push. The foreign key points to a
core table, so the core schema is declared as an external schema, for reference only: without
it, `module:generate:sql` cannot resolve `product_sale_elements`.

```xml
<!-- local/modules/StockSync/Config/schema.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<database defaultIdMethod="native" name="TheliaMain" namespace="StockSync\Model">

    <!-- The core tables a foreign key points to, read for reference only. -->
    <external-schema filename="local/config/schema.xml" referenceOnly="true"/>

    <table name="stock_sync_state">
        <column name="product_sale_elements_id" primaryKey="true" required="true" type="INTEGER"/>
        <column name="pushed_quantity" required="true" type="FLOAT"/>
        <column name="pushed_at" required="true" type="TIMESTAMP"/>

        <foreign-key foreignTable="product_sale_elements" onDelete="CASCADE">
            <reference local="product_sale_elements_id" foreign="id"/>
        </foreign-key>
    </table>

    <table name="stock_sync_log">
        <column autoIncrement="true" name="id" primaryKey="true" required="true" type="INTEGER"/>
        <column name="product_sale_elements_id" required="true" type="INTEGER"/>
        <column name="quantity" required="true" type="FLOAT"/>
        <column name="created_at" required="true" type="TIMESTAMP"/>
    </table>
</database>
```

Generate the models and the SQL file:

```bash
php Thelia module:generate:model StockSync
php Thelia module:generate:sql StockSync
```

### The message

The message carries an id, nothing else. It is a class of the module namespace, so the queue
accepts it, and its only property is a promoted scalar, so the Symfony serializer writes and
reads it as JSON.

```php
// local/modules/StockSync/Message/PushStock.php
<?php

declare(strict_types=1);

namespace StockSync\Message;

final readonly class PushStock
{
    public function __construct(
        public int $productSaleElementsId,
    ) {
    }
}
```

Never put a Propel model in a message. It cannot be serialized as JSON, and by the time the
worker reads the message the row may have changed or been deleted.

### The handler

The handler re-reads the combination, compares it with what was pushed last time, calls the
API with the absolute quantity, then records the push. It assumes nothing about a request: the
shop URL comes from `DEFAULT_URI`, and the locale of the product title is the default language
of the shop, chosen explicitly.

```php
// local/modules/StockSync/MessageHandler/PushStockHandler.php
<?php

declare(strict_types=1);

namespace StockSync\MessageHandler;

use Propel\Runtime\Propel;
use StockSync\Message\PushStock;
use StockSync\Model\StockSyncLog;
use StockSync\Model\StockSyncState;
use StockSync\Model\StockSyncStateQuery;
use StockSync\StockSync;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Messenger\Exception\UnrecoverableMessageHandlingException;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Thelia\Model\Lang;
use Thelia\Model\ProductSaleElementsQuery;

#[AsMessageHandler]
final readonly class PushStockHandler
{
    public function __construct(
        private HttpClientInterface $httpClient,
        #[Autowire(env: 'DEFAULT_URI')]
        private string $shopUrl,
    ) {
    }

    public function __invoke(PushStock $message): void
    {
        $productSaleElements = ProductSaleElementsQuery::create()->findPk($message->productSaleElementsId);

        // Deleted since the message was dispatched: nothing left to push.
        if (null === $productSaleElements) {
            return;
        }

        $quantity = (float) $productSaleElements->getQuantity();
        $state = StockSyncStateQuery::create()->findPk($productSaleElements->getId());

        // Already pushed with this quantity: a replay, or a second message for the same change.
        if (null !== $state && $state->getPushedQuantity() === $quantity) {
            return;
        }

        $apiUrl = (string) StockSync::getConfigValue('api_url');

        if ('' === $apiUrl) {
            throw new UnrecoverableMessageHandlingException('StockSync has no api_url configured.');
        }

        $locale = Lang::getDefaultLanguage()->getLocale();
        $product = $productSaleElements->getProduct();
        $product->setLocale($locale);

        $response = $this->httpClient->request('PUT', rtrim($apiUrl, '/').'/stock/'.rawurlencode((string) $productSaleElements->getRef()), [
            'auth_bearer' => (string) StockSync::getConfigValue('api_token'),
            'json' => [
                'quantity' => $quantity,
                'title' => $product->getTitle(),
                'locale' => $locale,
                'source' => rtrim($this->shopUrl, '/'),
            ],
        ]);

        $status = $response->getStatusCode();

        // The API refused the data: retrying would get the same answer.
        if ($status >= 400 && $status < 500 && 429 !== $status) {
            throw new UnrecoverableMessageHandlingException(\sprintf('The warehouse refused %s with HTTP %d.', $productSaleElements->getRef(), $status));
        }

        // A 5xx or a 429: throw, so Messenger retries later.
        if ($status >= 300) {
            throw new \RuntimeException(\sprintf('The warehouse answered HTTP %d for %s.', $status, $productSaleElements->getRef()));
        }

        $this->recordPush($productSaleElements->getId(), $quantity, $state);
    }

    private function recordPush(int $productSaleElementsId, float $quantity, ?StockSyncState $state): void
    {
        $connection = Propel::getConnection('TheliaMain');
        $connection->beginTransaction();

        try {
            $state ??= (new StockSyncState())->setProductSaleElementsId($productSaleElementsId);
            $state
                ->setPushedQuantity($quantity)
                ->setPushedAt(new \DateTimeImmutable())
                ->save($connection);

            (new StockSyncLog())
                ->setProductSaleElementsId($productSaleElementsId)
                ->setQuantity($quantity)
                ->setCreatedAt(new \DateTimeImmutable())
                ->save($connection);

            $connection->commit();
        } catch (\Throwable $exception) {
            $connection->rollBack();

            throw $exception;
        }
    }
}
```

`StockSync::getConfigValue()` is read again for every message, because the worker forgets the
module configuration between messages: a token changed in the back office is used by the next
push without restarting the worker.

The two writes of `recordPush()` share an explicit transaction on the Propel connection, so
the state and the log never disagree.

### The listener

The core saves a combination in its `PRODUCT_UPDATE_PRODUCT_SALE_ELEMENT` listener, at
priority 128, and commits its transaction there. The module listens to the same event at a
lower priority, so it runs after the commit, and dispatches the message.

```php
// local/modules/StockSync/EventListener/StockChangedListener.php
<?php

declare(strict_types=1);

namespace StockSync\EventListener;

use StockSync\Message\PushStock;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Messenger\MessageBusInterface;
use Thelia\Core\Event\ProductSaleElement\ProductSaleElementUpdateEvent;
use Thelia\Core\Event\TheliaEvents;

final readonly class StockChangedListener implements EventSubscriberInterface
{
    public function __construct(
        private MessageBusInterface $bus,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            // Below the core listener (128), which writes and commits the change.
            TheliaEvents::PRODUCT_UPDATE_PRODUCT_SALE_ELEMENT => ['onStockChanged', 0],
        ];
    }

    public function onStockChanged(ProductSaleElementUpdateEvent $event): void
    {
        $this->bus->dispatch(new PushStock($event->getProductSaleElementId()));
    }
}
```

The queue in the shop database uses its own connection, so a message dispatched before the
commit stays queued even if the transaction is rolled back. Dispatching after the action has
committed avoids a push for a change that never happened. If your own code wraps the action
in a larger transaction, dispatch after that outer commit instead.

Stock also changes outside this event, when an order is placed for instance. The nightly task
below covers those changes; a module that needs them sooner listens to the events concerned
in the same way.

### The recurring task

`#[AsCronTask]` adds the command to the `thelia` schedule. It runs at 02:00 when a worker
consumes `scheduler_thelia`, and can be run by hand like any command.

```php
// local/modules/StockSync/Command/PushAllStockCommand.php
<?php

declare(strict_types=1);

namespace StockSync\Command;

use StockSync\Message\PushStock;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Scheduler\Attribute\AsCronTask;
use Thelia\Model\ProductSaleElementsQuery;

#[AsCommand(name: 'stock-sync:push-all', description: 'Queue a stock push for every product combination.')]
#[AsCronTask('0 2 * * *', schedule: 'thelia')]
final class PushAllStockCommand extends Command
{
    public function __construct(
        private readonly MessageBusInterface $bus,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $ids = ProductSaleElementsQuery::create()->select('Id')->find();

        foreach ($ids as $id) {
            $this->bus->dispatch(new PushStock((int) $id));
        }

        $output->writeln(\sprintf('%d stock push(es) queued.', \count($ids)));

        return self::SUCCESS;
    }
}
```

The command only dispatches messages. With a queue, the pushes are spread over the `async`
worker; without one, they run during the command. Combinations whose quantity did not change
are skipped by the handler, so the nightly run only calls the API for real changes.

### Turning the module off

A queue accepts the messages of active modules only. Messages of `StockSync` still waiting when
the module is turned off can no longer be read: the worker reads each of them as
`Thelia\Messenger\Message\UndecodableJob` and sets it aside in `failed`. Nothing is lost and
nothing loops. The Background jobs screen lists them as `Unreadable job: <reason>` with the
original class `StockSync\Message\PushStock`. Delete them there, and let the nightly task push
the stock again once the module is back.

To avoid this, wait for `php Thelia messenger:stats async` to reach zero before turning the
module off. The same happens when a message class is renamed or removed, or when its
constructor changes so that queued content no longer fits: keep the old class until the queue
is empty.

## Idempotence and replay

A handler can run more than once for the same message:

- a retry after a failure that happened halfway, for instance when the API accepted the
  push but the database write that follows failed,
- a replay from the failed jobs, by `messenger:failed:retry` or from the back office,
- a worker killed hard (`SIGKILL`, out of memory) while handling the message: the Doctrine
  transport redelivers it after `redeliver_timeout`, one hour by default,
- two messages for the same row, dispatched by two saves in a row.

Write every handler so that running it twice has the effect of running it once:

- carry ids in the message, and read the current state of the row in the handler,
- check whether the work is already done before doing it (`stock_sync_state` above),
- send absolute values to remote services (a quantity, a status), never deltas such as
  "remove 2", which a replay would apply twice,
- record what was done in the same transaction as the other writes of the handler,
- return without error when the row no longer exists or is in a state that makes the job
  pointless. Throwing would only send the message to `failed` for nothing.

Use `UnrecoverableMessageHandlingException` when a retry cannot succeed (data refused,
configuration missing). The message goes to `failed` at once, where it can be replayed once
the cause is fixed.

Test the replay: dispatch the message twice in a test and check that the effect happened once.
