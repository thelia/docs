---
title: Import Category
---

Import category loop lists all defined import categories.  
`{loop type="import-category" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#import-arguments}

| Argument                                                   | Description                                                                   | Default | Example                                                                          |
|------------------------------------------------------------|:------------------------------------------------------------------------------|:-------:|:---------------------------------------------------------------------------------|
| [import export category](./ImportExportCategory) arguments |                                                                               |         |                                                                                  |
| id                                                         | A single or a list of import category ids.                                    |         | id="2", id="1,4,7"                                                               |
| order                                                      | A list of values see [sorting possible values](#import-order-possible-values) | manual  | order="alpha"                                                                    |
| ref                                                        | A single or a list of import category references.                             |         | ref="thelia.import.products", id="thelia.import.products,thelia.import.modules"  |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable  | Value                                                          |
|:----------|:---------------------------------------------------------------|
| $ID       | the import category id                                         |
| $POSITION | the import category position                                   |
| $REF      | The import category reference, as defined in a config.xml file |
| $TITLE    | the import category title                                      |

Plus the [global outputs](./global_outputs)

## Order possible values {#import-order-possible-values}

[Arguments](#import-arguments)

| Ascending value | Descending value | Sorted fields |
|-----------------|------------------|:--------------|
| alpha           | alpha_reverse    | title         |
| id              | id_reverse       | Id            |
| manual          | manual_reverse   | position      |
| ref             | ref_reverse      | reference     |
