---
title: Feature availability
---

Feature availability loop lists feature availabilities.  
`{loop type="feature-availability" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#feature-arguments}

| Argument | Description                                                                    | Default | Example               |
|----------|:-------------------------------------------------------------------------------|:-------:|:----------------------|
| exclude  | A single or a list of feature availability ids to exclude.                     |         | exclude="456,123"     |
| feature  | A single or a list of feature ids.                                             |         | feature="2,5"         |
| id       | A single or a list of feature availability ids.                                |         | id="2", id="1,4,7"    |
| order    | A list of values see [sorting possible values](#feature-order-possible-values) | manual  | order="alpha_reverse" |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable       | Value                                           |
|:---------------|:------------------------------------------------|
| $CHAPO         | the feature availability chapo                  |
| $DESCRIPTION   | the feature availability description            |
| $FEATURE_ID    | The ID ot the related feature                   |
| $ID            | the feature availability id                     |
| $IS_TRANSLATED | check if the feature availability is translated |
| $LOCALE        | The locale used for this research               |
| $POSITION      | the feature availability position               |
| $POSTSCRIPTUM  | the feature availability postscriptum           |
| $TITLE         | the feature availability title                  |

Plus the [global outputs](./global_outputs)

## Order possible values {#feature-order-possible-values}

[Arguments](#feature-arguments)

| Ascending value | Descending value              | Sorted fields |
|-----------------|-------------------------------|:--------------|
| alpha           | alpha-reverse , alpha_reverse | title         |
| id              | id_reverse                    | id            |
| manual          | manual_reverse                | position      |
