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
