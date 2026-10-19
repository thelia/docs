---
title: Serving files from a CDN
sidebar_position: 4.6
---

# Serving files from a CDN

A shop serves three families of files, and each one is configured in a different place:

| Files | Where they come from | What to configure |
| --- | --- | --- |
| Theme files (JavaScript, CSS, fonts, icons) | Compiled by AssetMapper into `public/assets/` | Cache headers on the origin; `ASSETS_CDN_URL` only for a separate domain |
| Catalogue images | Generated on demand by LiipImagine into `public/media/cache/` | Cache headers on the origin; `MEDIA_CDN_URL` only for a separate domain |
| Protected files (virtual products, invoices, order PDFs) | Served by the shop after checking the visitor's rights | Nothing: they must not be cached by a CDN |

HTML pages and protected files are sent as `private`, so a CDN that honours the origin headers
does not cache them. The rest of this page explains each family, then the settings that keep
absolute URLs on the shop's own domain.

The setups below were checked on Thelia 3.2 and on the development version of the core, with
the Flexy theme and the default back office theme, behind a caching reverse proxy configured
like a pull CDN that honours the origin's `Cache-Control` headers. Rules specific to a
commercial CDN (edge TTL overrides, "cache everything" options) are not covered.

## Two ways to set it up

The reference setup puts a pull CDN in front of the shop's own domain: the CDN answers for
`shop.example.com`, sends the requests it cannot serve from its cache to the shop, and caches
what the origin marks as cacheable. Thelia needs no setting for it, theme files and images keep
their usual URLs, and the back office works as before. What it needs is the cache headers of
[Headers on the origin](#headers-on-the-origin) and the host and proxy settings of
[Absolute URLs and trusted hosts](#absolute-urls-and-trusted-hosts).

The other setup serves the files from a separate domain, such as `cdn.example.com`, while
pages stay on the shop's domain. Thelia then has to write that domain in the URLs it builds:
`ASSETS_CDN_URL` for theme files, `MEDIA_CDN_URL` for catalogue images. A separate domain never
receives the shop's cookies, but it needs the CORS header below, and the default back office
theme does not support `ASSETS_CDN_URL` yet (see the warning in
[Pointing asset URLs to a separate domain](#pointing-asset-urls-to-a-separate-domain)).

## Theme files

The front theme's files are served under `/assets/frontOffice/<active theme>/`, for Flexy
`/assets/frontOffice/flexy/`. The back office theme's files are compiled under the same prefix
(`/assets/frontOffice/flexy/backoffice/...`), because the whole application has a single asset
map. The prefix follows the active theme, so changing theme changes every asset URL.

Each file name carries a digest of its content, for example `app-e2rXCYD.js`. A file whose
content changes gets a new name, which is what makes long caching safe.

With a CDN in front of the shop's domain, theme files need nothing more than the
[headers on the origin](#headers-on-the-origin). The next section only applies to a separate
domain.

### Pointing asset URLs to a separate domain

Create `config/packages/assets_cdn.yaml` in the project:

```yaml
parameters:
    env(ASSETS_CDN_URL): ''

framework:
    assets:
        base_urls: '%env(ASSETS_CDN_URL)%'
```

Then set the variable in the environment of the server:

```bash
# .env.local, or the environment of the hosting
ASSETS_CDN_URL=https://cdn.example.com
```

With the variable empty, nothing changes and asset URLs stay relative, so the file can be
committed and the CDN switched on per environment. With the variable set, every asset URL is
rewritten: `asset()` calls (favicons), the importmap
(`"app": "https://cdn.example.com/assets/frontOffice/flexy/app-e2rXCYD.js"`), the
`<link rel="modulepreload">` tags and the HTTP `Link: <...css>; rel="preload"` header.

There is a single default asset package and no option per area, so the back office asset URLs
are rewritten too.

:::warning The default back office theme breaks with `ASSETS_CDN_URL`
The default back office theme (`thelia/backoffice-default-twig-template`, up to 1.2.2 and in its
development version) loads its entry script through `asset()`, so from the CDN domain, but
writes its importmap with paths on the shop's domain. The relative imports of the entry script
then resolve on the CDN domain, match no importmap entry, and the browser requests files that do
not exist, such as `/assets/frontOffice/flexy/backoffice/bootstrap.js` (404). The back office
loses its scripts: tabs, pickers and every form that relies on JavaScript stop working. The front
office is not affected.

Until the back office theme handles it, do not set `ASSETS_CDN_URL` on a shop that uses this
theme: put the CDN in front of the shop's domain instead.
:::

### Headers on the origin

By default nginx sends no `Cache-Control` header for `/assets/`, and a CDN that honours origin
headers then caches nothing. Add these blocks to the shop's server block, next to the
configuration of the [nginx page](./nginx-configuration.md):

```nginx
# Theme files: content-hashed names, never change once published.
location ^~ /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable" always;
    add_header Access-Control-Allow-Origin "*" always;
    try_files $uri =404;
}

# Catalogue derivatives: generated on demand, same name when regenerated.
location ^~ /media/cache/ {
    try_files $uri @rewriteapp;
    add_header Cache-Control "public, max-age=86400" always;
}
```

The `/media/cache/` block is explained in [Catalogue images](#catalogue-images). With another
web server, or with rules set on the CDN instead of the origin, apply the same principle:
a long TTL and `immutable` on `/assets/`, and the CORS header below.

### The CORS header is required

The importmap loads the theme's scripts as ES modules. Once they come from another domain, the
browser only runs them if the response carries `Access-Control-Allow-Origin`.

:::warning Without CORS the front office stops working
Without the header, the browser console fills with errors such as
`... has been blocked by CORS policy`: `app.js`, Turbo and the Stimulus controllers are all
blocked, and the pages lose every interactive behaviour. With
`Access-Control-Allow-Origin: *` on `/assets/`, the same pages load with no error.
:::

Fonts are referenced by relative `url()` in the compiled CSS, so they load from the CDN as well.

### Deploying

A deploy needs no purge. A changed file gets a new name, the page references the new name,
and the CDN fetches it from the origin on the first request. The old URL stays in the CDN
cache, where it does no harm.

What the deploy must do is rebuild the compiled files that the web server serves:

```bash
php Thelia asset-map:compile
```

- `bin/install` runs `importmap:install`, `tailwind:build` and `sass:build`, but not
  `asset-map:compile`.
- `php Thelia thelia:cache:clear` deletes `public/assets` unless you pass
  `--without-assets`. Compile again after it.
- The Composer package of the theme does not ship `assets/vendor/`: run
  `php Thelia importmap:install` after updating it.
- Changing the active theme changes the prefix of every asset URL, so the CDN fetches the
  new files on first request.

## Catalogue images

The original images and documents live outside the web root, in `local/media/images` and
`local/media/documents`. The resized versions shown on the shop (derivatives) are generated on
demand into `public/media/cache/<filter>/...`.

A derivative that does not exist yet is linked as `/media/cache/resolve/<filter>/<path>`. PHP
generates it and answers a `302` redirect to the final file, with
`cache-control: max-age=0, must-revalidate, private` and a session cookie. A CDN never caches
that redirect, and it should not. Once the file exists, pages link it directly.

Derivative URLs are absolute and built from the host of the request, for example
`src="https://shop.example.com/media/cache/product_card/product/PROD002-1.jpg"`. Their names
are not versioned by content (`<original name>-<id>.<ext>`): a regenerated image keeps its
name. Give them a moderate TTL, such as the one day of the nginx block above, and never
`immutable`.

The `try_files $uri @rewriteapp;` line of the `/media/cache/` block is what lets a
`/media/cache/resolve/` request reach PHP. Without it, a derivative that has not been generated
yet is never generated and the image stays broken.

There are two ways to put a CDN in front of these images.

### CDN in front of the shop domain

A pull CDN placed in front of the whole shop domain caches the derivatives under their usual
URLs. No Thelia setting is needed: the CDN honours the `Cache-Control` headers of the origin,
caches `/media/cache/<filter>/...` files and lets the `private` responses through. The same
applies if you keep images on the shop domain and only move theme files to the CDN.

### Dedicated media domain

To serve derivatives from a separate domain, create `config/packages/liip_imagine_cdn.yaml`:

```yaml
parameters:
    env(MEDIA_CDN_URL): ''

services:
    app.imagine.cdn_resolver:
        class: Liip\ImagineBundle\Imagine\Cache\Resolver\ProxyResolver
        arguments:
            - '@liip_imagine.cache.resolver.default'
            - ['%env(MEDIA_CDN_URL)%']
        tags:
            - { name: liip_imagine.cache.resolver, resolver: cdn }

liip_imagine:
    cache: cdn
```

```bash
# .env.local, or the environment of the hosting
MEDIA_CDN_URL=https://media.example.com
```

The CDN pulls from the shop domain. Product images and their WebP `<source srcset>` variants
are then linked on the media domain. A derivative not generated yet keeps its
`/media/cache/resolve/` URL on the shop domain, the shop generates it and redirects to the
media domain, and the CDN fetches it from the origin. A new image therefore shows without
purging the CDN.

The file can be committed and kept in every environment. With `MEDIA_CDN_URL` empty, the
resolver removes the scheme and host from derivative URLs, which become relative
(`src="/media/cache/product_card/..."`), and the redirect sent by
`/media/cache/resolve/` is relative too. Images display as before, and derivative URLs no
longer depend on the `Host` header of the request. The `/media/cache/resolve/` links
themselves stay absolute, because they are generated by the router.

Pushing derivatives to object storage is another option. LiipImagine provides resolvers for it,
but the distribution installs no Flysystem or AWS package, and this setup is not covered here.

### The WebP trap

:::warning Do not turn on `liip_imagine.webp.generate`
With `liip_imagine.webp.generate: true`, LiipImagine always returns the
`/media/cache/resolve/` URL and picks the format from the `Accept: image/webp` header of the
browser. Every view of every image becomes a private `302`, and a CDN caches nothing. Flexy sets
`generate: false` since version 1.0.1. A project that sets it back to `true` loses image caching.
:::

To check a shop, load a product page twice and count the `/media/cache/resolve/` URLs in the
`src` and `srcset` attributes of the second response. There should be none; with the setting
on, every image of the page uses one. A zoom link (`data-zoom-src`) can keep a
`/media/cache/resolve/` URL until a visitor opens the zoom, which is expected.

```bash
curl -s https://shop.example.com/<product page> > /dev/null
curl -s https://shop.example.com/<product page> \
  | grep -oE '[[:space:]](src|srcset)="[^"]*/media/cache/resolve/' | wc -l
```

## Protected files

These files are served by the shop after it has checked the visitor's rights. They must never
go through CDN caching:

| URL | Content | Check made by the shop |
| --- | --- | --- |
| `/account/order/download/{orderProductId}` | Virtual product file | Logged-in customer, order line of that customer, paid order |
| `/order/track/{token}/download/{orderProductId}` | Virtual product file, guest order | Signed guest token |
| `/account/order/pdf/{delivery,invoice,quotation}/{id}` | Order PDFs | Logged-in customer |
| `/account/return/pdf/{id}` | Return PDF | Logged-in customer |
| `/order/track/{token}/invoice` | Invoice, guest order | Signed guest token |

Virtual product files are read from `local/media/documents/` and sent as attachments. All of
these responses carry `cache-control: private`: requested anonymously through a CDN,
`/account/order/download/1` and `/account/order/pdf/invoice/1` redirect to `/customer/login`,
and the CDN fetches them from the origin every time.

They stay safe as long as the CDN honours the origin's `Cache-Control`. Never add a "cache
everything" rule on:

- `/account/*`
- `/order/*`
- `/admin*`
- `/api/*`
- `/_components/*` (LiveComponent requests)
- `/media/cache/resolve/*`
- HTML pages

Catalogue documents attached to products, categories or contents are public by design. They
are served by the API under `/api/front/{product,category,content,...}_documents/{id}/file` and
from `public/cache/documents/`.

SVG images are accepted (sanitised at upload) and served as `image/svg+xml`. Serving media from
a separate domain limits what a malicious SVG could do on the shop's domain.

## Absolute URLs and trusted hosts

Several absolute URLs are built from the `Host` header of the request: derivative image URLs,
the sitemap and the guest order tracking link. The
[media resolver file](#dedicated-media-domain) takes derivative images out of that list, but
not the others. Thelia ships no list of trusted hosts, so a
request sent with a forged `Host` gets pages whose image URLs point to that host. Worse,
`/sitemap.xml?flush=1` sent with a forged `Host` rewrites the cached sitemap, and every visitor
and search engine then receives URLs on the attacker's domain until the next rebuild.

A CDN makes this easier to exploit, because a poisoned response can be cached and served to
everyone. Declaring the shop's host is therefore mandatory. Set `url_site` to the shop URL
first (back office configuration, or the command below; it is empty on a fresh demo install):

```bash
php Thelia thelia:config set url_site "https://shop.example.com"
```

Console commands that build a request, such as `php Thelia tntsearch:indexes`, take its host
from `url_site` and fall back to `localhost` when it is empty. With trusted hosts set and
`url_site` empty, they stop with `Untrusted Host "localhost"`.

Then declare the host:

```bash
# .env.local, or the environment of the hosting: a regular expression, several separated by commas
SYMFONY_TRUSTED_HOSTS='^shop\.example\.com$'
```

Symfony reads it through `trusted_hosts: '%env(default::SYMFONY_TRUSTED_HOSTS)%'`. Once it is
set, a request with any other `Host` gets a `400` response, and the shop host still answers
normally, directly and through the CDN. Keep it out of the environment of the test suites: they
send their requests with the `localhost` host and would all be refused.

It follows that the CDN must send the shop's own host to the origin (often called "host header
= origin host" in pull zone settings), never the CDN domain or the host sent by the client.

When the CDN terminates TLS, Thelia also needs to know which proxies to trust, so that it sees
the visitor's address and the `https` scheme. Without project configuration, Symfony reads
them from `SYMFONY_TRUSTED_PROXIES`; a project that wires its own `TRUSTED_PROXIES` variable
into `framework.trusted_proxies`, as
[Behind a proxy or a load balancer](../api/rate-limiting.md#behind-a-proxy-or-a-load-balancer)
shows, sets that one instead. The same section gives the rules for choosing the addresses.
Thelia's default trusted headers are `X-Forwarded-For`, `X-Forwarded-Port` and
`X-Forwarded-Proto`, not `X-Forwarded-Host`.

`url_site` also serves the e-mail layout and the SEO canonical and hreflang URLs, so links in
e-mails do not depend on the request either.

## HTML and cookies

HTML pages are sent with `cache-control: max-age=0, must-revalidate, private` and a
`PHPSESSID` cookie on the first visit, so a CDN caches no HTML today. Caching public pages is
a separate topic.

Files under `/assets/` and existing files under `/media/cache/<filter>/` are sent without
`Set-Cookie`. A separate CDN or media domain never receives the shop's cookies, so browsers do
not send them with every image and script request.

## Checking the setup

Theme files, through the CDN. Run it twice: the second response should show the CDN's cache
status header as a hit.

```bash
curl -sI https://cdn.example.com/assets/frontOffice/flexy/app-<hash>.js
# cache-control: public, max-age=31536000, immutable
# access-control-allow-origin: *
```

Asset URLs in a page point to the CDN domain:

```bash
curl -s https://shop.example.com/ | grep -oE '(src|href)="[^"]*/assets/[^"]*"' | head
```

HTML stays private:

```bash
curl -sI https://shop.example.com/
# cache-control: ... private
```

A forged host is refused, against the origin directly:

```bash
curl -s -o /dev/null -w '%{http_code}' -H 'Host: evil.example' https://shop.example.com/
# 400
```

In the browser, open the developer tools, filter the Network tab by domain, and check that the
console shows no CORS error. Do the same on a back office page with tabs, such as a product
edit page: the tabs must switch and the Network tab must show no `404` under `/assets/`.

### After the first deploy

- Theme files load through the CDN, and the back office still switches tabs and saves forms.
- After a deploy that changes a theme file, pages use the new version without any purge.
- Virtual product downloads are still served by the shop, and a logged-out request is
  redirected to the login page.
- Links in e-mails and invoices use the shop domain (`url_site` is set).
- A newly added product image shows without purging the CDN.
- `sitemap.xml` and the canonical URLs of the pages use the shop domain, not the CDN domain.
- A request with a forged `Host` gets a `400`.
