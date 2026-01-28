---
title: Front-Office Forms
sidebar_position: 8
---

# Front-Office Forms

Thelia 3 uses **Symfony Forms** with **LiveComponents** for interactive form handling in the front-office. This provides server-side validation with real-time feedback.

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

use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
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
            ->add('name', TextType::class, [
                'label' => 'Your Name',
                'attr' => ['placeholder' => 'John Doe'],
            ])
            ->add('email', EmailType::class, [
                'label' => 'Email Address',
            ])
            ->add('message', TextareaType::class, [
                'label' => 'Your Message',
                'attr' => ['rows' => 5],
            ])
            ->getForm();
    }

    #[LiveAction]
    public function save(): void
    {
        $this->submitForm();

        if ($this->getForm()->isValid()) {
            $data = $this->getForm()->getData();
            // Send email, save to database, etc.

            $this->submitted = true;
        }
    }
}
```

### Form Template

```twig
{# ContactForm.html.twig #}
<div {{ attributes }}>
    {% if submitted %}
        <div class="alert alert-success">
            Thank you for your message! We'll respond soon.
        </div>
    {% else %}
        {{ form_start(form, {
            attr: {
                'data-action': 'live#action:prevent',
                'data-live-action-param': 'save'
            }
        }) }}

        <div class="mb-4">
            {{ form_row(form.name) }}
        </div>

        <div class="mb-4">
            {{ form_row(form.email) }}
        </div>

        <div class="mb-4">
            {{ form_row(form.message) }}
        </div>

        <button type="submit" class="btn btn-primary">
            Send Message
        </button>

        {{ form_end(form) }}
    {% endif %}
</div>
```

### Using the Form

```twig
{{ component('Flexy:ContactForm') }}
```

## Real-Time Validation

LiveComponents validate on each interaction:

```php
#[AsLiveComponent(name: 'Flexy:RegistrationForm')]
class RegistrationForm
{
    use DefaultActionTrait;
    use ComponentWithFormTrait;

    protected function instantiateForm(): FormInterface
    {
        return $this->createForm(RegistrationType::class);
    }

    // Validation happens automatically on data-model changes
}
```

```twig
<div {{ attributes }}>
    {{ form_start(form) }}

    {# Real-time validation on blur #}
    <div class="mb-4">
        {{ form_label(form.email) }}
        {{ form_widget(form.email, {
            attr: {'data-model': 'on(change)|email'}
        }) }}
        {{ form_errors(form.email) }}
    </div>

    {# Debounced validation #}
    <div class="mb-4">
        {{ form_label(form.username) }}
        {{ form_widget(form.username, {
            attr: {'data-model': 'debounce(500)|username'}
        }) }}
        {{ form_errors(form.username) }}
    </div>

    {{ form_end(form) }}
</div>
```

## Thelia Form Types

Thelia provides predefined form types:

### Address Form

```php
use Thelia\Form\Definition\FrontForm;
use TwigEngine\Service\FormService;

#[AsLiveComponent(name: 'Flexy:AddressForm')]
class AddressForm
{
    use DefaultActionTrait;
    use ComponentWithFormTrait;

    public function __construct(
        private readonly FormService $formService,
    ) {}

    protected function instantiateForm(): FormInterface
    {
        return $this->formService->getFormByName(FrontForm::ADDRESS_CREATE);
    }

    #[LiveAction]
    public function save(): void
    {
        $this->submitForm();

        if ($this->getForm()->isValid()) {
            // Save address
        }
    }
}
```

### Cart Add Form

```php
use Thelia\Form\Definition\FrontForm;

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

## Multi-Step Forms

```php
#[AsLiveComponent(name: 'Flexy:CheckoutForm')]
class CheckoutForm
{
    use DefaultActionTrait;
    use ComponentWithFormTrait;

    #[LiveProp]
    public int $step = 1;

    #[LiveProp]
    public array $formData = [];

    protected function instantiateForm(): FormInterface
    {
        return match ($this->step) {
            1 => $this->createAddressForm(),
            2 => $this->createDeliveryForm(),
            3 => $this->createPaymentForm(),
            default => throw new \InvalidArgumentException('Invalid step'),
        };
    }

    #[LiveAction]
    public function nextStep(): void
    {
        $this->submitForm();

        if ($this->getForm()->isValid()) {
            $this->formData = array_merge(
                $this->formData,
                $this->getForm()->getData()
            );
            $this->step++;
            $this->resetForm();
        }
    }

    #[LiveAction]
    public function previousStep(): void
    {
        $this->step--;
        $this->resetForm();
    }

    private function createAddressForm(): FormInterface
    {
        return $this->createFormBuilder()
            ->add('address', AddressType::class)
            ->getForm();
    }

    private function createDeliveryForm(): FormInterface
    {
        return $this->createFormBuilder()
            ->add('deliveryModule', ChoiceType::class, [
                'choices' => $this->getDeliveryOptions(),
            ])
            ->getForm();
    }

    private function createPaymentForm(): FormInterface
    {
        return $this->createFormBuilder()
            ->add('paymentModule', ChoiceType::class, [
                'choices' => $this->getPaymentOptions(),
            ])
            ->getForm();
    }
}
```

```twig
<div {{ attributes }}>
    {# Progress indicator #}
    <div class="steps">
        <span class="{{ step >= 1 ? 'active' : '' }}">Address</span>
        <span class="{{ step >= 2 ? 'active' : '' }}">Delivery</span>
        <span class="{{ step >= 3 ? 'active' : '' }}">Payment</span>
    </div>

    {{ form_start(form) }}

    {% if step == 1 %}
        {{ form_widget(form.address) }}
    {% elseif step == 2 %}
        {{ form_widget(form.deliveryModule) }}
    {% else %}
        {{ form_widget(form.paymentModule) }}
    {% endif %}

    <div class="buttons">
        {% if step > 1 %}
            <button type="button"
                    data-action="live#action"
                    data-live-action-param="previousStep">
                Back
            </button>
        {% endif %}

        {% if step < 3 %}
            <button type="button"
                    data-action="live#action"
                    data-live-action-param="nextStep">
                Continue
            </button>
        {% else %}
            <button type="submit"
                    data-action="live#action"
                    data-live-action-param="complete">
                Place Order
            </button>
        {% endif %}
    </div>

    {{ form_end(form) }}
</div>
```

## Form Theming

### Flexy Form Theme

Flexy includes a custom form theme:

```twig
{# Use Flexy theme #}
{% form_theme form '@Flexy/form/flexy_form_theme.html.twig' %}

{{ form_start(form) }}
    {{ form_widget(form) }}
{{ form_end(form) }}
```

### Custom Field Rendering

```twig
{{ form_start(form) }}

{# Custom layout #}
<div class="form-grid">
    <div class="form-col">
        {{ form_label(form.firstname) }}
        {{ form_widget(form.firstname, {
            attr: {class: 'form-input'}
        }) }}
        {{ form_errors(form.firstname) }}
    </div>

    <div class="form-col">
        {{ form_label(form.lastname) }}
        {{ form_widget(form.lastname, {
            attr: {class: 'form-input'}
        }) }}
        {{ form_errors(form.lastname) }}
    </div>
</div>

{{ form_end(form) }}
```

## File Uploads

```php
#[AsLiveComponent(name: 'Flexy:AvatarUpload')]
class AvatarUpload
{
    use DefaultActionTrait;
    use ComponentWithFormTrait;

    #[LiveProp]
    public ?string $uploadedFile = null;

    protected function instantiateForm(): FormInterface
    {
        return $this->createFormBuilder()
            ->add('avatar', FileType::class, [
                'label' => 'Profile Picture',
                'constraints' => [
                    new File([
                        'maxSize' => '2M',
                        'mimeTypes' => ['image/jpeg', 'image/png'],
                    ]),
                ],
            ])
            ->getForm();
    }

    #[LiveAction]
    public function upload(): void
    {
        $this->submitForm();

        if ($this->getForm()->isValid()) {
            /** @var UploadedFile $file */
            $file = $this->getForm()->get('avatar')->getData();

            // Handle file upload
            $filename = uniqid() . '.' . $file->guessExtension();
            $file->move($this->uploadDir, $filename);

            $this->uploadedFile = $filename;
        }
    }
}
```

## AJAX Form Submission

For forms outside LiveComponents:

```twig
<form action="{{ path('contact_submit') }}"
      method="post"
      data-turbo="true">
    {# Form fields #}
    <button type="submit">Send</button>
</form>
```

With Turbo Streams response:

```php
#[Route('/contact', name: 'contact_submit', methods: ['POST'])]
public function submit(Request $request): Response
{
    $form = $this->createForm(ContactType::class);
    $form->handleRequest($request);

    if ($form->isSubmitted() && $form->isValid()) {
        // Process form...

        if ($request->headers->has('Turbo-Frame')) {
            return new Response(
                '<turbo-stream action="replace" target="contact-form">
                    <template>
                        <div class="alert-success">Message sent!</div>
                    </template>
                </turbo-stream>',
                200,
                ['Content-Type' => 'text/vnd.turbo-stream.html']
            );
        }

        return $this->redirectToRoute('contact_success');
    }

    // Handle errors...
}
```

## Loading States

```twig
<div {{ attributes }}>
    {{ form_start(form) }}

    {# Show during submission #}
    <div data-loading="action(save)" class="hidden">
        <span class="spinner"></span> Submitting...
    </div>

    {# Hide during submission #}
    <button type="submit"
            data-loading="action(save)|addClass(opacity-50)"
            data-action="live#action"
            data-live-action-param="save">
        Submit
    </button>

    {{ form_end(form) }}
</div>
```

## Error Handling

```php
#[LiveAction]
public function save(): void
{
    try {
        $this->submitForm();

        if ($this->getForm()->isValid()) {
            $this->processForm();
            $this->success = true;
        }
    } catch (\Exception $e) {
        $this->error = 'An error occurred. Please try again.';
    }
}
```

```twig
{% if error %}
    <div class="alert alert-danger">{{ error }}</div>
{% endif %}

{% if success %}
    <div class="alert alert-success">Form submitted successfully!</div>
{% else %}
    {{ form_start(form) }}
    {# ... #}
    {{ form_end(form) }}
{% endif %}
```

## Best Practices

### 1. Use Thelia Form Types

```php
// Good - use predefined types
$this->formService->getFormByName(FrontForm::ADDRESS_CREATE);

// Avoid - recreating standard forms
$this->createFormBuilder()
    ->add('address1', TextType::class)
    ->add('address2', TextType::class)
    // ...
```

### 2. Validate Server-Side

```php
// Always validate on server
#[LiveAction]
public function save(): void
{
    $this->submitForm();

    if (!$this->getForm()->isValid()) {
        // Errors are automatically displayed
        return;
    }

    // Process valid data
}
```

### 3. Provide Feedback

```twig
{# Loading state #}
<button data-loading="addClass(loading)">Submit</button>

{# Success message #}
{% if submitted %}
    <div class="success">Thank you!</div>
{% endif %}

{# Error summary #}
{{ form_errors(form) }}
```

### 4. Handle Edge Cases

```php
#[LiveAction]
public function save(): void
{
    // Check for concurrent modifications
    if ($this->isStale()) {
        $this->error = 'Data has changed. Please refresh.';
        return;
    }

    $this->submitForm();
    // ...
}
```

## Next Steps

- [LiveComponents](./live-components) - Component details
- [Flexy Theme](./flexy-theme/) - Form examples
- [Turbo](./turbo) - Form submissions with Turbo
