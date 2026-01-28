---
title: State
---

State loop lists states.  
`{loop type="state" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#sale-arguments}

| Argument | Description                                                                                | Default | Example                        |
|----------|:-------------------------------------------------------------------------------------------|:-------:|:-------------------------------|
| country  | A single or a list of country ids.                                                         |         | country="10,9", country: "500" |
| exclude  | A single or a list of state ids to exclude from the results.                               |         | exclude="2", exclude="1,4,7"   |
| id       | A single or a list of state ids.                                                           |         | id="2", id="1,4,7"             |
| order    | A list of values see [sorting possible values](#sale-order-possible-values)                |   id    | order="alpha_reverse"          |
| visible  | A boolean value to return visible or not visible states (possible values : yes, no or *).  |   yes   | visible="no"                   |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable       | Value                                          |
|:---------------|:-----------------------------------------------|
| $COUNTRY       | the country the state belongs                  |
| $ID            | the state id                                   |
| $ISOCODE       | the state ISO code                             |
| $IS_TRANSLATED | check if the state is translated               |
| $LOCALE        | The locale used for this research              |
| $TITLE         | the state title                                |
| $VISIBLE       | true if the state is visible. False otherwise  |

Plus the [global outputs](./global_outputs)

## Order possible values {#sale-order-possible-values}

[Arguments](#sale-arguments)

| Ascending value | Descending value | Sorted fields       |
|-----------------|------------------|:--------------------|
| alpha           | alpha_reverse    | title               |
| id              | id_reverse       | id                  |
| random          |                  | pseudo-random order |
| visible         | visible_reverse  | visibility          |
