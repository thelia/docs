---
title: module:schema:apply
---

## Description
Apply the SQL schema of one module or of every module: its `Config/TheliaMain.sql`, then its `Config/update/*.sql` scripts in version order. It does what a module does on activation and update, without asking anything, so it fits a CI job or a deployment script.

The command connects with the `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD` and `DATABASE_NAME` environment variables.

## Usage
```shell
module:schema:apply [options] [--] [<module>]
```

## Arguments
- `module`                    The module name. Give it or `--all`, not both.

## Options
- `--all`                     Apply the schema of every module that has a `Config/TheliaMain.sql`
- `--dry-run`                 List the SQL files that would run, without running them
- `--force`                   Replay `TheliaMain.sql` even when a table it drops holds rows, which are lost

## Tables that hold data

Added in Thelia 3.2. A `TheliaMain.sql` drops each table before creating it again, so replaying it on a shop in service would empty the tables of the module. The command reads the `DROP TABLE` statements of the script first. When one of those tables exists and holds rows, it applies nothing for that module, names the tables with their row count and exits with a failure:

```
Module "MyModule" not applied: its TheliaMain.sql drops tables that hold data, which would be lost: my_module_item (12 rows).
```

With `--all`, the other modules are still applied and the command exits with a failure at the end. Tables that are empty or absent do not block the command, and neither do the `update/*.sql` scripts.

To change the schema of an installed module, ship the change as a `Config/update/<version>.sql` script. Pass `--force` only when emptying the tables is what you want.

## Statements already applied

Each statement runs on its own. The errors that mean the statement was already applied are skipped, so the command can be run again on the same database:

| MySQL error | Meaning |
|-------------|---------|
| 1050 | Table already exists |
| 1060 | Duplicate column name |
| 1061 | Duplicate key name |
| 1068 | Multiple primary key defined |
| 1091 | Column or key to drop does not exist |
| 1826 | Duplicate foreign key constraint name |
| 1005 with errno 121 | Duplicate foreign key constraint name |

1091 is skipped since Thelia 3.2: an update script dropping a column, an index or a foreign key that is already gone no longer stops the command. A typo in the name to drop goes through silently as well. Any other error stops the module and is printed with the file it came from. Run with `-v` to see how many statements each file skipped.

## Example
To list the files that would be applied for every module:
```shell
php Thelia module:schema:apply --all --dry-run
```

To apply the schema of MyModule:
```shell
php Thelia module:schema:apply MyModule
```
