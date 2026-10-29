---
title: i18n:prune-overrides
---

## Description
List or remove local translation overrides whose base string no longer exists.

## Usage
```shell
  i18n:prune-overrides [options]
```

## Options
 -    `--locale[=LOCALE]`  Restrict to a single locale, e.g. `fr_FR` (default: every override file found).
 -    `--force`            Actually remove the orphaned overrides (default: dry-run, only report).

Merchant translation edits are stored in the local override layer (`local/I18n/{locale}.php`, the `global` fallback domain), which is not versioned and survives a code update. When a base string is removed from the code, an override that still references it becomes orphaned. This command reports those orphans and, with `--force`, prunes them.

An override is reported when its source string is absent from the base catalogs loaded for that locale. Review the list before forcing, especially on a partially translated locale, where a string may look orphaned only because its base translation is missing. The command **never** touches the versioned base translation files; it only rewrites the local override files, and clears the cache after a prune.

## Examples
List orphaned overrides across every local locale file (dry-run):
```shell
php Thelia i18n:prune-overrides
```

Restrict the report to French:
```shell
php Thelia i18n:prune-overrides --locale=fr_FR
```

Remove the orphaned French overrides:
```shell
php Thelia i18n:prune-overrides --locale=fr_FR --force
```

:::note
See [Internationalization](../internationalization.md#the-base-and-override-model) for the base and override model this command maintains.
:::
