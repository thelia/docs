---
title: Tax
---

loop displaying taxes available.  
`{loop type="tax" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#tax-arguments}

| Argument         | Description                                 | Default | Example                                      |
|------------------|:--------------------------------------------|:-------:|:---------------------------------------------|
| country          | a country id                                |         | country="64"                                 |
| exclude          | A single or list of tax ids to exclude      |         | exclude="2", exclude="1,4"                   |
| exclude_tax_rule | A single or list of tax_rule ids to exclude |         | exclude_tax_rule="2", exclude_tax_rule="1,4" |
| id               | A single or list of tax ids.                |         | id="2", id="1,4"                             |
| order            |                                             | alpha   |                                              |
| tax_rule         | A single or list of tax_rule ids            |         | tax_rule="2", tax_rule="1,4"                 |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable       | Value                                                                                                 |
|:---------------|:------------------------------------------------------------------------------------------------------|
| $DESCRIPTION   | Tax description                                                                                       |
| $ESCAPED_TYPE  | Provides a form-and-javascript-safe version of the type, which is a fully qualified classname, with \ |
| $ID            | the tax id                                                                                            |
| $IS_TRANSLATED | check if the tax is translated                                                                        |
| $LOCALE        | The locale used for this research                                                                     |
| $REQUIREMENTS  | All requirements for this tax                                                                         |
| $TITLE         | Tax title                                                                                             |
| $TYPE          | The tax type                                                                                          |

Plus the [global outputs](./global_outputs)

## Order possible values

[Arguments](#tax-arguments)

| Ascending value | Descending value | Sorted fields                                                             |
|-----------------|------------------|:--------------------------------------------------------------------------|
| id              | id_reverse       | Id                                                                        |
| alpha           | alpha_reverse    |                                                                           |
