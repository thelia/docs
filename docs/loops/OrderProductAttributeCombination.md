---
title: Order product attribute combination
---

Order product attribute combination loop lists order product attribute combinations.  
`{loop type="order_product_attribute_combination" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#order-arguments}

| Argument         | Description                                         | Default | Example               |
|------------------|:----------------------------------------------------|:-------:|:----------------------|
| order            | See [Order possible values](#order-possible-values) |  alpha   | order="alpha_reverse"|
| order_product    | A single order product id.                          |  null   | order_product="2"     |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable                             | Value                                                 |
|:-------------------------------------|:------------------------------------------------------|
| $ATTRIBUTE_AVAILABILITY_CHAPO        | the order product attribute availability chapo        |
| $ATTRIBUTE_AVAILABILITY_DESCRIPTION  | the order product attribute availability description  |
| $ATTRIBUTE_AVAILABILITY_POSTSCRIPTUM | the order product attribute availability postscriptum |
| $ATTRIBUTE_AVAILABILITY_TITLE        | the order product attribute availability title        |
| $ATTRIBUTE_CHAPO                     | the order product attribute chapo                     |
| $ATTRIBUTE_DESCRIPTION               | the order product attribute description               |
| $ATTRIBUTE_POSTSCRIPTUM              | the order product attribute postscriptum              |
| $ATTRIBUTE_TITLE                     | the order product attribute title                     |
| $ID                                  | the order product attribute combination ID            |
| $ORDER_PRODUCT_ID                    | the related order product ID                          |

Plus the [global outputs](./global_outputs)

## Order possible values

[Arguments](#order-arguments)

| Ascending value | Descending value | Sorted fields |
|-----------------|------------------|:--------------|
| alpha           | alpha_reverse    |               |
