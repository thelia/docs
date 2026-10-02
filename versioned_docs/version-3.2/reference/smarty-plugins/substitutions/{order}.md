Lang Substitution provides current lang in session. 
`{lang attr="one_of_the_following"}`

## Attributes

| Attribute name          | Data returned                                                                                          |
|:------------------------|:-------------------------------------------------------------------------------------------------------|
| `id`                    | 	                                                                                                      |
| `title`                 |                                                                                                        |
| `code`                  | 	      ISO 639-1 Code                                                                                  |
| ` locale `              | 	 	The language locale code eg: fr_FR, en_US, ...  	 	                                                 |
| ` url `                 | 	  Custom URL for language 	 	                                                                         |
| ` decimals `            | 	 	 	Decimal places  	                                                                                 |
| ` decimal_separator `   | 	The separator for the decimal point  	 	                                                              |
| ` thousands_separator ` | 	  	The thousands separator 	 	                                                                        |
| ` date_format `         | 	 	The date format. The syntax used is identical to the PHP date() function. eg: d/m/Y  	 	            |
| ` time_format `         | 	 	 	The time format. The syntax used is identical to the PHP date() function. eg: H:i:s  	            |
| ` datetime_format `     | 	  The date time format. The syntax used is identical to the PHP date() function. eg: d/m/y H:i:s 	 	  |
| ` position `            | 	 	 	                                                                                                  |
| ` by_default `          | 	 	 	`true` if the category is the default currency, `false` otherwise                                 |
| ` createdAt `           | 	 	 	The date of creation formatted by  [Date time parameter](#date-time-optional-parameters)          |
| ` updatedAt `           | 	 	 	The date of last modification formatted by  [Date time parameter](#date-time-optional-parameters) |

### Date Time optional parameters
| Parameter | Description                                                                                                                                             |
|:----------|:--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `output`  | Take `date`, `datetime` or `time` as value to select the return type                                                                                    |
| `format`  | Take a [PHP date format](https://www.php.net/manual/fr/datetime.format.php),  the format for the current locale will be used if this parameter is empty |