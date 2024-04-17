---
title: Coupon
---

Return coupons information  
`{loop type="coupon" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#coupon-arguments}

| Argument   | Description                                                                                                                                          | Default | Example                                         |
|------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------|:-------:|:------------------------------------------------|
| code       | A single or a list of coupons code.                                                                                                                  |         | code="THECODE", code="ACODE,ANOTHERCODE,COCODE" |
| id         | A single or a list of coupons ids.                                                                                                                   |         | id="2", id="1,4,7"                              |
| in_use     | If true, only coupons currently in use in the checkout process are returned. If false, only coupons not in use in the checkout process are returned. |         | in_use="true"                                   |
| is_enabled | If true, only enabled are returned. If false, only disabled coupons are returned.                                                                    |         | is_enabled="true"                               |
| order      | A list of values see [sorting possible values](#coupon-order-possible-values)                                                                        | code    | order="alpha_reverse"                           |

Plus the [global arguments](./global_arguments) and the [global I18n](./global_arguments_I18n.md)

## Outputs

| Variable                         | Value                                                                    |
|:---------------------------------|:-------------------------------------------------------------------------|
| $IS_TRANSLATED                   | check if the coupon is translated or not                                 |
| AMOUNT                           | the coupon amount. Could be a percentage, or an absolute amount          |
| APPLICATION_CONDITIONS           | an array of usage conditions descriptions                                |
| CODE                             | the coupon code                                                          |
| DAY_LEFT_BEFORE_EXPIRATION       | days left before coupon expiration                                       |
| DESCRIPTION                      | the coupon description                                                   |
| DISCOUNT_AMOUNT                  | Amount subtracted from the cart, only if the coupon is currentrly in use |
| EXPIRATION_DATE                  | the coupon expiration date                                               |
| FREE_SHIPPING_FOR_COUNTRIES_LIST | list of country IDs for which the shipping is free                       |
| FREE_SHIPPING_FOR_MODULES_LIST   | list of module IDs for which the shipping is free                        |
| ID                               | the coupon id                                                            |
| IS_AVAILABLE_ON_SPECIAL_OFFERS   | true if the coupon effect applies to products currently on sale          |
| IS_CUMULATIVE                    | true if the coupon is cumulative with other coupons                      |
| IS_ENABLED                       | true if the coupon is enabled                                            |
| IS_REMOVING_POSTAGE              | true if the coupon removes shipping costs                                |
| LOCALE                           | the coupon locale                                                        |
| PER_CUSTOMER_USAGE_COUNT         | true if the coupon maximum usage count is per customer                   |
| SERVICE_ID                       | the coupon service id                                                    |
| SHORT_DESCRIPTION                | the coupon short description                                             |
| START_DATE                       |                                                                          |
| TITLE                            | the coupon title                                                         |
| TOOLTIP                          | The coupon short description                                             |
| USAGE_LEFT                       | number of usages left                                                    |

Plus the [global outputs](./global_outputs) and the [global I18n](./global_arguments_I18n.md)

## Order possible values {#coupon-order-possible-values}

[Arguments](#coupon-arguments)

| Ascending value | Descending value        | Sorted fields         |
|-----------------|-------------------------|:----------------------|
| code            | code-reverse            | coupon code           |
| days-left       | days-left-reverse       | days of validity left |
| enabled         | enabled-reverse         | coupons               |
| expiration-date | expiration-date-reverse | expiration date       |
| id              | id-reverse              | id                    |
| start-date      | start-date-reverse      |                       |
| title           | title-reverse           | title                 |
| usages-left     | usages-left-reverse     | usage count left      |
