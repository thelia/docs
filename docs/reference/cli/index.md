---
title: Commands
sidebar_position: 11
---

# Console Commands

Thelia ships a console application built on the [Symfony Console component](https://symfony.com/doc/current/console.html). Run any Thelia command from the project root:

```shell
php Thelia <command>
```

`./Thelia` is a small shim that boots Symfony Runtime and the `Thelia\Core\Application` (wrapping `App\Kernel`, or `KernelInstall` when Thelia is not installed yet). Symfony's own built-in commands (for example `lint:twig`, `debug:router`, `debug:event-dispatcher`) are available through the standard console:

```shell
php bin/console <command>
```

:::tip
List every available command and its description with `php Thelia list`. Add `--help` to any command (`php Thelia module:list --help`) to see its arguments and options.
:::

## Available commands

All commands below live in `Thelia\Command\` (core: `core/lib/Thelia/Command/`). Most are declared with the PHP 8 `#[AsCommand(name: ..., description: ...)]` attribute (the Symfony 7 idiom). A few legacy ones still declare their name with `setName()` in `configure()` — this is noted where relevant.

### Modules

| Command | Description |
| --- | --- |
| `module:list` | List the modules (code, active, type, version). |
| `module:activate` | Activate a module. |
| `module:deactivate` | Deactivate a module. |
| `module:refresh` | Refresh the modules list (scan the modules directories). |
| `module:position` | Set module(s) position. |
| `module:generate` | Generate all the files needed to create a new module. |
| `module:generate:model` | Generate the Propel model for a specific module. |
| `module:generate:sql` | Generate the SQL from a module `schema.xml` file. |
| `module:schema:apply` | Apply the SQL schema for one or all modules. |
| `module:post-activate-all` | Run `postActivation()` for all active modules. |

### Cache and assets

| Command | Description |
| --- | --- |
| `cache:clear` | Invalidate all caches. |
| `image-cache:clear` | Empty part or all of the web-space image cache. |

:::note
`php Thelia cache:clear` purges the Thelia caches more completely than `php bin/console cache:clear`. Prefer the Thelia variant when in doubt.
:::

### Installation and database

| Command | Description |
| --- | --- |
| `thelia:install` | Install Thelia from the CLI (MySQL/MariaDB only). |
| `thelia:database:create` | Create the Thelia database if it does not exist. |
| `thelia:database:populate` | Apply the core schema and reference data to the database. |
| `thelia:demo:import` | Import the demo catalog, customers, orders and carts (dev/test only). |
| `thelia:dev:db:diff` | Generate SQL to update the database structure to the global Propel schema. |
| `thelia:dev:reloadDB` | Erase the current database and recreate it. |

:::caution
`thelia:dev:db:diff` and `thelia:dev:reloadDB` are development helpers. `thelia:dev:reloadDB` drops your data — never run it against a production database.
:::

### Administrators

| Command | Description |
| --- | --- |
| `admin:create` | Create a new administrator user. |
| `admin:updatePassword` | Change an administrator password. |

### Data import/export and generation

| Command | Description |
| --- | --- |
| `export` | Export data through a registered export handler. |
| `import` | Import data through a registered import handler. |
| `generate:sql` | Generate the core SQL files (`insert.sql`, `update*.sql`). |
| `thelia:generate-resources` | Output the admin resources (ACL resource keys). |

### Configuration and maintenance

| Command | Description |
| --- | --- |
| `thelia:config` | Manage configuration variables. |
| `maintenance:purge` | Purge old data: carts without orders, anonymous carts, and admin logs. |
| `sale:check-activation` | Check the activation/deactivation dates of sales and apply the required action. |
| `currency:update-rates` | Update currency exchange rates. |

:::note
`maintenance:purge` still declares its name with `setName()` in `configure()` rather than the `#[AsCommand]` attribute. Both styles work; new commands should use the attribute.
:::

### Templates

| Command | Description |
| --- | --- |
| `template:set` | Set the active front-office, back-office, e-mail or PDF template. |

## Creating a custom command

Thelia commands are autodiscovered Symfony console commands. Declare the command name and description with the `#[AsCommand]` attribute, then put your logic in `execute()`.

If your command needs the Thelia service container (event dispatcher, translator, request initialization), extend `Thelia\Command\ContainerAwareCommand`:

```php
// local/modules/MyModule/Command/HelloWorldCommand.php
<?php

declare(strict_types=1);

namespace MyModule\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Thelia\Command\ContainerAwareCommand;

#[AsCommand(name: 'hello:world', description: 'output hello world')]
class HelloWorldCommand extends ContainerAwareCommand
{
    protected function configure(): void
    {
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $output->writeln('Hello world !');

        return self::SUCCESS;
    }
}
```

Run it from the project root:

```shell
php Thelia hello:world
```

A few points:

- `#[AsCommand(name: 'hello:world', description: 'output hello world')]` replaces the old `setName()` / `setDescription()` calls inside `configure()`. With the attribute, `configure()` is only needed to declare arguments and options (and can be left empty).
- `execute()` must return an `int`. Return `Command::SUCCESS` (`0`) on success, or `Command::FAILURE` / `Command::INVALID` on error. `self::SUCCESS` is the same constant, inherited from `Symfony\Component\Console\Command\Command`.
- `ContainerAwareCommand` exposes `getContainer()`, `getDispatcher()` and `initRequest()` for commands that dispatch Thelia events or need a `Request` in the request stack.

:::tip
If your command does not need the Thelia container helpers, extend `Symfony\Component\Console\Command\Command` directly. With the `#[AsCommand]` attribute it is still autodiscovered and registered. See `core/lib/Thelia/Command/ModulePostActivateAllCommand.php` for a real example that extends the plain Symfony `Command`.
:::

See `core/lib/Thelia/Command/ModuleListCommand.php` for a complete, real-world reference: it uses `#[AsCommand]`, extends `ContainerAwareCommand`, and renders a table.

:::note
Use native return and parameter types on every method you override (`protected function configure(): void`, `protected function execute(InputInterface $input, OutputInterface $output): int`). Symfony 7 interfaces require them.
:::

## `thelia:demo:import` — load demo data

`thelia:demo:import` populates a fresh store with a realistic demo dataset: catalog (categories, products, features, attributes, brands), content folders, customers, sales, coupons, orders and carts. It also copies the matching demo images into `local/media/images/` unless you pass `--skip-images`.

```shell
php Thelia thelia:demo:import
```

Options:

| Option | Effect |
| --- | --- |
| `--reset` | Empty the affected tables before importing. |
| `--skip-images` | Do not import or copy images. |
| `--quiet-errors` | Display errors concisely. |

This is what `bin/install --with-demo` runs after activating the modules (it passes `--skip-images` when you add `--skip-demo-images`).

:::caution
`thelia:demo:import` is only available in the `dev` and `test` environments and must run from the CLI. It refuses to run in `prod`.
:::

### The demo importer is extensible

`thelia:demo:import` is a good illustration of the Thelia editorial line: **no central registry, work units are auto-discovered**. The command does not hard-code its steps. It injects every importer through `#[AutowireIterator('thelia.demo_importer')]` (not `#[TaggedIterator]`, which is deprecated in Symfony 7.1):

```php
// core/lib/Thelia/Command/Import/DemoImportCommand.php (excerpt)
use Symfony\Component\DependencyInjection\Attribute\AutowireIterator;

public function __construct(
    #[Autowire('%kernel.environment%')]
    private readonly string $env,
    private readonly RouterInterface $router,
    #[AutowireIterator('thelia.demo_importer')]
    iterable $importers,
) {
    // importers are sorted by priority(), lower runs first
}
```

Each importer is a service implementing `Thelia\Command\Import\DemoImporterInterface` (most extend `AbstractDemoImporter`). The interface is tagged automatically:

```php
// core/lib/Thelia/Command/Import/DemoImporterInterface.php
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

#[AutoconfigureTag('thelia.demo_importer')]
interface DemoImporterInterface
{
    public function priority(): int;

    public function description(): string;

    public function import(DemoImportContext $context): void;
}
```

Because the interface carries `#[AutoconfigureTag('thelia.demo_importer')]`, any service implementing it is collected by the iterator without extra configuration. To add your own demo data, create a class extending `AbstractDemoImporter`, return a `priority()` that runs after its producers (categories before products, for instance), and Thelia will pick it up.

## `module:post-activate-all`

`module:post-activate-all` runs `postActivation()` on every active module:

```shell
php Thelia module:post-activate-all
```

This is the step that lets modules create their own tables and seed their data. It is run automatically by:

- `bin/install` — after the modules are activated, before the demo import (see the [install reference](../../getting-started/install-reference.md)).
- `bin/test-prepare` — so module tables exist in the isolated test database (see [Testing](../../testing/index.md)).

If you activate a module manually and its tables are missing, run this command (or reactivate the module) to trigger its `postActivation()`.

## Learn more

- [Symfony Console documentation](https://symfony.com/doc/current/console.html)
- [Install reference](../../getting-started/install-reference.md)
- [Testing](../../testing/index.md)
