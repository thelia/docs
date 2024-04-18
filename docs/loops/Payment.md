---
title: Payment
---

payment loop displays payment modules information.  
`{loop type="payment" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#payment-arguments}

| Argument                                                   | Description        | Default | Example         |
|------------------------------------------------------------|:-------------------|:-------:|:----------------|
| all [base specific module arguments](./BaseSpecificModule) |                    |         |                 |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable      | Value                                |
|:--------------|:-------------------------------------|
| $CHAPO        | the payment module short description |
| $CODE         | the module code                      |
| $DESCRIPTION  | the payment module description       |
| $ID           | the payment module id                |
| $POSTSCRIPTUM | the payment module postscriptum      |
| $TITLE        | the payment module title             |

Plus the [global outputs](./global_outputs)
