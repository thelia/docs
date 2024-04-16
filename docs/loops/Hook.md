---
title: Hook
---

...

`{loop type="hook" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#area-arguments}

| Argument | Description | Default | Example |
|----------|:------------|:-------:|:--------|
| code     | The hook code | | |
| hook_type| The type of hook | | |
| order    | | | |
| exclude  | | | |
| active   | | | |

Plus the [global arguments](./global_arguments) and [global arguments I18n](./global_arguments_I18n.md)

## Outputs {#area-outputs}

| Variable        | Value |
|:----------------|:------|
| $ID             | |
| $IS_TRANSLATED  | |
| $LOCALE         | |
| $TITLE          | |
| $CHAPO          | |
| $DESCRIPTION    | |
| $CODE           | |
| $TYPE           | |
| $NATIVE         | |
| $ACTIVE         | |
| $BY_MODULE      | |
| $BLOCK          | |
| $POSITION       | |

Plus the [global outputs](./global_outputs)

## Order possible values

[Arguments](#area-arguments)

| Ascending value | Descending value | Sorted fields |
|-----------------|------------------|:--------------|
| id              | id_reverse       | |
| alpha           | alpha_reverse    | |
| manual          | manual_reverse   | |
| enabled         | enabled_reverse  | |
| native          | native_reverse   | |
| code            | code_reverse     | |
