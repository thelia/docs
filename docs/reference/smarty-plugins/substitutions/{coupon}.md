Return information on the coupons defined during the purchase process    
`{coupon attr="one_of_the_following"}`

## Attributes

| Attribute name   | Data returned                                                                                    |
|:-----------------|:-------------------------------------------------------------------------------------------------|
| ` coupon_count `  | Number of coupons currently in use 	 	                                                           |
| ` coupon_list ` | An array containing the code of coupons currently in use.	 	 	                                   |
| ` has_coupons ` | `true` if some coupons are currently in use, `false` otherwise	 	 	                              |
| ` is_delivery_free ` | `true` if at least one of the coupons currently in use gives free delivery, `false` otherwise	 	 	 |