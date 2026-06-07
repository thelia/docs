---
title: UI components and Stimulus
sidebar_position: 5
---

# UI components and Stimulus

The back-office ships its reusable UI as part of the `default-twig` bundle. The
component PHP classes, their Twig templates, the Stimulus controllers and the
asset build all live inside `templates/backOffice/default-twig/`. Nothing is
declared in XML and nothing is registered globally. You drop a class in the right
folder and the bundle picks it up.

This is the back-office counterpart of the Flexy front-office components. The
patterns are the same (Symfony UX TwigComponent + Stimulus). What differs is the
surface they target, the admin on Bootstrap 5, and the fact that the back-office
layer is TwigComponent-only (see the note below).

:::note Themes are bundles
`BackOfficeDefaultTwigBundle` registers its own component namespace, Twig paths
and Stimulus app. A module never edits the core to add a back-office component.
It ships its own bundle, or reuses the ones documented here through Twig.
:::

## A concrete component first

Every list screen in the admin renders through a single component, `BoDataTable`.
Its class is a plain `final` class with public properties, tagged with
`#[AsTwigComponent]`:

```php
// templates/backOffice/default-twig/src/UiComponents/DataTable/DataTable.php
namespace BackOfficeDefaultTwigBundle\UiComponents\DataTable;

use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;

#[AsTwigComponent(name: 'BoDataTable', template: '@BackOfficeDefaultTwig/components/DataTable/DataTable.html.twig')]
final class DataTable
{
    public string $id = '';

    public string $caption = '';

    /** @var list<Column> */
    public array $columns = [];

    /** @var list<array<string, mixed>> */
    public array $rows = [];

    public string $emptyMessage = '';

    public ?string $sortField = null;

    public string $sortDirection = 'asc';

    // … sort params, hook injection points, etc.
}
```

You render it from any Twig template with the `component()` function, the same
syntax the Flexy front office uses. The second argument is a hash whose keys map
one-to-one to the public properties:

```twig
{# templates/backOffice/default-twig/<domain>/list.html.twig #}
{{ component('BoDataTable', {
    id: 'currencies',
    columns: [
        column('name', 'Name'|trans, 'start', 'name'),
        column('code', 'ISO 4217'|trans, 'start', 'code'),
        column_toggle('visible', 'Visible'|trans, 'toggle_visible_url'),
        column_actions('_actions', 'Actions'|trans),
    ],
    rows: rows,
    emptyMessage: 'No currency defined yet.'|trans,
    sortField: sort_field,
}) }}
```

The `columns` prop is a list of `Column` value objects. You rarely build them by
hand: the bundle registers Twig helper functions (`column()`, `column_text()`,
`column_html()`, `column_toggle()`, `column_badge()`, `column_actions()`,
`column_radio()`, `row_action()` in `src/Twig/DataTableExtension.php`) that return
the right `Column`/`RowAction`. Each `Column` carries a `ColumnKind` (an enum)
telling the template how to render its cell:

```php
// templates/backOffice/default-twig/src/UiComponents/DataTable/Column.php
namespace BackOfficeDefaultTwigBundle\UiComponents\DataTable;

final readonly class Column
{
    public function __construct(
        public string $key,
        public string $label,
        public ColumnKind $kind = ColumnKind::TEXT,
        public string $cellAlign = 'start',
        public array $options = [],
        public ?string $sortKey = null,
    ) {
    }
}
```

```php
// templates/backOffice/default-twig/src/UiComponents/DataTable/ColumnKind.php
enum ColumnKind: string
{
    case TEXT = 'text';
    case HTML = 'html';
    case TOGGLE = 'toggle';
    case BADGE = 'badge';
    case ACTIONS = 'actions';
    case RADIO = 'radio';
}
```

Each kind has its own cell template under `components/DataTable/cells/`
(`text.html.twig`, `html.html.twig`, `toggle.html.twig`, `badge.html.twig`,
`actions.html.twig`, `radio.html.twig`). The `ACTIONS` kind renders a list of
`RowAction` value objects (edit / delete / view / custom), each optionally gated
by a Symfony voter attribute.

:::tip Sortable columns and list sort state
Set `Column::$sortKey` to make a header clickable. Pair it with the `ListSort`
value object (`ListSort::fromRequest(...)`), which reads the `order` / `direction`
query parameters, validates them against an allow-list, and hands the result both
to your Propel query and to the `BoDataTable` `sortField` / `sortDirection` props.
:::

## The component catalog

All components live in `src/UiComponents/<Name>/<Name>.php`, paired with a Twig
template in `components/<Name>/<Name>.html.twig`. Every one is a `final` class
tagged `#[AsTwigComponent(name: 'Bo…', template: '@BackOfficeDefaultTwig/…')]`.

| Component name | Class | Purpose |
|---|---|---|
| `BoDataTable` | `UiComponents\DataTable\DataTable` | List table: typed columns, sortable headers, row actions, module hook injection points |
| `BoPagination` | `UiComponents\Pagination\Pagination` | Page links for a paginated list (windowed, with ellipsis) |
| `BoCreateDialog` | `UiComponents\CreateDialog\CreateDialog` | Bootstrap modal wrapping a Symfony `FormView` for "create" forms |
| `BoConfirmDialog` | `UiComponents\ConfirmDialog\ConfirmDialog` | Modal confirming a destructive action (delete), posts to `formAction` with a CSRF token |
| `BoWarningDialog` | `UiComponents\WarningDialog\WarningDialog` | Informational / blocking modal with a single OK button |
| `BoFetchDialog` | `UiComponents\FetchDialog\FetchDialog` | Modal whose body is fetched on demand from a `data-fetch-url` |
| `BoDashboard` | `UiComponents\Dashboard\Dashboard` | Home dashboard: KPI cards + charts, period-aware |
| `BoLanguageSwitcher` | `UiComponents\LanguageSwitcher\LanguageSwitcher` | "Edit in &lt;language&gt;" switcher on i18n edit screens |
| `BoSaveModeToolbar` | `UiComponents\SaveModeToolbar\SaveModeToolbar` | "Save" / "Save and close" / "Close" toolbar on edit screens |

