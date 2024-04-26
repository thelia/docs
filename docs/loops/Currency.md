---
title: Currency
---

Currency loop lists currencies.  
`{loop type="currency" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#currency-arguments}

| Argument     | Description                                                                     | Default | Example                      |
|--------------|:--------------------------------------------------------------------------------|:-------:|:-----------------------------|
| default_only | A boolean value to display only the default currency.                           |         | default_only="true"          |
| exclude      | A single or a list of currency ids.                                             |         | exclude="2", exclude="1,4,7" |
| id           | A single or a list of currency ids.                                             |         | id="2", id="1,4,7"           |
| order        | A list of values see [sorting possible values](#currency-order-possible-values) | manual  | order="id_reverse"           |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable       | Value                                           |
|:---------------|:------------------------------------------------|
| $FORMAT        | the format of the currency                      |
| $ID            | the currency id                                 |
| $ISOCODE       | the ISO numeric currency code                   |
| $IS_DEFAULT    | returns if the currency is the default currency |
| $IS_TRANSLATED | check if the currency is translated             |
| $LOCALE        | The locale used for this research               |
| $NAME          | the currency name                               |
| $POSITION      | the currency position                           |
| $RATE          | the currency rate                               |
| $SYMBOL        | the ISO numeric currency symbol                 |
| $VISIBLE       | the visibility status of the currency           |

Plus the [global outputs](./global_outputs)

## Order possible values {#currency-order-possible-values}

[Arguments](#currency-arguments)

| Ascending value | Descending value    | Sorted fields |
|-----------------|-------------------- |:--------------|
| code            | code-reverse        | currency code |
| id              | id_reverse          | id            |
| is_default      | is_default_reverse  | by default    |
| manual          | manual_reverse      | position      |
| name            | name_reverse        | name          |
| rate            | rate_reverse        | rate          |
| symbol          | symbol_reverse      | symbol        |
| visible         | visible_reverse     | visible       |
