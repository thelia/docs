---
title: Product sale elements
---

Product sale elements loop lists product sale elements from your shop. You may need to use the attribute combination loop inside your product sale elements loop.  
`{loop type="product_sale_elements" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#pse-arguments}

| Argument               | Description                                                                                                                          | Default         | Example                      |
| ---------------------- |:-------------------------------------------------------------------------------------------------------------------------------------| :-------------: | :----------------------------|
| attribute_availability | A single or a list of attribute availability (may not yet be managed on the back-end ?)                                              |                 | attribute_availability="2,7" |
| currency               | A currency id                                                                                                                        |                 | currency="1"                 |
| default                | A boolean value. If true, returns only the default product sale elements. If false, the default product sale element is not returned |                 | default="yes"                |
| id                     | A comma separated list of product sale elements id. Mandatory if the 'product' parameter is not present                              |                 | id="1,3,8"                   |
| new                    | A boolean value. If true, returns only product sale elements for which promo is on. The reverse with 'false'                         |                 | new="yes"                    |
| order                  | A list of values see [sorting possible values](#pse-order-possible-values)                                                           | random          | order="promo,min_price"      |
| product                | A single product id. Mandatory if the 'id' parameter is not present                                                                  |                 | product="2"                  |
| promo                  | A boolean value. If true, returns only product sale elements for which new is on. The reverse with 'false'                           |                 | promo="yes"                  |
| ref                    | A product reference                                                                                                                  |                 | ref="a_ref"                  |
| visible                | A boolean value, or * (the default) for ignoring this filter                                                                         |                 | visible="no"                 |

Plus the [global arguments](./global_arguments) and [search arguments](./search_arguments)

## Outputs

| Variable           | Value                                                                                   |
| :----------------- | :-------------------------------------------------------------------------------------- |
| $EAN_CODE          | the product sale element EAN Code                                                       |
| $ID                | the product sale element id                                                             |
| $IS_DEFAULT        | returns if the product sale element is the default product sale element for the product |
| $IS_NEW            | returns if the product sale element is new                                              |
| $IS_PROMO          | returns if the product sale element is in promo                                         |
| $PRICE             | the product sale element price                                                          |
| $PRICE_TAX         | the product sale element price tax                                                      |
| $PRODUCT_ID        | the related product id                                                                  |
| $PROMO_PRICE       | the product sale element promo price                                                    |
| $PROMO_PRICE_TAX   | the product sale element promo price tax                                                |
| $QUANTITY          | the product sale element stock quantity                                                 |
| $REF               | the product sale element reference                                                      |
| $TAXED_PRICE       | the product sale element taxed price                                                    |
| $TAXED_PROMO_PRICE | the product sale element taxed promo price                                              |
| $WEIGHT            | the product sale element weight                                                         |

Plus the [global outputs](./global_outputs)

## Examples

I want to display all products sale elements for current product and show all the attribute combinations which matched it.  

```smarty
{loop name="pse" type="product_sale_elements" product="$PRODUCT_ID"}
    <div>
        {loop name="combi" type="attribute_combination" product_sale_elements="$ID"}
        {$ATTRIBUTE_ID}. {$ATTRIBUTE_TITLE} = {$ATTRIBUTE_AVAILABILITY_ID}. {$ATTRIBUTE_AVAILABILITY_TITLE}<br />
        {/loop}
        <br />{$WEIGHT} g
        <br /><strong>{if $IS_PROMO == 1} {$PROMO_PRICE} € (instead of {$PRICE}) {else} {$PRICE} € {/if}</strong>
        <br /><br />
        Add
        <select>
            {for $will=1 to $QUANTITY}
            <option>{$will}</option>
            {/for}
        </select>
        to my cart
    </div>
{/loop}
```

## Order possible values {#pse-order-possible-values}

[Arguments](#pse-arguments)

| Ascending value | Descending value | Sorted fields                                                             |
|-----------------|------------------|:--------------------------------------------------------------------------|
| id              | id_reverse       | Id                                                                        |
| created         | created_reverse  | creation date                                                             |
| max_price       | min_price        | Price                                                                     |
| new             |                  | new products first                                                        |
| promo           |                  | promo products first                                                      |
| quantity        | quantity_reverse | quantity                                                                  |
| random          |                  | pseudo-random                                                             |
| ref             | ref_reverse      | reference                                                                 |
| updated         | updated_reverse  | update date                                                               |
| weight          | weight_reverse   | weight                                                                    |
