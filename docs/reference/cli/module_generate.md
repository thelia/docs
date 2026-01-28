---
title: module:generate
---

## Description
Generate all needed files for creating a new Module

## Usage
```shell
module:generate [options] [--] <name>
```

## Arguments
- `name`                   Name wanted for your Module

## Options
- `--force`  If defined, it will update the module with missing directories and files (no overrides).

## Example
To generate a module named `MyModule`
```shell
php Thelia module:generate MyModule
