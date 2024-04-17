---
title: Hook
---

...

`{loop type="hook" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#area-arguments}

| Argument | Description      | Default | Example |
|----------|:-----------------|:-------:|:--------|
| active   |                  |         |         |
| code     | The hook code    |         |         |
| exclude  |                  |         |         |
| hook_type| The type of hook |         |         |
| order    |                  |         |         |

Plus the [global arguments](./global_arguments) and [global arguments I18n](./global_arguments_I18n.md)

## Outputs {#area-outputs}

| Variable        | Value |
|:----------------|:------|
| $ACTIVE         |       |
| $BLOCK          |       |
| $BY_MODULE      |       |
| $CHAPO          |       |
| $CODE           |       |
| $DESCRIPTION    |       |
| $ID             |       |
| $IS_TRANSLATED  |       |
| $LOCALE         |       |
| $NATIVE         |       |
| $POSITION       |       |
| $TITLE          |       |
| $TYPE           |       |

Plus the [global outputs](./global_outputs)

## Order possible values

[Arguments](#area-arguments)

| Ascending value | Descending value | Sorted fields |
|-----------------|------------------|:--------------|
| alpha           | alpha_reverse    |               |
| code            | code_reverse     |               |
| enabled         | enabled_reverse  |               |
| id              | id_reverse       |               |
| manual          | manual_reverse   |               |
| native          | native_reverse   |               |
