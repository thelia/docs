---
title: Product
---

Product loop lists products from your shop. You very probably will have to use the product sale elements loop inside your product loop.   
`{loop type="product" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#product-arguments}

| Argument         | Description                                                                                                             | Default | Example                                |
|------------------|-------------------------------------------------------------------------------------------------------------------------|---------|----------------------------------------|
| attribute_non_strict_match | <strong>Only available if complex='true'</strong> <br/> promo, new, quantity, weight or price may differ in the different product sale element depending on the different attributes. This parameter allows to provide a list of non-strict attributes. <br/> liste of [expected values](#product_attribute_non_strict_match_values) | none | attribute_non_strict_match="promo,new" : <br/> loop will return the product if it has at least a product sale element in promo and at least a product sale element as new ; even if it's not the same product sale element. |
| brand            | A single or a list of brand ids.                                                                                        |         | page="2"                               |
| category         | A single or a list of category ids.                                                                                     |         | limit="10"                             |
| category_default | A single or a list of default category ids allowing to retrieve all products having this parameter as default category. |         | offset="10"                            |
| complex          | A boolean. If set to true, product loop will consider all product sale elements else it will only consider default product sale element. Some of the arguments/outputs will not be available depending on the complex argument. | false | complex="true" |
| content          | One or more content ID. When this parameter is set, the loop returns the products related to the specified content IDs. |         | content="3"                            |
| currency         | A currency id                                                                                                           |         | currency="1"                           |
| current          | A boolean value which allows either to exclude current product from results either to match only this product           |         | current="yes"                          |
| current_category | A boolean value which allows either to exclude current category products from results either to match only current category products. If a product is in multiple categories whose one is current it will not be excluded if current_category="false" but will be included if current_category="yes" |  | current_category="yes" |
| depth            | A positive integer value which precise how many subcategory levels will be browse. Will not be consider if category parameter is not set. | 1 | depth="2"                  |
| exclude          | A single or a list of product ids.                                                                                      |         | exclude="2", exclude="1,4,7"           |
| exclude_category | A single or a list of category ids. If a product is in multiple categories which are not all excluded it will not be excluded. |  | exclude_category="2", exclude_category="1,4,7" |
| exclude_tax_rule_id | Filter products not having this tax rule ID                                                                          |         | exclude_tax_rule_id=21                 |
| feature_availability | A list of mandatory features and the feature_availability expected for these.                                       |         | feature_availability="1: \(1 \| 2\) , 2:*, 3: 10 \| \(11&12\)" : feature 1 must have feature_availability 1 or 2 AND feature 2 must be set to any feature_availability AND feature 3 must have feature_availability 10 or both feature_availability 11 and 12 |
| feature_values   | A list of mandatory features and the string value expected for these.                                                   |         | feature_values="1: \(foo \| bar\) , 2:*, 3: foobar" : feature 1 must have feature value "foo" or "bar" AND feature 2 must be set to any feature_availability AND feature 3 must have feature value "foobar" |
| id               | A single or a list of product ids.                                                                                      |         | id="2" or id="1,4,7"                   |
| max_price        | A float value. Equal value matches.                                                                                     |         | max_price="32.1"                       |
| max_weight       | A float value. Equal value matches.                                                                                     |         | max_weight="32.1"                      |
| min_price        | A float value. Equal value matches.                                                                                     |         | min_price="12.3"                       |
| min_stock        | An integer value. Equal value matches.                                                                                  |         | min_stock="3"                          |
| min_weight       | A float value. Equal value matches.                                                                                     |         | min_weight="32.1"                      |
| new              | A boolean value to get products by their newness                                                                        |         | new="yes"                              |
| order            | The order for sorting products, see [sorting possible values](#product-order-possible-values)                           | alpha   | order="category,min_price"             |
| promo            | A boolean value.                                                                                                        |         | promo="yes"                            |
| ref              | A single or a list of product references.                                                                               |         | ref="PROD011" or ref="PROD011,PROD018" |
| sale             |                                                                                                                         |         |                                        |
| tax_rule_id      | Filter products having this tax rule ID                                                                                 |         | tax_rule_id=21                         |
| template_id      |                                                                                                                         |         |                                        |
| title            | filter by title                                                                                                         |         | title="foo"                            |
| virtual          | A boolean value.                                                                                                        | *       | virtual="yes"                          |
| visible          | A boolean value.                                                                                                        | yes     | visible="no"                           |
| with_prev_next_info | A boolean. If set to true, $HAS_PREVIOUS, $HAS_NEXT, $PREVIOUS, and $NEXT output variables are available.            | false   | with_prev_next_info="yes"              |
| with_prev_next_visible |                                                                                                                   | *       |                                        |

Plus the [global arguments](./global_arguments), [global arguments I18n](./global_arguments_I18n) and [search arguments](./search_arguments)

## Outputs

The product loop has a specific behaviour with the parameter `complex` if set to true some values will not be handled the same way and some other will not be available.  

| Variable          | Value                                                                                                     | If complex='true'  | If complex='false'  |
|-------------------|-----------------------------------------------------------------------------------------------------------|:------------------:|:-------------------:|
| $BEST_PRICE       | the product best tax-free price for the received arguments, depending on the attributes and promo status. |          ✅         |         ✅          |
| $BEST_PRICE_TAX   | the best price taxes amount                                                                               |          ✅         |         ✅          |
| $BEST_TAXED_PRICE | the best price including taxes                                                                            |          ✅         |         ✅          |
| $BRAND_ID         | the brand id of this product. Empty if no brand is assigned for this product                              |          ✅         |         ✅          |
| $CHAPO            | Chapo                                                                                                     |          ✅         |         ✅          |
| $DEFAULT_CATEGORY | the default category id associated to this product                                                        |          ✅         |         ✅          |
| $DESCRIPTION      | Description                                                                                               |          ✅         |         ✅          |
| $EAN_CODE         | The default product sale elements EAN Code                                                                |          🚫         |         ✅          |
| $HAS_NEXT         | true if a product exists after this one in the current category, following products positions. Only available if with_prev_next_info parameter is set to true  |          ✅         |         ✅          |
| $HAS_PREVIOUS     | true if a product exists before this one in the current category, following products positions. Only available if with_prev_next_info parameter is set to true |          ✅         |         ✅          |
| $ID               | the product id                                                                                            |          ✅         |         ✅          |
| $IS_NEW           | Newness                                                                                                   | return true if at least one of it's product sale element is new  |  return true if the default product sale element is new  |
| $IS_PROMO         |                                                                                                           | returns if at least one of it's product sale element is in promo |  returns if the default product sale element is in promo |
| $IS_TRANSLATED    | check if the product is translated or not                                                                 |          ✅         |         ✅          |
| $LOCALE           | the locale used for this loop                                                                             |          ✅         |         ✅          |
| $META_DESCRIPTION | the product meta description                                                                              |          ✅         |         ✅          |
| $META_KEYWORDS    | the product meta keywords                                                                                 |          ✅         |         ✅          |
| $META_TITLE       | the product meta title                                                                                    |          ✅         |         ✅          |
| $NEXT             | The ID of product after this one in the current category, following products positions, or null if none exists. Only available if <strong>with_prev_next_info</strong> parameter is set to true  |          ✅         |         ✅          |
| $POSITION         | the product position                                                                                      |          ✅         |         ✅          |
| $POSTSCRIPTUM     | Postscriptum                                                                                              |          ✅         |         ✅          |
| $PREVIOUS         | The ID of product before this one in the current category, following products positions, or null if none exists. Only available if <strong>with_prev_next_info</strong> parameter is set to true |          ✅         |         ✅          |
| $PRICE            | the default product sale elements price                                                                   |          🚫         |         ✅          |
| $PRICE_TAX        | the default product sale elements price tax                                                               |          🚫         |         ✅          |
| $PRODUCT_SALE_ELEMENT | the default product sale elements id                                                                  |          🚫         |         ✅          |
| $PROMO_PRICE      | the default product sale elements promo price                                                             |          🚫         |         ✅          |
| $PROMO_PRICE_TAX  | the default product sale elements promo price tax                                                         |          🚫         |         ✅          |
| $PSE_COUNT        | the number of product sale elements                                                                       |          🚫         |         ✅          |
| $QUANTITY         | the default product sale elements stock quantity                                                          |          🚫         |         ✅          |
| $REF              | the product reference                                                                                     |          ✅         |         ✅          |
| $SHOW_ORIGINAL_PRICE |                                                                                                        |          ✅         |         ✅          |
| $TAXED_PRICE      | the default product sale elements taxed price                                                             |          🚫         |         ✅          |
| $TAXED_PROMO_PRICE | the default product sale elements taxed promo price                                                      |          🚫         |         ✅          |
| $TAX_RULE_ID      | the product's tax rule ID                                                                                 |          ✅         |         ✅          |
| $TEMPLATE         | the template id associated to this product                                                                |          ✅         |         ✅          |
| $TITLE            | Title                                                                                                     |          ✅         |         ✅          |
| $URL              | the product URL                                                                                           |          ✅         |         ✅          |
| $VIRTUAL          | Return if the product is a virtual product or not                                                         |          ✅         |         ✅          |
| $VISIBLE          | Return if the product is visible or not                                                                   |          ✅         |         ✅          |
| $WEIGHT           | the default product sale elements weight                                                                  |          🚫         |         ✅          |

Plus the [global outputs](./global_outputs)

## Examples

I want to display all products from categories 1 and 2 and their subcategories whose feature `color` (ID : 1) is `blue` (ID : 13) or `lightblue` (ID : 17), order by ascending price

```smarty
<ul>
{loop type="product" name="my_product_loop" category="1,2" depth="2" feature_availability="1:13|17" order="min_price"}
    <li>{$TITLE} ({$REF})</li>
{/loop}
</ul>
```

I want to display all products which are in promo for the current category displaying the new products first and then order by decreasing price

```smarty
<ul>
{loop type="product" name="another_product_loop" promo="true" current_category="true" order="new,max_price"}
    <li>{$TITLE} ({$REF})</li>
{/loop}
</ul>
```

## Order possible values {#product-order-possible-values}

[Arguments](#product-arguments)

| Ascending value | Descending value | Sorted fields                                                             |
|-----------------|------------------|:--------------------------------------------------------------------------|
| alpha           | alpha_reverse    | Title                                                                     |
| created         | created_reverse  | Creation date                                                             |
| updated         | updated_reverse  | Last update date                                                          |
| id              | id_reverse       | Id                                                                        |
| ref             | ref_reverse      | Reference                                                                 |
| manual          | manual_reverse   | By position considering a given category, `category` argument must be set |
| min_price       | max_price        | Price                                                                     |
| position        | position_reverse | By position, without considering a parent category                        |
| visible         | visible_reverse  | Visible                                                                   |
| given_id        |                  | Return the same order received in id argument which therefore must be set |
| new             |                  | New products first                                                        |
| promo           |                  | Promo product first                                                       |
| random          |                  | Random order                                                              |

## attribute_non_strict_match possible values {#product_attribute_non_strict_match_values}

[Arguments](#product-arguments)

| Expected values | description                                                                          |
|---------------- |:------------------------------------------------------------------------------------ |
| \*              | all the attributes are non strict                                                    |
| max_price       |                                                                                      |
| max_weight      |                                                                                      |
| min_price       |                                                                                      |
| min_stock       |                                                                                      |
| min_weight      |                                                                                      |
| new             |                                                                                      |
| none            | product loop will look for at least 1 attribute which matches all the loop criteria. |
| promo           |                                                                                      |
