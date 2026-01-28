---
title: Template
sidebar_position: 5
---

:::info Thelia 3 - Dual Templating
In **Thelia 3**, Smarty is used only for the **back-office**, PDF, and mail templates. The **front-office** uses **Twig** with the Flexy theme. See [Front-Office Development](/docs/front-office) for Twig documentation.
:::

The template engine used in Thelia back-office is [Smarty](https://smarty-php.github.io/smarty/).
There is 4 types of templates :
- frontOffice : for templates rendered from a controller that extend `BaseFrontController`
- backOffice : for templates rendered from a controller that extend `BaseAdminController`
- pdf : for pdf documents like invoices
- mail : for mail sent by Thelia

For each of this types you can choose an active template. Either by the configuration page in back office or by these environment variables:
```
ACTIVE_FRONT_TEMPLATE    
ACTIVE_ADMIN_TEMPLATE    
ACTIVE_MAIL_TEMPLATE   
ACTIVE_PDF_TEMPLATE   
``` 
:::caution
It's strongly recommended to never modify the defaults templates but copy and rename it with the name of your project.    
Like this you can always update Thelia and the defaults templates without loosing your changes
:::

### Templates structure

Thelia Smarty templates are located in the templates sub-directory.

```
\templates
  \frontOffice
    \default
    \myTemplate
  \backOffice
    \default
    ...  
  \pdf
    \default
    ...  
  \mail
    \default
    ...
```

This is the structure of all Thelia templates, it can be located either at the root of your project or in each module folder.
If same file are in multiple templates location, Thelia apply this priority to know which has to be rendered (the first file found is the file rendered)
1. In the `active` template in root templates directory
2. In the `active` template in each module subdirectory located in root templates directory
3. In the `active` template in each module templates directory
4. In the "default" template in root templates directory
5. In the "default" template in each module subdirectory located in root templates directory
6. In the "default" template in each module templates directory

For example if you have this structure :
```
\local
    \modules
        \MyProject
            \templates
                \frontOffice
                    \default
                        template.html
\templates
  \frontOffice
    \default
        template.html
    \myTemplate
        template.html
        \modules
            \myproject
                template.html
```

It will check all these directories in this order :
1. `\templates\frontOffice\myTemplate\`
2. `\templates\frontOffice\myTemplate\modules\myproject` * this for each activated modules
3. `\local\modules\MyProject\templates\frontOffice\myTemplate` * this for each activated modules
4. `\templates\frontOffice\default\`
5. `\templates\frontOffice\default\modules\myproject` * this for each activated modules
6. `\local\modules\MyProject\templates\frontOffice\default` * this for each activated modules

### Features

#### Loops

Loops allow to get data from your shop back-end and display them in your front view. More documentation can be found [here](/loops/index.md).

#### Smarty plugins

Smarty plugins are used to execute functions from templates. More documentation can be found [here](/smarty_plugins/index.md).
