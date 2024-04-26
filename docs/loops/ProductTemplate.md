---
title: Product template
---

Product template loop to display product templates.  
`{loop type="product_template" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#product-template-arguments}

| Argument | Description                                                        |     Default      | Example                      |
|----------|:-------------------------------------------------------------------|:----------------:|:-----------------------------|
| exclude  | A single or a list of sale ids to excluded from results.           |                  | exclude="2", exclude="1,4,7" |
| id       | A single or a list of sale ids.                                    |                  | id="2", id="1,4,7"           |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable               | Value                                                                         |
|:-----------------------|:------------------------------------------------------------------------------|
| $ID                    | the content id                                                                |
| $IS_TRANSLATED         | check if the content is translated                                            |
| $LOCALE                | the locale (e.g. fr_FR) of the returned data                                  |
| $NAME                  | the template name                                                             |

Plus the [global outputs](./global_outputs)
