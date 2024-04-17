---
title: Product sale elements document
---
 
`{loop type="product_sale_elements_document" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#psed-arguments}

| Argument                 | Description                                                                    | Default         | Example                  |
| ------------------------ |:-------------------------------------------------------------------------------| :-------------: | :------------------------|
| id                       |                                                                                |                 |                          |
| order                    | A list of values see [sorting possible values](#psed-order-possible-values)    | position        | order="position-reverse" |
| product_sale_elements_id |                                                                                |                 |                          |
| product_document_id      |                                                                                |                 |                          |

Plus the [global arguments](./global_arguments) and [search arguments](./search_arguments)

## Outputs

| Variable                  | Value                                                                                   |
| :------------------------ | :-------------------------------------------------------------------------------------- |
| $ID                       |                                                                                         |
| $PRODUCT_DOCUMENT_ID      |                                                                                         |
| $PRODUCT_SALE_ELEMENTS_ID |                                                                                         |

Plus the [global outputs](./global_outputs)

## Order possible values {#psed-order-possible-values}

[Arguments](#psed-arguments)

| Ascending value | Descending value | Sorted fields                                                             |
|-----------------|------------------|:--------------------------------------------------------------------------|
| position        | position_reverse |                                                                           |
