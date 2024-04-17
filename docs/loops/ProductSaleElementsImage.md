---
title: Product sale elements image
---
 
`{loop type="product_sale_elements_image" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#psei-arguments}

| Argument                 | Description                                                                    | Default         | Example                  |
| ------------------------ |:-------------------------------------------------------------------------------| :-------------: | :------------------------|
| id                       |                                                                                |                 |                          |
| order                    | A list of values see [sorting possible values](#psei-order-possible-values)    | position        | order="position-reverse" |
| product_sale_elements_id |                                                                                |                 |                          |
| product_image_id         |                                                                                |                 |                          |

Plus the [global arguments](./global_arguments) and [search arguments](./search_arguments)

## Outputs

| Variable                  | Value                                                                                   |
| :------------------------ | :-------------------------------------------------------------------------------------- |
| $ID                       |                                                                                         |
| $PRODUCT_IMAGE_ID         |                                                                                         |
| $PRODUCT_SALE_ELEMENTS_ID |                                                                                         |

Plus the [global outputs](./global_outputs)

## Order possible values {#psei-order-possible-values}

[Arguments](#psei-arguments)

| Ascending value | Descending value | Sorted fields                                                             |
|-----------------|------------------|:--------------------------------------------------------------------------|
| position        | position_reverse |                                                                           |
