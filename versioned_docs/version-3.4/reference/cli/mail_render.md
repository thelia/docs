---
title: mail:render
---

## Description
Render a mail message to a file without sending it, to preview it or work on its template.

## Usage
```shell
  mail:render <message-code> [options]
```

## Arguments
 -    `message-code`  Mail message code, e.g. `order_confirmation`.

## Options
 -    `--order[=ORDER]`    Order id, to provide the order context (`order_id`, `order_ref`, `customer_id`).
 -    `--locale[=LOCALE]`  Locale to render in, e.g. `fr_FR` (default: the store's default language).
 -    `--out[=OUT]`        Output file prefix: writes `<prefix>.html` and `<prefix>.txt` (default: the HTML body is written to standard output).

The command renders the email through the active email template, exactly as it would be sent, but never sends it. It pushes a request with a session so the parser and the formatting helpers have a locale and a currency to work with, so it runs fine outside any HTTP request.

With an order id, the order context (`order_id`, `order_ref`, and the customer) is injected, so messages that display order details render with real data. Without it, only the message and its layout are rendered.

## Examples
Preview the HTML body on screen:
```shell
php Thelia mail:render order_confirmation --order=1 --locale=fr_FR
```

Write both bodies to files (`order_confirmation.html` and `order_confirmation.txt`):
```shell
php Thelia mail:render order_confirmation --order=1 --locale=fr_FR --out=order_confirmation
```

:::tip
Emails ship as a `.html.twig` and a `.txt.twig` per message. `--out` writes both, so you can check the HTML and the plain-text bodies side by side. See [Emails and PDF](../emails-and-pdf.md).
:::
