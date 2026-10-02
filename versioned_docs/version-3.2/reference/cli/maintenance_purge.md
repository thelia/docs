---
title: maintenance:purge
---

## Description
Purge old data from the database: carts without orders, anonymous carts, admin logs, form firewall records, and the identity of accounts nobody uses anymore.

## Usage
```shell
  maintenance:purge [options]
```

## Options
 -    `--dry-run`  Report what the purge would remove, without touching anything.

Every period is a configuration variable, so a shop sets its own. Read and write them with
`thelia:config`.

| Data | Configuration variable | Default |
| --- | --- | --- |
| Carts without an order | `purification_cart_no_order_days` | 60 days |
| Anonymous carts | `purification_cart_anonymous_days` | 30 days |
| Admin logs | `purification_admin_logs_days` | 180 days |
| Form firewall records | `purification_form_firewall_days` | 1 day |
| Identity of accounts that never ordered | `purification_customer_no_order_days` | `0`, off |
| Identity of accounts whose last order is old | `purification_customer_after_last_order_days` | `0`, off |

Customer retention is off by default, on purpose: erasing an identity cannot be undone,
and the shop is the only one that knows how long it is allowed to keep the data. When a
period is set, the accounts are anonymized through `CUSTOMER_ANONYMIZE`, so modules erase
their share on a scheduled run exactly as on a manual one, and an account already
anonymized is skipped.

The form firewall threshold never goes below the longest waiting period configured, so a
purge cannot hand a blocked IP address a fresh set of attempts.

At the end of its run the command dispatches `TheliaEvents::MAINTENANCE_PURGE`: a module
listens to it, purges its own tables, and appends a line to the report with
`$event->addResult()`.

## Examples
See what would be removed:
```shell
php Thelia maintenance:purge --dry-run
```

Run the purge, typically from a nightly task:
```shell
php Thelia maintenance:purge
```

Set a retention period of two years for accounts that never ordered:
```shell
php Thelia thelia:config set purification_customer_no_order_days 730
```

:::tip
Run `--dry-run` after every change of period, and read the counts before letting the task
run unattended. See [Personal data](../../security/personal-data.md).
:::
