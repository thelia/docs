---
title: Serializer
---

`{loop type="serializer" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#serializer-arguments}

| Argument   | Description                                                                        | Default       | Example             |
|------------|:-----------------------------------------------------------------------------------|:-------------:|:--------------------|
| order      | A list of values see [sorting possible values](#serializer-order-possible-values)  | alpha         | order=" random"     |
| serializer |                                                                                    |               |                     |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable               | Value                                                                         |
|:-----------------------|:------------------------------------------------------------------------------|
| $EXTENSION             |                                                                               |
| $ID                    |                                                                               |
| $MIME_TYPE             |                                                                               |
| $NAME                  |                                                                               |

Plus the [global outputs](./global_outputs)

## Order possible values {#serializer-order-possible-values}

[Arguments](#serializer-arguments)

| Ascending value | Descending value | Sorted fields         |
|-----------------|------------------|:----------------------|
| alpha           | alpha-reverse    |                       |
