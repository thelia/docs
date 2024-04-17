---
title: Module Hook
---

...

`{loop type="hook" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#area-arguments}

| Argument        | Description | Default | Example |
|-----------------|:------------|:-------:|:--------|
| active          |             |         |         |
| exclude         |             |         |         |
| hook            |             |         |         |
| hook_active     |             |         |         |
| id              |             |         |         |
| module          |             |         |         |
| module_active   |             |         |         |
| order           | a list of values see [sorting possible values](#area-order-possible-values) | manual | order="id" |

Plus the [global arguments](./global_arguments) and [global arguments I18n](./global_arguments_I18n.md)

## Outputs {#area-outputs}

| Variable        | Value |
|:----------------|:------|
| $ID             |       |
| $HOOK_ID        |       |
| $MODULE_ID      |       |
| $MODULE_TITLE   |       |
| $MODULE_CODE    |       |
| $CLASSNAME      |       |
| $METHOD         |       |
| $ACTIVE         |       |
| $HOOK_ACTIVE    |       |
| $MODULE_ACTIVE  |       |
| $POSITION       |       |
| $TEMPLATES      |       |

Plus the [global outputs](./global_outputs)

## Order possible values {#area-order-possible-values}

[Arguments](#area-arguments)

| Ascending value | Descending value | Sorted fields |
|-----------------|------------------|:--------------|
| id              | id_reverse       |               |
| hook            | hook_reverse     |               |
| manual          | manual_reverse   |               |
| enabled         | enabled_reverse  |               |
