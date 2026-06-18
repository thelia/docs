---
title: Back-Office Development
sidebar_position: 1
---

# Back-Office Development

The Thelia 3 back-office (admin panel) is a Symfony bundle named `default-twig`. It renders Twig
templates, fetches data through Repositories, and displays lists with Twig UiComponents (a
server-rendered DataTable). Modules extend it through hooks and Symfony UX (Stimulus plus
LiveComponent/TwigComponent).

The bundle lives at `templates/backOffice/default-twig/`. It declares its own routes with PHP 8
`#[Route]` attributes, along with its own hooks, templates, forms, and assets.

:::caution The Smarty back-office is legacy
The previous Smarty `default` back-office theme is no longer recommended and will likely be dropped
in Thelia 3.1. New development targets the `default-twig` bundle. The two themes can run side by
side during the transition, but build any new admin screen on the Twig bundle.
:::

## Back-office vs front-office

| Aspect | Back-office (`default-twig`) | Front-office (Flexy) |
|--------|------------------------------|----------------------|
| Template engine | Twig | Twig |
| Data access | Repositories plus Twig UiComponents (DataTable) | `DataAccessService` (API) |
| Extensibility | Hooks (`safe_hook`, `hook_block`, `has_hook` Twig functions) plus `#[AsHook]` | Hooks plus Twig overrides |
| Interactivity | Stimulus plus Symfony UX (LiveComponent / TwigComponent) | Stimulus plus Symfony UX |

## Activating the Twig back-office

The `default-twig` bundle is the back-office reference. Activate it at install time, or switch an
existing installation over to it.

```bash
# fresh install - select the default-twig back-office theme
ddev exec php bin/install \
  --frontoffice_theme=flexy --backoffice_theme=default-twig \
  --pdf_theme=default --email_theme=default \
  --with-demo --with-admin \
  --admin_login=thelia --admin_password=thelia \
  --admin_first_name=thelia --admin_last_name=thelia \
  --admin_email=thelia@example.com

# already installed - switch the active back-office template
ddev exec bin/console template:set backOffice default-twig
ddev exec bin/console cache:warmup -e dev

# build the bundle assets (SCSS + JS)
ddev exec bash -c "cd templates/backOffice/default-twig && npm install && npm run build"
```

The admin is then available at `https://<your-site>.ddev.site/admin`.

:::tip Watch assets during development
While editing SCSS or Stimulus controllers, run `npm run watch` from
`templates/backOffice/default-twig/` so the bundle assets rebuild automatically. After editing a
Twig template, clear the cache with `ddev exec bin/console cache:clear -e dev`.
:::

## Bundle structure

The back-office is a regular Symfony bundle. Templates live at the bundle root (so the Thelia
parser resolver picks them up as `templates/backOffice/default-twig/<name>.html.twig`), and the PHP
lives under `src/`:

```
templates/backOffice/default-twig/
├── base.html.twig             # base layout
├── auth-layout.html.twig      # login screen
├── home.html.twig             # dashboard
├── <domain>/                  # one folder per business domain (catalog, customer, order, ...)
│   ├── list.html.twig
│   ├── edit.html.twig
│   ├── _create_modal.html.twig
│   └── _delete_modal.html.twig
├── components/                # reusable Twig component templates (DataTable, Dashboard, ...)
├── form/
│   └── bo_form_theme.html.twig    # Bootstrap 5 form theme, scoped to /admin
├── config/
│   └── packages/twig.yaml         # registers the form theme namespace + form_themes
├── assets/                    # SCSS + JS + img + flags
│   ├── app.js
│   ├── controllers/           # Stimulus controllers
│   └── styles/
└── src/
    ├── BackOfficeDefaultTwigBundle.php
    ├── Controller/            # one folder per domain (Catalog, Customer, Order, ...)
    ├── DTO/                   # immutable data transfer objects
    ├── EventListener/         # AdminContextRequestListener, AdminLocaleListener
    ├── Form/                  # Symfony form types (CustomerType, AddressType, ...)
    ├── Hook/Attribute/        # the #[AsHook] attribute
    ├── Repository/            # Propel queries
    ├── Security/              # AdminVoter
    ├── Service/               # back-office services (AdminFormAction, ...)
    ├── Twig/                  # Twig extensions (HookExtension, DataTableExtension, ...)
    └── UiComponents/          # AsTwigComponent / AsLiveComponent
```

