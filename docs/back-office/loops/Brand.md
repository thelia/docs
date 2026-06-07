---
title: Brand
---

Brand loop lists brands defined in your shop.  
`{loop type="brand" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#brand-arguments}

| Argument             | Description                                                                                          | Default         | Example                   |
| -------------------- |:-----------------------------------------------------------------------------------------------------| :-------------: | :-------------------------|
| current              | A boolean value which allows either to exclude current brand from results, or match only this brand  |                 | current="yes"             |
| exclude              | A list of brand IDs to exclude from selection when running the loop                                  |                 |                           |
| id                   | A single or a list of brand ids.                                                                     |                 |  id="2", id="1,4,7"       |
| order                | A list of values <br/> [Expected values](#brand-order-possible-values)                               | alpha           | order="random"            |
| product              | A single product id.                                                                                 |                 | product="2"               |
| title                | A title string                                                                                       |                 | title="foo"               |
| visible              | A boolean value.                                                                                     | yes             | visible="no"              |
| with_prev_next_info  | A boolean. If set to true, $PREVIOUS and $NEXT output arguments are available.                       | false           | with_prev_next_info="yes" |

Plus the [global arguments](./global_arguments) and [search arguments](./searchArguments.md)

## Outputs

| Variable                 | Value                                                                                | If with_prev_next_info='true' | If with_prev_next_info='false' |
| :----------------------- | :----------------------------------------------------------------------------------- |:-----------------------------:|:------------------------------:|
| $CHAPO                   | the brand chapo                                                                      |           ✅                   |          ✅                    |
| $DESCRIPTION             | the brand description                                                                |           ✅                   |          ✅                    |
| $HAS_NEXT                | true if a brand exists after this one, following brands positions.                   |           ✅                   |          🚫                    |
| $HAS_PREVIOUS            | true if a brand exists before this one following brands positions                    |           ✅                   |          🚫                    |
| $ID                      | the brand id                                                                         |           ✅                   |          ✅                    |
| $IS_TRANSLATED           | check if the brand is translated                                                     |           ✅                   |          ✅                    |
| $LOCALE                  | The locale used for this research                                                    |           ✅                   |          ✅                    |
| $LOGO_IMAGE_ID           | ID of the brand logo image, among the brand images                                   |           ✅                   |          ✅                    |
| $META_DESCRIPTION        | the brand meta description                                                           |           ✅                   |          ✅                    |
| $META_KEYWORDS           | the brand meta keywords                                                              |           ✅                   |          ✅                    |
| $META_TITLE              | the brand meta title                                                                 |           ✅                   |          ✅                    |
| $NEXT                    | The ID of brand after this one, following brands positions, or null if none exists   |           ✅                   |          🚫                    |
| $POSITION                | the brand position                                                                   |           ✅                   |          ✅                    |
| $POSTSCRIPTUM            | the brand postscriptum                                                               |           ✅                   |          ✅                    |
| $PREVIOUS                | The ID of brand before this one, following brands positions, or null if none exists. |           ✅                   |          🚫                    |
| $TITLE                   | the brand title                                                                      |           ✅                   |          ✅                    |
| $URL                     | the brand URL                                                                        |           ✅                   |          ✅                    |
| $VISIBLE                 | true if the product is visible or not, false otherwise                               |           ✅                   |          ✅                    |

Plus the [global outputs](./global_outputs)

## Order possible values {#brand-order-possible-values}

[Arguments](#brand-arguments)

| Ascending value | Descending value  | Sorted fields                 |
|-----------------|-------------------|:------------------------------|
| alpha           | alpha-reverse     | title                         |
| created         | created-reverse   | date of brand creation        |
| id              | id-reverse        | ID order                      |
| manual          | manual-reverse    | order position                |
| random          |                   |                               |
| updated         | updated-reverse   | order on date of brand update |
| visible         | visible-reverse   | visible                       |
