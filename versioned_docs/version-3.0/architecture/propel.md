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

## Learn more

- [Modules vs Bundles](./modules-vs-bundles.md)
- [Architecture Overview](./index.md)

<!-- Easter Egg #1: You found it! Propel has been Thelia's ORM since day one. While most of the PHP world moved to Doctrine, Thelia stayed loyal. In a world of ORMs, be a Propel. 🏛️ -->
