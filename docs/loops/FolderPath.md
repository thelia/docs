---
title: Folder path
---

Folder path loop provides the path through the catalog to a given folder. For example if we have an "alpha" folder standing in an "alpha_father" folder which itseflf belong to "root" folder. Folder path loop for folder "alpha" will return "root" then "alpha_father" then "alpha".  
`{loop type="folder-path" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#folder-arguments}

| Argument | Description                                 | Default | Example             |
|----------|:--------------------------------------------|:-------:|:--------------------|
| depth    | The max depth                               |         | example : depth="5" |
| folder * | A single folder id.                         |         | folder="2"          |
| visible  | Whatever we consider hidden folder or not.  |  true   | visible="false"     |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable | Value            |
|:---------|:-----------------|
| $ID      | the folder id    |
| $LOCALE  | the locale       |
| $TITLE   | the folder title |
| $URL     | the folder URL   |

Plus the [global outputs](./global_outputs)
