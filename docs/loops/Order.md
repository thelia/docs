---
title: Order
---

Order loop displays orders information.  
`{loop type="order" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#order-arguments}

| Argument                   | Description                                                                                                                                                                                         |       Default       | Example                                |
|----------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-------------------:|:---------------------------------------|
| customer                   | A single customer id or `current` keyword to get logged in user or `*` keyword to match all users.                                                                                                  |       current       | customer="2", customer="current"       |
| exclude_status             | A single or a list of order status ID which are to be excluded from the results                                                                                                                     |                     | status="*", exclude_status="1,4,7"     |
| exclude_status_code        | A single or a list of order status codes which are to be excluded from the results. The valid status codes are not_paid, paid, processing, sent, canceled, or any custom status that may be defined |                     | exclude_status_code="paid,processing"  |
| id                         | A single or a list of order ids.                                                                                                                                                                    |                     | id="2", id="1,4,7"                     |
| order                      | A list of values see [sorting possible values](#order-order-possible-values)                                                                                                                        | create-date-reverse | order="create-date-reverse"            |
| status                     | A single or a list of order status ID or `*` keyword to match all                                                                                                                                   |                     | status="*", status="1,4,7"             |
| status_code                | A single or a list of order status codes or `*` keyword to match all. The valid status codes are not_paid, paid, processing, sent, canceled, or any custom status that may be defined               |                     | status="*", status="not_paid,canceled" |
| with_prev_next_info        | A boolean. If set to true, $PREVIOUS and $NEXT output arguments are available.                                                                                                                      |        false        | with_prev_next_info="yes"              |
| ref                        | A single or a list of references.                                                                                                                                                                   |                     | ref="ref,ref2"                         |
| invoice_ref                | A single or a list of invoice references.                                                                                                                                                           |                     | invoice_ref="foo,bar"                  |
| delivery_ref               | A single or a list of delivery references.                                                                                                                                                          |                     | delivery_ref="delivery_ref"            |
| transaction_ref            | A single or a list of transaction references.                                                                                                                                                       |                     | transaction_ref="transaction_ref"      |

Plus the [global arguments](./global_arguments) and [search arguments](./search_arguments)

## Outputs

| Variable                  | Value                                                                                                       | If <small>with_prev_next_info='true'</small> | If <small>with_prev_next_info='false'</small> |
|:--------------------------|:------------------------------------------------------------------------------------------------------------|:--------------------------------------------:|:---------------------------------------------:|
| $CURRENCY                 | the order currency id ; you can use it in a [currency loop](./Currency)                                     |                      ✅                       |                       ✅                      |
| $CURRENCY_RATE            | the order currency rate                                                                                     |                      ✅                       |                       ✅                      |
| $CUSTOMER                 | the order customer id ; you can use it in a [customer loop](./Customer)                                     |                      ✅                       |                       ✅                      |
| $DELIVERY_ADDRESS         | the order delivery address id ; you can use it in a [order address loop](./OrderAddress)                    |                      ✅                       |                       ✅                      |
| $DELIVERY_MODULE          | the order delivery module id ; you can use it in a [module loop](./Module)                                  |                      ✅                       |                       ✅                      |
| $DELIVERY_REF             | the order delivery reference. It's usually use for tracking package                                         |                      ✅                       |                       ✅                      |
| $DISCOUNT                 | the order discount                                                                                          |                      ✅                       |                       ✅                      |
| $HAS_NEXT                 | true if a order exists after this one, following orders id.                                                 |                      ✅                       |                       🚫                      |
| $HAS_PAID_STATUS          | True is the order has the 'paid' status, false otherwise                                                    |                      ✅                       |                       ✅                      |
| $HAS_PREVIOUS             | true if a order exists before this one following orders id.                                                 |                      ✅                       |                       🚫                      |
| $ID                       | the order id                                                                                                |                      ✅                       |                       ✅                      |
| $INVOICE_ADDRESS          | the order the order invoice address id ; you can use it in a [order address loop](./OrderAddress)           |                      ✅                       |                       ✅                      |
| $INVOICE_REF              | the order invoice reference                                                                                 |                      ✅                       |                       ✅                      |
| $IS_CANCELED              | True is the order has the 'canceled' status, false otherwise                                                |                      ✅                       |                       ✅                      |
| $IS_NOT_PAID              | True is the order has the 'not paid' status, false otherwise                                                |                      ✅                       |                       ✅                      |
| $IS_PAID                  | True is the order has been paid (whatever current status is), false otherwise                               |                      ✅                       |                       ✅                      |
| $IS_PROCESSING            | True is the order has the 'processing' status, false otherwise                                              |                      ✅                       |                       ✅                      |
| $IS_SENT                  | True is the order has the 'sent' status, false otherwise                                                    |                      ✅                       |                       ✅                      |
| $LANG                     | the order language id                                                                                       |                      ✅                       |                       ✅                      |
| $NEXT                     | The ID of order after this one, following orders id, or null if none exists.                                |                      ✅                       |                       🚫                      |
| $PAYMENT_MODULE           | the order payment module id ; you can use it in a [module loop](./Module)                                   |                      ✅                       |                       ✅                      |
| $POSTAGE                  | the order postage                                                                                           |                      ✅                       |                       ✅                      |
| $POSTAGE_TAX              | the order postage tax                                                                                       |                      ✅                       |                       ✅                      |
| $POSTAGE_TAX_RULE_TITLE   | the tax rule used to get the postage tax amount                                                             |                      ✅                       |                       ✅                      |
| $POSTAGE_UNTAXED          | the order postage amount without tax                                                                        |                      ✅                       |                       ✅                      |
| $PREVIOUS                 | The ID of order before this one, following orders id, or null if none exists.                               |                      ✅                       |                       🚫                      |
| $REF                      | the order reference                                                                                         |                      ✅                       |                       ✅                      |
| $STATUS                   | the order status ; you can use it in a [order status loop](./OrderStatus)                                   |                      ✅                       |                       ✅                      |
| $STATUS_CODE              | the order status code                                                                                       |                      ✅                       |                       ✅                      |
| $TOTAL_AMOUNT             | the order amount without taxes                                                                              |                      ✅                       |                       ✅                      |
| $TOTAL_ITEMS_AMOUNT       | the total amount for ordered items, excluding taxes                                                         |                      ✅                       |                       ✅                      |
| $TOTAL_ITEMS_TAX          | the total tax amount for of the ordered items only, without postage tax                                     |                      ✅                       |                       ✅                      |
| $TOTAL_TAX                | the order taxes amount                                                                                      |                      ✅                       |                       ✅                      |
| $TOTAL_TAXED_AMOUNT       | the order amount including taxes                                                                            |                      ✅                       |                       ✅                      |
| $TOTAL_TAXED_ITEMS_AMOUNT | the total amount for ordered items, including taxes                                                         |                      ✅                       |                       ✅                      |
| $TRANSACTION_REF          | the order transaction reference. It's usually the unique identifier shared between the e-shop and it's bank |                      ✅                       |                       ✅                      |
| $VIRTUAL                  | the order has at least one product which is a virtual product                                               |                      ✅                       |                       ✅                      |
| $WEIGHT                   | The total weight of the order                                                                               |                      ✅                       |                       ✅                      |
| $INVOICE_DATE             | the order invoice date                                                                                      |                      ✅                       |                       ✅                      |
| $DISCOUNT_WITHOUT_TAX     | the order discount without tax                                                                              |                      ✅                       |                       ✅                      |
| $DISCOUNT_TAX             | the tax amount applied to the order discount                                                                |                      ✅                       |                       ✅                      |

Plus the [global outputs](./global_outputs)

## Order possible values {#order-order-possible-values}

[Arguments](#order-arguments)

| Ascending value | Descending value      | Sorted fields |
|-----------------|-----------------------|:--------------|
| company         | company-reverse       | company       |
| create-date     | create-date-reverse   | creation date |
| customer-name   | customer-name-reverse | customer name |
| id              | id-reverse            | id            |
| invoice-date    | invoice-date-reverse  | invoice date  |
| reference       | reference-reverse     | reference     |
| status          | status-reverse        | status        |
