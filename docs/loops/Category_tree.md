---
title: Category tree
---

Category tree loop, to get a category tree from a given category to a given depth.  
`{loop type="category-tree" name="the-loop-name" [argument="value"], [...]}`

## Arguments

| Argument         | Description                                                                                            | Default | Example         |
| ---------------- |:------------------------------------------------------------------------------------------------------ | :-----: | :---------------|
| category *       | A single category id.                                                                                  |         | category="2"    |
| depth            | The max depth                                                                                          |         | depth="5"       |
| exclude          | A single or a list of category ids to exclude for result.                                              |         | exclude="5,72"  |
| need_count_child | A boolean which indicates whether the number of children in each category should be taken into account |         |                 |
| order            | A list of values <br/> [Expected values](#category-order-possible-values)                              | position| order="random"  |
| visible          | Whatever we consider hidden category or not.                                                           | true    |                 |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable            | Value                                                   |
| :------------------ | :------------------------------------------------------ |
| $CHILD_COUNT        | The number of direct children of a category in the tree |
| $ID                 | the category id                                         |
| $LEVEL              | The depth of the category in the tree                   |
| $PARENT             | the parent category                                     |
| $PREV_LEVEL         | The depth of the direct parent category in the tree.    |
| $TITLE              |  the category title                                     |
| $URL                |  the category URL                                       |
| $VISIBLE            |  whatever the category is visible or not                |

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
