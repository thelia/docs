---
title: Area
---

Area loop returns shipping zones information.  
`{loop type="area" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#area-arguments}

| Argument             | Description                                                                                            | Default | Example            |
| ---------------------|:-------------------------------------------------------------------------------------------------------| :------ | :----------------- |
| country              | A list of country IDs. Only zones including these countries will be returned.                          |         |                    |
| GroupByCountryArea   | A boolean that specifies whether the results should be grouped by country and geographic area.         |         |                    |
| id                   | A single or a list of shipping zones ids.                                                              |         | id="2", id="1,4,7" |
| module_id            | A comma separated list of module IDs. If not empty, only zones for the specified modules are returned. |         |                    |
| order                | A list of values <br/> [Expected values](#area-order-possible-values)                                  | name    | order="alpha"      |
| unassigned           | If true, returns shipping zones not assigned to any delivery module.                                   |         |                    |
| with_zone            | A module ID. Returns shipping zones which are assigned to this module ID                               |         |                    |
| without_zone         | A module ID. Returns shipping zones which are not assigned to this module ID                           |         |                    |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable   | Value                                               |
| :--------  | :---------------------------------------------------|
| $ID        | the shipping zone id                                |
| $NAME      | the accessory name                                  |
| $POSTAGE   | shipping costs associated with each geographic are  |

Plus the [global outputs](./global_outputs)

## Order possible values {#area-order-possible-values}

[Arguments](#area-arguments)

| Ascending value | Descending value  | Sorted fields |
|-----------------|-------------------|:--------------|
| alpha           |                   |  title        |
| id              | id-reverse        |  ID order     |
| name            | name-reverse      |  name         |
