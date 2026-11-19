---
title: Front-Office Forms
sidebar_position: 8
---

# Front-Office Forms

Thelia 3 builds front-office forms with Symfony Forms, usually wrapped in a LiveComponent for interactive validation and submission. Instead of building forms inline, Flexy resolves predefined Thelia forms by name through the `FormServiceInterface`.

:::tip Official Documentation
For the underlying form component, see [symfony.com/doc/current/forms.html](https://symfony.com/doc/current/forms.html). For the LiveComponent integration, see [symfony.com/bundles/ux-live-component/current/index.html](https://symfony.com/bundles/ux-live-component/current/index.html).
:::

## How Thelia forms are resolved

Thelia ships ready-made forms (login, registration, address, cart, contact, coupon, etc.). You do not rebuild them: you ask the form service for one by name and get a fully configured `Symfony\Component\Form\Form` back.

```php
// core/lib/Thelia/Core/Form/FormServiceInterface.php
namespace Thelia\Core\Form;

use Symfony\Component\Form\Form;

interface FormServiceInterface
{
    public function getFormByName(?string $name, array $data = []): Form;
}
```

- `$name` is a Thelia form name (a service-name string, see the table below).
- `$data` is the optional default data array used to pre-fill the form.

Inject the interface (not a concrete implementation) into your component or controller:

```php
use Thelia\Core\Form\FormServiceInterface;

public function __construct(
    private readonly FormServiceInterface $formService,
) {
}
```

:::note
Inject `Thelia\Core\Form\FormServiceInterface`. A no-op default implementation is registered in the core, so the container still builds when no form renderer module (such as TwigEngine) is active. The real renderer is provided by that module at runtime.
:::

## A LiveComponent form

The Flexy theme exposes its forms as LiveComponents, grouped under `components/Forms/`. A good example is `Forms:Customer:Update`, the "edit my profile" component:

```php
// templates/frontOffice/flexy/components/Forms/Customer/Update.php
namespace FlexyBundle\Components\Forms\Customer;

use FlexyBundle\Form\CustomerUpdateForm;
use Symfony\Component\Form\FormInterface;
use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\ComponentWithFormTrait;
use Symfony\UX\LiveComponent\DefaultActionTrait;
use Thelia\Core\Form\FormServiceInterface;
use Thelia\Domain\Customer\CustomerFacade;

#[AsLiveComponent]
class Update
{
    use ComponentWithFormTrait;
    use DefaultActionTrait;

    #[LiveProp]
    public ?array $customer = null;

    public function __construct(
        private readonly FormServiceInterface $formService,
        private readonly CustomerFacade $customerFacade,
    ) {
    }

    protected function instantiateForm(): FormInterface
    {
        return $this->formService->getFormByName(CustomerUpdateForm::FORM_NAME, $this->customer ?? []);
    }
}
```

Three pieces make this a form component:

- `#[AsLiveComponent]` registers it. It carries no argument: the component is named after its class path (`Forms:Customer:Update`) and its template is the `Update.html.twig` sitting next to it.
- `ComponentWithFormTrait` wires the Symfony form lifecycle (rendering, hydration, submission) and requires you to implement `instantiateForm()`.
- `DefaultActionTrait` provides the default re-render action triggered by LiveProp changes.

`instantiateForm()` returns the form built by `$this->formService->getFormByName(...)`. Here the name comes from a Flexy form class constant (`CustomerUpdateForm::FORM_NAME`), but it can equally be a `FrontForm` constant.

:::tip Inject, do not inherit
A form component needs no base class. Inject the exact services you need, as above with
`FormServiceInterface` and `CustomerFacade`. A few Flexy components extend Symfony's
`AbstractController`, but only where they genuinely use its helpers.
:::

## Handling submission with a LiveAction

Add a `#[LiveAction]` method that calls `submitForm()` then checks validity. The `Forms:PromoCode:Base` component shows the pattern:

```php
// templates/frontOffice/flexy/components/Forms/PromoCode/Base.php
namespace FlexyBundle\Components\Forms\PromoCode;

use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\ComponentWithFormTrait;
use Symfony\UX\LiveComponent\DefaultActionTrait;
use Thelia\Core\Event\Coupon\CouponConsumeEvent;
use Thelia\Core\Event\TheliaEvents;
use Thelia\Core\Form\FormServiceInterface;
use Thelia\Domain\Cart\CartFacade;
use Thelia\Form\CouponCode;

#[AsLiveComponent]
class Base
{
    use ComponentWithFormTrait;
    use DefaultActionTrait;

    public function __construct(
        private readonly FormServiceInterface $formService,
        private readonly EventDispatcherInterface $eventDispatcher,
        private readonly CartFacade $cartFacade,
    ) {
    }

    protected function instantiateForm(): FormInterface
    {
        return $this->formService->getFormByName(CouponCode::getName());
    }

    #[LiveAction]
    public function save(): void
    {
        $this->submitForm();

        $couponCode = $this->getForm()->get('coupon-code')->getData();
        $this->eventDispatcher->dispatch(
            new CouponConsumeEvent($couponCode),
            TheliaEvents::COUPON_CONSUME,
        );

        $this->cartFacade->recalculatePostage($this->cartFacade->getOrCreateFromSession());
    }
}
```

The flow follows Thelia's event-driven model: the component never persists data itself. It dispatches an event (`CouponConsumeEvent`) and an Action listener does the work.

To guard against invalid input, check `getForm()->isValid()` after `submitForm()`:

```php
#[LiveAction]
public function save(): void
{
    $this->submitForm();

    if (!$this->getForm()->isValid()) {
        return; // Validation errors are rendered automatically by the form theme
    }

    // Dispatch your event with the valid data
}
```

### Template

```twig
{# templates/frontOffice/flexy/components/Forms/SomeForm/Base.html.twig #}
{% form_theme form with flexy_form_themes only %}

<div {{ attributes }}>
    {{ form_start(form) }}
        {{ form_widget(form) }}

        <button
            type="submit"
            data-action="live#action:prevent"
            data-live-action-param="save"
        >Submit</button>
    {{ form_end(form) }}
</div>
```

## Available Thelia form names

`Thelia\Form\Definition\FrontForm` lists the core front-office forms. The constant values are **service-name strings** (for example `FrontForm::CART_ADD` resolves to `'thelia.cart.add'`); pass the constant, not the literal, to `getFormByName()`.

| Constant | Value | Purpose |
|----------|-------|---------|
| `FrontForm::CUSTOMER_LOGIN` | `thelia.front.customer.login` | Customer login |
| `FrontForm::CUSTOMER_CREATE` | `thelia.front.customer.create` | Customer registration |
| `FrontForm::CUSTOMER_PROFILE_UPDATE` | `thelia.front.customer.profile.update` | Profile update |
| `FrontForm::CUSTOMER_PASSWORD_UPDATE` | `thelia.front.customer.password.update` | Password change |
| `FrontForm::CUSTOMER_LOST_PASSWORD` | `thelia.front.customer.lostpassword` | Password reset request |
| `FrontForm::ADDRESS_CREATE` | `thelia.front.address.create` | Create address |
| `FrontForm::ADDRESS_UPDATE` | `thelia.front.address.update` | Update address |
| `FrontForm::CART_ADD` | `thelia.cart.add` | Add to cart |
| `FrontForm::COUPON_CONSUME` | `thelia.order.coupon` | Apply a coupon |
| `FrontForm::ORDER_DELIVER` | `thelia.order.delivery` | Choose delivery |
| `FrontForm::ORDER_PAYMENT` | `thelia.order.payment` | Choose payment |
| `FrontForm::CONTACT` | `thelia.front.contact` | Contact form |
| `FrontForm::NEWSLETTER` | `thelia.front.newsletter` | Newsletter subscription |

### Pre-filling a form

Pass defaults through the second `getFormByName()` argument:

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

## Real-time validation

LiveComponents can validate fields as the user types, using `data-model` bindings:

```twig
{# Validate on change #}
{{ form_widget(form.email, {
    attr: {'data-model': 'on(change)|email'}
}) }}

{# Debounced validation #}
{{ form_widget(form.username, {
    attr: {'data-model': 'debounce(500)|username'}
}) }}
```

## Flexy form theme

Flexy ships its form theme at `@FlexyForm/flexy_form_theme.html.twig`. It is **not** registered as a
global `twig.form_themes` entry: a global theme would also restyle the back-office forms. Instead the
bundle exposes the list as a Twig global, and every template that renders a form opts in:

```twig
{% form_theme form with flexy_form_themes only %}
```

The `only` keyword keeps every other theme out, so the widgets rendered below are Flexy's and nothing
else. Put the tag inside the block that renders the form, before `form_start`.

The global and the `@FlexyForm` namespace are both declared by the bundle, in
`FlexyBundle::prependExtension()`:

```php
// templates/frontOffice/flexy/src/FlexyBundle.php
$containerBuilder->prependExtensionConfig('twig', [
    'paths' => [
        \dirname(__DIR__).'/components' => 'Flexy',
        \dirname(__DIR__).'/form' => 'FlexyForm',
    ],
    'globals' => [
        'flexy_form_themes' => [
            '@FlexyForm/flexy_form_theme.html.twig',
        ],
    ],
]);
```

A field template that reuses the theme's blocks imports them by namespace:

```twig
{% use '@FlexyForm/flexy_form_theme.html.twig' %}
```

:::caution
A front-office form rendered without the `{% form_theme %}` tag gets Symfony's bare default markup,
not the Flexy widgets. The back office works the same way, with its own `bo_form_themes` global.
:::

## Plain Symfony fallback

If you need a one-off form that has no Thelia definition, you can build it inline with Symfony's `createFormBuilder()`. This is standard Symfony, not the Thelia way. Prefer a named Thelia form whenever one exists:

:::caution `createFormBuilder()` requires `AbstractController`
`createFormBuilder()` is a helper provided by Symfony's `Symfony\Bundle\FrameworkBundle\Controller\AbstractController`, so the call below only works in a component that extends it, as `Layouts:ProductListing:Base` does. Otherwise, inject `Symfony\Component\Form\FormFactoryInterface` and call `$this->formFactory->createBuilder()`.
:::

```php
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormInterface;

protected function instantiateForm(): FormInterface
{
    // Plain Symfony fallback - only when no Thelia FrontForm fits
    return $this->createFormBuilder()
        ->add('name', TextType::class)
        ->add('email', EmailType::class)
        ->add('message', TextareaType::class)
        ->getForm();
}
```

## Best practices

- **Use a named Thelia form** (`FrontForm::*` or a theme form constant) over a hand-built one.
- **Inject `FormServiceInterface`** rather than a concrete service or the container.
- **Validate server-side**: call `submitForm()`, then check `getForm()->isValid()` before acting.
- **Never persist in the component**: dispatch a Thelia event and let the Action listener save.

## Learn more

- [LiveComponents](./live-components): component lifecycle and LiveProps
- [Flexy Theme](./flexy-theme/): theme structure and assets
- [Stimulus](./stimulus): JavaScript controllers
