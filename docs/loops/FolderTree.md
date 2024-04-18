---
title: Folder tree
---

Folder tree loop, to get a folder tree from a given folder to a given depth.  
`{loop type="folder-tree" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#folder-arguments}

| Argument   | Description                                             | Default | Example             |
|------------|:--------------------------------------------------------|:-------:|:--------------------|
| depth      | The max depth                                           |         | example : depth="5" |
| exclude    | A single or a list of folder ids to exclude for result. |         | exclude="5,72"      |
| folder *   | A single folder id.                                     |         | folder="2"          |
| visible    | Whatever we consider hidden folder or not.              |  true   | visible="false"     |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable     | Value                                  |
|:-------------|:---------------------------------------|
| $CHILD_COUNT | the number of child folders            |
| $ID          | the folder id                          |
| $LEVEL       | the folder level                       |
| $PARENT      | the parent folder                      |
| $TITLE       | the folder title                       |
| $URL         | the folder URL                         |
| $VISIBLE     | whatever the folder is visible or not  |

Plus the [global outputs](./global_outputs)
