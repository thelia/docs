---
title: Lang
---

Lang loop.   
`{loop type="lang" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#lang-arguments}

| Argument        | Description                                                                 |  Default  | Example                          |
|-----------------|:----------------------------------------------------------------------------|:---------:|:---------------------------------|
| acive           |                                                                             |   true    |                                  |
| code            | A single or list of lang code.                                              |           | code="fr", code="fr,en"          |
| default_only    | returns only the default language                                           |   false   | default_only="true"              |
| exclude         | A single or list of lang ids.                                               |           | exclude="2", exclude="1,3"       |
| exclude_default | exclude the default language from results                                   |   false   | exclude_default="true"           |
| id              | A single or list of lang ids.                                               |           | id="2"                           |
| locale          | A single or list of lang locale.                                            |           | code="fr_FR", code="fr_FR,fr_CA" |
| order           | A list of values see [sorting possible values](#lang-order-possible-values) | position  | order="alpha_reverse"            |
| visible         |                                                                             |   true    |                                  |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable             | Value                                                         |
|:---------------------|:--------------------------------------------------------------|
| $ACTIVE              |                                                               |
| $CODE                | lang code, example : fr                                       |
| $DATE_FORMAT         | the lang date format                                          |
| $DECIMAL_COUNT       | the number of digits after the decimal separator              |
| $DECIMAL_SEPARATOR   | the lang decimal separator, such as , or .                    |
| $ID                  | the order id                                                  |
| $IS_DEFAULT          | check if the current result is the default one                |
| $LOCALE              | lang locale, example : fr_FR                                  |
| $POSITION            | lang position                                                 |
| $THOUSANDS_SEPARATOR | the lang thousangs separator                                  |
| $TIME_FORMAT         | the lang time format                                          |
| $TITLE               | lang title                                                    |
| $URL                 | the lang URL, only if a specific URL is defined for each lang |
| $VISIBLE             |                                                               |

Plus the [global outputs](./global_outputs)

## Order possible values {#lang-order-possible-values}
[Arguments](#lang-arguments)

| Ascending value | Descending value  | Sorted fields |
|-----------------|-------------------|:--------------|
| alpha           | alpha_reverse     | title         |
| id              | id_reverse        | Id            |
| position        | position_reverse  | position      |
