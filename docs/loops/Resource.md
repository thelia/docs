---
title: Resource
---

`{loop type="resource" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#resource-arguments}

| Argument | Description                                                                                     |     Default      | Example             |
|----------|:------------------------------------------------------------------------------------------------|:----------------:|:--------------------|
| code     |                                                                                                 |                  |                     |
| order    | A list of values see [sorting possible values](#resource-order-possible-values)                 | id               | order="title"       |
| profile  |                                                                                                 |                  |                     |

Plus the [global arguments](./global_arguments), [global arguments I18n](./global_arguments_I18n)

## Outputs

| Variable               | Value                                                                         |
|:-----------------------|:------------------------------------------------------------------------------|
| $CHAPO                 | the resource chapo                                                            |
| $CODE                  | the resource code                                                             |
| $CREATABLE             | <strong>Only if profile is not null</strong>                                  |
| $DELETABLE             | <strong>Only if profile is not null</strong>                                  |
| $DESCRIPTION           | the resource description                                                      |
| $ID                    | the content id                                                                |
| $IS_TRANSLATED         | check if the content is translated                                            |
| $LOCALE                | the locale (e.g. fr_FR) of the returned data                                  |
| $POSTSCTIPTUM          | the resource postscriptum                                                     |
| $TITLE                 | the resource title                                                            |
| $UPDATABLE             | <strong>Only if profile is not null</strong>                                  |
| $VIEWABLE              | <strong>Only if profile is not null</strong>                                  |

Plus the [global outputs](./global_outputs)

## Order possible values {#resource-order-possible-values}

[Arguments](#resource-arguments)

| Ascending value | Descending value   | Sorted fields         |
|-----------------|--------------------|:----------------------|
| code            | code-reverse       | code                  |
| id              | id-reverse         | id                    |
| title           | title-reverse      | title                 |
