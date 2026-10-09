---
title: Accounting Exports
sidebar_position: 11
---

# Accounting Exports

Added in Thelia 3.3.

Two exports give the accountant the sales of a period in a file their software loads, instead
of an order export to rework: the **sales journal**, one row per accounting entry, and the
**tax summary**, one row per month and per tax rate. They sit in the Orders category of the
export screen and run from the command line like any export.

## The chart of accounts

Set it in the back office, under Configuration > Accounting, before the first export:

| Setting | Example | Meaning |
| --- | --- | --- |
| Journal code and label | `VE`, `Ventes` | the sales journal; `VE` / `Ventes` when left empty |
| Customer account | `411000` | debited of every invoice |
| Shipping account | `708500` | credited of the shipping, excluding tax |
| One row per tax rate | `20` → `706200`, `445720` | the account of the sales at that rate, and of the tax collected (not needed at 0) |

They are the `accounting_*` configuration variables, which `thelia:config` reads and writes;
the rates are one variable, `accounting_rate_accounts`, as `20:706200:445720,5.5:706055:445705,0:706000`.
The sales journal refuses to run until the chart is complete, and says what is missing: no
account is ever made up.

## The sales journal

The invoices of the period, by **invoice date**: an order placed in January and invoiced in
February is in February. An order without invoice reference has no entry (the report counts
them, the orders placed before the invoice numbering was switched on among them).

Each invoice is a piece, balanced to the cent:

- the customer is debited of the total of the invoice;
- the products are credited excluding tax, one line per tax rate of the chart; prices and taxes
  being rounded to the cent, an amount is filed under the rate of the chart that gives its tax
  within a cent (0.20 of tax on 0.99 makes 20.20%, filed at 20%), and a line taxed twice under
  the sum of its rates, which the chart needs a row for;
- an order discount is spread over the rates in proportion of their amount excluding tax;
- the shipping is credited excluding tax on the shipping account, at the rate or rates of its
  tax; untaxed shipping needs no rate row;
- the tax collected is credited by rate, the shipping's included.

The amounts are those of the invoice handed to the customer, under the rounding rule the
order was priced with, older orders included: nothing is recomputed. An order priced before
the rounding rules did not take its discount off the tax on its invoice, and is booked so. An order in another
currency is booked in the shop currency at the rate of the order, with its own amount and
currency beside it. An order that cannot be booked, for instance taxed at a rate the chart
has no account for, is left out and named in the report.

## Formats

The columns of the sales journal are the 18 fields of the French accounting entries file
(fichier des écritures comptables), in their order:

| Field | Value |
| --- | --- |
| `JournalCode`, `JournalLib` | the sales journal |
| `EcritureNum`, `PieceRef` | the invoice reference |
| `EcritureDate`, `PieceDate`, `ValidDate` | the invoice date |
| `CompteNum`, `CompteLib` | the account and its label |
| `CompAuxNum`, `CompAuxLib` | the customer reference and name, on the customer line only |
| `EcritureLib` | "Facture <reference> <customer>" (in the language of the export) |
| `Debit`, `Credit` | the amount, in the shop currency |
| `EcritureLet`, `DateLet` | empty |
| `Montantdevise`, `Idevise` | the amount and currency of an order in another currency |

Choose the **FEC** format to get the file itself: tab separated, the field names on the first
line (even for a period without invoice), dates as YYYYMMDD, amounts with a decimal comma,
UTF-8. Rename it `<SIREN>FEC<YYYYMMDD>.txt` before handing it to the tax administration. Choose
**CSV** to read it in a spreadsheet. The labels follow the language chosen for the export.

## The tax summary

Per month of invoice and per tax rate, the highest first: the amount taxed (products and
shipping), the tax and the number of invoices.
It is read from the same pieces as the sales journal, so its taxes add up to the tax lines of
the journal, to the cent: the figures to check the tax return against.

## The report

After the download, the export screen shows what the export did: the number of pieces and the
totals of debit and credit, the orders left out and why, how many orders of the period have no
invoice reference. On the command line, the report follows the path of the file:

```shell
php Thelia export thelia.export.sales_journal thelia.fec --start=2026-02-01 --end=2026-02-28 --locale=fr_FR
php Thelia export thelia.export.tax_summary thelia.csv --start=2026-01-01 --end=2026-03-31
```

## Not covered

- **Credit notes.** No credit note module runs on Thelia 3 yet: refunds and credit notes are
  not in the journal, and the report says so.
- Matching (`EcritureLet`), the payments received and the bank reconciliation.
- Sending the exports by mail on a schedule.
