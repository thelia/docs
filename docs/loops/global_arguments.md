---
title: Global arguments
sidebar_position: 1
---

These arguments can be set on all loops

| Argument        | Description                                                                      | Default      | Example              |
| --------------- |:--------------------------------------------------------------------------------:|-------------:|---------------------:|
| backend_context | Determine if loop is use in backend context.                                     | no           | backend_context="on" |
| force_return    | force return result for i18n tables even if there is no record.                  | no           | force_return="on"    |
| lang            | For internationalizable loops only. Thelia automatically manages the language, but this lang identifier can force a particular one. |   | lang="1" |
| limit           | The maximum number of results to display.                                        | PHP_INT_MAX  | limit="10"           |
| name *          | The loop name. This name must be unique and is used to reference this loop.      |              | name="my_name_loop"  |
| no-cache        |                                                                                  | no           | no-cache="no"        |
| offset          | The first product to display offset. Will not be used if `page` argument is set. | 0            | offset="10"          |
| page            | The page to display.                                                             |              | page="2"             |
| return_url      | A boolean value which allows the urls generation.                                | yes          | return_url="no"      |
| type            |                                                                                  |              |                      |
