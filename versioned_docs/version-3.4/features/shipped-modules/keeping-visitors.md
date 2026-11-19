---
title: Keeping Visitors
sidebar_position: 5
---

# Keeping Visitors

Two modules give a visitor a reason to come back: a list of products they want, and an e-mail when
a product they could not buy is available again. Both are active on a fresh install and need no key.

| Module | What it does | Default state |
| --- | --- | --- |
| WishList | Wish lists for customers and guests | Active |
| StockAlert | "Notify me" e-mail when a product is back in stock | Active |

## Wish lists (WishList)

### What it does

With the Flexy theme:

- a heart button on the product page and on the product cards adds the product to a wish list;
- a wish list link appears in the header;
- the customer account has a **My wishlists** section.

A visitor who is not logged in can build a list too. When they log in, that list is merged into
their account.

### Settings

None. The module works as soon as it is active.

Module: [thelia-modules/WishList](https://github.com/thelia-modules/WishList)

## Back-in-stock alerts (StockAlert)

### What it does

When the selected combination of a product is out of stock, the product page offers to be notified.
The visitor leaves an e-mail address, and an e-mail is sent when the stock of that combination
comes back.

The module can also send price-drop alerts.

### Set it up

The settings, including the price-drop alerts, are on `/admin/module/StockAlert`.

Module: [thelia-modules/StockAlert](https://github.com/thelia-modules/StockAlert)
