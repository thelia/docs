---
title: Category tree
---

Category tree loop, to get a category tree from a given category to a given depth.      
`{loop type="category-tree" name="the-loop-name" [argument="value"], [...]}`

## Arguments 

| Argument    | Description                                               | Default | Example         |
| ----------- |:----------------------------------------------------------| :-----: | :---------------|
| category *  | A single category id.                                     |         | category="2"    |
| depth       | The max depth                                             |         | depth="5"       |
| exclude     | A single or a list of category ids to exclude for result. |         | exclude="5,72"  |
| need_count_child     |                                                  |         |                 |
| order       |                                                           | position|                 |
| visible     | Whatever we consider hidden category or not.              | true    |                 |

Plus the [global arguments](./global_arguments) and the [global I18n](./global_arguments_I18n.md)

## Outputs

| Variable            | Value                                    |
| :------------------ | :--------------------------------------- |
| $CHILD_COUNT	      |                                          |
| $ID	              | the category id                          |
| $LEVEL	          |                                          |
| $PARENT	          | the parent category                      |
| $PREV_LEVEL	      |                                          |
| $TITLE	          |  the category title                      |
| $URL	              |  the category URL                        |
| $VISIBLE	          |  whatever the category is visible or not |

Plus the [global outputs](./global_outputs)

## Examples

I want to display a select list with all visible categories.
```smarty
<select name="category">
    {loop name="categories-tree" type="category-tree" category="0"}
        <option value="{$ID}">{"-"|str_repeat:$LEVEL} {$TITLE} {if $CHILD_COUNT != 0}({$CHILD_COUNT}){/if}</option>
    {/loop}
</select>
```

## Order possible values {#brand-order-possible-values}
[Arguments](#brand-arguments)

| Ascending value | Descending value  | Sorted fields                 |
|-----------------|-------------------|:------------------------------|
| alpha           | alpha_reverse     |                               |
| id              | id_reverse        |                               |
| position        | position_reverse  |                               |
