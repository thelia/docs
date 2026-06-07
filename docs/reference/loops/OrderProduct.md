---
title: Order product
---

Order product loop displays Order products information.  
`{loop type="order_product" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#order-arguments}

| Argument | Description                              | Default | Example            |
|----------|:-----------------------------------------|:-------:|:-------------------|
| id       | A single or a list of order product ids. |         | id="2", id="1,4,7" |
| order *  | A single order id.                       |  null   | order="2"          |
| virtual  | A boolean value.                         |   *     | new="yes"          |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable                   | Value                                                          |
|:---------------------------|:---------------------------------------------------------------|
| $CART_ITEM_ID              | The related Cart Item ID of this order product                 |
| $CHAPO                     | the order product short description                            |
| $DESCRIPTION               | the order product description                                  |
| $EAN_CODE                  | the product ean code                                           |
| $ID                        | the order product id                                           |
| $PRODUCT_ID                | the product id                                                 |
| $PARENT                    | the parent product in the cart, if the current product has one |
| $POSTSCRIPTUM              | the order product postscriptum                                 |
| $PRICE                     | the order product price (unit price)                           |
| $PRICE_TAX                 | the order product taxes (unit price)                           |
| $PRODUCT_SALE_ELEMENTS_ID  | the order product sale elements id                             |
| $PRODUCT_SALE_ELEMENTS_REF | the order product sale elements reference                      |
| $PROMO_PRICE               | the order product in promo price (unit price)                  |
| $PROMO_PRICE_TAX           | the order product in promo price taxes (unit price)            |
| $QUANTITY                  | the order product ordered quantity                             |
| $REF                       | the order product reference                                    |
| $TAXED_PRICE               | the order product price including taxes (unit price)           |
| $TAXED_PROMO_PRICE         | the order product in promo price including taxes (unit price)  |
| $TAX_RULE_DESCRIPTION      | the tax rule description for this item                         |
| $TAX_RULE_TITLE            | the tax rule title for this item                               |
| $TITLE                     | the order product title                                        |
| $TOTAL_PRICE               | the order product price (total price)                          |
| $TOTAL_PROMO_PRICE         | the order product in promo price (total price)                 |
| $TOTAL_TAXED_PRICE         | the order product price including taxes (total price)          |
| $TOTAL_TAXED_PROMO_PRICE   | the order product in promo price including taxes (total price) |
| $VIRTUAL                   | whatever the order product is a virtual product or not         |
| $VIRTUAL_DOCUMENT          | the name of the file if the product is virtual.                |
| $WAS_IN_PROMO              | whatever the order product sale elements was in promo or not   |
| $WAS_NEW                   | whatever the order product sale elements was new or not        |
| $WEIGHT                    | the order product sale elements weight                         |
| $REAL_PRICE                | the real price of the product                                  |
| $REAL_TAXED_PRICE          | the real price of the product including taxes                  |
| $REAL_PRICE_TAX            | the real price of the taxe for the product                     |
| $REAL_TOTAL_PRICE          | the real total price of the product                            |
| $REAL_TOTAL_TAXED_PRICE    | the real total price of the product including taxes            |
| $REAL_TOTAL_PRICE_TAX      | the real total price of the taxe for the product               |

Plus the [global outputs](./global_outputs)
