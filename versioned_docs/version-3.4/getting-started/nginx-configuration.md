---
title: Nginx configuration
sidebar_position: 2
---

Only the `public` directory has to be accessible. Configure your server block like this:

```nginx
server {
    listen 80;
    server_name domain.tld;

    root /var/www/thelia/public;
    index index.php;

    access_log /var/log/nginx/thelia.access.log;
    error_log /var/log/nginx/thelia.error.log;

    location / {
        try_files $uri $uri/ @rewriteapp;
    }

    location @rewriteapp {
        rewrite ^(.*)$ /index.php/$1 last;
    }

    # Uploaded documents: served as downloads, never run or rendered as a page
    location ^~ /cache/documents/ {
        add_header X-Content-Type-Options "nosniff" always;
        add_header Content-Disposition "attachment" always;

        location ~* \.(?:pdf|jpe?g|png|gif|webp|avif|txt)$ {
            add_header X-Content-Type-Options "nosniff" always;
        }
    }

    # PHP configuration
    location ~ ^/index\.php(/|$) {
        # PHP-FPM Config (Socket or Network)
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        # fastcgi_pass 127.0.0.1:9000;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $document_root;
        internal;
    }

    # Return 404 for other PHP files
    location ~ \.php$ {
        return 404;
    }

    # Security: discard all files and folders starting with a "."
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Favicon and robots
    location = /favicon.ico {
        access_log off;
        log_not_found off;
    }

    location = /robots.txt {
        access_log off;
        log_not_found off;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|gif|css|png|js|ico|pdf|zip|woff|woff2|ttf|svg)$ {
        try_files $uri @rewriteapp;
        expires 30d;
        access_log off;
        log_not_found off;
    }
}
```

Replace `/var/www/thelia/public` with the full path to the `public` directory of your project.

## Document cache

Thelia publishes the documents attached to products, categories, contents, folders and brands
under `public/cache/documents/`. The `location ^~ /cache/documents/` block serves them with
`X-Content-Type-Options: nosniff`, and as a download (`Content-Disposition: attachment`) unless
they are PDF, raster image or plain text files, which still open in the browser, so a browser
does not render an uploaded document as a page of the shop. The `^~` prefix also keeps the PHP
location and the static files location away from that directory.

The nested location repeats `nosniff` because nginx drops the `add_header` lines of the parent
location as soon as a location sets its own.

On Apache, Thelia writes an `.htaccess` that does the same in the document cache. nginx does
not read it, so a shop served by nginx needs this block. It is required from Thelia 3.2.1 and
3.1.2 on: add it to the server block of an existing shop when you update. If
`document_cache_dir_from_web_root` moves the document cache, change the path of the location.

## Theme assets

