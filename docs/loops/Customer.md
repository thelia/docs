---
title: Customer
---

Customer loop displays customers information.  
`{loop type="customer" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#customer-arguments}

| Argument            | Description                                                                                                                                         | Default  | Example                               |
|---------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------|:--------:|:--------------------------------------|
| current             | A boolean value which must be set to false if you need to display not authenticated customers information, typically if `sponsor` parameter is set. |   yes    | current="false"                       |
| Newsletter          | A boolean that represents whether the customer is subscribed to the newsletter                                                                      |          |                                       |
| order               | A list of values see [sorting possible values](#customer-order-possible-values)                                                                     | lastname | order="firstname, lastname"           |
| ref                 | A single or a list of customer references.                                                                                                          |          | ref="1231231241", ref="123123,789789" |
| reseller            | A boolean value.                                                                                                                                    |          | reseller="yes"                        |
| sponsor             | The sponsor ID which you want the list of affiliated customers                                                                                      |          | sponsor="1"                           |
| with_prev_next_info | A boolean. If set to true, $HAS_PREVIOUS, $HAS_NEXT, $PREVIOUS, and $NEXT output variables are available.                                           |  false   | with_prev_next_info="yes"             |

Plus the [global arguments](./global_arguments) and [search arguments](./search_arguments)

## Outputs

| Variable            | Value                                                                                                                                                                           |
|:--------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| $CONFIRMATION_TOKEN | the customer registration confirmation token, used when email confirmation of registration is enabled (see <strong>customer_email_confirmation</strong> configuration variable) |
| $DISCOUNT           | the customer discount                                                                                                                                                           |
| $EMAIL              | the customer email                                                                                                                                                              |
| $FIRSTNAME          | the customer firstname                                                                                                                                                          |
| $HAS_NEXT           | true if a customer exists after the current one, regarding the curent order. Only available if <strong>with_prev_next_info</strong> parameter is set to true                    |
| $HAS_PREVIOUS       | true if a customer exists before the current one, regarding the curent order. Only available if <strong>with_prev_next_info</strong> parameter is set to true                   |
| $ID                 | the customer id                                                                                                                                                                 |
| $LASTNAME           | the customer lastname                                                                                                                                                           |
| $NEWSLETTER         | true if the customer is registered in the newsletter table, false otherwise                                                                                                     |
| $NEXT               | ID of the next customer, or null if non exists. Only available if <strong>with_prev_next_info</strong> parameter is set to true                                                 |
| $PREVIOUS           | ID of the previous customer, or null if non exists. Only available if <strong>with_prev_next_info</strong> parameter is set to true                                             |
| $REF                | the customer reference                                                                                                                                                          |
| $RESELLER           | return if the customer is a reseller                                                                                                                                            |
| $SPONSOR            | the customer sponsor which might be use in another   [customer loop](./Customer)                                                                                                |
| $TITLE              | the customer title which might be use in [title loop](./Title)                                                                                                                  |

Plus the [global outputs](./global_outputs)

## Order possible values {#customer-order-possible-values}

[Arguments](#customer-arguments)

| Ascending value            | Descending value           | Sorted fields     |
|----------------------------|----------------------------|:------------------|
| firstname                  | firstname_reverse          | firstname         |
| id                         | id_reverse                 | ID                |
| last_order                 | last_order_reverse         | last order        |
| lastname                   | lastname_reverse           | lastname          |
| registration_date          | registration_date_reverse  | registration date |
| order_amount               | order_amount_reverse       | last order        |
| reference                  | reference_reverse          | reference         |
| registration_date          |                            | registration date |
