---
title: Document
---

The document loop process, cache and display products, categories, contents and folders documents.   
`{loop type="document" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#document-arguments}

| Argument    | Description                                                                                                          | Default | Example               |
|-------------|:---------------------------------------------------------------------------------------------------------------------|:-------:|:----------------------|
| category ** | a category identifier. The loop will return this category's documents                                                |         | category="2"          |
| content **  | a content identifier. The loop will return this content's documents                                                  |         | content="2"           |
| exclude     | A single or a comma-separated list of document IDs to exclude from the list.                                         |         | exclude="456,123"     |
| folder **   | a folder identifier. The loop will return this folder's documents                                                    |         | folder="2"            |
| force_return|                                                                                                                      | true    |                       |
| id          | A single or a list of document ids.                                                                                  |         | id="2", id="1,4,7"    |
| lang        | A language identifier, to specify the language in which the document information will be returned                    |         |                       |
| order       | A list of values see [sorting possible values](#document-order-possible-values)                                      | manual  | order="alpha_reverse" |
| product **  | a product identifier. The loop will return this product's documents                                                  |         | product="2"           |
| query_namespace|                                                                                                                   | Thelia\\Model|                  |
| source **   | see [Expected values](#document-source-expected-values)                                                              |         | source="category"     |
| source_id   | The identifier of the object provided in the "source" parameter. Only considered if the "source" argument is present |         | source_id="2"         |
| visible     | A boolean value.                                                                                                     |   yes   | visible="no"          |
| with_prev_next_info|                                                                                                               |  false  |                       |

Plus the [global arguments](./global_arguments) and the [global I18n](./global_arguments_I18n.md)

## Outputs

| Variable                | Value                                                                                     |
|:------------------------|:------------------------------------------------------------------------------------------|
| $CHAPO                  | the document chapo                                                                        |
| $DESCRIPTION            | the document description                                                                  |
| $DOCUMENT_FILE          |                                                                                           |
| $DOCUMENT_PATH          | The absolute path to the generated document file                                          |
| $DOCUMENT_URL           | The absolute URL to the generated document                                                |
| $ID                     | the document ID                                                                           |
| $LOCALE                 | the locale                                                                                |
| $OBJECT_ID              | The object ID                                                                             |
| $OBJECT_TYPE            | The object type (e.g., produc, category, etc. see 'source' parameter for possible values) |
| $ORIGINAL_DOCUMENT_PATH | The absolute path to the original document file                                           |
| $POSITION               | the position of this document in the object's document list                               |
| $POSTSCRIPTUM           | the document postscriptum                                                                 |
| $TITLE                  | the document title                                                                        |
| $VISIBLE                | true if the document is visible. False otherwise                                          |

Plus the [global outputs](./global_outputs)

## Order possible values {#document-order-possible-values}
[Arguments](#document-arguments)

| Ascending value | Descending value | Sorted fields       |
|-----------------|------------------|:--------------------|
| alpha           | alpha-reverse    | title               |
| manual          | manual-reverse   | position            |
| random          |                  | pseudo-random order |

## Souce expected values {#document-source-expected-values}
[Arguments](#document-arguments)

| value    |
|----------|
| brand    |
| category |
| content  |
| folder   |
| product  |