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

## Videos

A product can attach videos alongside its images. A video comes from one of two
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
| `video_providers` | `youtube,vimeo,dailymotion` | Comma-separated list of platforms Thelia recognizes when a merchant pastes a video address. An address from a platform not in this list is refused. |
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
