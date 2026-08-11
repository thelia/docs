---
title: thelia:config
---

## Description
Manage configuration variables

## Usage
```shell 
thelia:config [options] [--] <COMMAND> [<name> [<value>]]
```

## Arguments
- `COMMAND`    Command : list, get, set, delete
- `name`    The variable name
- `value`   The variable value


## Options
- `--secured`  When setting a new variable tell variable is secured.
- `--visible`  When setting a new variable tell variable is visible.


## Example

Example to change value of config `url_site` and keep it visible 
```shell
php Thelia thelia:config set url_site "https://thelia.net" --visible
```

## Overriding a variable from the environment

Every variable of the `config` table can be overridden by an environment variable, which is handy for values that differ between your machines and your servers without touching the database.

The name is derived from the variable name: uppercase, with `.` and `-` replaced by `_`. So `store_name` is overridden by `STORE_NAME`, and `rewriting_enable` by `REWRITING_ENABLE`.

```bash
# .env.local
STORE_NAME="My shop, staging"
REWRITING_ENABLE=0
```

The override happens when the value is read, so it applies to `ConfigQuery::read()` and to everything built on it, including the `{config}` Smarty function and the `config` loop. The stored row is left untouched: remove the environment variable and the database value applies again.

One thing to know: the resolved values are kept in a shared cache, so changing an environment variable is not enough on its own.

```bash
php Thelia cache:clear
```
