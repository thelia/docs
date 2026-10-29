---
title: Apache configuration
sidebar_position: 3
---

Only the `public` directory has to be accessible with Apache. Configure your vhost like this:

```apache
<VirtualHost *:80>
    ServerName domain.tld
    DocumentRoot "/var/www/thelia/public"

    <Directory "/var/www/thelia/public">
        AllowOverride All
        Require all granted
    </Directory>

    # Custom log file
    LogLevel warn
    ErrorLog /var/log/apache2/thelia.error.log
    CustomLog /var/log/apache2/thelia.access.log combined
</VirtualHost>
```

Replace `/var/www/thelia/public` with the full path to the `public` directory of your project.

## .htaccess files

Thelia relies on two `.htaccess` files, so `AllowOverride` must include at least `FileInfo`
(`All` covers it):

- `public/.htaccess` routes the requests to `index.php`;
- `public/cache/documents/.htaccess`, from Thelia 3.2.1 and 3.1.2 on, keeps the browser from
  rendering a published document as a page of the shop. It sends
  `X-Content-Type-Options: nosniff` for every document and `Content-Disposition: attachment`
  for all but PDF, raster image and plain text files. Its directives only apply when
  `mod_headers` is enabled.

Thelia writes the second file itself, when it is missing: the update script writes it for the
documents already published, and Thelia writes it before it publishes a document. If the update
script cannot write it, it prints a warning naming `Thelia\Core\File\DocumentCacheProtection`,
the class that writes it. An `.htaccess` already present in the directory is left as it is: add
these headers to it yourself. When `document_cache_dir_from_web_root` moves the document cache,
the file goes in that directory.

## Theme assets

`php Thelia asset-map:compile` writes the theme files to `public/assets/` with a digest in
their names. In production it also writes a `.br`, a `.zst` and a `.gz` copy next to each text
file (see [Precompressed assets](./nginx-configuration.md#precompressed-assets)). From Thelia 3.3,
the `public/.htaccess` of the shop serves the `.br` and `.gz` copies when the browser accepts
them (it needs `mod_rewrite` and `mod_headers`; without `mod_headers` the original file is sent).
On an older `.htaccess`, add these rules to it. If the virtual host does not read `.htaccess`
files (`AllowOverride None`), put them in the `<Directory>` block of `public/` instead: while
the `.htaccess` is read, its rewrite rules replace those of the `<Directory>` block, which are
then ignored.

```apache
<IfModule mod_rewrite.c>
<IfModule mod_headers.c>
    RewriteEngine On

    # Brotli, if the browser accepts it and the original file exists
    RewriteCond %{HTTP:Accept-Encoding} br
    RewriteCond %{REQUEST_FILENAME} -f
    RewriteCond %{REQUEST_FILENAME}.br -s
    RewriteRule ^(assets/.*)\.(css|js|json|svg)$ $1.$2.br [QSA]

    # Gzip, if the browser accepts it and the original file exists
    RewriteCond %{HTTP:Accept-Encoding} gzip
    RewriteCond %{REQUEST_FILENAME} -f
    RewriteCond %{REQUEST_FILENAME}.gz -s
    RewriteRule ^(assets/.*)\.(css|js|json|svg)$ $1.$2.gz [QSA]

    # Right content type, and no second compression by mod_brotli or mod_deflate
    RewriteRule \.css\.(br|gz)$  - [T=text/css,E=no-brotli:1,E=no-gzip:1]
    RewriteRule \.js\.(br|gz)$   - [T=text/javascript,E=no-brotli:1,E=no-gzip:1]
    RewriteRule \.json\.(br|gz)$ - [T=application/json,E=no-brotli:1,E=no-gzip:1]
    RewriteRule \.svg\.(br|gz)$  - [T=image/svg+xml,E=no-brotli:1,E=no-gzip:1]

    <FilesMatch "\.(css|js|json|svg)\.br$">
        Header append Content-Encoding br
        Header append Vary Accept-Encoding
    </FilesMatch>
    <FilesMatch "\.(css|js|json|svg)\.gz$">
        Header append Content-Encoding gzip
        Header append Vary Accept-Encoding
    </FilesMatch>
</IfModule>
</IfModule>
```

The rules follow the precompressed content pattern of the Apache manual
([mod_brotli](https://httpd.apache.org/docs/2.4/mod/mod_brotli.html#precompressed) and
[mod_deflate](https://httpd.apache.org/docs/2.4/mod/mod_deflate.html#precompressed)). Two
details differ:

- The `public/.htaccess` of Thelia already compresses text on the fly with `mod_deflate` and
  `mod_brotli`. `E=no-brotli:1,E=no-gzip:1` stops them from compressing a file that is already
  compressed.
- `RewriteCond %{REQUEST_FILENAME} -f` requires the original file to exist, so a compressed copy
  is never served for a path whose original was removed.

The rules only apply under `assets/`. Thelia's `.htaccess` sends every other request that is not
a file to `index.php`, and it does not touch a file that exists.

## HTTP/2

The Flexy theme serves one JavaScript file per module through an import map: the home page
references about 80 module URLs and 15 `modulepreload` links. Over HTTP/1.1 these requests queue
on six connections per host. A server without HTTP/2 slows this model down noticeably, so enable
it on the HTTPS vhost:

```apache
Protocols h2 http/1.1
```

This needs `mod_http2` (`a2enmod http2` on Debian) and an MPM that supports it: `mpm_event` or
`mpm_worker`, not `mpm_prefork`. With `mpm_prefork`, switch to `mpm_event` and run PHP through
PHP-FPM (`proxy_fcgi`). Browsers only use HTTP/2 over TLS, so the shop needs HTTPS.

## Required writable directories

Apache needs write access to these directories:

- `var/cache`
- `var/log`
- `local/session`
- `local/media`
- `public/cache`

```bash
chmod -R 755 var/cache var/log local/session local/media public/cache
chown -R www-data:www-data var/ local/ public/cache
```
