---
title: Export
---

Export loop lists all defined exports.  
`{loop type="export" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#export-arguments}

| Argument | Description                                                                   | Default | Example                                                                        |
|----------|:------------------------------------------------------------------------------|:-------:|:-------------------------------------------------------------------------------|
| category | A single or a list of export category ids.                                    |         | category="2", category="1,4"                                                   |
| id       | A single or a list of export ids.                                             |         | id="2", id="1,4,7"                                                             |
| order    | A list of values see [sorting possible values](#export-order-possible-values) | manual  | order="alpha"                                                                  |
| ref      | A single or a list of export references.                                      |         | ref="thelia.export.customer", id="thelia.export.customer,thelia.export.orders" |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable      | Value                                                              |
|:--------------|:-------------------------------------------------------------------|
| $CATEGORY_ID  | the export category id                                             |
| $DESCRIPTION  | the export description                                             |
| $HANDLE_CLASS | The fully qualified name of the class which implements this export |
| $ID           | the export id                                                      |
| $POSITION     | the export position in the containing category                     |
| $REF          | The export reference, as defined in a config.xml file              |
| $TITLE        | The export title                                                   |
| $URL          | the URL to start this export in the admin export page              |

Plus the [global outputs](./global_outputs)

## Order possible values {#export-order-possible-values}

[Arguments](#export-arguments)

| Ascending value | Descending value | Sorted fields |
|-----------------|------------------|:--------------|
| alpha           | alpha-reverse    | title         |
| id              | id_reverse       | id            |
| manual          | manual-reverse   | position      |
| ref             | ref_reverse      | reference     |
