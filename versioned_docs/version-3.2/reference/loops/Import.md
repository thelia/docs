---
title: Import
---

Import loop lists all defined imports.  
`{loop type="import" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#import-arguments}

| Argument                                          | Description                                                                   | Default | Example                                                                 |
|---------------------------------------------------|:------------------------------------------------------------------------------|:-------:|:------------------------------------------------------------------------|
| [impor export type](./ImportExportType) arguments |                                                                               |         |                                                                         |
| category                                          | A single or a list of import category ids.                                    |         | category="2", category="1,4"                                            |
| id                                                | A single or a list of import ids.                                             |         | id="2", id="1,4,7"                                                      |
| order                                             | A list of values see [sorting possible values](#import-order-possible-values) | manual  | order="alpha"                                                           |
| ref                                               | A single or a list of import references.                                      |         | ref="thelia.import.price", id="thelia.import.price,thelia.import.stock" |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable      | Value                                                              |
|:--------------|:-------------------------------------------------------------------|
| $CATEGORY_ID  | the import category id                                             |
| $DESCRIPTION  | the import description                                             |
| $HANDLE_CLASS | The fully qualified name of the class which implements this import |
| $ID           | the import id                                                      |
| $POSITION     | the import position in the containing category                     |
| $REF          | The import reference, as defined in a config.xml file              |
| $TITLE        | The import title                                                   |
| $URL          | the URL to start this import in the admin import page              |

Plus the [global outputs](./global_outputs)

## Order possible values {#import-order-possible-values}

[Arguments](#import-arguments)

| Ascending value | Descending value | Sorted fields |
|-----------------|------------------|:--------------|
| alpha           | alpha_reverse    | title         |
| id              | id_reverse       | Id            |
| manual          | manual_reverse   | position      |
| ref             | ref_reverse      | reference     |
