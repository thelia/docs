---
title: Base Specific Module
---
This class is abstract

## Arguments {#bsm-arguments}

| Argument     | Description                                                                    | Default | Example                    |
|--------------|:-------------------------------------------------------------------------------|:-------:|:---------------------------|
| code         | A module code.                                                                 |         | code='Atos'                |
| exclude      | A list of module IDs to exclude from the results                               |         | exclude="12,21"            |
| exclude_code | A list of module codes to exclude from the results                             |         | exclude_code="Cheque,Atos" |
| id           | A module id.                                                                   |         | module=4                   |
| order        | A list of values see [sorting possible values](#bsm-order-possible-values)     | manual  | order=" id_reverse"        |

Plus the [global arguments](./global_arguments) and the [global I18n](./global_arguments_I18n.md)

## Order possible values {#bsm-order-possible-values}

[Arguments](#bsm-arguments)

| Ascending value | Descending value | Sorted fields |
|-----------------|------------------|:--------------|
| alpha           | alpha_reverse    | title         |
| id              | id_reverse       | id            |
| manual          | manual_reverse   | position      |
