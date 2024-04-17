---
title: Accessory
---

The accessory loop lists products accessories. As an accessory is itself a product, this loop behaves like a product loop. Therefore you can use all [product loop](./product) arguments and outputs.  
`{loop type="accessory" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#pse-arguments}

| Argument | Description | Default | Example |
| ------------- |:-------------| :-------------: | :-------------|
| all [product loop](./product) arguments      |  |              | order="min_price", max_price="100" |
| order       | A list of values <br/> [Expected values](#accessory-order-possible-values) | accessory | order="accessory,max_price" |
| product \*            | A single product id. | | product="2" |

## Outputs

| Variable                                                                      | Value                           |
| :---------------------------------------------------------------------------  | :------------------------------ |
| $ACCESSORY_ID                                                                 | The product ID of the accessory |
| $ID                                                                           | the accessory id                |
| $POSITION                                                                     |                                 |
| all [product loop](./product) outputs, except ID, which is the accessory ID   |                                 |

## Examples

I want to display all accessories which are in category 1, order by ascending price, for all products in category 2.

```smarty
<ul>
{loop type="product" name="products_in_category_2" category="2"}
    {loop type="accessory" name="accessories_in_category_1_order_by_min_price" category="1" product="$ID" order="min_price"}
        <li>{$TITLE} ({$REF})</li>
    {/loop}
{/loop}
</ul>
```

## Order possible values {#accessory-order-possible-values}

[Arguments](#pse-arguments)

| Ascending value                      | Descending value  | Sorted fields |
|--------------------------------------|-------------------|:--------------|
| accessory                            | accessory_reverse | accessory     |
| all [product loop](./product) orders |                   |               |
