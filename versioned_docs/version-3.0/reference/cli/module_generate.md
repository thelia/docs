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
- `--force`  When set, adds any missing directories and files to the module without overwriting existing ones.

## Example
To generate a module named `MyModule`
```shell
php Thelia module:generate MyModule
