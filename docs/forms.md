---
title: Forms
sidebar_position: 10
---

:::info Thelia 3 - Dual Usage
Form **classes** (extending `BaseForm`) are still used in both front-office and back-office for validation and processing. However, form **rendering in templates** differs:
- **Back-Office**: Use **Smarty** plugins (`{form}`, `{form_field}`) as shown below
- **Front-Office**: Use **Twig** with Symfony forms in [LiveComponents](/docs/front-office/live-components), or access forms via controller logic
:::

## Form definitions
To create a new form create a new class that extend `BaseForm` then implement the method `buildForm` to describe your form.

```php
<?php
namespace Thelia\Form;

use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Validator\Constraints;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Thelia\Core\Translation\Translator;
use Thelia\Model\AddressQuery;
use Thelia\Model\ModuleQuery;
use Thelia\Module\BaseModule;

class OrderDeliveryForm extends BaseForm
{
    protected function buildForm(): void
    {
        $this->formBuilder
            ->add('delivery-address', IntegerType::class, [
                'required' => true,
                'constraints' => [
                    new Constraints\NotBlank(),
                    new Constraints\Callback(
                        [$this, 'verifyDeliveryAddress']
                    ),
                ],
            ])
            ->add('delivery-module', IntegerType::class, [
                'required' => true,
                'constraints' => [
                    new Constraints\NotBlank(),
                    new Constraints\Callback(
                        [$this, 'verifyDeliveryModule']
                    ),
                ],
            ]);
    }

    public function verifyDeliveryAddress($value, ExecutionContextInterface $context): void
    {
        $address = AddressQuery::create()
            ->findPk($value);

        if (null === $address) {
            $context->addViolation(Translator::getInstance()->trans('Address ID not found'));
        }
    }

    public function verifyDeliveryModule($value, ExecutionContextInterface $context): void
    {
        $module = ModuleQuery::create()
            ->filterActivatedByTypeAndId(BaseModule::DELIVERY_MODULE_TYPE, $value)
            ->findOne();

        if (null === $module) {
            $context->addViolation(Translator::getInstance()->trans('Delivery module ID not found'));
        } elseif (!$module->isDeliveryModule()) {
            $context->addViolation(
                sprintf(Translator::getInstance()->trans("delivery module %s is not a Thelia\Module\DeliveryModuleInterface"), $module->getCode())
            );
        }
    }
}
```

For more information about field types you can refer to [Symfony form type documentation](https://symfony.com/doc/current/reference/forms/types.html)

## Usage in templates
To display the form in your template you will need the form name, it is the name of your module in lowercase + full namespace and the class of your form in snake_case.
For example the form name for `YourModule\Form\SomethingForm.php` will be `yourmodule_form_something_form`
It can be modified with the static function `getName` but we do not advise to do that, 
because it's more simple to guess a form name by reading is namespace than going in to the class and looking the method. 
It also guarantees a unique name for your form.

### Call your form

First of all you have to call the form you need by using the form block :
```smarty
    {form name="yourmodule_form_something_form"}
        ...
    {/form}
```
The form reference is now available in the `$form` variable.

### Display it
```smarty
    {form name="yourmodule_form_something_form"}
        <form method="post" action="{url path='your/target'}" {form_enctype form=$form}>
        ...
        </form>
    {/form}
```

### Displaying a form field

#### Custom form field
For displaying a field, you have to use the `{form_field}` block, and put the name of the field you want to display in the “field” parameter :
```smarty
{form name="thelia_form_order_delivery_form"}
    <form method="post" action="{url path='your/target'}" {form_enctype form=$form} >
        {form_hidden_fields form=$form}

        {form_field form=$form field="firstname"}
           <label>{intl l="{$label}"}</label>
           <input type="text" name="{$name}" value="{$value}" {$attr} />
        {/form_field}

        {form_field form=$form field="delivery_options"}
            <select name="{$name}">
                {foreach $choices as $choice}
                    <option value="{$choice->value}">{$choice->label}</option> 
                {/foreach}
            </select>
        {/form_field}
    </form>
{/form}
```
Values available in the `{form_field}` block :

-    `$name` : field’s name used in the name part of your input
-    `$value` : default value to display
-    `$data` : the form definition data attribute
-    `$type` : the field type, as defined in the form definition (choice, radio, number, text, textarea, etc.)
-    `$checked` : the checked status (true / false) of a radio or checkbox field
-    `$multiple` : true if a select field may have multiple selected values
-    `$disabled` : true if the field is disabled, false otherwise
-    `$read_only` : true if the fiedl is read only, false otherwise
-    `$max_length` : the maximum length of the field
-    `$required` : true if the field is required, false otherwise
-    `$label` : label for this field, can be used in label html tag for example
-    `$attr` : all the attributes defined in your form class, can be any HTML attributes, such as an id, or any other attribute such as HTML5 form validation for example
-    `$attr_list` : the ‘attr’ array of form definition
-    `$options` : all the options available for this field. This variable is a PHP array.
-    `$error` : true if validation error has been detected on the field
-    `$message` : the error message, defined if $error is true, empty otherwise.
-    `$choices` : an array of available choices. $choices is available only if your field has defined choices.

#### Auto form field
To speed up writing form in templates Thelia provide a Smarty plugin `render_form_field` which automatically generates the field HTML code, and all the related code, such as formatting and error reporting.
```smarty
{form name="thelia_form_order_delivery_form"}
    <form method="post" action="{url path='your/target'}" {form_enctype form=$form} >
        {form_hidden_fields form=$form}

        {render_form_field form=$form field="firstname"}
        {render_form_field form=$form field="delivery_options"}
    </form>
{/form}
```

### Display errors
If your form contains some errors, it automatically displays the value already sent by the user and then can display a message for each fields containing errors. The `{form_field_error}` is used, and it works like the `{form_field}` block. You can call it outside the `{form_field}` block :
```smarty
{form name="thelia_form_order_delivery_form"}
    <form method="post" action="{url path='your/target'}" {form_enctype form=$form} >
        {form_hidden_fields form=$form}

        {form_field form=$form field="firstname"}
            {form_error form=$form.firstname}
                {$message}
            {/form_error}

            <label>{intl l="{$label}"}</label>
           <input type="text" name="{$name}" value="{$value}" {$attr} />
        {/form_field}
    </form>
{/form}
```

### Hidden fields
Thelia uses hidden fields internally. In order to display these fields (and all the hidden fields defined in your form), use the `form_hidden_fields` plugin.    
Don’t forget this, as it contains the CRSF validation data :
```smarty
{form name="thelia_form_order_delivery_form"}
    <form method="post" action="{url path='your/target'}" {form_enctype form=$form} >
         {form_hidden_fields form=$form}
            ...
    </form>
{/form}
```

## Usage in controllers
Form are useful to validate data submitted by users. This is done by two functions in controllers :
- `createForm` that create a form object
- `validateForm` that validate form data

```php
<?php

namespace Front\Controller;

class OrderController extends BaseFrontController
{
    public function submitRoute()
    {
        $form = $this->createForm(OrderDeliveryForm::getName);
        
       try {
            $data = $this->validateForm($form)->getData();

            // Do what you want with submitted data

        } catch (\Exception $e) {
           // Do something when the form is not valid
        }
    }
}
```
