---
title: Product media
sidebar_position: 4
---

# Product media

A product carries three kinds of media: images, documents, and videos. Images and
videos share the same position sequence and the same alternative text mechanism.

## Alternative text and decorative images

Every image managed by Thelia (product, category, folder, content, brand) carries a
translatable `alt` text and a `decorative` flag.

The resolved alternative text follows one rule:

- the image is decorative: the alternative text is an empty string
- otherwise, the `alt` field if it is set
- otherwise, the image title
- otherwise, an empty string

This mirrors [WCAG 1.1.1 (Non-text Content)](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html):
an image that conveys information needs a text alternative, and an image that is
purely decorative needs an empty `alt` attribute so screen readers skip it instead of
reading a filename or a redundant title.

The front-office computes this resolved value; templates never fall back to the title
themselves.

## One image file per language

Added in Thelia 3.2.

Each language of an image can show its own file: a packaging printed for one country, a visual
with translated text, a legal mention that differs from one market to the next. This covers the
images of products, categories, contents, folders, brands and modules.

In the back office, the merchant opens an image from the Images tab, switches to the language to
change with the language selector of the edit screen, and uploads the file there. The file
replaces the one of the language being edited only, and the screen says so. The previous file is
removed from the disk once no other language still uses it. Deleting the image removes the file
of every language.

A language without a file of its own follows the same rule as a missing translated text, set by
`default_lang_without_translation`:

| `default_lang_without_translation` | A language without its own file shows |
| --- | --- |
| `1` (the default) | The file of the default language. The edit screen says that the language has no image of its own. |
| `0` | No file. |

The update to 3.2 gives every active language the file the image had, so nothing changes on
screen after the update. Cloning a product copies the file of each language that has its own.

