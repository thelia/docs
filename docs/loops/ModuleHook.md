---
title: Module Hook
---

Module hook loop lists all defined module hooks.
`{loop type="hook" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#area-arguments}

| Argument        | Description                                                                 | Default | Example              |
|-----------------|:----------------------------------------------------------------------------|:-------:|:---------------------|
| active          | Check if the hook is active                                                 |   *     | active="1"           |
| exclude         | A single or a list of hook IDs to exclude                                   |         | exclude="1,2,3"      |
| hook            | The hook name                                                               |         | hook="displayHeader" |
| hook_active     | Check if the hook is active                                                 |   *     | hook_active="1"      |
| id              | The hook ID                                                                 |         | id="2"               |
| module          | The module name                                                             |         | module="blockcart"   |
| module_active   | Check if the module is active                                               |   *     | module_active="1"    |
| order           | a list of values see [sorting possible values](#area-order-possible-values) | manual  | order="id"           |

Plus the [global arguments](./global_arguments)

## Outputs {#area-outputs}

| Variable        | Value               |
|:----------------|:--------------------|
| $ACTIVE         | The hook status     |
| $CLASSNAME      | The hook class name |
| $HOOK_ACTIVE    | The hook status     |
| $HOOK_ID        | The hook ID         |
| $ID             | The hook module id  |
| $METHOD         | The hook method     |
| $MODULE_ACTIVE  | The module status   |
| $MODULE_CODE    | The module code     |
| $MODULE_ID      | The module ID       |
| $MODULE_TITLE   | The module title    |
| $POSITION       | The hook position   |
| $TEMPLATES      | The hook templates  |

Plus the [global outputs](./global_outputs)

## Order possible values {#area-order-possible-values}

[Arguments](#area-arguments)

| Ascending value | Descending value | Sorted fields |
|-----------------|------------------|:--------------|
| enabled         | enabled_reverse  | active        |
| hook            | hook_reverse     | hook          |
| id              | id_reverse       | id            |
| manual          | manual_reverse   | position      |
