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
| `MESSENGER_TRANSPORT_DSN` | empty | The queue of the `async` transport. Empty means no queue: every job runs at once. `doctrine://default`, a Redis DSN or an AMQP DSN names a queue that a worker consumes. |
| `MESSENGER_FAILURE_TRANSPORT_DSN` | `doctrine://default?queue_name=failed` | Where the jobs that failed every attempt are kept. |
| `THELIA_SCHEDULE_SALE_CHECK` | `* * * * *` | Cron expression of `sale:check-activation`. Empty disables the task. |
| `THELIA_SCHEDULE_MAINTENANCE_PURGE` | `30 3 * * *` | Cron expression of `maintenance:purge`. Empty disables the task. |
| `THELIA_SCHEDULE_FAILED_JOBS_PURGE` | `0 4 * * *` | Cron expression of `thelia:messenger:purge-failed`. Empty disables the task. |
| `THELIA_SCHEDULE_CURRENCY_RATES` | empty | Cron expression of `currency:update-rates`. Off by default. |
| `LOCK_DSN` | `flock` | The lock store that keeps two workers from running the same scheduled task. |

`doctrine://default` is the only Doctrine connection name accepted: it is the shop database,
reached with the settings of the Propel connection. The table `messenger_messages` is created
by the installer and by the 3.3.0 update script.

The container parameter `thelia.messenger.allowed_message_classes` (an array, empty by
default) lists the exact names of the message classes that a project queues from outside
`Thelia\` and the namespaces of the active modules.

### Transports

| Transport | Retries | Notes |
| --- | --- | --- |
| `async` | 3, after 30 s, 2 min and 8 min (multiplier 4, with jitter) | Then the message goes to `failed`. |
| `failed` | none | Replay with `messenger:failed:retry` or from the back office. |
| `scheduler_thelia` | none | The recurring tasks of the `thelia` schedule. |

The core routes `Symfony\Component\Mailer\Messenger\SendEmailMessage`,
`Thelia\Domain\DataTransfer\Job\RunExportJob` and `Thelia\Domain\DataTransfer\Job\RunImportJob`
to `async`.

## Commands

| Command | Use |
| --- | --- |
| `messenger:consume async scheduler_thelia --time-limit=3600 --memory-limit=256M` | Run a worker. Prefer one worker per transport. |
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
- how many jobs failed, and the list of failed jobs with their description, the reason of the
  failure, the date and the number of attempts,
- the last 20 exports and the last 20 imports.

Each failed job can be replayed or deleted. Replay puts the job back on the transport it
failed on. Without a queue, it runs at once, and a job that fails again stays in the failed
list.

The screen answers to the resource `admin.configuration.background-jobs`. Grant `VIEW` to read
it, `UPDATE` to replay and `DELETE` to delete. The description of a mail names its recipient
and a failure reason may quote personal data, so give it only to the profiles that need it.

## Back-office exports and imports

Exports and imports started from the back office are jobs. Both use the status enum
`Thelia\Domain\DataTransfer\Job\JobStatus` (`queued`, `running`, `done`, `failed`).

| | Export | Import |
| --- | --- | --- |
| Launcher | `ExportJobLauncher::launch(...)` | `ImportJobLauncher::launch(Import $import, File $file, string $originalName, ?Lang $language = null, ?int $adminId = null)` |
| Message | `RunExportJob(int $exportJobId)` | `RunImportJob(int $importJobId)` |
| Row | `export_job` | `import_job`: status, file name, rows imported, refused rows with their reason, error |
| Without a queue | Runs in the request, the file is served at once | Runs in the request, the page shows the rows imported and the rows refused |
| With a queue | `/admin/export/job/{id}`: waiting, running with the rows written, done with the download, failed with the reason | `/admin/import/job/{id}`: waiting, running, done with the rows changed and refused, failed with the reason |
| Replay of a failed job | Starts the export over | Runs again from the first row |
| Files | Deleted after a day | Kept in `var/data-transfer/import/<Ymd>/` until the import is done, kept while it may be replayed |
| `maintenance:purge` | Deletes the jobs older than 7 days | Deletes the jobs older than 7 days and their files |

The classes live in `Thelia\Domain\DataTransfer\Job\`. Both job pages refresh every 3 seconds,
and a finished job is never run twice.

`ImportJobLauncher::launch()` checks the extension of the file in the request, so a wrong file
is refused before anything is queued. The file is moved out of the upload directory to
`var/data-transfer/import/`, not to the cache, which a deployment empties.

An import writes each row on its own. Replaying a failed import writes again the rows written
before the failure, with the same values, which leaves them as they were.

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
listener and the command discovered. `configureContainer()` routes the message to `async`, in
the same way the core routes its own messages. `postActivation()` creates the tables.

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
    <authors>
        <author>
            <name>Your Name</name>
        </author>
    </authors>
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

### The tables

`stock_sync_state` remembers the last quantity pushed for each combination; it is what makes
the handler idempotent. `stock_sync_log` keeps one line per push.

```xml
<!-- local/modules/StockSync/Config/schema.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<database defaultIdMethod="native" name="TheliaMain" namespace="StockSync\Model">

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
