---
title: customer:anonymize
---

## Description
Erase the identifying data of a customer, keeping the accounting record of the orders.

## Usage
```shell
  customer:anonymize <email> [options]
```

## Arguments
 -    `email`  Email address of the customer to anonymize.

## Options
 -    `--force`  Do not ask for confirmation.

Deleting an account would take away orders a business is required to keep. This command
erases the identity instead: name, email, password, tokens, address book, cart addresses,
the identity frozen on the order addresses (including SIRET and VAT number), carts,
newsletter subscription, account version history, and the identity copied into the admin
log. The orders keep their reference, invoice number and date, amounts, taxes, coupons and
status history, and stay attached to the now anonymous account.

The whole operation runs in a single Propel transaction: if a module fails, nothing is
written. `customer.anonymized_at` records the date of the first erasure, so running the
command twice does not move the date.

Modules erase their own share by implementing `CustomerPersonalDataProviderInterface`. See
[Personal data](../../security/personal-data.md).

## Examples
Ask for confirmation, then anonymize:
```shell
php Thelia customer:anonymize customer@example.com
```

From a script, without the prompt:
```shell
php Thelia customer:anonymize customer@example.com --force
```

:::caution
This cannot be undone. The account is disabled and its email is replaced by
`anonymous-<id>@anonymous.invalid`, so the person cannot log in again nor be found by
email.
:::
