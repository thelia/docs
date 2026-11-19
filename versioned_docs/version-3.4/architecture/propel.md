---
title: Propel
sidebar_position: 5
---

# Propel ORM

Thelia 3 uses the [Propel ORM](https://propelorm.org/) to talk to the database. If you come from a Symfony background you are probably used to Doctrine, and Propel works differently. Read the next section before writing any model code.

## Propel is not Doctrine

There is no `EntityManager` and no `flush()`. A Propel model is an *Active Record*: it knows how to persist itself.

```php
$category = CategoryQuery::create()->findPk($id);   // retrieve
$category->setVisible(1);
$category->save();                                  // persisted immediately
```

Each `->save()` runs the `INSERT`/`UPDATE` straight away. There is no unit of work to commit at the end of the request.

:::caution Respect the native Propel types
Propel generates strictly typed setters from your `schema.xml`. Passing the wrong scalar type throws a `TypeError` on PHP 8.3.

- `TINYINT` columns are `?int`, so pass `0` or `1`, never `true`/`false`.
  `setVisible(?int $v = null)` is the real generated signature.
- `DECIMAL` columns are `?string`, so pass a string, never a `float`.
  `setPrice(?string $v = null)` is the real generated signature.

For toggles, use `$model->setVisible($model->getVisible() ? 0 : 1)`.
:::

Connections are retrieved from Propel directly, there is no service to inject:

```php
use Propel\Runtime\Propel;

$con = Propel::getConnection('TheliaMain');
```

## Describing your schema

To add a table, describe it in your module's schema located at `local/modules/MyModule/Config/schema.xml`. See the [Propel schema reference](https://propelorm.org/documentation/reference/schema.html) for the full syntax.

```xml
<!-- local/modules/MyModule/Config/schema.xml -->
<table name="block_group" namespace="MyModule\Model">
    <column name="id" type="INTEGER" required="true" primaryKey="true" autoIncrement="true" />
    <column name="slug" type="VARCHAR" size="50" />
    <column name="visible" type="TINYINT" defaultValue="0" required="true" />
    <column name="created_at" type="TIMESTAMP" />
    <column name="updated_at" type="TIMESTAMP" />
    <unique name="slug_unique">
        <unique-column name="slug" />
    </unique>
</table>
```

## Generating the SQL and the model from the schema

Run this command to generate both the model classes and the SQL from your schema:

```bash
php Thelia module:generate:model --generate-sql MyModule
```

This command generates a `TheliaMain.sql` file in `local/modules/MyModule/Config/`. Do not edit it, since it is overwritten every time the command runs.

It also generates a [Model](https://propelorm.org/documentation/reference/active-record.html) and a [ModelQuery](https://propelorm.org/documentation/reference/model-criteria.html) class for each table. Those generated stubs are empty classes that extend the real Propel base classes (stored in the Propel cache). You can add your own methods and properties to the stubs, which are never overwritten.

:::note
`module:generate:model` delegates the SQL part to the `module:generate:sql` command, which writes to your module's `Config/` directory. The file is named after the Propel connection (`TheliaMain`), hence `TheliaMain.sql`. Without the `--generate-sql` option, only the model classes are generated.
:::

## Executing the SQL

### At first activation

To create your tables the first time the module is activated, run the generated SQL from `postActivation()`:

```php
// local/modules/MyModule/MyModule.php
use Propel\Runtime\Connection\ConnectionInterface;
use Thelia\Core\Install\Database;
use Thelia\Module\BaseModule;

class MyModule extends BaseModule
{
    public function postActivation(?ConnectionInterface $con = null): void
    {
        // Only run once
        if (!self::getConfigValue('is_initialized', false)) {
            $database = new Database($con);
            $database->insertSql(null, [__DIR__.'/Config/TheliaMain.sql']);

            self::setConfigValue('is_initialized', 1);
        }
    }
}
```

:::caution Import the right `Database` class
The class is `Thelia\Core\Install\Database`. The legacy `Thelia\Install\Database` no longer exists in Thelia 3, and importing it triggers a fatal error.

`new Database($con)` is correct: the constructor accepts a `ConnectionInterface` (or a `\PDO`, or `null` to grab the write connection automatically). Do not call `$con->getWrappedConnection()` yourself, because `Database` already unwraps the connection internally.
:::

### On module update

Once a module is activated, schema changes must go through the update system. There is currently no command that diffs your schema, so you extract the change manually from the regenerated `TheliaMain.sql`.

For example, if the first activation generated this table:

```sql
DROP TABLE IF EXISTS `block_group`;

CREATE TABLE `block_group`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(50),
    `created_at` DATETIME,
    `updated_at` DATETIME,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `slug_unique` (`slug`)
) ENGINE=InnoDB;
```

and you later add a `visible` column to `schema.xml`, the regenerated SQL becomes:

```sql
DROP TABLE IF EXISTS `block_group`;

CREATE TABLE `block_group`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(50),
    `visible` TINYINT DEFAULT 0 NOT NULL,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `slug_unique` (`slug`)
) ENGINE=InnoDB;
```

Extract only the difference:

```sql
ALTER TABLE `block_group` ADD `visible` TINYINT DEFAULT 0 NOT NULL;
```

Put that statement in a new file under `local/modules/MyModule/Config/update/`, named after the **target** version of your module. If your module is at `1.0.6` and you ship `1.1.0`, create `local/modules/MyModule/Config/update/1.1.0.sql` and bump `<version>` in `module.xml`.

Then make sure your module's `update()` method applies the pending files:

```php
// local/modules/MyModule/MyModule.php
use Propel\Runtime\Connection\ConnectionInterface;
use Symfony\Component\Finder\Finder;
use Thelia\Core\Install\Database;
use Thelia\Module\BaseModule;

class MyModule extends BaseModule
{
    public function update($currentVersion, $newVersion, ?ConnectionInterface $con = null): void
    {
        $finder = Finder::create()
            ->name('*.sql')
            ->depth(0)
            ->sortByName()
            ->in(__DIR__.DS.'Config'.DS.'update');

        $database = new Database($con);

        /** @var \SplFileInfo $file */
        foreach ($finder as $file) {
            if (version_compare($currentVersion, $file->getBasename('.sql'), '<')) {
                $database->insertSql(null, [$file->getPathname()]);
            }
        }
    }
}
```

Thelia calls `update()` whenever it refreshes the module list (from the admin page or the CLI) and detects that the declared version differs from the installed one. The `version_compare()` guard runs every `*.sql` file whose name is greater than the current version, so all intermediate migrations are applied in order.

:::note
`update()` overrides the no-op method declared in `Thelia\Module\BaseModule`. The expected signature is `update($currentVersion, $newVersion, ?ConnectionInterface $con = null): void`.
:::

## Adding a column to a native Thelia table

You **cannot** modify the native Thelia tables. The recommended way to attach extra data to a core entity is to create your own table with a foreign key to the base table.

```xml
<!-- local/modules/MyModule/Config/schema.xml -->
<table name="extend_customer_data" namespace="MyModule\Model">
    <column name="id" primaryKey="true" required="true" type="INTEGER" />
    <column name="additional_column" type="VARCHAR" size="255" />
    <foreign-key foreignTable="customer" name="fk_extend_customer_data_customer_id" onDelete="CASCADE" onUpdate="CASCADE">
        <reference foreign="id" local="id" />
    </foreign-key>
</table>
```

## Reads the core keeps in memory

Since Thelia 3.1, the core avoids reading the same rows several times for one page. A module gets the benefit by going through the models and the query classes, and loses it, or reads stale values, when it writes behind their back in raw SQL.

| Read | What the core keeps | Dropped when |
|------|---------------------|--------------|
| `ConfigQuery::read()` | The whole `config` table, read in one query and shared between processes through the application cache | A `Config` model is saved or deleted, `ConfigQuery::write()` included |
| `ModuleConfigQuery::getConfigValue()`, `BaseModule::getConfigValue()` | Every configuration row of the module, read in one query on the first call | A `ModuleConfig` row or its translation is saved or deleted, `setConfigValue()` and `deleteConfigValue()` included, and at the start of each request and console command |
| `Lang::getActiveLangs()`, `Country::getDefaultCountry()` | The active languages and the default country, for the life of the PHP process | A `Lang` or `Country` model is saved or deleted, and at the start of each console command |

A value written with an SQL `UPDATE` raises none of these events. To be read at once, write through the model. `ConfigQuery::read($name, $default, true)` reads one row again, bypassing the snapshot.

On PHP-FPM the process ends with the request, so the language and country memo lasts one request. On a persistent worker runtime such as FrankenPHP or RoadRunner, it lasts as long as the worker: a change written outside the model is seen once the worker restarts.

### Relations read by the API

When the API serializes a collection, the core reads the relations of the whole page, and the translations of the rows reached under a collection, in one statement per relation instead of one query per row. This walks the `#[Relation]` properties of the resource, collections included, down to five levels. A resource a module exposes gets the same treatment when it declares its relations with `Thelia\Api\Bridge\Propel\Attribute\Relation`.

Two options of the attribute change the cost of a relation:

| Option | Effect |
|--------|--------|
| `preload: true` | Reads a many-to-one relation for the whole page at once. Use it when the target changes from one row to the next. Without it the query joins the relation but each row still reads its target. |
| `hydrateOutOfGroups: true` | Reads the relation even when no serialization group of the request exposes it. It costs a query per row: keep it for a resource that computes another field from that relation. |

```php
#[Relation(targetResource: Brand::class, preload: true)]
#[Groups([self::GROUP_FRONT_READ])]
public ?Brand $brand = null;
```

The batch reads rely on the Propel instance pool. Disabling it with `Propel::disableInstancePooling()` while the API serializes a collection puts the core back to one query per row.

## Learn more

- [Modules vs Bundles](./modules-vs-bundles.md)
- [Architecture Overview](./index.md)

<!-- Easter Egg #1: You found it! Propel has been Thelia's ORM since day one. While most of the PHP world moved to Doctrine, Thelia stayed loyal. In a world of ORMs, be a Propel. 🏛️ -->
