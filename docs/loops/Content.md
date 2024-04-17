---
title: Content
---

Content loop lists contents from your shop.  
`{loop type="content" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#content-arguments}

| Argument | Description | Default | Example |
| ------------- |:-------------| :-------------: | :-------------|
| current      | A boolean value which allows either to exclude current content from results either to match only this content  | |  current="yes" |
| current_folder      | A boolean value which allows either to exclude current folder contents from results either to match only current folder contents. If a content is in multiple folders whose one is current it will not be excluded if current_folder="false" but will be included if current_folder="yes"  | |   current_folder="yes" |
| depth      | A positive integer value which precise how many subfolder levels will be browse. Will not be consider if folder parameter is not set.  | 1 |   depth="2" |
| exclude      | A single or a list of content ids.  |  |   exclude="2", exclude="1,4,7" |
| exclude_folder      | A single or a list of folder ids. If a content is in multiple folders which are not all excluded it will not be excluded.  |  |   exclude_folder="2", exclude_folder="1,4,7" |
| folder      | A single or a list of folder ids.  |  |   folder="3", folder="2,5,8" |
| folder_default      | A single or a list of default folder ids allowing to retrieve all content having this parameter as default folder.  |  |   folder_default="2", folder_default="1,4,7" |
| id      | A single or a list of content ids.  |  |  id="2", id="1,4,7" |
| order       | A list of values <br/> [Expected values](#content-order-possible-values) | alpha | order="random" |
| title       | A title string |  | title="foo" |
| visible       | A boolean value. | yes | visible="no" |
| with_prev_next_info       | A boolean. If set to true, $PREVIOUS and $NEXT output arguments are available. | false | with_prev_next_info="yes" |

Plus the [global arguments](./global_arguments), the [global I18n](./global_arguments_I18n.md) and [search arguments](./search_arguments)

## Outputs

| Variable                                                                      | Value                                                                                                          | If with_prev_next_info='true' | If with_prev_next_info='false' |
| :---------------------------------------------------------------------------  | :------------------------------------------------------------------------------------------------------------- | :---------------------------: | :----------------------------: |
| $CHAPO                                                                        | the content chapo                                                                                              | ✅                             | ✅                             |
| $DEFAULT_FOLDER                                                               | the default folder id for the current content                                                                  | ✅                             | ✅                             |
| $DESCRIPTION                                                                  | the content description                                                                                        | ✅                             | ✅                             |
| $HAS_NEXT                                                                     | true if a content exists after this one in the current folder, following contents positions.                   | ✅                             | 🚫                             |
| $HAS_PREVIOUS                                                                 | true if a content exists before this one in the current folder, following contents positions.                  | ✅                             | 🚫                             |
| $ID                                                                           | the content id                                                                                                 | ✅                             | ✅                             |
| $IS_TRANSLATED                                                                | check if the content is translated                                                                             | ✅                             | ✅                             |
| $LOCALE                                                                       | The locale used for this research                                                                              | ✅                             | ✅                             |
| $META_DESCRIPTION                                                             | the content meta description                                                                                   | ✅                             | ✅                             |
| $META_KEYWORDS                                                                | the content meta keywords                                                                                      | ✅                             | ✅                             |
| $META_TITLE                                                                   | the content meta title                                                                                         | ✅                             | ✅                             |
| $NEXT                                                                         | The ID of content after this one in the current folder, following contents positions, or null if none exists.  | ✅                             | 🚫                             |
| $POSITION                                                                     | the content position                                                                                           | ✅                             | ✅                             |
| $POSTSCRIPTUM                                                                 | the content postscriptum                                                                                       | ✅                             | ✅                             |
| $PREVIOUS                                                                     | The ID of content before this one in the current folder, following contents positions, or null if none exists. | ✅                             | 🚫                             |
| $TITLE                                                                        | the content title                                                                                              | ✅                             | ✅                             |
| $URL                                                                          | the content URL                                                                                                | ✅                             | ✅                             |

Plus the [global outputs](./global_outputs)

## Order possible values {#content-order-possible-values}

[Arguments](#content-arguments)

| Ascending value      | Descending value  | Sorted fields |
|----------------------|-------------------|:----------------------------------------------------------------------------|
| alpha                | alpha_reverse     | title                                                                       |
| created              | created_reverse   | date of content creation                                                    |
| given_id             |                   | return the same order received in `id` argument which therefore must be set |
| id                   | id_reverse        | ID                                                                          |
| manual               | manual_reverse    | position, considering a given folder. `folder` argument must be set         |
| position             | position_reverse  | position, without considering a parent folder                               |
| random               |                   |                                                                             |
| updated              | updated_reverse   | date of content update                                                      |
| visible              | visible_reverse   | online/offline items firts                                                  |
