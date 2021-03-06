---
title: Getting started
---

When you create a new website but a feature is missing in Thelia you can add it by creating a module.    
We advise to create only one specific module to your website, in general we name it by the name of the project. 

But if you think your feature can help other users of Thelia you can create a new module only for this feature and publish it on Github, here is a list a modules published by the Thelia core team https://github.com/thelia-modules

## Module structure

:::caution

All folders and files are case sensitive

:::

The structure of your module is like this :

```
\local
  \modules
    \MyModule
      \Config
        config.xml   <- mandatory
        module.xml   <- mandatory
        routing.xml
        schema.xml
      MyModule.php <- mandatory
      \Loop
        Product.php
        MyLoop.php
      ...
```

Your root folder is the name of your module (in this example the name is "MyModule"). You have to create the main
class MyModule in the MyModule.php file. Remember, your module must be [PSR-0](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-0.md) compliant, so your main class is MyModule\MyModule.php (yes
 namespace use is mandatory and it's good for you). The other mandatory file is module.xml. This file contains
 information about module like compatibility and dependencies with other modules.

The config file (Config/config.xml) is mandatory. With this file you can declare all your
services like event listeners, loops, forms or commands.

Here is the body of your config.xml file :

```xml
<?xml version="1.0" encoding="UTF-8" ?>

<config xmlns="http://thelia.net/schema/dic/config"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://thelia.net/schema/dic/config http://thelia.net/schema/dic/config/thelia-1.0.xsd">


</config>
```



## Module and Command line

Command line is very usefull for generating many thinks around modules.

### Generate a new module

```
$ php Thelia module:generate ModuleName
```

This command line generate a module with all needed classes, files and folders

### Generate the model

```bash
$ php Thelia module:generate:model ModuleName
```

This command search the schema.xml file and parse it using Propel command line.

This file is explain in [Propel documentation](http://propelorm.org/reference/schema.html)

### Generate the sql

```
$ php Thelia module:generate:sql ModuleName
```

Just like the precedent command, schema.xml is parsed and sql file is created in Config folder.


## Manage your module with composer

If you want to use composer in your module, you have to require a special package in your composer.json file. Doing this,
you can share your module on [packagist](https://packagist.org/) and of course require other dependencies for your module.

We have develop an installer, it will copy your module in the good directory (local/module).

This is how to use it in your composer.json (Example from [thelia/hooktest-module](https://github.com/thelia/HookTest-module)) : 

```
{
    "name": "thelia/hooktest-module",
    "type": "thelia-module",
    "require": {
        "thelia/installer": "~1.2"
    },
    "extra": {
        "installer-name": "HookTest"
    }
}
```

There are three important points here : 

* **type** : must be `thelia-module`.
* **require** : require the `thelia/installer` custom installer for composer.
* **installer-name** : the directory name for your module. Here I name my package "thelia/hooktest-module" but at the end I want the name of the directory to be ?? HookTest ?? so I use the ?? installer-name ?? extra parameter.

