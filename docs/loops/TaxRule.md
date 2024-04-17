---
title: Tax rule
---

loop displaying taxes rules created.  
`{loop type="tax-rule" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#tax-arguments}

| Argument | Description                                                                | Default | Example                    |
|----------|:---------------------------------------------------------------------------|:-------:|:---------------------------|
| exclude  | A single or list of tax rule ids to exclude                                |         | exclude="2", exclude="1,4" |
| id       | A single or list of tax rule ids.                                          |         | id="2", id="1,4"           |
| order    | A list of values see [sorting possible values](#tax-order-possible-values) |  alpha  | order="random"             |

Plus the [global arguments](./global_arguments) and [global arguments I18n](./global_arguments_I18n)  

## Outputs

| Variable       | Value                               |
|:---------------|:------------------------------------|
| $DESCRIPTION   | Tax description                     |
| $ID            | the tax id                          |
| $IS_DEFAULT    | check if it's the default tax rule  |
| $IS_TRANSLATED | check if the tax rule is translated |
| $LOCALE        | The locale used for this research   |
| $TITLE         | Tax title                           |

Plus the [global outputs](./global_outputs)

## Order possible values {#tax-order-possible-values}

[Arguments](#tax-arguments)

| Ascending value | Descending value | Sorted fields       |
|-----------------|------------------|:--------------------|
| alpha           | alpha_reverse    | title               |
| id              | id_reverse       | id                  |
