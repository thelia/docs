---
title: Attribute availability
---

Attribute availability loop lists attribute availabilities (e.g., attribute values).  
`{loop type="attribute_availability" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#attribute-av-arguments}

| Argument | Description | Default | Example |
| ------------- |:-------------| :-------------: | :-------------|
| attribute      | A single or a list of attribute ids. | | id="2", id="1,4,7" |
| exclude      | A single or a list of attribute availability ids to exclude. | | exclude="456,123" |
| id      | A single or a list of attribute availability ids. | |  id="2", id="1,4,7" |
| order       | A list of values <br/> [Expected values](#attribute-av-order-possible-values) | manual | order="alpha_reverse" |
| product      | A product ID. If present, only attribute values that are part of this product's combinations are returned | |  product="279" |

Plus the [global arguments](./global_arguments) and the [global I18n](./global_arguments_I18n.md)

## Outputs

| Variable       | Value                                                       |
| :------------  | :---------------------------------------------------------- |
| $ATTRIBUTE_ID  | the ID of the attribute this attribute availability belongs |
| $CHAPO         | the attribute availability chapo                            |
| $DESCRIPTION   | the attribute availability description                      |
| $ID            | the attribute availability id                               |
| $IS_TRANSLATED | check if the product is translated or not                   |
| $LOCALE        | the locale used for this loop                               |
| $POSITION      | the attribute availability position                         |
| $POSTSCRIPTUM  | the attribute availability postscriptum                     |
| $TITLE         | the attribute availability title                            |

Plus the [global outputs](./global_outputs)

## Order possible values {#attribute-av-order-possible-values}

[Arguments](#attribute-av-arguments)

| Ascending value | Descending value  | Sorted fields |
|-----------------|-------------------|:--------------|
| alpha           | alpha_reverse     | title         |
| id              | id_reverse        |               |
| manual          | manual_reverse    |               |
