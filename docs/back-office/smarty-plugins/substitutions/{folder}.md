Folder Substitutions provide current folder, identified by `folder_id` parameter (either GET or POST).    
`{folder attr="one_of_the_following"}`

## Attributes

| Attribute name   | Data returned                                                                                          |
|:-----------------|:-------------------------------------------------------------------------------------------------------|
| `id`             | 	                                                                                                      |
| `title`          |                                                                                                        |
| `chapo`          | 	                                                                                                      |
| ` description `  | 	 	                                                                                                    |
| ` postscriptum ` | 	 	 	                                                                                                  |
| ` visible `      | 	 	 	`true` if the folder is active, `false` otherwise                                                 |
| ` parent `       | 	 	 	The id of parent folder                                                                           |
| ` position `     | 	 	 	The position number in parent folder                                                              |
| ` createdAt `    | 	 	 	The date of creation formatted by  [Date time parameter](#date-time-optional-parameters)          |
| ` updatedAt `    | 	 	 	The date of last modification formatted by  [Date time parameter](#date-time-optional-parameters) |

### Date Time optional parameters
| Parameter | Description                                                                                                                                             |
|:----------|:--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `output`  | Take `date`, `datetime` or `time` as value to select the return type                                                                                    |
| `format`  | Take a [PHP date format](https://www.php.net/manual/fr/datetime.format.php),  the format for the current locale will be used if this parameter is empty |