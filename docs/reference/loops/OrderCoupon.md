---
title: Order coupon
---

Retrieve order coupons information for a given order  
`{loop type="order_coupon" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#order-arguments}

| Argument | Description         | Default | Example    |
|----------|:--------------------|:-------:|:-----------|
| order *  | A single order id.  |   null  | order="2"  |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable                          | Value                                                                                                         |
|:----------------------------------|:--------------------------------------------------------------------------------------------------------------|
| $CODE                             | the coupon code                                                                                               |
| $DAY_LEFT_BEFORE_EXPIRATION       | days left before coupon expiration                                                                            |
| $DESCRIPTION                      | the coupon description                                                                                        |
| $DISCOUNT_AMOUNT                  | the coupon discount amount                                                                                    |
| $EXPIRATION_DATE                  | the coupon expiration date                                                                                    |
| $FREE_SHIPPING_FOR_COUNTRIES_LIST | comma separated list of country IDs for which the free shipping applies                                       |
| $FREE_SHIPPING_FOR_MODULES_LIST   | comma separated list of shipping module IDs for which the free shipping applies                               |
| $ID                               | the coupon id                                                                                                 |
| $IS_AVAILABLE_ON_SPECIAL_OFFERS   | true if the coupon applies to discounted products                                                             |
| $IS_CUMULATIVE                    | true if the coupon is cumulative                                                                              |
| $IS_REMOVING_POSTAGE              | true if the coupon provides free shipping                                                                     |
| $IS_USAGE_CANCELED                | true if the usage of this coupon was canceled (probably when the related order was canceled), false otherwise |
| $PER_CUSTOMER_USAGE_COUNT         | Get the [per_customer_usage_count] column value.                                                              |
| $SHORT_DESCRIPTION                | the coupon short description                                                                                  |
| $TITLE                            | the coupon title                                                                                              |

Plus the [global outputs](./global_outputs)
