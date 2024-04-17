---
title: Folder
---

Folder loop lists folders from your shop.  
`{loop type="folder" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#folder-arguments}

| Argument              | Description                                                                                                                                                                      |              Default              | Example                      |
|-----------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------------------------:|:-----------------------------|
| content               | A single content id.                                                                                                                                                             |                                   | content="3"                  |
| content_count_visible | This parameter controls how content is counted. If 'yes' (the default) only visible contents are counted, 'no': only hidden contents are counted, '*': all contents are counted. |                yes                | content_count_visible="*"    |
| current               | A boolean value which allows either to exclude current folder from results either to match only this folder                                                                      |                                   | current="yes"                |
| exclude               | A single or a list of folder ids.                                                                                                                                                |                                   | exclude="2", exclude="1,4,7" |
| id                    | A single or a list of folder ids.                                                                                                                                                |                                   | id="2", id="1,4,7"           |
| need_content_count    | A boolean. If set to true, the loop will return the number of contents in each folder and its sub-folders                                                                        | true (for backward-compatibility) | need_content_count="yes"     |
| need_count_child      | A boolean. If set to true, the loop will return the number of sub-folders of each folder                                                                                         | true (for backward-compatibility) | need_count_child="yes"       |
| not_empty             | (**not implemented yet**) A boolean value. If true, only the folders which contains at leat a visible content (either directly or trough a subfolder) are returned               |                no                 | not_empty="yes"              |
| order                 | A list of values see [sorting possible values](#folder-order-possible-values)                                                                                                    |              manual               | order="random"               |
| parent                | A single folder id.                                                                                                                                                              |                                   | folder="3"                   |
| title                 |                                                                                                                                                                                  |                                   |                              |
| visible               | A boolean value.                                                                                                                                                                 |                yes                | visible="no"                 |
| with_prev_next_info   | A boolean. If set to true, $PREVIOUS and $NEXT output arguments are available.                                                                                                   |               false               | with_prev_next_info="yes"    |

Plus the [global arguments](./global_arguments), the [global I18n](./global_arguments_I18n.md) and [search arguments](./search_arguments)

## Outputs

| Variable          | Value                                                                                                               | If with_prev_next_info='true' | If with_prev_next_info='false' | other                                                                          |
|:------------------|:--------------------------------------------------------------------------------------------------------------------|:-----------------------------:|:------------------------------:|--------------------------------------------------------------------------------|
| $CHAPO            | the folder chapo                                                                                                    |               ✅               |               ✅                |                                                                               |
| $CHILD_COUNT      | Number of subfolders contained by the current forlder.                                                              |               ✅               |               ✅                | Only available if <strong>need_count_child</strong> parameter is set to true  |
| $CONTENT_COUNT    | the number of visible contents for this folder.                                                                     |               ✅               |               ✅                | Only available if <strong>need_content_count</strong> parameter is set to true|
| $DESCRIPTION      | the folder description                                                                                              |               ✅               |               ✅                |                                                                               |
| $HAS_NEXT         | true if a folder exists after this one in the current parent folder, following folders positions.                   |               ✅               |               🚫                |                                                                               |
| $HAS_PREVIOUS     | true if a folder exists before this one in the current parent folder, following folders positions.                  |               ✅               |               🚫                |                                                                               |
| $ID               | the folder id                                                                                                       |               ✅               |               ✅                |                                                                               |
| $IS_TRANSLATED    | check if the folder is translated                                                                                   |               ✅               |               ✅                |                                                                               |
| $LOCALE           | The locale used for this research                                                                                   |               ✅               |               ✅                |                                                                               |
| $META_DESCRIPTION | the folder meta description                                                                                         |               ✅               |               ✅                |                                                                               |
| $META_KEYWORDS    | the folder meta keywords                                                                                            |               ✅               |               ✅                |                                                                               |
| $META_TITLE       | the folder meta title                                                                                               |               ✅               |               ✅                |                                                                               |
| $NEXT             | The ID of folder after this one in the current parent folder, following folders positions, or null if none exists.  |               ✅               |               🚫                |                                                                               |
| $PARENT           | the parent folder                                                                                                   |               ✅               |               ✅                |                                                                               |
| $POSITION         | the folder position                                                                                                 |               ✅               |               ✅                |                                                                               |
| $POSTSCRIPTUM     | the folder postscriptum                                                                                             |               ✅               |               ✅                |                                                                               |
| $PREVIOUS         | The ID of folder before this one in the current parent folder, following folders positions, or null if none exists. |               ✅               |               🚫                |                                                                               |
| $ROOT             |                                                                                                                     |               ✅               |               ✅                |                                                                               |
| $TITLE            | the folder title                                                                                                    |               ✅               |               ✅                |                                                                               |
| $URL              | the folder URL                                                                                                      |               ✅               |               ✅                |                                                                               |
| $VISIBLE          | the folder visibility                                                                                               |               ✅               |               ✅                |                                                                               |

Plus the [global outputs](./global_outputs)

## Order possible values {#folder-order-possible-values}

[Arguments](#folder-arguments)

| Ascending value | Descending value | Sorted fields            |
|-----------------|------------------|:-------------------------|
| alpha           | alpha_reverse    | title                    |
| created         | created_reverse  | date of content creation |
| id              | id_reverse       | id                       |
| manual          | manual_reverse   | position                 |
| random          |                  | folders in random order  |
| updated         | updated_reverse  | date of content update   |
| visible         | visible_reverse  | items                    |
