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
        expires 30d;
        access_log off;
        log_not_found off;
    }
}
```

Replace `/var/www/thelia/public` with the full path to the `public` directory of your project.

## Required Writable Directories

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
