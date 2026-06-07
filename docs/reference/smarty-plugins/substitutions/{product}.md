Product Substitutions provide current product, identified by `product_id` parameter (either GET or POST).    
`{product attr="one_of_the_following"}`

## Attributes

| Attribute name   | Data returned                                                                                          |
|:-----------------|:-------------------------------------------------------------------------------------------------------|
| `id`             | 	                                                                                                      |
| `ref`            | 	                                                                                                      |
| `title`          |                                                                                                        |
| `chapo`          | 	                                                                                                      |
| ` description `  | 	 	                                                                                                    |
| ` postscriptum ` | 	 	 	                                                                                                  |
| ` tax_rule_id `  | 	 	 	                                                                                                  |
| ` brand_id `     | 	 	 	                                                                                                  |
| ` visible `      | 	 	 	`true` if the product is active, `false` otherwise                                                |
| ` parent `       | 	 	 	The id of default parent category                                                                 |
| ` position `     | 	 	 	The position number in default parent category                                                    |
| ` createdAt `    | 	 	 	The date of creation formatted by  [Date time parameter](#date-time-optional-parameters)          |
| ` updatedAt `    | 	 	 	The date of last modification formatted by  [Date time parameter](#date-time-optional-parameters) |

### Date Time optional parameters
| Parameter | Description                                                                                                                                             |
|:----------|:--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `output`  | Take `date`, `datetime` or `time` as value to select the return type                                                                                    |
| `format`  | Take a [PHP date format](https://www.php.net/manual/fr/datetime.format.php),  the format for the current locale will be used if this parameter is empty |