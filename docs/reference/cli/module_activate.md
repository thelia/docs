---
title: module:activate
---

## Description
Activate a module

## Usage
```shell
module:activate [options] [--] <module>
```

## Arguments
- `module`                    module to activate

## Options
- `--with-dependencies`  activate module recursively
- `-s`, `--silent`             Don't throw exception on error


## Example
To activate silently TheliaLibrary module   
```shell
php Thelia module:activate -s TheliaLibrary
```