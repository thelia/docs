---
title: Front-Office Forms
sidebar_position: 8
---

# Front-Office Forms

Thelia 3 uses **Symfony Forms** with **LiveComponents** for interactive form handling in the front-office.

:::tip Official Documentation
For complete Symfony Forms documentation, see [symfony.com/doc/current/forms.html](https://symfony.com/doc/current/forms.html).
:::

## Form Handling Approaches

| Approach | Best For |
|----------|----------|
| LiveComponent + Form | Real-time validation, multi-step forms |
| Turbo Frame | Simple forms, inline editing |
| Standard Symfony | Full-page form submissions |

## LiveComponent Forms

### Basic Form Component

```php
<?php

declare(strict_types=1);

namespace FlexyBundle\UiComponents\ContactForm;

use Symfony\Component\Form\FormInterface;
use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\ComponentWithFormTrait;
use Symfony\UX\LiveComponent\DefaultActionTrait;

#[AsLiveComponent(
    name: 'Flexy:ContactForm',
    template: '@UiComponents/ContactForm/ContactForm.html.twig'
)]
class ContactForm
{
    use DefaultActionTrait;
    use ComponentWithFormTrait;

    #[LiveProp]
    public bool $submitted = false;

    protected function instantiateForm(): FormInterface
    {
        return $this->createFormBuilder()
            ->add('name', TextType::class)
            ->add('email', EmailType::class)
            ->add('message', TextareaType::class)
            ->getForm();
    }

    #[LiveAction]
    public function save(): void
    {
        $this->submitForm();

        if ($this->getForm()->isValid()) {
            // Process form...
            $this->submitted = true;
        }
    }
}
```

### Template

```twig
<div {{ attributes }}>
    {% if submitted %}
        <div class="alert alert-success">Message sent!</div>
    {% else %}
        {{ form_start(form, {
            attr: {
                'data-action': 'live#action:prevent',
                'data-live-action-param': 'save'
            }
        }) }}

        {{ form_row(form.name) }}
        {{ form_row(form.email) }}
        {{ form_row(form.message) }}

        <button type="submit">Send</button>
        {{ form_end(form) }}
    {% endif %}
</div>
```

## Thelia Form Types

Thelia provides predefined form types:

```php
use Thelia\Form\Definition\FrontForm;
use TwigEngine\Service\FormService;

protected function instantiateForm(): FormInterface
{
    return $this->formService->getFormByName(FrontForm::ADDRESS_CREATE);
}
```

### Available Form Names

| Form Name | Purpose |
|-----------|---------|
| `FrontForm::CUSTOMER_LOGIN` | Customer login |
| `FrontForm::CUSTOMER_CREATE` | Customer registration |
| `FrontForm::CUSTOMER_UPDATE` | Profile update |
| `FrontForm::CUSTOMER_PASSWORD` | Password change |
| `FrontForm::ADDRESS_CREATE` | Create address |
| `FrontForm::ADDRESS_UPDATE` | Update address |
| `FrontForm::CART_ADD` | Add to cart |
| `FrontForm::CONTACT` | Contact form |
| `FrontForm::NEWSLETTER` | Newsletter subscription |

### Cart Add Form Example

```php
protected function instantiateForm(): FormInterface
{
    return $this->formService->getFormByName(FrontForm::CART_ADD, [
        'product' => $this->product['id'],
        'product_sale_elements_id' => $this->currentPse['id'],
        'quantity' => 1,
        'append' => 1,
        'newness' => 0,
    ]);
}
```

## Real-Time Validation

LiveComponents validate on each interaction:

```twig
{# Update on blur #}
{{ form_widget(form.email, {
    attr: {'data-model': 'on(change)|email'}
}) }}

{# Debounced validation #}
{{ form_widget(form.username, {
    attr: {'data-model': 'debounce(500)|username'}
}) }}
```

## Flexy Form Theme

```twig
{% form_theme form '@Flexy/form/flexy_form_theme.html.twig' %}

{{ form_start(form) }}
    {{ form_widget(form) }}
{{ form_end(form) }}
```

## Loading States

```twig
<div {{ attributes }}>
    <div data-loading="action(save)" class="hidden">
        Submitting...
    </div>

    <button type="submit"
            data-loading="action(save)|addClass(opacity-50)"
            data-action="live#action"
            data-live-action-param="save">
        Submit
    </button>
</div>
```

## Best Practices

### Use Thelia Form Types

```php
// Good - use predefined types
$this->formService->getFormByName(FrontForm::ADDRESS_CREATE);
```

### Validate Server-Side

```php
#[LiveAction]
public function save(): void
{
    $this->submitForm();

    if (!$this->getForm()->isValid()) {
        return; // Errors displayed automatically
    }

    // Process valid data
}
```

## Next Steps

- [LiveComponents](./live-components) - Component details
- [Flexy Theme](./flexy-theme/) - Form examples
- [Turbo](./turbo) - Form submissions with Turbo
