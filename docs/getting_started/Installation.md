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

Rename `YourProject` with the name of your project. Be aware of the version you want to install (here `2.6.0`) :

```bash
composer create-project thelia/thelia-project YourProject 2.6.0
```

You can say `yes` for the recipes.

### Thelia core installation
```bash
cd YourProject
php Thelia thelia:install
```
Installation will ask you some questions, like database connection. Please, use the access of your provider.

### Create an admin

```bash
php Thelia admin:create
```

### Thelia modern theme installation

#### 1\. Check Node.js Version


Make sure you have Node.js installed and a supported version > 10.0.0
```bash
node --version
```
If your Node.js version is not supported, install a compatible version from [Node.js](https://nodejs.org).


#### 2\. Check Yarn Installation

Verify that Yarn is installed and accessible in your system.

```bash
yarn --version
```
If Yarn is not installed, install it by following the instructions on the [Yarn website](https://yarnpkg.com).


#### 3\. Configure a Template

Choose a front-office template. By default, the template is named `modern`.

```bash
cp -r templates/frontOffice/modern templates/frontOffice/<template_name>
```

Replace `<template_name>` with your desired template name.


#### 4\. Activate/Deactivate Modules

Activate essential modules and deactivate unnecessary ones.


```bash
php Thelia module:refresh
php Thelia module:activate OpenApi
php Thelia module:activate ChoiceFilter
php Thelia module:activate StoreSeo
php Thelia module:activate SmartyRedirection
php Thelia module:deactivate HookAdminHome
php Thelia module:deactivate HookAnalytics
php Thelia module:deactivate HookCart
php Thelia module:deactivate HookCustomer
php Thelia module:deactivate HookSearch
php Thelia module:deactivate HookLang
php Thelia module:deactivate HookCurrency
php Thelia module:deactivate HookNavigation
php Thelia module:deactivate HookProductsNew
php Thelia module:deactivate HookSocial
php Thelia module:deactivate HookNewsletter
php Thelia module:deactivate HookContact
php Thelia module:deactivate HookLinks
php Thelia module:deactivate HookProductsOffer
php Thelia module:refresh
```

⚠️ You can ignore errors on deactivate commands; some modules might not be installed or available.

#### 5\. Change Active Template

Set the active front-office template.

```bash
php Thelia template:set frontOffice <template_name>
```

Replace `<template_name>` with your chosen template.

#### 6\. Install Front-End Dependencies

Navigate to your template directory and install dependencies using Yarn.

```bash
cd templates/frontOffice/<template_name>
yarn install
yarn build
```

#### Final Step: Clear Cache

Clear the cache to ensure all changes are applied.

```bash
rm -rf ./var/cache
php Thelia assets:install web
```

Depending your web server you may need to do come configuration : 
- Guide for [Apache](./apache_configuration)
- Guide for [Nginx](./nginx_configuration)

----

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
