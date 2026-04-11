---
title: module:generate:model
---

## Description
Generate model for a specific module

## Usage
```shell
module:generate:model [options] [--] <name>
```

## Arguments
- `name`                   Module name

## Options
- `--generate-sql`  With this option generate sql file at the same time


## Example
To generate the model and sql for your module `MyModule`
```shell
php Thelia module:generate:model --generate-sql MyModule
