---
title: Templates and form theme
sidebar_position: 4
---

# Templates and form theme

The Twig back-office (the `default-twig` bundle) renders its pages with standard Twig
templates and standard Symfony forms. There is no Smarty, no `{loop}`, no `{form_field}`:
a list page is a `.html.twig` file, a form is a `*Type` class rendered with
`form_start` / `form_end`, and a custom Bootstrap 5 form theme handles the markup.

This page explains where templates live, how they are organized, and how forms are
rendered.

:::info Owner decision
The Smarty `default` back-office theme is no longer recommended and is expected to be
dropped in Thelia 3.1. The reference back-office is the **`default-twig` bundle**:
autonomous in its routes (`#[Route]` attributes), hooks, templates, forms and assets.
:::

## Templates are namespaced Twig files

Every back-office template is a `.html.twig` file under the bundle, reachable through the
`@BackOfficeDefaultTwig` Twig namespace. For example, the brand list is rendered from:

```text
@BackOfficeDefaultTwig/catalog/brand/list.html.twig
```

The namespace is registered by the bundle in `prependExtension()`, pointing at the bundle
root (`getViewsPath()` returns `dirname(__DIR__)`):

```php
// templates/backOffice/default-twig/src/BackOfficeDefaultTwigBundle.php
public function prependExtension(ContainerConfigurator $container, ContainerBuilder $builder): void
{
    if (!$this->isActive($builder)) {
        return;
    }

    $container->extension('twig', [
        'paths' => [
            $this->getViewsPath() => 'BackOfficeDefaultTwig',
        ],
    ]);

    // ...
}

private function getViewsPath(): string
{
    // Templates live at the bundle root so the Thelia ParserResolver picks them up
    // automatically (`templates/backOffice/<active>/<name>.html.twig`).
    return \dirname(__DIR__);
}
```

:::tip Always qualify the namespace in `extends`
When a controller calls `twig->render()` directly (for example an error page), Twig does
not see the bundle root as an implicit search path. `{% extends 'base.html.twig' %}` then
fails with a `LoaderError`. Always write
`{% extends '@BackOfficeDefaultTwig/base.html.twig' %}`.
:::

## One folder per business domain

Templates are grouped by business domain, one folder each. The hierarchy stays at three
levels of nesting at most:

```text
templates/backOffice/default-twig/
├── base.html.twig            # base layout (every screen extends it)
├── auth-layout.html.twig     # login screen layout
├── home.html.twig            # dashboard
├── _page_header.html.twig    # shared partial (title + actions)
├── _side_nav.html.twig       # sidebar
├── _top_nav.html.twig        # top bar
├── catalog/                  # Product, Category, Brand
│   ├── brand/
│   │   ├── list.html.twig
│   │   ├── edit.html.twig
│   │   ├── _create_modal.html.twig
│   │   └── _delete_modal.html.twig
│   ├── category/
│   └── product/
├── customer/                 # Customer, Address
├── order/
├── configuration/            # Language, Currency, Variable, Profile, ...
├── folder/                   # Folder, Content
├── module/                   # Module, ModuleHook
├── sale/
└── ...
```

The recurring file conventions per domain are:

| File | Role |
|------|------|
| `list.html.twig` | List screen (data table + create button) |
| `edit.html.twig` | Edit screen (the entity form) |
| `_create_modal.html.twig` | Modal form to create a new entity |
| `_delete_modal.html.twig` | Confirmation modal before deletion |

Partials are prefixed with an underscore (`_create_modal.html.twig`,
`_page_header.html.twig`). This is a naming convention, not a Twig requirement.

### The shared page header

Every list and edit screen reuses `_page_header.html.twig` through an `{% embed %}`, which
lets the screen fill the `title` and `actions` blocks:

```twig
{# @BackOfficeDefaultTwig/catalog/brand/list.html.twig #}
{% embed '@BackOfficeDefaultTwig/_page_header.html.twig' with { title: 'Brands management'|trans } %}
    {% block actions %}
        <button class="btn btn-sm btn-primary">{{ 'Create'|trans }}</button>
    {% endblock %}
{% endembed %}
```

:::tip Prefer `{% embed %}` over `{% include %}` when overriding blocks
`{% embed %}` includes a template **and** lets you override its blocks in the same call.
Use it whenever a partial exposes block slots like `_page_header.html.twig` does.
:::

## The form theme

`bo_form_theme.html.twig` is a custom Bootstrap 5 Symfony form theme. It is **not** registered
globally: neither theme is. Each side declares its own list as a Twig global, and each template
that renders a form opts in. The back-office list is declared in `config/packages/twig.yaml`,
which the bundle imports during `prependExtension()`:

