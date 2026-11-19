---
title: Accounting Exports
sidebar_position: 11
---

# Accounting Exports

Added in Thelia 3.4.

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
| Account of commercial credit notes | `709000` | optional: debited of the commercial credit notes; the sales account of their rate when left empty |

They are the `accounting_*` configuration variables, which `thelia:config` reads and writes;
the rates are one variable, `accounting_rate_accounts`, as `20:706200:445720,5.5:706055:445705,0:706000`.
The sales journal refuses to run until the chart is complete, and says what is missing: no
account is ever made up.

## The sales journal

The invoices of the period, by **invoice date**: an order placed in January and invoiced in
February is in February. An order without invoice reference, or without invoice date, has no
entry; the report counts them (see [The report](#the-report)).

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

### A discount on an order with several rates

Thelia takes the tax out of an order discount at the average of the rates of the order lines,
not weighted by their amounts. On an order that mixes rates, the invoice then collects a little
more tax at one rate and a little less at another than its amounts excluding tax say. The
journal books the invoice as it was issued, and the report names each such order with the tax
collected and the tax the rate gives: check them before the tax return.

## Credit notes

When the CreditNote module is active, its credit notes are in the sales journal: a credit note
is booked once it has a credit note number and an invoiced status (accepted or used), at its
date, between the invoices of the same period. Each one is the reverse of an invoice: the
customer is credited, the products, the shipping and the tax it gives back are debited by rate.
A credit note in another currency is booked at its own exchange rate, or at the rate of its
order when it has none. CreditNote 4.4.0 records no rate on its credit notes, so the rate of the
order is the one used: the credit note then reverses its invoice to the cent. A credit note with neither a rate nor an order is left out and named in the report.

A commercial credit note (a rebate, a discount, a refund of a difference) is a reduction granted
after the invoice: it is debited to the account of commercial credit notes when it is set
(709 in the French chart), to the sales account of its rate otherwise. A discount granted on the
invoice itself stays on the sales account, net.

A credit note used to pay an order is a settlement, not a sale given back: it is not in the
sales journal. The tax summary takes the credit notes off their month.

The journal reads the tables of CreditNote 4.4.0. When the module is active but its tables
cannot be read, or when no credit note module is installed, the report says that the credit
notes are not in the journal: refunds made without a credit note never are.

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
| `EcritureLib` | `Facture <reference> <customer>`, `Avoir <reference> <customer>` for a credit note (in the language of the export) |
| `Debit`, `Credit` | the amount, in the shop currency |
| `EcritureLet`, `DateLet` | empty |
| `Montantdevise`, `Idevise` | the amount and currency of an order in another currency |

Choose the **FEC** format to get the file itself: tab separated, the field names on the first
line (even for a period without invoice), dates as YYYYMMDD, amounts with a decimal comma,
UTF-8. Rename it `<SIREN>FEC<YYYYMMDD>.txt` before handing it to the tax administration. Choose
**CSV** to read it in a spreadsheet. The labels follow the language chosen for the export.
The FEC format is offered to the sales journal only: the other exports, the tax summary
included, are refused in that format, and the imports do not read it.

The FEC file is written as the format asks, without the guard the other exports put in front of
a value a spreadsheet would read as a formula (a customer name starting with `=`, for
instance). Open it in accounting software, not in a spreadsheet.

## The tax summary

Per month of invoice and per tax rate, the highest first: the amount taxed (products and
shipping), the tax and the number of pieces (invoices and credit notes).
It is read from the same pieces as the sales journal, so its taxes add up to the tax lines of
the journal, to the cent: the figures to check the tax return against.

## The report

The page of the export job shows what the export did, once it is done: the number of pieces
and the totals of debit and credit, the number of credit notes among them, the orders and
credit notes left out and why, the orders whose discount moved tax between rates, and how many
orders have no entry:

- the orders of the period with an invoice date but no invoice reference;
- the orders placed in the period with an invoice reference but no invoice date: they belong
  to no period, book them by hand;
- the orders placed in the period that are not invoiced.

The report names the first 100 warnings and counts the others in a last line, so that a long
period never keeps the job from ending.

On the command line, the report follows the path of the file:

```shell
php Thelia export thelia.export.sales_journal thelia.fec --start=2026-02-01 --end=2026-02-28 --locale=fr_FR
php Thelia export thelia.export.tax_summary thelia.csv --start=2026-01-01 --end=2026-03-31
```

Both exports can be sent as scheduled report mails. The mail opens with their totals: the
number of pieces, of which credit notes, and the debit and credit of the journal; the amount
taxed, the tax collected and the number of pieces of the tax summary.

## Keeping the files, and anonymized customers

The sales journal of a closed period is a document to keep: export it at the closing and keep
the file for as long as the law asks you to keep your accounting records. The shop does not keep
it for you: the file of an export is deleted once it is a day old, by the next export or by
`maintenance:purge`, and the export job and its report a week after it is done (see [Personal data](../security/personal-data.md#background-jobs)). The
report names orders and credit notes by their reference only.

Anonymizing a customer keeps their orders, amounts, invoice numbers and dates, and the customer
reference: a journal exported again after it has the same pieces and the same amounts, but the
name of the customer (`CompAuxLib`) reads `anonymous anonymous`. The credit notes keep the
address the CreditNote module copied, which the anonymization of the core does not reach.

## For module authors

An export of your own can report what it produced and what it left out. Implement `Thelia\Domain\DataTransfer\Export\ReportingExportInterface`: `report()` returns an `ExportReport`, read once the export has run. Add lines with `addLine()` and warnings with `addWarning()`. The `export` command prints the lines, then the warnings.

The export job keeps the report in the `export_job.report` column, added by the `3.4.0` update script. `ExportJob::getExportReport()` reads it. A replayed job starts with an empty report. A report holds at most 100 warnings (`ExportReport::MAX_WARNINGS`) and is cut to the size of the column, so a journal with many faulty orders still ends as done, with its file. A job whose row cannot be saved is marked failed instead of staying running.

A serializer made for some exports only implements `Thelia\Core\Serializer\ExportOnlySerializerInterface` and its `supportsExport()`. The FEC serializer (`thelia.fec`) does so. Such a serializer is refused for any other export and is never offered to an import. `SerializerManager::getExportSerializers()` returns the serializers an export can be written with.

## Not covered

- Matching (`EcritureLet`), the payments received and the bank reconciliation.
