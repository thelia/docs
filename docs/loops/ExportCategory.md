---
title: Export Category
---

Export category loop lists all defined export categories.  
`{loop type="export-category" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#export-arguments}

| Argument | Description                                                                   | Default | Example                                                                          |
|----------|:------------------------------------------------------------------------------|:-------:|:---------------------------------------------------------------------------------|
| id       | A single or a list of export category ids.                                    |         | id="2", id="1,4,7"                                                               |
| order    | A list of values see [sorting possible values](#export-order-possible-values) | manual  | order="alpha"                                                                    |
| ref      | A single or a list of export category references.                             |         | ref="thelia.export.customer", id="thelia.export.customer,thelia.export.products" |
|          | And the [Import export category arguments](./ImportExportCategory)            |         |                                                                                  |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable  | Value                                                          |
|:----------|:---------------------------------------------------------------|
| $ID       | the export category id                                         |
| $POSITION | the export category position                                   |
| $REF      | The export category reference, as defined in a config.xml file |
| $TITLE    | The export category title                                      |

Plus the [global outputs](./global_outputs)

## Order possible values {#export-order-possible-values}

[Arguments](#export-arguments)

| Ascending value | Descending value | Sorted fields |
|-----------------|------------------|:--------------|
| alpha           | alpha-reverse    | title         |
| id              | id_reverse       | id            |
| manual          | manual_reverse   | position      |
| ref             | ref_reverse      | reference     |