```yaml
# templates/backOffice/default-twig/config/packages/twig.yaml
twig:
  paths:
    "%kernel.project_dir%/templates/backOffice/default-twig/form": BackOfficeDefaultTwigForm
  globals:
    bo_form_themes:
      - "bootstrap_5_layout.html.twig"
      - "@BackOfficeDefaultTwigForm/bo_form_theme.html.twig"
```

`bootstrap_5_layout.html.twig` comes first, so it supplies the complete Bootstrap base, and
`bo_form_theme.html.twig` only carries the admin refinements on top. Render a form with:

```twig
{% form_theme form with bo_form_themes only %}
```

The `only` keyword excludes every other theme, so an admin form can never pick up a front-office
Flexy widget. The isolation is structural: no block has to test the request path.

:::caution Every admin form needs the tag
Without `{% form_theme form with bo_form_themes only %}`, the form renders with Symfony's default
markup instead of the Bootstrap 5 admin widgets. Put the tag in the block that renders the form,
before `form_start`.
:::

## Forms are standard Symfony forms

Back-office forms are plain Symfony form types: a `final` class extending `AbstractType`,
located in `src/Form/<Group>/<Name>Type.php`. No Thelia `BaseForm`, no XML.

```php
// templates/backOffice/default-twig/src/Form/Brand/BrandType.php
namespace BackOfficeDefaultTwigBundle\Form\Brand;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Contracts\Translation\TranslatorInterface;

final class BrandType extends AbstractType
{
    public function __construct(
        private readonly TranslatorInterface $translator,
    ) {
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('title', TextType::class, [
                'constraints' => [new NotBlank()],
                'label' => $this->translator->trans('Brand name'),
            ])
            ->add('locale', HiddenType::class, [
                'constraints' => [new NotBlank()],
            ])
            ->add('visible', CheckboxType::class, [
                'required' => false,
                'label' => $this->translator->trans('This brand is online'),
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'csrf_token_id' => 'admin.brand',
        ]);
    }
}
```

In the template, opt into the admin form theme, then render the form with `form_start` /
`form_end`. The theme supplies the Bootstrap 5 markup, so you only point each widget at the
right field:

```twig
{# @BackOfficeDefaultTwig/catalog/brand/edit.html.twig #}
{% form_theme form with bo_form_themes only %}

{{ form_start(form, {
    action: path('admin.brand.save', { brand_id: brand.id }),
    method: 'post',
    attr: { 'data-testid': 'brand-edit-form' }
}) }}

    <div class="mb-3">
        {{ form_label(form.title) }}
        {{ form_widget(form.title, { attr: { class: 'form-control' } }) }}
    </div>

    <div class="form-check mb-3">
        {{ form_widget(form.visible, { attr: { class: 'form-check-input' } }) }}
        {{ form_label(form.visible) }}
    </div>

    {{ form_widget(form.id) }}
    {{ form_widget(form.locale) }}

    <button type="submit" class="btn btn-primary">{{ 'Save'|trans }}</button>
{{ form_end(form) }}
```

This replaces the old Smarty `{form}` / `{form_field}` pattern entirely. There is no
manual loop over fields and no manual error block: Symfony renders labels, widgets and
errors through the theme.

:::caution Custom widget markup needs `setRendered`
When you render a field with raw HTML instead of `form_widget`, for instance a `<select>`
built from a custom list, Symfony does not know the field has been rendered, and
`form_end(form)` will output it a second time. Mark it as rendered explicitly:

```twig
{# @BackOfficeDefaultTwig/catalog/category/edit.html.twig #}
{{ form_label(form.parent) }}
<select name="{{ form.parent.vars.full_name }}" class="form-select" required>
    <option value="0"{{ not form.parent.vars.value ? ' selected' }}>{{ '- Root category -'|trans }}</option>
    {% for cat in available_categories %}
        <option value="{{ cat.id }}"{{ cat.id == form.parent.vars.value ? ' selected' }}>{{ cat.title }}</option>
    {% endfor %}
</select>
{% do form.parent.setRendered %}
```
:::

## Escaping

Twig auto-escapes everything by default. The only place the `|raw` filter is allowed is
hook output, because a hook returns HTML produced by listeners:

```twig
{% for block in hook_block('home.block', { foo: bar }) %}
    <h2>{{ block.title }}</h2>
    {{ block.content|raw }}
{% endfor %}
```

Anywhere else, leave the default escaping in place. Never use `|raw` on user-supplied or
database values.

## Learn more

- [Hooks](./hooks) - inject content into back-office screens
- [Forms](/docs/reference/forms) - Thelia form handling reference
- [Modules and bundles](/docs/architecture/modules-vs-bundles) - why themes are bundles
