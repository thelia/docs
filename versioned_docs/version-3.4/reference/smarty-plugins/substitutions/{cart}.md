Cart Substitution provides data for the current cart in session.    
`{cart attr="one_of_the_following"}`

## Attributes

| Attribute name                                           | Data returned                                                                             |
|:---------------------------------------------------------|:------------------------------------------------------------------------------------------|
| `contains_virtual_product` OR `is_virtual`               | `true` if the cart contains at least one virtual product, `false` otherwise               |
| `item_count` OR `count_item`                             | The number of items in the cart. A cart with 2 x product X and 3 x product Y have 5 items |
| `total_price_with_discount` OR `total_price`             | Total cart amount in the current currency, without taxes, including discount              |
| `total_price_without_discount`                           | 	Total cart amount in the current currency, without taxes, excluding discount             |
| `total_taxed_price_with_discount` OR `total_taxed_price` | Total cart amount in the current currency with taxes, and including the discount          |
| `total_taxed_price_without_discount`                     | 	 	Total price with discount without taxes                                                |
| ` weight `                                               | 	 	 	The cart total weight, in kg                                                         |