The bundle is registered as a standard Symfony bundle and only loads its services when it is the
active back-office template. Services are autodiscovered and autoconfigured, so there is no service
XML to write:

```php
// templates/backOffice/default-twig/src/BackOfficeDefaultTwigBundle.php
$container->services()
    ->load('BackOfficeDefaultTwigBundle\\', $resourcePath)
    ->exclude([
        $resourcePath.'/BackOfficeDefaultTwigBundle.php',
        $resourcePath.'/DTO/',
        $resourcePath.'/Hook/Attribute/',
        $resourcePath.'/DependencyInjection/',
    ])
    ->autowire()
    ->autoconfigure();
```

## Adding an admin page from a module

A module adds an admin page with a thin controller and a PHP 8 `#[Route]` attribute. The controller
renders a Twig template; it never persists data itself. Thelia is event-driven:
`Controller → dispatch(Event) → Action listener → Model::save()`.

```php
// local/modules/MyModule/src/Controller/ConfigController.php
namespace MyModule\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Twig\Environment;

final class ConfigController
{
    public function __construct(private readonly Environment $twig)
    {
    }

    #[Route('/admin/module/MyModule', name: 'mymodule.admin.config')]
    public function config(): Response
    {
        return new Response($this->twig->render('@MyModule/config.html.twig'));
    }
}
```

:::note No `@Route` annotations
Symfony 7 removed Doctrine annotations. Always use the PHP 8 attribute
`Symfony\Component\Routing\Attribute\Route`, never `@Route`.
:::

## Back-office forms

Build admin forms with Symfony's form component and let the bundle's `bo_form_theme.html.twig`
render them with Bootstrap 5 markup. The theme is registered globally and scopes itself to the
`/admin` path, so any form rendered under `/admin` gets the back-office styling automatically.

```php
// local/modules/MyModule/src/Form/ConfigType.php
namespace MyModule\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;

final class ConfigType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('apiKey', TextType::class, [
                'label' => 'API key',
                'required' => true,
            ])
            ->add('enabled', CheckboxType::class, [
                'label' => 'Enable module',
                'required' => false,
            ]);
    }
}
```

Render the form in a Twig template with the standard Symfony form helpers:

```twig
{# local/modules/MyModule/templates/config.html.twig #}
{{ form_start(form, { action: path('mymodule.admin.config.save'), method: 'post' }) }}
    {{ form_row(form.apiKey) }}
    {{ form_row(form.enabled) }}
    <button type="submit" class="btn btn-primary">{{ 'Save'|trans }}</button>
{{ form_end(form) }}
```

The form theme is wired in the bundle's Twig configuration:

```yaml
# templates/backOffice/default-twig/config/packages/twig.yaml
twig:
  paths:
    "%kernel.project_dir%/templates/backOffice/default-twig/form": BackOfficeDefaultTwigForm
  form_themes:
    - "@BackOfficeDefaultTwigForm/bo_form_theme.html.twig"
```

## Extending the back-office with hooks

Hooks are the extension points modules use to inject content into back-office screens. In templates,
the bundle exposes Twig functions through `BackOfficeDefaultTwigBundle\Twig\HookExtension`:

```twig
{# render a hook's HTML output (tolerant: swallows a failing listener) #}
{{ safe_hook('state.edit-js', { state_id: state.id }) }}

{# iterate over the fragments contributed by a block hook #}
{% if has_hook('product.tab') %}
    <ul>
        {% for block in hook_block('product.tab', { product_id: product.id }) %}
            <li><a href="{{ block.href }}">{{ block.title }}</a></li>
        {% endfor %}
    </ul>
{% endif %}
```

