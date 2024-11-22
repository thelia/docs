---
title: Installation
sidebar_position: 1
---

You need to follow the requirements and have composer installed.
With this installation you can manage easily your Thelia version with composer, require new
dependencies, etc.

:::info

If you want to use **docker** please follow [this](./docker) way.

:::

### Download the project
```
composer create-project thelia/thelia-project YourProject 2.5.3
```

### Launch the database installation

```bash
cd YourProject
php Thelia thelia:install
```

That's all, your Thelia is now installed, but depending your web server you may need to do come configuration : 
- Guide for [Apache](./apache_configuration)
- Guide for [Nginx](./nginx_configuration)


### Insert demo data
Now if you want a demo data with fake but realistic products execute

```bash
php local/setup/import.php
```

### Create an admin account

```bash
php Thelia admin:create
```

### Require existing modules
If you want to add a module made by our community you can browse [this](../../modules) list and execute the `composer require` command attached to it to download it.
After that you can enable and disable the module in the modules pages in your store back-office.

-----
