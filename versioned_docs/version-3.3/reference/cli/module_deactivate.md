---
title: module:deactivate
---

## Description
Deactivate a module

## Usage
```shell
module:deactivate [options] [--] <module>
```

## Arguments
- `module`                    module to deactivate

## Options
- `--with-dependencies`  activate module recursively
-  `-y`, `--assume-yes`         Assume to deactivate a mandatory module


## Example
To deactivate TheliaLibrary module   
```shell
php Thelia module:deactivate TheliaLibrary
```