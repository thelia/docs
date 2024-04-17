---
title: Feature value
---

Feature value loop lists feature availabilities.  
`{loop type="feature_value" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#feature-arguments}

| Argument                     | Description                                                                             | Default | Example                                           |
|------------------------------|:----------------------------------------------------------------------------------------|:-------:|:--------------------------------------------------|
| exclude_feature_availability | A boolean value to return only features with feature availability (no personal value).  | 0       | feature_availability="true"                       |
| exclude_free_text            | A boolean value to return only features with free text value (no feature availability). | 0       | exclude_free_text="1" or exclude_free_text="true" |
| feature                      | A single feature id.                                                                    | null    | feature="2"                                       |
| feature_availability         | A single or a list of feature availability ids.                                         |         | feature_availability="2,5"                        |
| force_return                 |                                                                                         | true    |                                                   |
| free_text                    | A single or a list of strings.                                                          |         | free_text="some text,some other text"             |
| order                        | A list of values see [sorting possible values](#feature-order-possible-values)          | manual  | order="alpha_reverse"                             |
| product                      | A single product id.                                |         | product="9"                                       |

Plus the [global arguments](./global_arguments) and [global arguments I18n](./global_arguments_I18n.md)

## Outputs

| Variable         | Value                                                                                       |
|:-----------------|:--------------------------------------------------------------------------------------------|
| $CHAPO           | the feature value chapo                                                                     |
| $DESCRIPTION     | the feature value description                                                               |
| $FEATURE_AV_ID   | the feature av. ID. Null if the feature ha no feature av. Use FREE_TEXT_VALUE in this case. |
| $FREE_TEXT_VALUE | 1 if this feature is free text, 0 otherwise. Deprecated in 2.4                              |
| $ID              | the feature value id                                                                        |
| $IS_FEATURE_AV   | 1 if this feature is feature av., 0 otherwise.                                              |
| $IS_FREE_TEXT    | 1 if this feature is free text, 0 otherwise.                                                |
| $LOCALE          | the locale of returned results                                                              |
| $POSITION        | the feature value position                                                                  |
| $POSTSCRIPTUM    | the feature availability postscriptum                                                       |
| $PRODUCT         | the id of the product. Deprecated, please use $PRODUCT_ID instead                           |
| $PRODUCT_ID      | (2.2) the id of the product                                                                 |
| $TITLE           | the feature availability title, or the feature value text for free text features.           |

Plus the [global outputs](./global_outputs)

## Order possible values {#feature-order-possible-values}

[Arguments](#feature-arguments)

| Ascending value | Descending value | Sorted fields |
|-----------------|------------------|:--------------|
| alpha           | alpha_reverse    | title         |
| manual          | manual_reverse   | position      |
