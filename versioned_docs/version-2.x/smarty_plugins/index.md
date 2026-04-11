---
title: Smarty plugins
--- 

To create plugin Smarty in Thelia, just create a new class that extend `TheliaSmarty\Template\AbstractSmartyPlugin`, then create function called `getPluginDescriptors`
that lists and describes all the plugin you want to create (you can create as many plugins as you want in one class).     
A smarty plugin is described like this :
```php
new SmartyPluginDescriptor(
    'function',
    'myFunction',
    $this,
    'doMyFunction'
)
```

First parameter is the type of the plugin, more information [here](https://smarty-php.github.io/smarty/programmers/plugins.html).    
Second parameter is the name you have to put in your templates to call your plugin.     
Third parameter is location of the Class of your function, in general it's `$this` because you write function in the same class as the declaration.    
Fourth parameter is the name of the function you want to call.

Declaration of your plugins :
```php 
class MyProjectPlugin extends AbstractSmartyPlugin
{
    public function getPluginDescriptors()
    {
        return [
            new SmartyPluginDescriptor(
                'function',
                'lower',
                 $this,
                'lowerString'
            ),
            new SmartyPluginDescriptor(
                'function',
                'bestProduct',
                $this,
                'getBestProduct'
            )
        ];
    }
    
    public function lowerString($params)
    {
        return strtolower($params['string']);
    }
    
    public function getBestProduct($params)
    {
        // Do a query to find your best product and return it
    }
}
```

Usage :
```smarty
    {lower string="A String THAT need to be LOWERCASE"} // Some plugins needs params
    
    {bestProduct} // Other don't
```
