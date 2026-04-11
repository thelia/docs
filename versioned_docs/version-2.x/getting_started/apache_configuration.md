---
title: Apache configuration
sidebar_position: 3
---

Only the ```web``` directory has to be accessible with apache, you can configure your vhost like this :

```
<virtualhost *:80>

	ServerName http://domain.tld
	DocumentRoot "/var/www/thelia/web"

	<Directory "/var/www/thelia/web">
	    AllowOverride All
        
        # on apache 2.2 use :
        #Order allow,deny
        #Allow from all
        
        # on apache 2.4 use :
        Require all granted
    </Directory>

	# Custom log file
    Loglevel warn
    ErrorLog /var/log/apache2/yoursite.error.log
    CustomLog /var/log/apache2/yoursite.log combined

</virtualHost>

```

Replace `/var/www/thelia/web` by the full path to the web directory of your project

Apache write in some directories so check this directories and change their rights :

* cache
* log
* local/session
* local/media
* web