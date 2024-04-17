---
title: Hook
---

Get data from the hook table.  
`{loop type="hook" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#area-arguments}

| Argument | Description                                         | Default | Example      |
|----------|:----------------------------------------------------|:-------:|:-------------|
| active   | If the hook is active or not                        |         |              |
| code     | The hook code                                       |         |              |
| exclude  | A single or a list of hook ids to exclude           |         |              |
| hook_type| The type of hook                                    |         |              |
| order    | See [Order possible values](#order-possible-values) |   id    | order='code' |

Plus the [global arguments](./global_arguments) and [global arguments I18n](./global_arguments_I18n.md)

## Outputs {#area-outputs}

| Variable        | Value |
|:----------------|:--------------------------------|
| $ACTIVE         | If the hook is active or not    |
| $BLOCK          | The [block] column value        |
| $BY_MODULE      | The value of the bt module field|
| $CHAPO          | Chapo                           |
| $CODE           | The hook code                   |
| $DESCRIPTION    | The hook description            |
| $ID             | The hook ID                     |
| $IS_TRANSLATED  | Check if the hook is translated |
| $LOCALE         | The locale user for this loop   |
| $NATIVE         | Naive                           |
| $POSITION       | The hook position               |
| $TITLE          | Title                           |
| $TYPE           | Type                            |

Plus the [global outputs](./global_outputs)

## Order possible values

[Arguments](#area-arguments)

| Ascending value | Descending value | Sorted fields                                                             |
|-----------------|------------------|:--------------------------------------------------------------------------|
| alpha           | alpha_reverse    | order by column "i18n_TITLE"                                              |
| code            | code_reverse     | Code                                                                      |
| enabled         | enabled_reverse  | Enabled                                                                   |
| id              | id_reverse       | ID                                                                        |
| manual          | manual_reverse   | By position considering a given category, `category` argument must be set |
| native          | native_reverse   | By native column                                                          |
