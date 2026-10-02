Currency Substitution provides current currency in session.  
`{currency attr="one_of_the_following"}`

## Attributes

| Attribute name | Data returned                                                                                          |
|:---------------|:-------------------------------------------------------------------------------------------------------|
| `id`           | 	                                                                                                      |
| `name`         |                                                                                                        |
| `code`         | 	       ISO 4217 Code. eg.: EUR                                                                        |
| ` symbol `     | 	 	                	The currency symbol: €, $, ...                                                     |
| ` rate `       | 	 	 	                                The rate relative to euro.                                        |
| ` by_default ` | 	 	 	`true` if the category is the default currency, `false` otherwise                                 |
| ` position `   | 	 	 	                                                                                                  |
| ` createdAt `  | 	 	 	The date of creation formatted by  [Date time parameter](#date-time-optional-parameters)          |
| ` updatedAt `  | 	 	 	The date of last modification formatted by  [Date time parameter](#date-time-optional-parameters) |

### Date Time optional parameters
| Parameter | Description                                                                                                                                             |
|:----------|:--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `output`  | Take `date`, `datetime` or `time` as value to select the return type                                                                                    |
| `format`  | Take a [PHP date format](https://www.php.net/manual/fr/datetime.format.php),  the format for the current locale will be used if this parameter is empty |