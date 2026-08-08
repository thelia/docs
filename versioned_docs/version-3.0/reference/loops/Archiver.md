---
title: Archiver
---

Retrieves a list of archivers, sorts them and returns its information.  
`{loop type="archiver" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#pse-arguments}

| Argument      | Description                                           | Default | Example                                     |
| ------------- |:------------------------------------------------------| :-----: | :-------------------------------------------|
| archiver      | generic type which represents the ID of the archiver  |         |                                             |
| availble      | specifies whether the archiver should be available    |         |  available ='true'                          |
| order         | specifies the sort order of archivers (alphabetical)  | alpha   | `enum sort{ case alpha; case alpha_reverse; }` |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable        | Value                                                  |
| :---------------| :----------------------------------------------------- |
| $EXTENSION      | the type of file extension associated with the archive |
| $ID             | ID of the archive                                      |
| $MIME           | the type MIME type associated with the archive         |
| $NAME           | Name of the archive                                    |

## Order possible values {#accessory-order-possible-values}

[Arguments](#pse-arguments)

| Ascending value                      | Descending value  | Sorted fields |
|--------------------------------------|-------------------|:--------------|
| alpha                                | alpha_reverse     | sort by key   |
