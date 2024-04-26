---
title: Generic
---

Generic loop can return any table present in your database and configured with propel. This loop is often useful on your own module table because most of the Thelia table already have dedicated loop.  
`{loop type="generic" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#area-arguments}

| Argument   | Description                                                                                                                     |            Default             | Example                             |
|------------|:--------------------------------------------------------------------------------------------------------------------------------|:------------------------------:|:------------------------------------|
| table_name*| The table name you want query                                                                                                   |                                |                                     |
| filters    | A single or a list of filters to apply on columns in this format <code>column_name:value1,value2&#124;other_column:value</code> |                                | filters="id:1,3&#124;visible:1"     |
| order      | A single or a list of orders to apply on columns  in this format <code>column_name:DESC&#124;other_column:ASC</code>            |                                | order="id:DESC&#124;created_at:ASC" |
| locale     | The locale for translated columns                                                                                               | The current locale for session |                                     |
| limit      | The number of rows to return                                                                                                    |                                | limit="10"                          |

Plus the [global arguments](./global_arguments)

## Outputs

This loop will output every column of the selected table and the columns of i18n table associated if the table is translatable. The fields are in UPPERCASE.

Plus the [global outputs](./global_outputs)

## Examples

I want to display all products visible and not virtual sorted by creation date (just for example, normally it is better to use a dedicated product loop)

```smarty
<ul>
    {loop type="generic" name="my_product_loop" table_name="product" filters="visible:1|virtual:0" orders="created_at:DESC"}
        <li>{$ID} {$TITLE} ({$REF})</li>
    {/loop}
</ul>
```
