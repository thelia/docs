---
title: Product template
---

`{loop type="product_template" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#product-template-arguments}

| Argument | Description                                                                                        |     Default      | Example             |
|----------|:---------------------------------------------------------------------------------------------------|:----------------:|:--------------------|
| exclude  | A single or a list of sale ids to excluded from results.                                           |                  |                     |
| id       | A single or a list of sale ids.                                                                    |                  | id="2", id="1,4,7"  |

Plus the [global arguments](./global_arguments), [global arguments I18n](./global_arguments_I18n)

## Outputs

| Variable               | Value                                                                         |
|:-----------------------|:------------------------------------------------------------------------------|
| $ID                    | the content id                                                                |
| $IS_TRANSLATED         | check if the content is translated                                            |
| $LOCALE                | the locale (e.g. fr_FR) of the returned data                                  |
| $NAME                  |                  s                                                             |

Plus the [global outputs](./global_outputs)
