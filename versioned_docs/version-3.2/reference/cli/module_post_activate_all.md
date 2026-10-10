---
title: module:post-activate-all
---

## Description
Run `postActivation()` for every active module. The install runs it once the modules are registered.

A module whose post-activation throws does not stop the others. Since Thelia 3.2, each failure is printed as an error with the module code, and the command exits with code `1` once every module has been tried, so a script can tell a half-installed module from a successful run. `thelia:install` and `bin/test-prepare` stop on that code. `bin/install` runs its remaining steps, then reports the number of errors and exits with code `1`.

## Usage
```shell
module:post-activate-all
```

## Example
```shell
php Thelia module:post-activate-all
```

A run where one module fails ends with:
```
2 module(s) post-activated.
Post-activation failed for 1 module(s): MyModule.
```
