---
title: thelia:price-list:import
---

## Description
Import the lines of a [price list](../../features/price-lists.md) from a CSV file, 5 MB at most.

## Usage
```shell
  thelia:price-list:import <code> <file> [options]
```

## Arguments
 -    `code`  The code of the price list.
 -    `file`  The CSV file.

## Options
 -    `--dry-run`  Report what would be written, write nothing.

The header needs `pse_ref` or `pse_id`, and `price` or `discount_percent`. `min_quantity` is
optional. The separator is a semicolon or a comma. A line in error is not written and the others
are. The report gives the number of lines created and updated, and each error with its line number.
The command exits with 1 when a line is in error or the file is refused.

## Examples
Check a file first:
```shell
php Thelia thelia:price-list:import wholesale prices.csv --dry-run
```

Write the lines:
```shell
php Thelia thelia:price-list:import wholesale prices.csv
```
