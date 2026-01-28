---
title: Serializer
---

Serializer loop lists serializers.  
`{loop type="serializer" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#serializer-arguments}

| Argument   | Description                                                                        | Default       | Example             |
|------------|:-----------------------------------------------------------------------------------|:-------------:|:--------------------|
| order      | A list of values see [sorting possible values](#serializer-order-possible-values)  | alpha         | order=" random"     |
| serializer | A serializer                                                                       |               | serializer="example"|

Plus the [global arguments](./global_arguments)

## Outputs

| Variable               | Value                                                                         |
|:-----------------------|:------------------------------------------------------------------------------|
| $EXTENSION             | the serializer extension                                                      |
| $ID                    | the serializer id                                                             |
| $MIME_TYPE             | the serializer mime type                                                      |
| $NAME                  | the serialiser name                                                           |

Plus the [global outputs](./global_outputs)

## Order possible values {#serializer-order-possible-values}

[Arguments](#serializer-arguments)

| Ascending value | Descending value | Sorted fields         |
|-----------------|------------------|:----------------------|
| alpha           | alpha-reverse    | serializer key        |
