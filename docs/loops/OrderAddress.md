---
title: Order address
---

Order address loop displays order addresses information.  
`{loop type="order_address" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#order-arguments}

| Argument | Description                | Default | Example |
|----------|:---------------------------|:-------:|:--------|
| id       | A single order address id  |  null   | id="2"  |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable   | Value                                                                     |
|:-----------|:--------------------------------------------------------------------------|
| $ADDRESS1  | the first order address line                                              |
| $ADDRESS2  | the second order address line                                             |
| $ADDRESS3  | the third order address line                                              |
| $CELLPHONE | the order address cellphone                                               |
| $CITY      | the order address city                                                    |
| $COMPANY   | the order address company                                                 |
| $COUNTRY   | the order address country which might be use in [country loop](./Country) |
| $FIRSTNAME | the order address firstname                                               |
| $ID        | the order address id                                                      |
| $LASTNAME  | the order address lastname                                                |
| $PHONE     | the order address phone                                                   |
| $STATE     | the order address state                                                   |
| $TITLE     | the order address title which might be use in [title loop](./Title)       |
| $ZIPCODE   | the order address zipcode                                                 |

Plus the [global outputs](./global_outputs)
