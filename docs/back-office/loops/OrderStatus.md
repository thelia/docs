---
title: Order status
---

Order status loop displays order status information.  
`{loop type="order_status" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#order-arguments}

| Argument | Description                                                       | Default | Example            |
|----------|:------------------------------------------------------------------|:-------:|:-------------------|
| code     | Status code                                                       |         | code="a_code"      |
| id       | A single or a list of order status ids                            |         | id="2", id="1,4,7" |
| order    | A list of values see [Expected values](#order-possible-values)    | manual  | order="random"     |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable          | Value                                          |
|:------------------|:-----------------------------------------------|
| $CHAPO            | the order status short description             |
| $CODE             | the order status code                          |
| $COLOR            | the order status hexadecimal color code        |
| $DESCRIPTION      | the order status description                   |
| $ID               | the order status id                            |
| $IS_TRANSLATED    | whatever the order status is translated or not |
| $LOCALE           | the order status locale                        |
| $POSITION         | the order status position                      |
| $POSTSCRIPTUM     | the order status postscriptum                  |
| $PROTECTED_STATUS | 1 if the order status is protected             |
| $TITLE            | the order status title                         |

Plus the [global outputs](./global_outputs)

## Order possible values {#order-possible-values}

[Arguments](#order-arguments)

| Ascending value | Descending value | Sorted fields |
|-----------------|------------------|:--------------|
| alpha           | alpha-reverse    | I18n title    |
| manual          | manual-reverse   | position      |
