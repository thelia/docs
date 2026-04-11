Customer Substitutions provide logged-in customer data.    
`{customer attr="one_of_the_following"}`

## Attributes

| Attribute name | Data returned                                                                                          |
|:---------------|:-------------------------------------------------------------------------------------------------------|
| `id`           | 	                                                                                                      |
| `ref`          | 	                                                                                                      |
| `firstname`    |                                                                                                        |
| `lastname`     | 	                                                                                                      |
| ` email `      | 	 	                                                                                                    |
| ` title_id `   | 	 	 	                                                                                                  |
| ` lang `       | 	 	The customer lang ID  	                                                                             |
| ` reseller `   | 	 	 	   	`1` if the customer is a reseller else `0`                                                    |
| ` sponsor `    | 	 	 	               	The customer sponsor ID                                                           |
| ` discount `   | 	 	 	      The customer % discount                                                                     |
| ` createdAt `  | 	 	 	The date of creation formatted by  [Date time parameter](#date-time-optional-parameters)          |
| ` updatedAt `  | 	 	 	The date of last modification formatted by  [Date time parameter](#date-time-optional-parameters) |

### Date Time optional parameters
| Parameter | Description                                                                                                                                             |
|:----------|:--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `output`  | Take `date`, `datetime` or `time` as value to select the return type                                                                                    |
| `format`  | Take a [PHP date format](https://www.php.net/manual/fr/datetime.format.php),  the format for the current locale will be used if this parameter is empty |