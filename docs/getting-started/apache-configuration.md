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

## Required Writable Directories

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
