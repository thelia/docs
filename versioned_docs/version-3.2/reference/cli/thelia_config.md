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