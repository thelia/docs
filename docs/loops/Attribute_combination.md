---
title: Attribute combination
---

Attribute combination loop lists attribute combinations.  
`{loop type="attribute_combination" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#pse-arguments}

| Argument                 | Description                                                                | Default | Example               |
| ------------------------ |:---------------------------------------------------------------------------| :-----: | :---------------------|
| order                    | A list of values <br/> [Expected values](#accessory-order-possible-values) | alpha   | order="alpha_reverse" |
| product_sale_elements \* | A single product sale elements id.                                         |         |  product="2"          |



## Outputs

| Variable                                                  | Value                                   |
| :-------------------------------------------------------  | :-------------------------------------- |
| $ATTRIBUTE_AVAILABILITY_CHAPO                             | the attribute availability chapo        |
| $ATTRIBUTE_AVAILABILITY_DESCRIPTION                       | the attribute availability description  |
| $ATTRIBUTE_AVAILABILITY_ID                                | the attribute availability id           |
| $ATTRIBUTE_AVAILABILITY_POSTSCRIPTUM                      | the attribute availability postscriptum |
| $ATTRIBUTE_AVAILABILITY_TITLE                             | the attribute availability title        |
| $ATTRIBUTE_CHAPO                                          | the attribute chapo                     |
| $ATTRIBUTE_DESCRIPTION                                    | the attribute description               |
| $ATTRIBUTE_ID                                             | the attribute id                        |
| $ATTRIBUTE_POSTSCRIPTUM                                   | the attribute postscriptum              |
| $ATTRIBUTE_TITLE                                          | the attribute title                     |
| $LOCALE                                                   | the locale used for this loop           |

## Examples

I want to display all products sale elements for current product and show all the attribute combinations which matched it.

```smarty
<ul>
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
</ul>
```

## Order possible values {#accessory-order-possible-values}

[Arguments](#pse-arguments)

| Ascending value                  | Descending value  | Sorted fields     |
|----------------------------------|-------------------|:------------------|
| alpha                            | alpha_reverse     | title             |
| manual                           | manual_reverse    | order by position |
