---
title: Attribute
---

Attribute loop lists attributes.   
`{loop type="attribute" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#attribute-arguments}

| Argument | Description | Default | Example |
| ------------- |:-------------| :-------------: | :-------------|
| exclude      | A single or a list of attribute ids to exclude. | | exclude="456,123" |
| exclude_template      | A single or a list of template ids. Only features NOT attached to these templates will be returned. | |  id="2", id="1,4,7" |
| id      | A single or a list of attribute ids. | |  id="2", id="1,4,7" |
| order       | A list of values <br/> [Expected values](#attribute-order-possible-values) | manual | order="alpha_reverse" |
| product   | A single or a list of product ids. | | id="2", id="1,4,7" |
| template   | A single or a list of template ids. Only features attached to these templates will be returned. | | id="2", id="1,4,7" |

Plus the [global arguments](./global_arguments) and the [global I18n](./global_arguments_I18n.md)

## Outputs

| Variable       | Value                                     |
| :------------  | :---------------------------------------- |
| $CHAPO         | the attribute chapo                       |
| $DESCRIPTION   | the attribute description                 |
| $ID            | the attribute id                          |
| $IS_TRANSLATED | check if the product is translated or not |
| $LOCALE        |                                           |
| $POSITION      | If none of the product, template or exclude_template parameter is present, $POSITION contains the attribute position. Otherwise, it contains the attribute position in the product template context.          |
| $POSTSCRIPTUM  | the attribute postscriptum                |
| $TITLE         | the attribute title                       |

Plus the [global outputs](./global_outputs)

## Order possible values {#attribute-order-possible-values}

[Arguments](#attribute-arguments)

| Ascending value | Descending value  | Sorted fields |
|-----------------|-------------------|:--------------|
| alpha           | alpha_reverse     | title         |
| id              | id_reverse        |               |
| manual          | manual_reverse    |               |
