---
title: Tracking
sidebar_position: 4
---

# Tracking

The GoogleTagManager module loads a Google Tag Manager container on the shop and sends the
e-commerce events of the visit to it. Analytics, advertising and other tags are then configured in
Google Tag Manager, not in the shop.

| Module | Default state | Needs |
| --- | --- | --- |
| GoogleTagManager | Inactive | A Google Tag Manager container ID |

## Set it up

1. Create a container in Google Tag Manager and note its ID (it starts with `GTM-`).
2. Activate the GoogleTagManager module.
3. Open `/admin/module/GoogleTagManager` and enter the container ID. Only letters, digits and dashes
   are accepted.

## What is sent

With an ID, every page loads the Google Tag Manager script in its `<head>`, and its `<noscript>`
fallback in the `<body>`. The module pushes these events to the `dataLayer`:

| Event | When |
| --- | --- |
| `view_item` | A product page is displayed |
| `view_cart` | The cart is displayed |
| `begin_checkout` | The checkout starts |
| `add_payment_info` | A payment method is chosen |
| `purchase` | The order confirmation page is displayed, once per order |
| `login` | A customer logs in |

Collecting audience data may require the visitor's consent depending on your jurisdiction. Handle
consent in your Google Tag Manager configuration or with a consent management tool.

## Without an ID

Nothing is injected in the pages. The module can stay active.

## Content Security Policy

Thelia sets no `Content-Security-Policy` header by default (see
[Default Response Headers](../../security/http-headers.md)). If you add one, it must allow scripts
from `https://www.googletagmanager.com` and inline scripts, or the container will not load.

Module: [thelia-modules/GoogleTagManager](https://github.com/thelia-modules/GoogleTagManager)
