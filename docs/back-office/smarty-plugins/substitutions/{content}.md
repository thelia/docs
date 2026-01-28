Content Substitutions provide current content, identified by `content_id` parameter (either GET or POST).    
`{content attr="one_of_the_following"}`

## Attributes

| Attribute name   | Data returned                                                                                          |
|:-----------------|:-------------------------------------------------------------------------------------------------------|
| `id`             | 	                                                                                                      |
| `title`          |                                                                                                        |
| `chapo`          | 	                                                                                                      |
| ` description `  | 	 	                                                                                                    |
| ` postscriptum ` | 	 	 	                                                                                                  |
| ` visible `      | 	 	 	`true` if the content is active, `false` otherwise                                                |
| ` position `     | 	 	 	The position number in parent folder                                                              |
| ` createdAt `    | 	 	 	The date of creation formatted by  [Date time parameter](#date-time-optional-parameters)          |
| ` updatedAt `    | 	 	 	The date of last modification formatted by  [Date time parameter](#date-time-optional-parameters) |

### Date Time optional parameters
| Parameter | Description                                                                                                                                             |
|:----------|:--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `output`  | Take `date`, `datetime` or `time` as value to select the return type                                                                                    |
| `format`  | Take a [PHP date format](https://www.php.net/manual/fr/datetime.format.php),  the format for the current locale will be used if this parameter is empty |