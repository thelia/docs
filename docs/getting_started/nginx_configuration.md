---
title: Nginx configuration
sidebar_position: 2
---

Only the ```web``` directory has to be accessible :

```
server {
    listen 80;
    server_name domain.tld;

    root /var/www/thelia/web/;
    index index.php;

    access_log      /var/log/nginx/domain.tld_access.log;
    error_log       /var/log/nginx/domain.tld_error.log;

    location / {
        try_files $uri $uri/ @rewriteapp;
    }

    location @rewriteapp {
    # rewrite all to index.php
        rewrite ^(.*)$ /index.php/$1 last;
    }

    # Php configuration
    location ~ ^/(index|index_dev)\.php(/|$) {
        # Php-FPM Config (Socks or Network) 
        fastcgi_pass unix:/var/run/php5-fpm.sock;
        # fastcgi_pass 127.0.0.1:9000;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    # Security. discard all files and folders starting with a "."
    location ~ /\. {
        deny  all;
        access_log off;
        log_not_found off;
    }
    # Stuffs
    location = /favicon.ico {
        allow all;
        access_log off;
        log_not_found off;
    }
    location ~ /robots.txt {
        allow  all;
        access_log off;
        log_not_found off;
    }

    # Static files
    location ~* ^.+\.(jpg|jpeg|gif|css|png|js|pdf|zip)$ {
        expires     30d;
        access_log  off;
        log_not_found off;
    }
}
```

Replace `/var/www/thelia/web` by the full path to the web directory of your project