On the module side, a hook listener extends `Thelia\Core\Hook\BaseHook` and declares which hooks it
listens to with `getSubscribedHooks()`:

```php
// local/modules/MyModule/src/Hook/AdminHook.php
namespace MyModule\Hook;

use Thelia\Core\Event\Hook\HookRenderBlockEvent;
use Thelia\Core\Event\Hook\HookRenderEvent;
use Thelia\Core\Hook\BaseHook;
use Thelia\Tools\URL;

final class AdminHook extends BaseHook
{
    public static function getSubscribedHooks(): array
    {
        return [
            'main.top-menu-tools' => [
                ['type' => 'back', 'method' => 'onMainTopMenuTools'],
            ],
            'product.tab' => [
                ['type' => 'back', 'method' => 'onProductTab'],
            ],
        ];
    }

    public function onMainTopMenuTools(HookRenderBlockEvent $event): void
    {
        $event->add([
            'id' => 'mymodule-menu',
            'title' => $this->trans('My Module'),
            'href' => URL::getInstance()->absoluteUrl('/admin/module/MyModule'),
        ]);
    }

    public function onProductTab(HookRenderEvent $event): void
    {
        $productId = $event->getArgument('product_id');

        $event->add($this->render('product-tab.html', ['product_id' => $productId]));
    }
}
```

:::tip Attribute alternative: `#[AsHook]`
The Twig back-office also ships a PHP 8 attribute,
`BackOfficeDefaultTwigBundle\Hook\Attribute\AsHook`, registered for autoconfiguration by the bundle.
You can annotate a listener method instead of returning a `getSubscribedHooks()` array:

```php
use BackOfficeDefaultTwigBundle\Hook\Attribute\AsHook;
use Thelia\Core\Event\Hook\HookRenderEvent;

#[AsHook(event: 'product.tab', type: 'back')]
public function onProductTab(HookRenderEvent $event): void
{
    // ...
}
```

The attribute takes `event` (the hook code), an optional `type` (defaults to `back`), and an
optional `priority`.
:::

See the [Hooks Reference](./hooks.md) for the full list of back-office hooks and the conventional
extension points every screen emits.

## Interactivity: Stimulus and Symfony UX

The back-office uses [Symfony UX](https://symfony.com/bundles/ux-stimulus/current/index.html):

- Stimulus controllers live in `assets/controllers/` and wire behavior to markup with
  `data-controller` / `data-action` attributes.
- TwigComponent and LiveComponent classes live in `src/UiComponents/` (annotated with
  `#[AsTwigComponent]` / `#[AsLiveComponent]`). The list screens render through a server-side
  `DataTable` component.

There is no separate jQuery layer to learn. The same UX stack powers both the front-office Flexy
theme and the back-office bundle.

## Best practices

### Do

- Build new admin screens on the `default-twig` bundle, not the Smarty theme.
- Keep controllers thin: dispatch an event and let an `Action` listener persist.
- Fetch data through Repositories and present lists with the DataTable UiComponent.
- Use hooks (`safe_hook` / `hook_block`) to extend existing screens instead of editing core
  templates.
- Render forms with the `bo_form_theme` so they match the rest of the admin.
- Translate every user-facing string with `|trans`.

### Don't

- Don't edit core back-office templates directly; extend through hooks.
- Don't use `@Route` annotations; use the PHP 8 `#[Route]` attribute.
- Don't call `save()` from a controller; dispatch an event instead, since Thelia is event-driven.
- Don't hardcode URLs; use `path()` / `url()`.
- Don't skip the CSRF token on form submissions.

## Reference documentation

- [Hooks Reference](./hooks.md): all back-office hooks and conventional extension points
- [Forms](/docs/reference/forms): Thelia form handling
- [Internationalization](/docs/reference/internationalization): translating admin strings
- [Module Development](/docs/modules): creating modules

## Next steps

- [Hooks](./hooks.md): extend the admin interface through hooks
- [Module controllers](/docs/modules/controllers): add admin pages from a module
- [Front-office LiveComponents](/docs/front-office/live-components): the Symfony UX patterns reused by the back-office
