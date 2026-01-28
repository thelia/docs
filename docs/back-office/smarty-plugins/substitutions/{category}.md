Category Substitutions provide current category, identified by `category_id` parameter (either GET or POST).    
`{category attr="one_of_the_following"}`

## Attributes

| Attribute name   | Data returned                                                                                          |
|:-----------------|:-------------------------------------------------------------------------------------------------------|
| `id`             | 	                                                                                                      |
| `title`          |                                                                                                        |
| `chapo`          | 	                                                                                                      |
| ` description `  | 	 	                                                                                                    |
| ` postscriptum ` | 	 	 	                                                                                                  |
| ` visible `      | 	 	 	`true` if the category is active, `false` otherwise                                               |
| ` parent `       | 	 	 	The id of parent category                                                                         |
| ` position `     | 	 	 	The position number in parent category                                                            |
| ` createdAt `    | 	 	 	The date of creation formatted by  [Date time parameter](#date-time-optional-parameters)          |
| ` updatedAt `    | 	 	 	The date of last modification formatted by  [Date time parameter](#date-time-optional-parameters) |

### Date Time optional parameters
| Parameter | Description                                                                                                                                             |
|:----------|:--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `output`  | Take `date`, `datetime` or `time` as value to select the return type                                                                                    |
| `format`  | Take a [PHP date format](https://www.php.net/manual/fr/datetime.format.php),  the format for the current locale will be used if this parameter is empty |