---
title: Config
---

Config loop, to access configuration variables  
`{loop type="config" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#conf-arguments}

| Argument      | Description                                                           | Default | Example                      |
| ------------- |:----------------------------------------------------------------------| :-----: | :----------------------------|
| exclude       | A single or a list of config ids.                                     |         | exclude="2", exclude="1,4,7" |
| hidden        | A boolean value.                                                      |         | hidden="no"                  |
| id            | A single of config id.                                                |         | id="2"                       |
| order         | A list of values <br/> [Expected values](#conf-order-possible-values) | name    | order="id_reverse"           |
| secured       | A boolean value.                                                      |         |  secured="no"                |
| variable      | Name of a variable config                                             |         |  variable="rewriting_enable" |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable                                                                  | Value                                     |
| :-----------------------------------------------------------------------  | :---------------------------------------- |
| $CHAPO                                                                    | The config variable chapo                 |
| $DESCRIPTION                                                              | The config variable description           |
| $HIDDEN                                                                   | check if the config variable is hidden    |
| $ID                                                                       | the config variable id                    |
| $IS_OVERRIDDEN_IN_ENV                                                     | check if the config is overridden         |
| $IS_TRANSLATED                                                            | check if the config is translated         |
| $LOCALE                                                                   | The locale used for this research         |
| $NAME                                                                     | The config variable name                  |
| $POSTSCRIPTUM                                                             | The config variable postscriptum          |
| $SECURED                                                                  | Check if the config variable is secured   |
| $TITLE                                                                    | The config variable title                 |
| $VALUE                                                                    | The config variable value                 |

Plus the [global outputs](./global_outputs)

## Order possible values {#conf-order-possible-values}

[Arguments](#conf-arguments)

| Ascending value                  | Descending value  | Sorted fields |
|----------------------------------|-------------------|:--------------|
| id                               | id_reverse        | ID            |
| name                             | name_reverse      | Name          |
| title                            | title_reverse     | Title         |
| value                            | value_reverse     | Value         |
