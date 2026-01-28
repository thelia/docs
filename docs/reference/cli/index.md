---
title: Commands
sidebar_position: 11
---

Commands use the helpfull console Symfony component. In your module you can define you own command that can be used
with command CLI.

To create a Command in Thelia just create a new class that extend `Thelia\Command\ContainerAwareCommand` and create these functions:
- `configure()` to give a name and optionally a description and parameters
- `execute()` where go the code to execute

```php
<?php

namespace MyModule\Commands;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

use Thelia\Command\ContainerAwareCommand;

class HelloWorld extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName("hello:world")
            ->setDescription("output hello world");
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output->writeln("Hello world !");
    }
}
```

You can now test the results using Thelia CLI tools. Go to your Thelia root directory and use this command :
```shell
php Thelia hello:world
```

Thelia uses all the features of the Symfony “command” component, so you can refer to [this component documentation](https://symfony.com/doc/current/console.html#creating-a-command) to create your Thelia commands.
