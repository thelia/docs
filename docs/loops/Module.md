---
title: Module
---

The module loop retrieve module informations  
`{loop type="module" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#module-arguments}

| Argument       | Description                                                                                                                                    | Default | Example                                    |
|----------------|:-----------------------------------------------------------------------------------------------------------------------------------------------|:-------:|:-------------------------------------------|
| active         | A boolean value.                                                                                                                               |    *    | active="no"                                |
| area           | A single or a list of area ids. Only modules assigned to this area will be returned.                                                           |         | area="5", profile="3,2,17"                 |
| code           | Module code                                                                                                                                    |         | code="Foo"                                 |
| exclude        | A single or a list of module ids to exclude.                                                                                                   |         | exclude="2", exclude="1,4,7"               |
| hidden         | A boolean value.                                                                                                                               |    *    | hidden="yes"                               |
| id             | A single or a list of module ids.                                                                                                              |         | id="2", id="1,4,7"                         |
| module_caegory | A single or a list of category   ids.                                                                                                          |         | module_category="classic,delivery,payment" |
| module_type    | Module type (classic, payment or delivery) <br/> Expected values : <br/> 1 : classic module <br/> 2 : delivery module <br/> 3 : payment module |         | module_type="1"                            |
| order          | A list of values see [sorting possible values](#module-order-possible-values)                                                                  | manual  | order="alpha_reverse"                      |
| profile        | A single or a list of profile ids.                                                                                                             |         | profile="2", profile="1,4,7"               |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable       | Value                                   |
|:---------------|:----------------------------------------|
| $ACTIVE        | check if the module is activated or not |
| $CATEGORY      | the module category                     |
| $CHAPO         | the module chapo                        |
| $CLASS         | The full namespace for the module class |
| $CODE          | The module code                         |
| $DESCRIPTION   | the module description                  |
| $EXISTS        | return true if the module exists        |
| $HIDDEN        | check if the module is hidden           |
| $ID            | the module ID                           |
| $IS_TRANSLATED | return true if the module is translated |
| $LOCALE        | The locale used for this research       |
| $MANDATORY     | check if the module is mandatory        |
| $POSITION      | the position of this module             |
| $POSTSCRIPTUM  | the module postscriptum                 |
| $TITLE         | the module title                        |
| $TYPE          | The module type                         |
| $VERSION       | The module version                      |

Plus the [global outputs](./global_outputs)

## Order possible values {#module-order-possible-values}

[Arguments](#module-arguments)

| Ascending value | Descending value | Sorted fields  |
|-----------------|------------------|:---------------|
| code            | code_reverse     | code           |
| enabled         | enabled_reverse  | enabled status |
| id              | id_reverse       | Id             |
| manual          | manual_reverse   | position       |
| title           | title_reverse    | title          |
| type            | type_reverse     | type           |