A few notes on the more involved ones:

- **`BoCreateDialog`** takes a Symfony `FormView` as its `form` prop, plus
  `formAction`, `submitLabel`, `size`, and an optional `fieldsTemplate` to
  override the default field rendering.
- **`BoConfirmDialog`** posts to its `formAction` (default `method="post"`) and
  includes a CSRF token by default (`token: true`). It exposes `hook` /
  `hookContext` props so modules can inject content via the back-office hook
  system.
- **`BoDashboard`** is the only component with constructor dependencies: it
  injects `DashboardStatsProvider` and the `RequestStack`, reads the `period`
  query parameter, and computes the stats for the current locale. The autowiring
  is automatic (see below), and you still render it as `{{ component('BoDashboard') }}`.

:::note Component classes are auto-discovered
The bundle loads `BackOfficeDefaultTwigBundle\` from `src/` with `autowire()`
and `autoconfigure()` enabled (see
`BackOfficeDefaultTwigBundle::loadExtension()`). Because Symfony UX TwigComponent
registers the `#[AsTwigComponent]` attribute for autoconfiguration, every class
under `src/UiComponents/` becomes a component with no extra service declaration:
no XML, no `services.yaml` entry. Add a new `final class` with the attribute,
add its template under `components/`, and you are done.
:::

### No LiveComponents in the back-office

Unlike the Flexy front office, the back-office bundle uses only
`#[AsTwigComponent]`. There is no `#[AsLiveComponent]`, no `LiveProp`, no
`LiveAction` in `src/UiComponents/`. Interactivity comes from Stimulus
controllers, Bootstrap 5 JS and HTMX rather than from server-rendered live
re-rendering. If you need the LiveComponent pattern (reactive props,
server round-trips), see the front-office reference linked at the end.

## Stimulus controllers

Client-side behavior lives in `assets/controllers/`. Each file is one Stimulus
controller; the filename maps to the controller identifier used in
`data-controller`:

```
templates/backOffice/default-twig/assets/controllers/
├── bo-sortable_controller.js        →  data-controller="bo-sortable"
├── bo-inline-edit_controller.js     →  data-controller="bo-inline-edit"
├── bo-date-range_controller.js      →  data-controller="bo-date-range"
├── bo-chart_controller.js           →  data-controller="bo-chart"
├── bootstrap-bridge_controller.js   →  data-controller="bootstrap-bridge"
└── … (50 controllers)
```

Back-office controllers are prefixed `bo-` and named in kebab-case. A controller
is a standard Hotwired Stimulus class:

```js
// templates/backOffice/default-twig/assets/controllers/confirm-modal_controller.js
import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static values = {
        message: { type: String, default: 'Are you sure?' },
    };

    confirm(event) {
        if (!window.confirm(this.messageValue)) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }
}
```

Wire it in Twig the usual Stimulus way:

```twig
<button data-controller="confirm-modal"
        data-action="click->confirm-modal#confirm"
        data-confirm-modal-message-value="{{ 'Delete this item?'|trans }}">
    {{ 'Delete'|trans }}
</button>
```

### The bootstrap-bridge controller

`bootstrap-bridge_controller.js` initializes Bootstrap 5 tooltips and popovers
for any element inside its scope, replacing the historical jQuery
`$.tooltip()` pattern. It is typically attached to `<body>`:

```twig
<body data-controller="bootstrap-bridge">
    <button data-bs-toggle="tooltip" title="{{ 'Help'|trans }}">…</button>
</body>
```

It imports `Tooltip` and `Popover` from `bootstrap` and disposes them on
`disconnect()`, so the bridge plays nicely with dynamically inserted DOM.

:::tip Controllers are auto-registered, not listed
`assets/controllers.json` is empty on purpose. The Stimulus app is started in
`assets/bootstrap.js` with `startStimulusApp(require.context('…/lazy-controller-loader!./controllers', …))`,
so every `*_controller.js` in `assets/controllers/` is lazily loaded by
identifier. You never edit `controllers.json` to register a back-office
controller. Just add the file.
:::

## Building the assets

The bundle builds its SCSS and JS with Webpack Encore. The entry point is
`assets/app.js` (which imports `bootstrap.js`, the SCSS, Bootstrap and HTMX),
declared in `webpack.config.js` and bridged to Stimulus with
`.enableStimulusBridge('./assets/controllers.json')`.

```bash
# install once
ddev exec bash -c "cd templates/backOffice/default-twig && npm install"

# production build (encore production)
ddev exec bash -c "cd templates/backOffice/default-twig && npm run build"

# rebuild on change during development (encore dev --watch)
ddev exec bash -c "cd templates/backOffice/default-twig && npm run watch"
```

:::caution Rebuild after editing assets
A SCSS or controller change is only visible after an Encore rebuild
(`npm run build` or a running `npm run watch`). After editing a Twig template,
clear the cache: `ddev exec bin/console cache:clear -e dev`.
:::

## Learn more

- [Back-Office Development](./index.md): overview of the admin layer
- [Hooks Reference](./hooks): how modules inject content into back-office screens
- [Front-office LiveComponents](/docs/front-office/live-components): the reactive component pattern (used in Flexy, not in the back-office)
- [Front-office Stimulus controllers](/docs/front-office/stimulus): the front-office counterpart of these controllers
