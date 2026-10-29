---
title: pdf:render
---

## Description
Render an order PDF (invoice or delivery) to a file without the HTTP flow, to preview it or work on its template.

## Usage
```shell
  pdf:render <document> [options]
```

## Arguments
 -    `document`  Document to render: `invoice` or `delivery`.

## Options
 -    `--order[=ORDER]`    Order id to render the document for (required in practice).
 -    `--locale[=LOCALE]`  Locale to render in, e.g. `fr_FR` (default: the store's default language).
 -    `--out[=OUT]`        Output file path, e.g. `invoice.pdf` (default: `<document>-<order_ref>.pdf`).

The command renders the document through the active PDF template and dispatches the `GENERATE_PDF` event, which produces the PDF with dompdf. It pushes a request with a session so the parser and the formatting helpers have a locale and a currency, so it works outside any HTTP request.

The order id is required to render a real document; the command fails if the order is not found. The `document` argument must be `invoice` or `delivery`.

## Examples
Render an invoice for order 1, in French:
```shell
php Thelia pdf:render invoice --order=1 --locale=fr_FR --out=invoice.pdf
```

Render a delivery slip, letting the file be named `delivery-<order_ref>.pdf`:
```shell
php Thelia pdf:render delivery --order=1
```

:::tip
Use this to iterate on a PDF template without going through the order back-office. See [Emails and PDF](../emails-and-pdf.md#pdf-templates) for the CSS constraints of the dompdf engine.
:::
