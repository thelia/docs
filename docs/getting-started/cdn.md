---
title: Serving files from a CDN
sidebar_position: 4.7
---

# Serving files from a CDN

| Files | Served from | CDN cache |
| --- | --- | --- |
| Theme files (JS, CSS, fonts, icons) | `public/assets/`, compiled by AssetMapper | Yes, long TTL |
| Catalogue images | `public/cache/images/`, generated on demand by LiipImagine | Yes, moderate TTL |
| Protected files (virtual products, order PDFs) | The shop, after checking the visitor's rights | Never |

Checked on Thelia 3.2 and the development version of the core, with Flexy and the default back
office theme, behind a caching proxy that honours the origin's `Cache-Control`. Options specific
to a commercial CDN are not covered.

## Recommended setup: a CDN in front of the shop domain

The CDN answers for `shop.example.com` and forwards to the shop what it does not have in cache.
URLs do not change, the back office works as before, and Thelia needs three settings.

### 1. Cache headers on the origin

Add to the shop's server block (see the [nginx page](./nginx-configuration.md), which extends
the `/assets/` location below with `gzip_static` and `brotli_static`: keep a single `/assets/`
location):

```nginx
# Theme files: the name carries a digest of the content.
location ^~ /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable" always;
    add_header Access-Control-Allow-Origin "*" always;
    try_files $uri =404;
}

# Image derivatives: same name when regenerated, so no immutable.
location ^~ /cache/images/ {
    add_header Cache-Control "public, max-age=86400" always;
    try_files $uri =404;
}
```

Derivatives are written under `public/cache/images/`, the `cache_prefix` TheliaLibrary sets in
`config/packages/liip_imagine_thelia.yaml`. One not generated yet is linked as
`/media/cache/resolve/...`, which PHP generates before answering a `302` to the file: that path
must reach PHP, as the [nginx page](./nginx-configuration.md) configures it.

### 2. The shop URL and its trusted host

Absolute URLs (images, sitemap, guest order link) are built from the `Host` header of the
request. Without a trusted host list, a forged `Host` ends up in the links, and
`/sitemap.xml?flush=1` sent with it rewrites the cached sitemap for every visitor.

```bash
php Thelia thelia:config set url_site "https://shop.example.com"
```

```bash
# .env.local or the hosting environment: regular expressions, comma separated
SYMFONY_TRUSTED_HOSTS='^shop\.example\.com$'
```

Set `url_site` first: console commands that build a request (`tntsearch:indexes`, for one) take
its host, and fail with `Untrusted Host "localhost"` while it is empty. Any other host now gets a
`400`. Keep the variable out of the test suites, which use `localhost`.

The CDN must send the shop's own host to the origin ("host header = origin host").

### 3. The trusted proxies

When the CDN ends TLS, Thelia must trust it to see the visitor's address and `https`: set
`SYMFONY_TRUSTED_PROXIES`, or the `TRUSTED_PROXIES` variable a project wires as shown in
[Behind a proxy or a load balancer](../api/rate-limiting.md#behind-a-proxy-or-a-load-balancer).
`X-Forwarded-Host` is not trusted by default.

## Files on a separate domain

To serve files from `cdn.example.com` while pages stay on the shop domain, Thelia must write
that domain in the URLs. With the variable empty, the files below change nothing for a shop at
the root of its domain, so they can be committed. A shop installed in a subdirectory loses its
base path as soon as `assets_cdn.yaml` exists, the variable empty or not: there, add that file
only where `ASSETS_CDN_URL` is set.

**Theme files**, `config/packages/assets_cdn.yaml`:

```yaml
parameters:
    env(ASSETS_CDN_URL): ''

framework:
    assets:
        base_urls: '%env(ASSETS_CDN_URL)%'
```

This rewrites `asset()`, the importmap, the `modulepreload` tags and the `Link` header. The
`Access-Control-Allow-Origin` header of step 1 is then mandatory: without it the browser blocks
every theme script (`... has been blocked by CORS policy`).

:::warning The default back office theme breaks
Up to 1.2.2 and in its development version, `default-twig` loads its entry script from the CDN
domain but keeps its importmap on the shop domain: the browser requests
`/assets/frontOffice/flexy/backoffice/bootstrap.js` (404) and the back office loses its
JavaScript. Do not set `ASSETS_CDN_URL` with this theme; use the recommended setup.
:::

**Catalogue images**, `config/packages/liip_imagine_cdn.yaml`:

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

Images and their WebP variants are then linked on `MEDIA_CDN_URL`; a new image shows without
purge. With the variable empty, image URLs become relative and no longer depend on the `Host`
of the request. A separate domain never receives the shop's cookies, and keeps uploaded SVG off
the shop domain.

## Pitfalls

- A deploy needs no purge: a changed theme file gets a new name. Run
  `php Thelia asset-map:compile` on each deploy (`bin/install` does not), again after
  `thelia:cache:clear` (it empties `public/assets` unless `--without-assets`), and
  `importmap:install` after updating the theme package. In production, this command also
  writes the minified CSS and the precompressed `.br`, `.zst` and `.gz` files.
- Never set `liip_imagine.webp.generate: true`: every image then goes through a
  private `302` that no CDN caches. To check, the second load of a product page must show no
  `/media/cache/resolve/` in `src` or `srcset` (the zoom link `data-zoom-src` may keep one):

  ```bash
  curl -s https://shop.example.com/<product page> > /dev/null
  curl -s https://shop.example.com/<product page> | grep -oE '[[:space:]](src|srcset)="[^"]*/media/cache/resolve/' | wc -l
  ```

- Protected files are sent `private`, the guest download route included: Thelia starts a session
  on every front request, and Symfony then marks the response `private`, even a
  `BinaryFileResponse`, which is public by default. They must stay so: no "cache everything" rule on
  `/account/*`, `/order/*`, `/admin*`, `/api/*`, `/_components/*`, `/media/cache/resolve/*` or HTML.
  Virtual product downloads (`/account/order/download/{id}`, `/order/track/{token}/download/{id}`)
  require the customer's paid order or the guest token.
- HTML is `private` with a session cookie, so no CDN caches it by default. From Thelia 3.3,
  read [Reverse proxy cache](./reverse-proxy-cache.md) before letting a CDN keep pages.
- A visitor country read from a CDN header (`CF-IPCountry`, for example) needs the CDN to set that
  header before its cache. See [Visitor country detection](../features/visitor-country.md#caching).

## Checking the setup

```bash
# Theme file: long TTL and CORS, then a cache hit on the second call
curl -sI https://cdn.example.com/assets/frontOffice/flexy/app-<hash>.js
# HTML stays private
curl -sI https://shop.example.com/ | grep -i cache-control
# A forged host is refused (against the origin): 400
curl -s -o /dev/null -w '%{http_code}' -H 'Host: evil.example' https://shop.example.com/
```

In the browser, the console shows no CORS error, and on a back office product page the tabs
switch with no `404` under `/assets/`. After the first deploy, check that a changed theme file
and a new product image show without purge, that a logged-out download redirects to the login
page, and that e-mails, the sitemap and canonical URLs use the shop domain.