For a template or a module, `getFile()` on an image model returns the file of the model's
current locale, with the fallback above, and the `image` loop reads the file in its own locale.
`getOwnFile()` returns the file of that language only, or `null`. The file is stored in
`<type>_image_i18n.file`; code that read the former `file` column of the image table has to read
the translation instead, see [Upgrading from 3.1 to 3.2](../upgrading/from-3.1-to-3.2.md#image-files-per-language).

The admin API follows the language too: `file` and `fileUrl` of an image resource follow
`?locale=`, and `POST /api/admin/<type>_images/{id}/file`, with the multipart fields
`fileToUpload` and `locale`, sets or replaces the file of one language.

## Image formats

Added in Thelia 3.2, with TheliaLibrary 2.0.10.

A shop can serve its catalog images in WebP or AVIF next to the source file. The browser picks
the lightest format it reads, and the source format (JPEG, PNG) stays the fallback, so a browser
that reads neither still gets the image.

### Settings

The formats and their quality are configuration variables, under Configuration > System
variables in the back office:

| Setting | Fresh install | Updated shop | Purpose |
| --- | --- | --- | --- |
| `image_formats` | `webp` | empty | Comma-separated list of the formats served next to the source file: `avif`, `webp`. Empty serves the source format only. |
| `image_quality_webp` | `75` | `75` | Encoder quality of WebP files, from 1 to 100. |
| `image_quality_avif` | `50` | `50` | Encoder quality of AVIF files, from 1 to 100. |

A shop updated from 3.1 gets an empty `image_formats` list and keeps rendering its images as
before, so nothing is regenerated on the first crawl. Setting it to `webp`, or `avif,webp`, turns
the feature on.

Each format has its own quality because the encoders do not share a scale: the same number does
not give the same picture in WebP and in AVIF. A quality that is not a number between 1 and 100
is ignored and the default of the format applies (75 for WebP, 50 for AVIF). An unknown entry in
`image_formats` is dropped, and the order of the list does not matter: AVIF is always offered
before WebP.

### What the server must support

A format is served only if the graphics library that renders the images can write it. Thelia
asks the driver LiipImagine runs on (the `driver` key of `config/packages/liip_imagine.yaml`,
`gd` by default):

| Driver | Writes WebP when | Writes AVIF when |
| --- | --- | --- |
| `gd` | GD was built with WebP support (`IMG_WEBP` in `imagetypes()`) | GD was built with AVIF support (`IMG_AVIF` in `imagetypes()`) |
| `imagick`, `gmagick` | ImageMagick or GraphicsMagick lists the WebP format | ImageMagick or GraphicsMagick lists the AVIF format |

A format listed in `image_formats` that the server cannot write is dropped silently: the browser
is offered one format less, and the page never breaks. Check what PHP supports before turning
AVIF on, for instance with `php -r 'var_dump(imagetypes() & IMG_AVIF);'` on a GD setup.

### How the images are served

TheliaLibrary renders an image as a `<picture>` element: one `<source>` per active format, most
efficient first, then the `<img>` of the source format. Each variant is a static file written
next to the source file in the LiipImagine cache, under the source name followed by the format
extension:

```
/media/cache/product_card/product/PROD001-1.jpg
/media/cache/product_card/product/PROD001-1.jpg.webp
```

The variant is generated the first time a page asks for it, then served directly by the web
server with no redirect and no content negotiation. A variant that fails to generate is logged
and left out of the `<picture>`. The web server picks the `Content-Type` from the extension, so it
needs to know `.webp` as `image/webp` and `.avif` as `image/avif`.

A variant is not regenerated when a quality setting changes. To apply a new quality to images
already in the cache, remove the cached images with LiipImagine's `liip:imagine:cache:remove`
command.

For developers, `Thelia\Domain\Media\Service\ImageFormatPolicy` is the single place that answers
which formats to serve (`activeFormats()`) and at which quality (`qualityFor()`).
`ImageFormatCapabilities` answers what the server can write. A theme or a module that renders
images itself asks the policy rather than reading the settings.

## Videos

A product can attach videos alongside its images. In the back office they are added and
managed from the Images tab of the product, in the same grid as the images, and moved
around in that grid: images and videos share one order. A video comes from one of two
sources:

- a platform video: the merchant pastes a YouTube, Vimeo or Dailymotion address, and
  Thelia recognizes the platform and extracts the video identifier
- a hosted file: uploaded and served from the shop's own storage

Only the platform and the extracted identifier are stored. The address the merchant
pasted is never persisted; the player address is always rebuilt from the identifier
when the video is displayed.

A video has:

- a thumbnail, chosen among the product's own images; when none is chosen, the first
  image of the product is used, and the theme placeholder when the product has none
- a position, shared with the product's images: the gallery shows videos and images in
  a single ordered list
- an optional attachment to one or more product sale elements (variants), so a video
  can be scoped to a specific variant instead of the whole product
- a visibility flag
- translatable title, alternative text, description, short description (`chapo`) and
  closing text (`postscriptum`)

The player is never loaded up front. A platform video renders as its thumbnail; the
embedded player (the iframe pointing at the platform) is only inserted after the
visitor clicks it. Nothing loads from the video platform before that click.

## Settings

| Setting | Default | Purpose |
| --- | --- | --- |
| `video_providers` | `youtube,vimeo,dailymotion` | Comma-separated list of platforms Thelia recognizes when a merchant pastes a video address. An address from a platform not in this list is refused. A video already stored for a platform taken off the list keeps its row but is served without an embed address, so the gallery shows nothing for it; putting the platform back brings it back. |
| `videos_library_path` | `local/media/videos` | Where hosted video files are stored. |
| `video_upload_allowed_mime_types` | `video/mp4, video/webm, video/ogg` | Accepted MIME types for a hosted video upload, same mechanism as `image_upload_allowed_mime_types`. |

## Content Security Policy

Thelia does not emit a Content-Security-Policy header by default. A shop that sets one,
whether from the application server, a reverse proxy or a module, must allow the origin
of each video platform it enables in `frame-src`, and its own media origin in
`media-src` for hosted files.

| Platform | `frame-src` origin |
| --- | --- |
| YouTube | `https://www.youtube-nocookie.com` |
| Vimeo | `https://player.vimeo.com` |
| Dailymotion | `https://www.dailymotion.com` |

Hosted video files need `media-src 'self'`, or the CDN origin serving `local/media/videos`
if the shop offloads media to one.

Example header covering all three platforms, with hosted files served from the shop
itself:

```
Content-Security-Policy: default-src 'self'; frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com https://www.dailymotion.com; media-src 'self';
```

Drop the origins for any platform excluded from `video_providers`; a shop that only
enables YouTube only needs that one origin in `frame-src`.

## API resources

- `/api/front/product_videos` and `/api/admin/product_videos`: the video itself
  (provider, external identifier, embed address, thumbnail, position, visibility,
  translations)
- `/api/front/product_sale_elements_product_video` and its admin counterpart: the
  attachment of a video to a specific product sale element
- `decorative` and `i18ns[].alt` on `/api/front/product_images` (and the equivalent
  category, folder, content and brand image resources)

See [API resources](../api/resources) for the resource definitions, and
[Translatable resources](../api/translatable-resources) for how `i18ns` is read and
written.
