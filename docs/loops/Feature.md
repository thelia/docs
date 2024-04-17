---
title: Feature
---

Feature loop lists features.  
`{loop type="feature" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#feature-arguments}

| Argument         | Description                                                                                         | Default | Example               |
|------------------|:----------------------------------------------------------------------------------------------------|:-------:|:----------------------|
| exclude          | A single or a list of feature ids to exclude.                                                       |         | exclude="456,123"     |
| exclude_template | A single or a list of template ids. Only features NOT attached to these templates will be returned. |         | id="2", id="1,4,7"    |
| id               | A single or a list of feature ids.                                                                  |         | id="2", id="1,4,7"    |
| lang             | A lang id                                                                                           |         | lang="1"              |
| order            | A list of values see [sorting possible values](#feature-order-possible-values)                      | manual  | order="alpha_reverse" |
| product          | A single or a list of product ids.                                                                  |         | id="2", id="1,4,7"    |
| template         | A single or a list of template ids. Only features attached to these templates will be returned.     |         | id="2", id="1,4,7"    |
| title            | A a string title                                                                                    |         | title="foo"           |
| visible          | A boolean value.                                                                                    |   yes   | visible="no"          |

Plus the [global arguments](./global_arguments) and the [global I18n](./global_arguments_I18n.md)

## Outputs

| Variable       | Value                                                                                                                                                                                            |
|:---------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| $CHAPO         | the feature chapo                                                                                                                                                                                |
| $DESCRIPTION   | the feature description                                                                                                                                                                          |
| $ID            | the feature id                                                                                                                                                                                   |
| $IS_TRANSLATED | check if the feature is translated                                                                                                                                                               |
| $LOCALE        | The locale used for this research                                                                                                                                                                |
| $POSITION      | If none of the product, template or exclude_template parameter is present, $POSITION contains the feature position. Otherwise, it contains the feature position in the product template context. |
| $POSTSCRIPTUM  | the feature postscriptum                                                                                                                                                                         |
| $TITLE         | the feature title                                                                                                                                                                                |

Plus the [global outputs](./global_outputs)

## Order possible values {#feature-order-possible-values}

[Arguments](#feature-arguments)

| Ascending value | Descending value | Sorted fields |
|-----------------|------------------|:--------------|
| alpha           | alpha-reverse    | title         |
| id              | id_reverse       |               |
| manual          | manual_reverse   | position      |
