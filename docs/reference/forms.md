---
title: Forms
sidebar_position: 2
---

# Forms Reference

Thelia's form system is built on Symfony Forms, providing validation, CSRF protection, and easy template rendering.

:::info Context-Specific Documentation
- **Front-Office Forms**: See [Front-Office Forms](/docs/front-office/forms) for LiveComponent-based forms with Twig
- **Back-Office Forms**: See [Back-Office Development](/docs/back-office) for Smarty form rendering
:::

## Creating a Form

Create a form class extending `BaseForm`:

```php
<?php

declare(strict_types=1);

namespace MyModule\Form;

use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Validator\Constraints;
use Thelia\Form\BaseForm;

class MyForm extends BaseForm
{
    protected function buildForm(): void
    {
        $this->formBuilder
            ->add('title', TextType::class, [
                'required' => true,
                'label' => 'Title',
                'constraints' => [
                    new Constraints\NotBlank(),
                    new Constraints\Length(['min' => 3, 'max' => 255]),
                ],
            ])
            ->add('quantity', IntegerType::class, [
                'required' => true,
                'constraints' => [
                    new Constraints\NotBlank(),
                    new Constraints\Positive(),
                ],
            ]);
    }
}
```

## Form Naming Convention

The form name is automatically generated from the fully qualified class name:

- `MyModule\Form\ConfigForm` → `mymodule_form_config_form`
- `MyModule\Form\ProductReviewForm` → `mymodule_form_product_review_form`

You can override this with `getName()`, but it's not recommended.

## Validation Constraints

Use Symfony Validator constraints:

```php
use Symfony\Component\Validator\Constraints;

$this->formBuilder
    ->add('email', TextType::class, [
        'constraints' => [
            new Constraints\NotBlank(),
            new Constraints\Email(),
        ],
    ])
    ->add('quantity', IntegerType::class, [
        'constraints' => [
            new Constraints\NotBlank(),
            new Constraints\Range(['min' => 1, 'max' => 100]),
        ],
    ]);
```

### Custom Validation with Callback

```php
use Symfony\Component\Validator\Context\ExecutionContextInterface;

$this->formBuilder
    ->add('code', TextType::class, [
        'constraints' => [
            new Constraints\Callback([$this, 'validateUniqueCode']),
        ],
    ]);

public function validateUniqueCode(mixed $value, ExecutionContextInterface $context): void
{
    $existing = MyModelQuery::create()->findOneByCode($value);

    if ($existing !== null) {
        $context->addViolation('This code already exists');
    }
}
```

## Using Forms in Controllers

```php
<?php

declare(strict_types=1);

namespace MyModule\Controller;

use MyModule\Form\MyForm;
use Thelia\Controller\Front\BaseFrontController;

class MyController extends BaseFrontController
{
    public function processAction(): mixed
    {
        $form = $this->createForm(MyForm::getName());

        try {
            $data = $this->validateForm($form)->getData();

            // Process valid form data
            $title = $data['title'];
            $quantity = $data['quantity'];

            // ... business logic

            return $this->generateRedirect('/success');

        } catch (\Exception $e) {
            // Form validation failed
            $this->setupFormErrorContext(
                'My Form',
                $e->getMessage(),
                $form
            );

            return $this->generateRedirect('/form-page');
        }
    }
}
```

## Available Field Types

Thelia supports all [Symfony Form Types](https://symfony.com/doc/current/reference/forms/types.html):

| Type | Use Case |
|------|----------|
| `TextType` | Single-line text input |
| `TextareaType` | Multi-line text input |
| `EmailType` | Email validation |
| `IntegerType` | Integer numbers |
| `NumberType` | Decimal numbers |
| `ChoiceType` | Select, radio, checkboxes |
| `CheckboxType` | Boolean checkbox |
| `HiddenType` | Hidden fields |
| `FileType` | File uploads |

## CSRF Protection

Forms include CSRF protection by default. Always include hidden fields in your templates:

**Smarty (Back-Office):**
```smarty
{form name="mymodule_form_my_form"}
    <form method="post" action="{url path='/my/action'}">
        {form_hidden_fields form=$form}
        {* ... form fields ... *}
    </form>
{/form}
```

**Twig (Front-Office with LiveComponents):**
```twig
{{ form_start(form) }}
    {# CSRF token included automatically #}
{{ form_end(form) }}
```

## Next Steps

- [Front-Office Forms](/docs/front-office/forms) - LiveComponent forms with real-time validation
- [Back-Office Development](/docs/back-office) - Smarty form rendering
- [Events](/docs/reference/events) - Form-related events
