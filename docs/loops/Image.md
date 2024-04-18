---
title: Image
---

The image loop process, cache and display images, categories, contents and folders images.  
`{loop type="image" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#image-arguments}

| Argument                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Default      | Example                                             |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-----------------------------------------------------|
| allow_zoom               | If true, the loop il allowed to resize an image to match the required width and height, causing, in most cases, a quality loss. If false, the image will never be zoomed. Default is false.                                                                                                                                                                                                                                                                                                                                                                                         |              | allow_zoom="true"                                   |
| background_color         | The color applied to empty image parts during processing. Use rgb or rrggbb color format                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |              | background_color="cc8000" or background_color="fff" |
| base64                   | If true, the loop will have a new output with the image in base64                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |              | base64="true"                                       |
| brand **                 | a brand identifier. The loop will return this brand's images                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |              | brand="2"                                           |
| category **              | a category identifier. The loop will return this category's images                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |              | category="2"                                        |
| content **               | a content identifier. The loop will return this content's images                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |              | content="2"                                         |
| effects                  | One or more comma separated effects definitions, that will be applied to the image in the specified order. Please see below a detailed description of available effects <br/> [Expected values](#image-effects-expected-values)                                                                                                                                                                                                                                                                                                                                                     |              | effects="greyscale,gamma:0.7,vflip"                 |
| exclude                  | A single or a comma-separated list of image IDs to exclude from the list.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |              | exclude="456,123"                                   |
| folder **                | a folder identifier. The loop will return this folder's images                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |              | folder="2"                                          |
| format                   | The format of the image.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |              | format="png"                                        |
| height                   | A height in pixels, for resizing image. If only the height is provided, the image ratio is preserved.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |              | height="200"                                        |
| id                       | A single or a list of image ids.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |              | id="2", id="1,4,7"                                  |
| ignore_processing_errors | If true, the loop will return a result even if the image processing fails, and set the PROCESSING_ERROR variable to true if an error occurs. If false, images for which the processing fails are not returned.                                                                                                                                                                                                                                                                                                                                                                      |              | ignore_processing_errors="false"                    |
| order                    | A list of values see [sorting possible values](#image-order-possible-values)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | manual       | order="alpha_reverse"                               |
| product **               | a product identifier. The loop will return this product's images                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |              | product="2"                                         |
| quality                  | The generated image quality, from 0(!) to 100%. The default value is 75% (you can hange this in the Administration panel)                                                                                                                                                                                                                                                                                                                                                                                                                                                           |              | quality="70"                                        |
| query_namespace          | The namespace                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Thelia\Model | query_namespace="Thelia\Model"                      |
| resize_mode              | If 'crop', the image will have the exact specified width and height, and will be cropped if required. If the source image is smaller than the required width and/or height, you have to set allow_zoom to true, otherwise the generated image will be smaller than required. If 'borders', the image will have the exact specified width and height, and some borders may be added. The border color is the one specified by 'background_color'. If 'none' or missing, the image ratio is preserved, and depending od this ratio, may not have the exact width and height required. |  none        | resize_mode="crop"                                  |
| rotation                 | The rotation angle in degrees (positive or negative) applied to the image. The background color of the empty areas is the one specified by 'background_color'                                                                                                                                                                                                                                                                                                                                                                                                                       |              | rotation="90"                                       |
| source **                | see [Expected values](#image-source-expected-values)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |              | source="category"                                   |
| source_id                | The identifier of the object provided in the "source" parameter. Only considered if the "source" argument is present                                                                                                                                                                                                                                                                                                                                                                                                                                                                |              | source_id="2"                                       |
| visible                  | A boolean value.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | yes          | visible="no"                                        |
| width                    | A width in pixels, for resizing image. If only the width is provided, the image ratio is preserved.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |              | width="200"                                         |
| with_prev_next_info      |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |              |                                                     |

Plus the [global arguments](./global_arguments) and [global arguments I18n](./global_arguments_I18n.md)

## Outputs

| Variable             | Value                                                                                                             | if prev_next_info = true            | if prev_next_info = false          |
|----------------------|-------------------------------------------------------------------------------------------------------------------|-------------------------------------|------------------------------------|
| $CHAPO               | the image chapo                                                                                                   |            ✅                       |             ✅                      |
| $DESCRIPTION         | the image description                                                                                             |            ✅                       |             ✅                      |
| $HAS_NEXT            | If the loop has a next image                                                                                      |            ✅                       |             🚫                      |
| $HAS_PREVIOUS        | If the loop has a previous image                                                                                  |            ✅                       |             🚫                      |
| $ID                  | the image ID                                                                                                      |            ✅                       |             ✅                      |
| $IMAGE_BASE64        | only available if base64 param is set to true                                                                     | only if base64 param is set to true | only if base64 param is se to true |
| $IMAGE_HEIGHT        | the image height                                                                                                  |            ✅                       |             ✅                      |
| $IMAGE_PATH          | The absolute path to the generated image file                                                                     |            ✅                       |             ✅                      |
| $IMAGE_URL           | The absolute URL to the generated image.                                                                          |            ✅                       |             ✅                      |
| $IMAGE_WIDTH         | the image width                                                                                                   |            ✅                       |             ✅                      |
| $IS_SVG              | true if the image is an SVG image                                                                                 | if no error in the image            |   if no error in the image         |
| $LOCALE              | The locale used for this research                                                                                 |            ✅                       |             ✅                      |
| $NEXT                | The next image ID                                                                                                 |            ✅                       |             🚫                      |
| $OBJECT_ID           | The object ID                                                                                                     |            ✅                       |             ✅                      |
| $OBJECT_TYPE         | The object type (e.g., produc, category, etc. see 'source' parameter for possible values)                         |            ✅                       |             ✅                      |
| $ORIGINAL_IMAGE_PATH | The absolute path to the original image file                                                                      |            ✅                       |             ✅                      |
| $ORIGINAL_IMAGE_URL  | The absolute URL to the original image                                                                            |            ✅                       |             ✅                      |
| $POSITION            | the position of this image in the object's image list                                                             |            ✅                       |             ✅                      |
| $POSTSCRIPTUM        | the image postscriptum                                                                                            |            ✅                       |             ✅                      |
| $PREVIOUS            | The previous image ID                                                                                             |            ✅                       |             🚫                      |
| $PROCESSING_ERROR    | true if the image processing fails. In this case, $IMAGE_URL, $ORIGINAL_IMAGE_URL, and $IMAGE_PATH will be empty. |            ✅                       |             ✅                      |
| $TITLE               | the image title                                                                                                   |            ✅                       |             ✅                      |
| $VISIBLE             | true if the image is visible. False otherwise                                                                     |            ✅                       |             ✅                      |

Plus the [global outputs](./global_outputs)

## Examples

Example 1  

Resize category images the 200x100, adding (white) borders if required.  

```smarty
{loop type="image" name="image_test" category="$ID" width="200" height="100" resize_mode="borders"}
    <img src="{$IMAGE_URL}" alt="{$TITLE}" />
{/loop}
```

Same behaviour, using the “source” style parameters  

```smarty
{loop type="image" name="image_test" source="category" source_id="$ID" width="200" height="100" resize_mode="borders"}
    <img src="{$IMAGE_URL}" alt="{$TITLE}" />
{/loop}
```

Example 2  

Resize 1 category images the 200x100, cropping id necessary, and transforming the image in grayscale, with a gamma razised to 1.1  

```smarty
="grayscale,gamma:1.1" limit="1"}
    <a href="{$ORIGINAL_IMAGE_URL}"><img src="{$IMAGE_URL}" alt="{$TITLE}" /></a>
{/loop}
```

## Order possible values {#image-order-possible-values}

[Arguments](#image-arguments)

| Ascending value | Descending value | Sorted fields        |
|-----------------|------------------|:---------------------|
| alpha           | alpha_reverse    | Title                |
| manual          | manual-reverse   | position             |
| random          |                  | pseudo-random order  |

## effects expected values {#image-effects-expected-values}

[Arguments](#image-arguments)

| Argument                 | Description                                                           | Exemple          |
|--------------------------|-----------------------------------------------------------------------|:-----------------|
| blur                     | blur the image                                                        | blur:5           |
| colorize:color           | apply a color mask to the image. The color format is $rgb or $rrggbb. | colorize:$ff2244 |
| gamma:value              | change the image Gamma to the specified value.                        | gamma:0.7        |
| grayscale or greyscale   | switch image to grayscale                                             |                  |
| hflip or horizontal_flip | flip the image horizontally.                                          |                  |
| negative                 | transform the image in its negative equivalent.                       |                  |
| vflip or vertical_flip   | flip the image vertically.                                            |                  |

## Souce expected values {#image-source-expected-values}

[Arguments](#image-arguments)

| value    |
|----------|
| brand    |
| category |
| content  |
| folder   |
| module   |
| product  |
