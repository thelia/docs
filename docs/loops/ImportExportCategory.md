---
title: Import Export Category
---

...

`{loop type="importexportcategory" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#area-arguments}

| Argument | Description      | Default | Example         |
|----------|:-----------------|:-------:|:----------------|
| id       | The category ID  |         | id="2"          |
| order    | Sorting order    |         | order="id"      |
| ref      | The ref column   |         | ref="reference" |

Plus the [global arguments](./global_arguments)

## Outputs {#area-outputs}

| Variable         | Value                 |
|:-----------------|:----------------------|
| $ID_VALUE$       | The category ID       |
| $REF_VALUE$      | The ref column        |
| $TITLE_VALUE$    | The category title    |
| $POSITION_VALUE$ | The category position |

Plus the [global outputs](./global_outputs)

## Order possible values

[Arguments](#area-arguments)

| Ascending value | Descending value | Sorted fields |
|-----------------|------------------|:--------------|
| alpha           | alpha_reverse    | I18n title    |
| id              | id_reverse       | id            |
| manual          | manual_reverse   | position      |
| ref             | ref_reverse      | ref           |
