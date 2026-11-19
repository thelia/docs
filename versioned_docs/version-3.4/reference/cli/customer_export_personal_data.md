---
title: customer:export-personal-data
---

## Description
Export everything the shop knows about one customer, as JSON.

## Usage
```shell
  customer:export-personal-data <email> [options]
```

## Arguments
 -    `email`  Email address of the customer.

## Options
 -    `--output-file[=OUTPUT-FILE]`  Write the archive to this file instead of the standard output.

Core contributes five sections: `customer` (the account), `addresses` (the address book),
`orders` (with their frozen order addresses, products and coupons), `carts`, and
`newsletter`. Every module implementing `CustomerPersonalDataProviderInterface` adds its
own section, under the name it declares.

The same export is available from the back-office, on the customer sheet.

## Examples
Print the export on screen:
```shell
php Thelia customer:export-personal-data customer@example.com
```

Write it to a file:
```shell
php Thelia customer:export-personal-data customer@example.com --output-file=export.json
```

:::tip
The file contains personal data. Deliver it over a channel the person controls, and delete
your local copy once it has been handed over. See [Personal data](../../security/personal-data.md).
:::
