---
title: Propel
sidebar_position: 4
---

Thelia uses the [Propel 2](http://propelorm.org/) orm to interact with database.

## Describing schema

To add new table in Thelia you have to describe it in your schema located here `MyModule/Config/schema.xml` please refer to [propel documentation](http://propelorm.org/documentation/reference/schema.html) to know how to do it.

## Generate Sql / Model from schema

To generate Sql request and associated model class from schema use this command

```bash
php Thelia module:generate:model --generate-sql MyProject 
```

This command will generate a TheliaMain.sql file at `local/modules/MyProject/Confif/TheliaMain.sql` don't modify it, it will be erased each time this command is executed.  
It will also generate [Model](http://propelorm.org/documentation/reference/active-record.html) and [ModelQuery](http://propelorm.org/documentation/reference/model-criteria.html) file for each table, in these files you can add your own functions or properties, they will not be erased as they are just empty class that extend the real propel Model located in propel cache.

## Execute Sql

### At module initialization
If you want to execute the sql at the first module activation add this function to your module's base file :

```php
    public function postActivation(ConnectionInterface $con = null): void
    {
        // Look if module has already been activated 
        if (!self::getConfigValue('is_initialized', false)) {
            $database = new Database($con);
            // Insert generated file
            $database->insertSql(null, [__DIR__.'/Config/TheliaMain.sql']);
            
            // Set module as initialized
            self::setConfigValue('is_initialized', true);
        }
    }
```

### On module update
If your module has already been activated you must go through the update system.
For now there is no way to get directly the sql request needed to update your database, you need to extract it from the generated TheliaMain.sql.

For example if at module initialization you have this sql generated :

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

And later you want to add a new boolean column named "visible" to you table you will add it to your shema.xml and get this sql :

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

So you have to extract only the difference like this

```sql
ALTER TABLE `block_group` ADD `visible` TINYINT DEFAULT 0 NOT NULL;
```

Then put this extracted requests on a new file located here `local/modules/MyProject/Config/update/` the name of the file must be the next version of your module. For instance, if the version of your module is `1.0.6` and the next version is `1.1.0`, create this file `local/modules/MyProject/Config/update/1.1.0.sql` and put the sql in it and change the `<version></version>` in module.xml.   
Make sure that you have this function in your base file :

```php
    /**
     * Execute sql files in Config/update/ folder named with module version (ex: 1.0.1.sql).
     *
     * @param $currentVersion
     * @param $newVersion
     * @param ConnectionInterface $con
     */
    public function update($currentVersion, $newVersion, ConnectionInterface $con = null): void
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
```

if not you will have to add it.
This function is called when Thelia refresh module list (either in the admin page oy by command) and detect that the next version of your module is different than the current.
And it will search and execute all sql files between two versions.


## Add a column to native Thelia table

In Thelia it is **not** possible to modify the native tables.    
The best practice to add columns is to create a new table with a foreign key attached to the base table.

```xml
    <table name="extend_customer_data" namespace="MyProject\Model">
        <column name="id" primaryKey="true" required="true" type="INTEGER" />
        <column name="additional_column" type="VARCHAR" size="255" />
        <foreign-key foreignTable="customer" name="fk_extend_customer_data_customer_id" onDelete="CASCADE" onUpdate="CASCADE">
            <reference foreign="id" local="id" />
        </foreign-key>
        ...
    </table>
```
