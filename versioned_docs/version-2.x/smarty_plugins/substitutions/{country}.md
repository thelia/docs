Country Substitution provides default country configured in the store.    
`{country attr="one_of_the_following"}`

## Attributes

| Attribute name   | Data returned                                                                                          |
|:-----------------|:-------------------------------------------------------------------------------------------------------|
| `id`             | 	                                                                                                      |
| `title`          |                                                                                                        |
| `chapo`          | 	                                                                                                      |
| ` description `  | 	 	                                                                                                    |
| ` postscriptum ` | 	 	 	                                                                                                  |
| `  isocode  `    | 	 	 	ISO 3166-1 numeric (3 digit)                                                                      |
| `  isoalpha2  `  | 	  	    The ISO 3166-1 alpha-2 (2 letter) 	 	                                                          |
| `  isoalpha3  `  | 	 	 	The ISO 3166-1 alpha-3 (3 letter)                                                                 |
| ` createdAt `    | 	 	 	The date of creation formatted by  [Date time parameter](#date-time-optional-parameters)          |
| ` updatedAt `    | 	 	 	The date of last modification formatted by  [Date time parameter](#date-time-optional-parameters) |

### Date Time optional parameters
| Parameter | Description                                                                                                                                             |
|:----------|:--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `output`  | Take `date`, `datetime` or `time` as value to select the return type                                                                                    |
| `format`  | Take a [PHP date format](https://www.php.net/manual/fr/datetime.format.php),  the format for the current locale will be used if this parameter is empty |