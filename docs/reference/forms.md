---
title: Forms
sidebar_position: 2
---

# Forms Reference

Thelia's form system is built on Symfony Forms. It handles validation, CSRF protection, and template rendering.

:::info Context-specific documentation
- **Front-Office Forms**: See [Front-Office Forms](/docs/front-office/forms) for LiveComponent-based forms with Twig
- **Back-Office Forms**: See [Back-Office Development](/docs/back-office) for Twig form rendering
:::

## Creating a form

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

## Form naming convention

The form name is automatically generated from the fully qualified class name:

- `MyModule\Form\ConfigForm` → `mymodule_form_config_form`
- `MyModule\Form\ProductReviewForm` → `mymodule_form_product_review_form`

You can override this with `getName()`, but it's not recommended.

## Validation constraints

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

### Custom validation with a callback

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

## Using forms in controllers

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

## Available field types

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

## CSRF protection

Forms include CSRF protection by default. Always include hidden fields in your templates:

**Smarty (legacy back-office):**
```smarty
{form name="mymodule_form_my_form"}
    <form method="post" action="{url path='/my/action'}">
        {form_hidden_fields form=$form}
        {* ... form fields ... *}
    </form>
{/form}
```

**Twig (front-office and default-twig back-office):**
```twig
{{ form_start(form) }}
    {# CSRF token included automatically #}
{{ form_end(form) }}
```

### Session-bound or stateless tokens

By default a `BaseForm` token is bound to the visitor's session: it is generated once, stored in the session and compared on submit. This is the right choice for forms that are always rendered fresh (account pages, checkout steps).

A form rendered inside a **cache** must not use a session token: a Turbo Drive snapshot, a Varnish page cache, a Twig fragment cache or an ESI block will replay a token that belongs to another session, and the submit fails with `The CSRF token is invalid`. For those forms, switch to Symfony's stateless validation, which checks the request origin (`Sec-Fetch-Site`, `Origin` or `Referer`) instead of a stored value. A stateless form renders a constant token, so the cached HTML stays valid for every visitor.

Two ways to opt in:

- pass a stateless token id when creating the form:

  ```php
  $form = $this->createForm(CartAdd::class, options: ['csrf_token_id' => 'submit']);
  ```

  `submit`, `authenticate` and `logout` are declared stateless by the `config/packages/csrf.yaml` that the framework-bundle recipe installs in every project.

- or declare the form's own name as stateless, without touching any PHP code. This is how a theme marks the forms it renders in cacheable zones:

  ```yaml
  # config/packages/csrf.yaml
  framework:
      csrf_protection:
          stateless_token_ids:
              - thelia_cart_add
              - thelia_coupon_code
  ```

Session-bound tokens stay the default. `'csrf_protection' => false` still disables the protection entirely; prefer a stateless id over disabling it.

## Next steps

- [Front-Office Forms](/docs/front-office/forms) - LiveComponent forms with real-time validation
- [Back-Office Development](/docs/back-office) - Twig form rendering
- [Events](/docs/reference/events) - Form-related events
