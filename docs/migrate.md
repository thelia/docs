---
title: Migrating from Thelia 2
sidebar_position: 10
---

# Migrating from Thelia 2

This guide covers the key differences between Thelia 2 and Thelia 3 to help you plan a migration.

## What Changed

### Front-Office: Smarty → Twig

| Thelia 2 | Thelia 3 |
|----------|----------|
| Smarty templates everywhere | Twig for front-office, Smarty kept for back-office |
| Loops for data access | `resources()` via DataAccessService (calls the API internally) |
| Custom jQuery scripts | Stimulus controllers |
| Full page reloads | LiveComponents for reactive UI |
| No component system | 47 pre-built components in Flexy theme |

### API: Custom → API Platform

| Thelia 2 | Thelia 3 |
|----------|----------|
| OpenApi module (custom) | API Platform 3 (industry standard) |
| Module-specific endpoints | Unified `/api/admin/` and `/api/front/` routes |
| Custom serialization | Serialization groups |
| No addon system | ResourceAddonInterface for enriching resources |

### Modules: XML → Autowiring

| Thelia 2 | Thelia 3 |
|----------|----------|
| `config.xml` for everything | `configureServices()` with autowiring |
| `routing.xml` for routes | `#[Route]` PHP attributes |
| Manual service registration | Autoconfigure handles subscribers, commands |
| `config.xml` still needed | Only for hooks, loops, and forms |

### Installation: Interactive → Standalone

| Thelia 2 | Thelia 3 |
|----------|----------|
| `php Thelia thelia:install` (needs kernel) | `php bin/install` (standalone, no kernel needed) |
| Interactive prompts | Environment variables + CLI options |
| `php Thelia` console | `php bin/console` (standard Symfony) |

## What Stayed the Same

- **Propel ORM** — same query API, same models, same `->save()` pattern
- **Back-office** — Smarty templates, loops, hooks (unchanged)
- **Module structure** — `Config/module.xml`, `Config/schema.xml`, lifecycle methods
- **Event system** — `TheliaEvents`, `EventSubscriberInterface`, same event names

## Migration Checklist

### Front-Office Templates

- [ ] Replace Smarty `{loop}` calls with `resources()` Twig function
- [ ] Convert `.html` templates to `.html.twig`
- [ ] Replace `{intl l="..."}` with `{{ '...'|trans }}`
- [ ] Replace `{$VAR}` with `{{ var }}`
- [ ] Convert jQuery to Stimulus controllers where needed

### Modules

- [ ] Add `configureServices()` to your module's main class
- [ ] Replace `<services>` XML with autowiring
- [ ] Replace `routing.xml` with `#[Route]` attributes on controllers
- [ ] Keep `<hooks>`, `<loops>`, `<forms>` in `config.xml` (still required)
- [ ] Update `use Thelia\Controller\Front\BaseFrontController` (same namespace)
- [ ] Add API resources in `Api/Resource/` if exposing data via API

### API Endpoints

- [ ] Replace OpenApi module endpoints with API Platform resources
- [ ] Implement `PropelResourceInterface` for new resources
- [ ] Use `ResourceAddonInterface` to enrich existing resources
- [ ] Set up JWT authentication (`lexik:jwt:generate-keypair`)

### Testing

- [ ] Set up test database with `php bin/test-prepare`
- [ ] Extend `IntegrationTestCase` for functional tests
- [ ] Use `FixtureFactory` for test data creation

## Key Namespace Changes

| Class | Same in T3? |
|-------|------------|
| `Thelia\Module\BaseModule` | Yes |
| `Thelia\Controller\Front\BaseFrontController` | Yes |
| `Thelia\Controller\Admin\BaseAdminController` | Yes |
| `Thelia\Core\Event\TheliaEvents` | Yes |
| `Thelia\Core\Hook\BaseHook` | Yes |
| `Thelia\Form\BaseForm` | Yes |
| `Thelia\Core\Template\Element\BaseLoop` | Yes (but deprecated) |

## See Also

- [Architecture](/docs/architecture) — Understand the new system design
- [Front-Office](/docs/front-office) — Twig and Symfony UX guide
- [Modules](/docs/modules) — Modern module development
- [Testing](/docs/testing) — New test framework
