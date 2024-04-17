---
title: Sale
---

Sale loop provides an access to sale operations defined on your shop.  
`{loop type="sale" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#sale-arguments}

| Argument | Description                                                                                                          |          Default           | Example             |
|----------|:---------------------------------------------------------------------------------------------------------------------|:--------------------------:|:--------------------|
| active   | A boolean value, to get only active (1) or inactive sales (0) or both (*)                                            |             1              | active="1"          |
| currency | A currency id, to get the price offset defined for this currency                                                     | The current shop currency  | currency="1"        |
| exclude  | A single or a list of sale ids to excluded from results.                                                             |                            | id="2", id="1,4,7"  |
| id       | A single or a list of sale ids.                                                                                      |                            | id="2", id="1,4,7"  |
| order    | A list of values see [sorting possible values](#sale-order-possible-values)                                          | start-date                 | order=" random"     |
| product  | A single or a list of product IDs. If specified, the loop will return the sales in which these products are selected |                            | id="2", id="1,4,7"  |

Plus the [global arguments](./global_arguments), [global arguments I18n](./global_arguments_I18n) and [search arguments](./search_arguments)

## Outputs

| Variable               | Value                                                                         |
|:-----------------------|:------------------------------------------------------------------------------|
| $ACTIVE                | true if the sale is active, false otherwise                                   |
| $CHAPO                 | the sale chapo                                                                |
| $DESCRIPTION           | the sale description                                                          |
| $DISPLAY_INITIAL_PRICE | true if the products initial price should be displayed, false otherwise       |
| $END_DATE              | the sale end date                                                             |
| $HAS_END_DATE          | true if the sale has a end date, false otherwise                              |
| $HAS_START_DATE        | true if the sale has a start date, false otherwise                            |
| $ID                    | the content id                                                                |
| $IS_TRANSLATED         | check if the content is translated                                            |
| $LOCALE                | the locale (e.g. fr_FR) of the returned data                                  |
| $POSTSCTIPTUM          | the sale postscriptum                                                         |
| $PRICE_OFFSET_SYMBOL   | the offset unit symbol, % for a percentage, the currency symbol for an amount |
| $PRICE_OFFSET_TYPE     | the price offset type, P for a percentage, A for an amount                    |
| $PRICE_OFFSET_VALUE    | the price offset value, as a percentage (0-100) or a constant amount.         |
| $SALE_LABEL            | the sale advertising label                                                    |
| $START_DATE            | the sale start date                                                           |
| $TITLE                 | the sale title                                                                |

Plus the [global outputs](./global_outputs)

## Order possible values {#sale-order-possible-values}

[Arguments](#sale-arguments)

| Ascending value | Descending value   | Sorted fields         |
|-----------------|--------------------|:----------------------|
| active          | active-reverse     | active                |
| alpha           | alpha-reverse      | title                 |
| created         | created-reverse    | date of sale creation |
| end-date        | end-date-reverse   | end date              |
| id              | id-reverse         | id                    |
| label           | label-reverse      | label                 |
| start-date      | start-date-reverse | start date            |
| updated         | updated-reverse    | date of sale update   |
