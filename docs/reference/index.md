---
title: Reference
sidebar_position: 1
---

# Reference Documentation

Technical reference documentation for Thelia's core systems.

## Core Systems

### Events

Thelia uses Symfony's event dispatcher to allow modules to react to various actions throughout the system. Events enable decoupled communication between components.

See [Events Reference](./events.md) for the complete list of available events.

### Forms

Thelia's form system is built on Symfony Forms, providing validation, CSRF protection, and easy template rendering.

See [Forms Reference](./forms.md) for form creation and handling.

### Internationalization

Thelia supports multiple languages and locales out of the box. Learn how to translate your modules and templates.

See [Internationalization](./internationalization.md) for i18n documentation.

## CLI Commands

Thelia provides console commands for common operations like cache management, module handling, and database operations.

See [CLI Reference](./cli/index.md) for all available commands.

## Quick Reference

| Topic | Description |
|-------|-------------|
| [Events](./events.md) | System events and event listeners |
| [Forms](./forms.md) | Form creation and validation |
| [Internationalization](./internationalization.md) | Multi-language support |
| [CLI Commands](./cli/index.md) | Console commands |

## Legacy References

These sections document the Smarty data layer kept for the transitional legacy back-office. Prefer [API resources](/docs/api/index.md) in new code.

| Topic | Description |
|-------|-------------|
| [Loops](./loops/index.md) | Smarty loop reference (legacy data layer) |
| [Smarty Plugins](./smarty-plugins/index.md) | Smarty plugins for the legacy back-office theme |
