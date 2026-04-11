---
title: Associated content
---

Associated content loop lists associated contents of a product or a category. It behaves like a content loop therefore you might use all [content loop](./Content) arguments and outputs.  
`{loop type="associated_content" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#ass-content-arguments}

| Argument                                | Description                                                                                                                    | Default            | Example                    |
| --------------------------------------- |:-------------------------------------------------------------------------------------------------------------------------------| :----------------: | :--------------------------|
| all [content loop](./Content) arguments |                                                                                                                                |                    | exclude_folder="1,2,9"     |
| category \*\*                           | A single category id.                                                                                                          |                    | category="5"               |
| exclude_category                        | A single or a list of category ids. If a content is in multiple categories which are not all excluded it will not be excluded. |                    | exclude_category="5"       |
| exclude_product                         | A single or a list of product ids. If a content is in multiple products which are not all excluded it will not be excluded.    |                    | exclude_product="5"        |
| order                                   | A list of values <br/> [Expected values](#ass-content-order-possible-values)                                                   | associated_content | order="associated_content" |
| product \*\*                            | A single product id.                                                                                                           |                    | product="2"                |

## Outputs

| Variable                                                                           | Value                           |
| :--------------------------------------------------------------------------------  | :------------------------------ |
| $CONTENT_ID                                                                        | the associated content id       |
| $ID                                                                                | the ID of each content          |
| $POSITION                                                                          | the postition of each contents  |
| all [content loop](./Content) outputs, except ID, which is the ID of the relation. |                                 |

## Order possible values {#ass-content-order-possible-values}

[Arguments](#ass-content-arguments)

| Ascending value                      | Descending value           | Sorted fields      |
|--------------------------------------|----------------------------|:-------------------|
| associated_content                   | associated_content_reverse | associated content |
| all [content loop](./Content) orders |                            |                    |
