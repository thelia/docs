---
title: Address
---

Address loop lists address addresses.     
`{loop type="address" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#pse-arguments}

| Argument      | Description                                                                                | Default         | Example                           |
| ------------- |:-------------------------------------------------------------------------------------------| :-------------: | :-------------------------------- |
| customer      | Either a customer id or the keyword `current` which search for current customer addresses. |  current        | customer="current", customer="11" |
| default       | A boolean value to return either customer default address either all the others.           |                 | default="true"                    |
| exclude       | A single or a list of address ids to exclude.                                              |                 | exclude="456,123"                 |
| id            | A single or a list of address ids.                                                         |                 |  id="2", id="1,4,7"               |


Plus the [global arguments](./global_arguments)

## Outputs

| Variable                                                              | Value                                                                                 |
| :-------------------------------------------------------------------  | :------------------------------------------------------------------------------------ |
| $ADDRESS1	                                                            | the first address line                                                                |
| $ADDRESS2	                                                            | the second address line                                                               |
| $ADDRESS3	                                                            | the third address line                                                                |   
| $CELLPHONE	                                                        | the address cellphone                                                                 |
| $CITY	                                                                | the address city                                                                      |
| $COMPANY	                                                            | the address company                                                                   |
| $COUNTRY	                                                            | the address country which might be use in [country loop](./Country)                   |
| $CUSTOMER	                                                            | the customer the address is link to which might be use in [customer loop](./Customer) |
| $DEFAULT	                                                            | return if address title is by default address                                         |
| $FIRSTNAME	                                                        | the address firstname                                                                 |
| $ID	                                                                | the address id                                                                        |
| $LABEL	                                                            | the address label                                                                     |
| $LASTNAME	                                                            | the address lastname                                                                  |
| $PHONE	                                                            | the address phone                                                                     |
| $STATE	                                                            |                                                                                       |
| $TITLE	                                                            | the address title which might be use in [title loop](./Title)                         |
| $ZIPCODE                                                              | the address zipcode                                                                   |


Plus the [global outputs](./global_outputs)