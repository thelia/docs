---
title: Country
---

Country loop lists countries.  
`{loop type="country" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#country-arguments}

| Argument     | Description                                                                                        | Default | Example                                   |
|--------------|:---------------------------------------------------------------------------------------------------|:-------:|:------------------------------------------|
| area         | A single or a list of area ids.                                                                    |         | area="10,9", area: "500"                  |
| exclude      | A single or a list of country ids to exclude from the results.                                     |         | exclude="2", exclude="1,4,7"              |
| exclude_area | A single or list of area IDs. Countries which belongs to these areas are excluded from the results |         | exclude_area="7", exclude_area="3,102,14" |
| has_states   | A boolean value to return countries that have states or not (possible values : yes, no or *).      |    *    | has_states="no"                           |
| id           | A single or a list of country ids.                                                                 |         | id="2", id="1,4,7"                        |
| order        | A list of values see [sorting possible values](#country-order-possible-values)                     |   id    | order="alpha_reverse"                     |
| visible      | A boolean value to return visible or not visible countries (possible values : yes, no or *).       |   yes   | visible="no"                              |
| with_area    | A boolean value to return either countries whose area is defined either all the others.            |         | with_area="true"                          |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable         | Value                                                                                              |
|:-----------------|:---------------------------------------------------------------------------------------------------|
| $CHAPO           | the country chapo                                                                                  |
| $DESCRIPTION     | the country description                                                                            |
| $HAS_STATES      | 1 if the country has states, 0 otherwise                                                           |
| $ID              | the country id                                                                                     |
| $ISOALPHA2       | the ISO 2 characters country code                                                                  |
| $ISOALPHA3       | the ISO 3 characters country code                                                                  |
| $ISOCODE         | the ISO numeric country code                                                                       |
| $IS_DEFAULT      | 1 if the country is the default one, 0 otherwise                                                   |
| $IS_SHOP_COUNTRY | 1 if the country is the shop country, 0 otherwise                                                  |
| $IS_TRANSLATED   | check if the country is translated                                                                 |
| $LOCALE          | The locale used for this research                                                                  |
| $NEED_ZIP_CODE   | 1 if the country needs a zip code for address, 0 otherwise                                         |
| $POSTSCRIPTUM    | the country postscriptum                                                                           |
| $TITLE           | the country title                                                                                  |
| $VISIBLE         | true if the country is visible. False otherwise                                                    |
| $ZIP_CODE_FORMAT | The format of the zip code for this country where N is a digit, L a letter and C a state ISO code. |

Plus the [global outputs](./global_outputs)

## Order possible values {#country-order-possible-values}

[Arguments](#country-arguments)

| Ascending value | Descending value | Sorted fields                    |
|-----------------|------------------|:---------------------------------|
| alpha           | alpha-reverse    | title                            |
| id              | id_reverse       | id                               |
| random          |                  | countries in pseudo-random order |
| visible         | visible_reverse  | visibility                       |
