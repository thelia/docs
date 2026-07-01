---
title: Reference
sidebar_position: 1
---

# Reference documentation

Technical reference for Thelia's core systems.

## Core systems

### Events

Thelia uses Symfony's event dispatcher so modules can react to actions across the system. Events keep components decoupled from each other.

See the [Events reference](./events.md) for the complete list of available events.

### Forms

Thelia's form system is built on Symfony Forms. It handles validation, CSRF protection, and template rendering.

See the [Forms reference](./forms.md) for form creation and handling.

### Internationalization

Thelia supports multiple languages and locales. This section covers how to translate your modules and templates.

See [Internationalization](./internationalization.md) for the i18n documentation.

### Emails and PDF

Transactional emails and order documents (invoice, delivery slip) are Twig themes rendered through the same parser as the rest of the site.

See [Emails and PDF](./emails-and-pdf.md) for the theme reference and the preview commands.

## CLI commands

Thelia provides console commands for common operations such as cache management, module handling, and database operations.

See the [CLI reference](./cli/index.md) for all available commands.

## Quick reference

| Topic | Description |
|-------|-------------|
| [Events](./events.md) | System events and event listeners |
| [Forms](./forms.md) | Form creation and validation |
| [Internationalization](./internationalization.md) | Multi-language support |
| [Emails and PDF](./emails-and-pdf.md) | Email and PDF Twig themes |
| [CLI Commands](./cli/index.md) | Console commands |

## Legacy references

These sections document the Smarty data layer kept for the transitional legacy back-office. Prefer [API resources](/docs/api/index.md) in new code.

| Topic | Description |
|-------|-------------|
| [Loops](./loops/index.md) | Smarty loop reference (legacy data layer) |
| [Smarty Plugins](./smarty-plugins/index.md) | Smarty plugins for the legacy back-office theme |
