---
title: Category path
---

Category path loop provides the path through the catalog to a given category. For example if we have an "alpha" category standing in an "alpha_father" category which itseflf belong to "root" category. Category path loop for category "alpha" will return "root" then "alpha_father" then "alpha".  
`{loop type="category-path" name="the-loop-name" [argument="value"], [...]}`

## Arguments

| Argument | Description | Default | Example |
| ------------- |:-------------| :-------------: | :-------------|
| category *    | A single category id.                        |      | category="2"    |
| depth         | The max depth                                |      | depth="5"       |
| visible       | Whatever we consider hidden category or not. | true | visible="false" |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable       | Value               |
| :------------- | :------------------ |
| $ID            | the category id     |
| $LOCALE        |                     |
| $PARENT        | the parent category |
| $TITLE         | the category title  |
| $URL           | the category URL    |

Plus the [global outputs](./global_outputs)

## Examples

I want to display a breadcrumb with parent categories.

```smarty
<ul class="breadcrumb">
    {loop name="category_path" type="category-path" category="{category attr="id"}"}
    <li>
    {if $LOOP_COUNT == $LOOP_TOTAL}
        <span class="current">{$TITLE}</span>
    {else}
        <a href="{$URL}">{$TITLE}</a>
    {/if}
    </li>
    {/loop}
</ul>
```
