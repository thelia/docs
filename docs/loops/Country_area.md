---
title: Country Area
---

Country area loop lists areas.

## Arguments {#country-arguments}

| Argument     | Description                                    | Default | Example                                    |
|--------------|:-----------------------------------------------|:-------:|:-------------------------------------------|
| area         |                                                |         |                                            |
| country      |                                                |         |                                            |
| id           |                                                |         |                                            |
| order        |                                                | id      |                                            |
| states       |                                                |         |                                            |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable         | Value                                                                                             |
|:-----------------|:--------------------------------------------------------------------------------------------------|
| $AREA_ID         |                                                                                                   |
| $COUNTRY_ID      |                                                                                                   |
| $ID              |                                                                                                   |
| $STATE_ID        |                                                                                                   |

Plus the [global outputs](./global_outputs)

## Order possible values {#country-order-possible-values}

[Arguments](#country-arguments)

| Ascending value | Descending value | Sorted fields                    |
|-----------------|------------------|:---------------------------------|
| area            | area-reverse     |                                  |
| country         | country_reverse  |                                  |
| id              | id_reverse       |                                  |
| state           | state_reverse    |                                  |
