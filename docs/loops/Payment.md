---
title: Payment
---

payment loop displays payment modules information.  
`{loop type="payment" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#payment-arguments}

| Argument     | Description                                                                    | Default | Example                    |
|--------------|:-------------------------------------------------------------------------------|:-------:|:---------------------------|
| code         | A module code.                                                                 |         | code='Atos'                |
| exclude      | A list of module IDs to exclude from the results                               |         | exclude="12,21"            |
| exclude_code | A list of module codes to exclude from the results                             |         | exclude_code="Cheque,Atos" |
| id           | A module id.                                                                   |         | module=4                   |
| order        | A list of values see [sorting possible values](#payment-order-possible-values) | manual  | order=" id_reverse"        |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable      | Value                                |
|:--------------|:-------------------------------------|
| $CHAPO        | the payment module short description |
| $CODE         | the module code                      |
| $DESCRIPTION  | the payment module description       |
| $ID           | the payment module id                |
| $POSTSCRIPTUM | the payment module postscriptum      |
| $TITLE        | the payment module title             |

Plus the [global outputs](./global_outputs)

## Order possible values {#payment-order-possible-values}

[Arguments](#payment-arguments)

| Ascending value | Descending value | Sorted fields |
|-----------------|------------------|:--------------|
| alpha           | alpha_reverse    | title         |
| id              | id_reverse       | id            |
| manual          | manual_reverse   | position      |
