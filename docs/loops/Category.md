---
title: Category
---

Category loop lists categories from your shop.  
`{loop type="category" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#category-arguments}

| Argument | Description | Default | Example |
| ------------- |:-------------| :-------------: | :-------------|
| content             | One or more content ID. When this parameter is set, the loop returns the categories related to the specified content IDs. |              | content="3" |
| current             | A boolean value which allows either to exclude current category from results either to match only this category |              | current="yes" |
| exclude             | A single or a list of category ids. |              | exclude="2", exclude="1,4,7" |
| exclude_parent      | A single or list of categories id to exclude. |              | exclude_parent="12,22" |
| exclude_product     | A single or list product id to exclude. |              |  exclude_product="3" |
| id                  | A single or a list of category ids. |              |   id="2", id="1,4,7" |
| need_count_child    | A boolean. If set to true, count how many subcategories contains the current category | false | need_count_child="yes" |
| need_product_count  | A boolean. If set to true, count how many products contains the current category | false | need_product_count="yes" |
| not_empty           | (**not implemented yet**) A boolean value. If true, only the categories which contains at least a visible product (either directly or through a subcategory) are returned | no | not_empty="yes" |
| order               | A list of values <br/> [Expected values](#category-order-possible-values) | manual | order="random" |
| parent              | A single or a list of category ids. |  | parent="3", parent="2,5,8" |
| product             | A single or list of product IDs. |  | product="3" |
| ProductCountVisibleOnly |  |  |  |
| TemplateId          |  |  |  |
| visible             | A boolean value. | yes | visible="no" |
| with_prev_next_info | A boolean. If set to true, $PREVIOUS and $NEXT output arguments are available. | false | with_prev_next_info="yes" |

Plus the [global arguments](./global_arguments), the [global I18n](./global_arguments_I18n.md) and [search arguments](./search_arguments)

## Outputs

| Variable           | Value                                                                                                                                                                                        |
|:-------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| $CHAPO             | the category chapo                                                                                                                                                                           |
| $CHILD_COUNT       | Number of subcategories contained by the current category.<br/> **Only available if "need_count_child" is set to true**                                                                      |
| $DESCRIPTION       | the category description                                                                                                                                                                     |
| $HAS_NEXT          | true if a category exists after this one in the current parent category, following categories positions.<br/> **Only available if "with_prev_next_info" is set to true**                     |
| $HAS_PREVIOUS      | true if a category exists before this one in the current parent category, following categories positions.<br/> **Only available if "with_prev_next_info" is set to true**                    |
| $ID                | the category id                                                                                                                                                                              |
| $IS_TRANSLATED     | check if the category is translated or not                                                                                                                                                   |
| $LOCALE            | the locale used for this loop                                                                                                                                                                |
| $META_DESCRIPTION  | the category meta description                                                                                                                                                                |
| $META_KEYWORD      | the category meta keyword                                                                                                                                                                    |
| $META_TITLE        | the category meta title                                                                                                                                                                      |
| $NEXT              | The ID of category after this one in the current parent category, following categories positions, or null if none exists.<br/> **Only available if "with_prev_next_info" is set to true**    |
| $PARENT            | the parent category                                                                                                                                                                          |
| $POSITION          | the category position                                                                                                                                                                        |
| $POSTSCRIPTUM      | the category postscriptum                                                                                                                                                                    |
| $PRODUCT_COUNT     | Number of visible products contained by the current category. <br/> **Only available if "need_product_child" is set to true**                                                                |
| $PREVIOUS          | The ID of category before this one in the current parent category, following categories positions, or null if none exists.<br/> **Only available if "with_prev_next_info" is set to true**   |
| $ROOT              |                                                                                                                                                                                              |
| $TEMPLATE          | the template id associated to this category                                                                                                                                                  |
| $TITLE             | the category title                                                                                                                                                                           |
| $URL               | the category URL                                                                                                                                                                             |
| $VISIBLE           | Return if the category is visible or not                                                                                                                                                     |

Plus the [global outputs](./global_outputs)

## Order possible values {#category-order-possible-values}

[Arguments](#category-arguments)

| Ascending value  | Descending value | Sorted fields            |
|------------------|------------------|:-------------------------|
| alpha            | alpha_reverse    | title                    |
| created          | created_reverse  | date of content creation |
| id               | id_reverse       | Order ID                 |
| manual           | manual_reverse   | position                 |
| random           |                  |                          |
| updated          | updated_reverse  | date of content update   |
| visible          | visible_reverse  | online items             |
