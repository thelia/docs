---
title: Order product tax
---

Order product tax loop displays taxes available.  
`{loop type="order_product_tax" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#order-arguments}

| Argument         | Description                 | Default | Example            |
|------------------|:----------------------------|:-------:|:-------------------|
| order_product *  | A single order product id.  | null    | order_product="2"  |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable      | Value                         |
|:--------------|:------------------------------|
| $AMOUNT       | Tax amount                    |
| $DESCRIPTION  | Tax description               |
| $ID           | Tax id                        |
| $PROMO_AMOUNT | Tax amount of the promo price |
| $TITLE        | Tax title                     |

Plus the [global outputs](./global_outputs)
