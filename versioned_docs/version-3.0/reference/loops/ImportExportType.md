---
title: Import Export Type
---

Import export type loop lists all defined import export types.  

## Arguments {#area-arguments}

| Argument | Description    | Default | Example                |
|----------|:---------------|:-------:|:-----------------------|
| category | category name  |         | category="my_category" |
| id       | the type ID    |         | id="2"                 |
| order    | Sorting order  |         | order="id"             |
| ref      | The ref column |         | ref="reference"        |

Plus the [global arguments](./global_arguments)

## Outputs {#area-outputs}

| Variable        | Value                    |
|:----------------|:-------------------------|
| CATEGORY_ID     | The category ID          |
| DESCRIPTION     | The category description |
| HANDLE_CLASS    | The handle class         |
| ID              | The type ID              |
| POSITION        | The category position    |
| REF             | The ref column           |
| TITLE           | The category title       |
| URL             | The category URL         |

Plus the [global outputs](./global_outputs)

## Order possible values

[Arguments](#area-arguments)

| Ascending value | Descending value | Sorted fields |
|-----------------|------------------|:--------------|
| alpha           | alpha_reverse    | I18n title    |
| id              | id_reverse       | id            |
| manual          | manual_reverse   | position      |
| ref             | ref_reverse      | ref           |
