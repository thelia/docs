---
title: Product sale elements image
---

Product sale elements image loop to display images of product's variations.  
`{loop type="product_sale_elements_image" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#psei-arguments}

| Argument                 | Description                                                                    | Default         | Example                                                        |
| ------------------------ |:-------------------------------------------------------------------------------| :-------------: | :--------------------------------------------------------------|
| id                       | A single or list of product id                                                 |                 | id="2", id="1,4,7"                                             |
| order                    | A list of values see [sorting possible values](#psei-order-possible-values)    | position        | order="position-reverse"                                       |
| product_sale_elements_id | A single or list of product sale element id                                    |                 | product_sale_elements_id="2", product_sale_elements_id="1,4,7" |
| product_image_id         | A single or list of product image id                                           |                 | product_image_id="2", product_image_id="1,4,7"                 |

Plus the [global arguments](./global_arguments) and [search arguments](./search_arguments)

## Outputs

| Variable                  | Value                               |
| :------------------------ | :-----------------------------------|
| $ID                       | Product id                          |
| $PRODUCT_IMAGE_ID         | Product image id                    |
| $PRODUCT_SALE_ELEMENTS_ID | Product sale element id             |

Plus the [global outputs](./global_outputs)

## Order possible values {#psei-order-possible-values}

[Arguments](#psei-arguments)

| Ascending value | Descending value | Sorted fields                                                             |
|-----------------|------------------|:--------------------------------------------------------------------------|
| position        | position_reverse | Position                                                                  |
