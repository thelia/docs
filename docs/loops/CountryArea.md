---
title: Country Area
---

Country area loop lists.

## Arguments {#country-arguments}

| Argument     | Description                                                                                  | Default | Example                                    |
|--------------|:-------------------------------------------------------------------------------------------- |:-------:|:-------------------------------------------|
| area         | A single or a list of area ids.                                                              |         | area="10,9", area: "500"                   |
| country      | A single or a list of country ids.                                                           |         | country="2", country="1,4,7"               |
| id           | A single or a list of country ids.                                                           |         | id="2", id="1,4,7"                         |
| order        | A list of values <br/> [Expected values](#content-order-possible-values)                     | id      |  order="alpha_reverse"                     |
| states       | A boolean value to return countries that have states or not (possible values : yes, no or *) |         |  states="no"                               |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable         | Value                                             |
|:-----------------|:--------------------------------------------------|
| $AREA_ID         | The ID of the area corresponding to the country.  |
| $COUNTRY_ID      | The ID of the country.                            |
| $ID              | The ID of the country area.                       |
| $STATE_ID        | The ID of the state corresponding to the country. |

Plus the [global outputs](./global_outputs)

## Order possible values {#country-order-possible-values}

[Arguments](#country-arguments)

| Ascending value | Descending value | Sorted fields        |
|-----------------|------------------|:---------------------|
| area            | area-reverse     | ID of the area       |
| country         | country_reverse  | ID of the country    |
| id              | id_reverse       | ID                   |
| state           | state_reverse    | ID of the state      |