`php Thelia asset-map:compile` writes the theme files to `public/assets/` with a digest in
their names. In production it also writes a `.br`, a `.zst` and a `.gz` copy next to each text
file (see [Precompressed assets](#precompressed-assets) below). Serve them with a dedicated
location:

```nginx
# Theme files: the name carries a digest of the content.
location ^~ /assets/ {
    gzip_static on;
    brotli_static on;   # needs the ngx_brotli module, remove the line without it
    gzip_vary on;

    add_header Cache-Control "public, max-age=31536000, immutable" always;
    add_header Access-Control-Allow-Origin "*" always;

    # The original file must exist: gzip_static and brotli_static do not check it
    try_files $uri =404;
}
```

The `^~` prefix makes this location win over the static files location above, so the cache
headers are repeated inside it. This is the same `/assets/` location as in
[Serving files from a CDN](./cdn.md): keep a single one in the server block.

`gzip_static` is part of the standard nginx build on Debian. `brotli_static` comes from the
ngx_brotli module, packaged as `libnginx-mod-http-brotli-static` on Debian. nginx
does not serve `.zst` files natively: those are for servers and proxies that support them.

`gzip_static on` and `brotli_static on` answer with `$uri.gz` or `$uri.br` when the browser
accepts the encoding, and they do so without checking that `$uri` exists. Without
`try_files $uri =404`, a request for a path whose original file was removed would still receive
its stale compressed copy. With it, a missing original is a 404 and no compressed file is ever
served alone. `gzip_vary on` adds `Vary: Accept-Encoding`, so a cache keeps the compressed and
the plain versions apart.

## HTTP/2

The Flexy theme serves one JavaScript file per module through an import map: the home page
references about 80 module URLs and 15 `modulepreload` links. Over HTTP/1.1 these requests queue
on six connections per host. A server without HTTP/2 slows this model down noticeably, so enable
it on the TLS listener of the shop:

```nginx
server {
    listen 443 ssl;
    http2 on;   # nginx 1.25.1 and later
    # before 1.25.1: listen 443 ssl http2;
    server_name domain.tld;
    # ...
}
```

Browsers only use HTTP/2 over TLS, so the shop needs HTTPS. If a CDN or a proxy terminates TLS,
HTTP/2 has to be enabled there.

## Precompressed assets

In production, the Flexy and `default-twig` themes enable `framework.asset_mapper.precompress`
(Symfony 7.3 and later). `php Thelia asset-map:compile` then writes `.br`, `.zst` and `.gz`
copies next to each compiled text asset: CSS, JavaScript, JSON, SVG, TTF, OTF, XML, HTML and
a few other text formats, which is Symfony's default list. WOFF2 fonts and images are already compressed and are
left alone.

The formats are detected on the machine that runs the compile:

| Format | Needs |
| --- | --- |
| Brotli (`.br`) | the `brotli` command or the PHP `brotli` extension |
| Zstandard (`.zst`) | the `zstd` command or the PHP `zstd` extension |
| Gzip (`.gz`) | nothing, zlib is always available |

A missing tool is skipped with a warning and the compile goes on. Install `brotli` (and
optionally `zstd`) on the build machine to get those formats. The same compile rebuilds the
Flexy Tailwind stylesheet minified and the back-office Sass stylesheet compressed. Nothing
changes in development: the AssetMapper dev server serves the sources and never compresses.

To turn precompression off, or to restrict it, set it in a file of your project, for example
`config/packages/asset_mapper.yaml`. Each list replaces the default one, so give it in full:

```yaml
framework:
    asset_mapper:
        precompress:
            enabled: false
```

```yaml
framework:
    asset_mapper:
        precompress:
            formats: [brotli, gzip]
            extensions: [css, js, json, svg]
```

### Minifying JavaScript

The default theme does not minify its JavaScript: the first-party code is small, and the vendor
files downloaded from jsDelivr are already minified, so precompression covers most of the gain.
On the demo shop, minifying the JavaScript a page loads saves about 7 KB on the home page
and about 10 KB on a product page once Brotli has compressed it, about 4 KB of
which come from `live_controller.js`.
A project that ships heavier JavaScript can add `sensiolabs/minify-bundle`, a standalone binary
that needs no Node. It hooks into `asset-map:compile` and minifies the assets while they are
copied:

```bash
composer require sensiolabs/minify-bundle
```

Its options live in `config/packages/sensiolabs_minify.yaml`. By default it minifies CSS and
JavaScript, and ignores vendor files (`ignore_vendor: true`). It downloads the binary from
GitHub in debug mode only (`download_binary: '%kernel.debug%'`), so on a build machine, install
`minify` and set `local_binary: 'auto'` so the bundle finds it:

```yaml
sensiolabs_minify:
    minify:
        local_binary: 'auto'
```

See the [bundle README](https://github.com/SensioLabs/minify-bundle) for the other options.

## Required writable directories

Ensure Nginx (www-data) has write access to:

- `var/cache`
- `var/log`
- `local/session`
- `local/media`
- `public/cache`

```bash
chmod -R 755 var/cache var/log local/session local/media public/cache
chown -R www-data:www-data var/ local/ public/cache
```

## Serving files from a CDN

To serve theme files and catalogue images from a CDN, see [Serving files from a CDN](./cdn.md).
