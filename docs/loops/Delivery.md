---
title: Delivery
---

delivery loop displays delivery modules information.  
`{loop type="delivery" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#delivery-arguments}

| Argument     | Description                                                                     | Default | Example                    |
|--------------|:--------------------------------------------------------------------------------|:-------:|:---------------------------|
| all [produspecific base module loop](./BaseSpecificModule) arguments|                          |         |                            |
| address      | An address id.                                                                  |         | address=21                 |
| code         | A module code.                                                                  |         | code='Atos'                |
| country      | A country id.                                                                   |         | country=2                  |
| exclude      | A list of module IDs to exclude from the results                                |         | exclude="12, 21"           |
| exclude_code | A list of module codes to exclude from the results                              |         | exclude_code="Cheque,Atos" |
| id           | A module id.                                                                    |         | module=4                   |
| order        | A list of values see [sorting possible values](#delivery-order-possible-values) | manual  | order="id_reverse"         |
| state        | A state id.                                                                     |         | state=12                   |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable                | Value                                                               |
|:------------------------|:--------------------------------------------------------------------|
| $CHAPO                  | the delivery module short description                               |
| $CODE                   | the module code                                                     |
| $DELIVERY_DATE          | the expected delivery date. This output could be empty.             |
| $DESCRIPTION            | the delivery module description                                     |
| $ID                     | the delivery module id                                              |
| $POSTAGE                | the delivery price with taxes, expressed in the current currency    |
| $POSTAGE_TAX            | The delivery price tax amount, expressed in the current currency    |
| $POSTAGE_TAX_RULE_TITLE | The tax rule title used to get delivery price tax                   |
| $POSTAGE_UNTAXED        | the delivery price without taxes, expressed in the current currency |
| $POSTSCRIPTUM           | the delivery module postscriptum                                    |
| $TITLE                  | the delivery module title                                           |

Plus the [global outputs](./global_outputs)

## Order possible values {#delivery-order-possible-values}

[Arguments](#delivery-arguments)

| Ascending value | Descending value | Sorted fields                      |
|-----------------|------------------|:-----------------------------------|
| alpha           | alpha_reverse    | title                              |
| id              | id_reverse       | id                                 |
| manual          | manual_reverse   | position as defined in back-office |
