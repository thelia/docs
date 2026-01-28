---
title: Product sale elements document
---
 
 Product sale elements image loop to display document of product's variations.  
`{loop type="product_sale_elements_document" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#psed-arguments}

| Argument                 | Description                                                                    | Default         | Example                                                        |
| ------------------------ |:-------------------------------------------------------------------------------| :-------------: | :--------------------------------------------------------------|
| id                       | A single or list of product id                                                 |                 | id="2", id="1,4,7"                                             |
| order                    | A list of values see [sorting possible values](#psed-order-possible-values)    | position        | order="position-reverse"                                       |
| product_sale_elements_id | A single or list of product sale element id                                    |                 | product_sale_elements_id="2", product_sale_elements_id="1,4,7" |
| product_document_id      | A single or list of product document id                                        |                 | product_document_id="2", product_document_id="1,4,7"           |

Plus the [global arguments](./global_arguments) and [search arguments](./search_arguments)

## Outputs

| Variable                  | Value                               |
| :------------------------ | :-----------------------------------|
| $ID                       | Product id                          |
| $PRODUCT_DOCUMENT_ID      | Product document id                 |
| $PRODUCT_SALE_ELEMENTS_ID | Product sale element id             |

Plus the [global outputs](./global_outputs)

## Order possible values {#psed-order-possible-values}

[Arguments](#psed-arguments)

| Ascending value | Descending value | Sorted fields                                                             |
|-----------------|------------------|:--------------------------------------------------------------------------|
| position        | position_reverse | Position                                                                  |
