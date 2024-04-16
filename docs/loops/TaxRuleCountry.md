---
title: Tax Rule Country
---

`{loop type="tax_rule_country" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#tax-arguments}

| Argument    | Description                                                                | Default | Example             |
|-------------|:---------------------------------------------------------------------------|:-------:|:--------------------|
| ask         |                                                                            | taxes   |                     |
| country     |                                                                            | null    |                     |
| state       |                                                                            |         |                     |
| tax_rule    |                                                                            | null    |                     |

Plus the [global arguments](./global_arguments) and [global arguments I18n](./global_arguments_I18n)  

## Outputs

| Variable             | Value                                   |
|:---------------------|:----------------------------------------|
| $COUNTRY             |                                         |
| $POSITION            |                                         |
| $STATE               |                                         |
| $TAX                 |                                         |
| $TAX_DESCRIPTION     |                                         |
| $TAX_TITLE           |                                         |
| $TAX_RULE            |                                         |

Plus the [global outputs](./global_outputs)

## Ask expected values

[Arguments](#tax-arguments)

| Value                                   |
|:----------------------------------------|
| countries                               |
| taxes                                   |
