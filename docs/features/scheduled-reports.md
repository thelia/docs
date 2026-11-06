---
title: Scheduled Reports
sidebar_position: 14
---

# Scheduled Reports

Added in Thelia 3.4.

A scheduled report sends an export of the back office by e-mail, on a fixed rhythm, to the people who need it. Nobody has to log in and download the file.

Any export of the export screen can be sent: orders, order lines, returns, the conversion funnel, and the exports added by modules.

## Set up a report

Open **Tools > Scheduled reports** in the back office. The export screen links to it too.

A report has these settings:

| Setting | Meaning |
| --- | --- |
| Title | The name of the report, shown in the e-mail. |
| Export | The export to send. |
| Period | The days the export covers, relative to the day the report goes out. |
| Recipients | The addresses that receive the report. Each one gets its own e-mail. |
| Frequency | Daily, weekly on a day of the week, or monthly on a day from 1 to 28. |
| Hour | The hour of the day the report goes out. |
| Language | The language of the e-mail and of the export. |

The periods are:

| Period | Covers |
| --- | --- |
| `yesterday` | The day before. |
| `last_7_days` | The seven days that end yesterday. |
| `previous_week` | Monday to Sunday of the week before. |
| `previous_month` | The whole month before. |
| `month_to_date` | From the first of the month to yesterday. |

A period runs from the first to the last second of its days, in the timezone of PHP.

The period only matters for an export that can be limited to a date range, such as the orders. An export that has no date range sends all of its data.

## What the e-mail holds

- One e-mail is sent to each recipient. An address that is refused does not stop the others.
- When the export provides a summary, the key figures open the e-mail. The orders export gives the number of orders and of paid orders, then the revenue with taxes and the average order value of the paid orders, counted as on the dashboard of the back office. The file still lists every order of the period. The conversion funnel gives the carts and orders created, the orders paid and the paid share.
- The export comes as a CSV file attached to the e-mail, or as a download link when the file is large (see below).
- When the period holds no data, the e-mail says that there is nothing to report. It has no attachment and no link.

## How sending is triggered

Reports are sent by the command [`report:send-due`](../reference/cli/report_send_due.md). It sends the reports that are due and leaves the others alone. Something has to run it every few minutes. There are three ways.

### The shop schedule

When a worker consumes the `scheduler_thelia` transport, the command runs by itself. See [Running the workers](../getting-started/background-workers.md).

The variable `THELIA_SCHEDULE_REPORT_MAILS` holds the cron expression. It is `*/15 * * * *` by default, which is every 15 minutes. An empty value turns the task off, for a shop that triggers the command another way.

### The WebScheduler module

Prepare one task that runs `report:send-due` from the report screen of the back office. The module calls a URL of the shop, and the shop runs the command.

Keep in mind:

- The URL of the trigger is public. It is protected by its secret and by an IP allowlist. The task prepared from the report screen has an empty allowlist, and WebScheduler then answers calls from any address: fill it in WebScheduler.
- The report screen shows the URL only to an administrator who may change the reports.
- WebScheduler stores what the command prints. The output of the command holds ids and counts only, never an amount or a name.

### A cron line on the server

Run the command from the project root. The report screen shows the line to copy, with the expression of `THELIA_SCHEDULE_REPORT_MAILS` when it is set:

```shell
*/15 * * * * cd /path/to/project && php bin/console report:send-due
```

`php Thelia report:send-due` does the same.

Do not use a cron line and the shop schedule together: the command would run twice. Two runs at the same time are harmless, because one lock protects each report and the second run skips it. It is still a waste.

## Send one report now

[`report:mail <id>`](../reference/cli/report_mail.md) sends one report at once, over the period relative to today. The **Send now** button of the report screen does the same. It does not change what the schedule has already sent.

While a run of `report:send-due` is sending the same report, the immediate send is refused and nothing is sent: try again a few minutes later.

## Large files

| Setting | Default | Meaning |
| --- | --- | --- |
| `report_mail_attachment_max_mb` | `5` | The largest file, in MB, that is attached. A larger file is sent as a link. `0` always sends a link. |
| `report_mail_link_lifetime_days` | `3` | How many days a download link stays valid. |

Both are shop settings, changed with [`thelia:config`](../reference/cli/thelia_config.md) or on the report screen. The screen accepts up to 100 MB and 1 to 14 days; `thelia:config` does not check these bounds.

The file of a link is kept in `var/report-mail`. The command `maintenance:purge` removes the files whose link has expired.

## Duplicates and retries

- A period is sent once to every recipient. When the command runs again, it sends nothing new until the next period is due.
- Each recipient is recorded as soon as their e-mail is sent. A run that stops halfway, during a deployment for example, leaves the next run with the recipients not yet served only.
- When the send fails for some recipients, only those recipients are tried again, by the next runs of the command. A recipient removed from the report in the meantime is not tried again. After three tries over the same period, they are given up until the next period, and the log says how many.
- When the whole send fails, for example because the shop has no sender address, the run counts as a try too: the period is given up after the third one.
- The command ends with the exit code 1 when a report could not be sent to everyone, so that a scheduler can raise an alert.
- A new report is due as soon as its latest scheduled moment has passed. It does not wait for the next one.

## Security

- The download link is signed with the secret of the application. It expires, and a link that was changed or has expired answers `403`. The file name inside the link is covered by the signature.
- The link only serves files of the report folder, `var/report-mail`. It cannot read another file.
- The link is rate limited per client, and the answer is never cached.
- Treat an e-mailed report like the export itself: it holds orders, amounts and customer data. Send it to people who may see them.
- Both report commands print ids and counts only. Their output holds no amount, no name and no address.
- The shop must have a store e-mail address (Configuration > Store). Without it, no report is sent.

## For developers

An export can open its e-mail with key figures. Implement `Thelia\Domain\DataTransfer\Export\MailableReportInterface` on the export class and return one `ReportSummaryLine` per figure.

`summarize()` is called on the export as it ran: the same period and the same language. Translate the labels and format the values yourself. A summary that throws is ignored, and the e-mail goes out without figures.

```php
<?php

declare(strict_types=1);

namespace MyModule\Export;

use Thelia\Core\Translation\Translator;
use Thelia\Domain\DataTransfer\Export\JsonFileAbstractExport;
use Thelia\Domain\DataTransfer\Export\MailableReportInterface;
use Thelia\Domain\DataTransfer\Export\ReportSummaryLine;

final class RefundExport extends JsonFileAbstractExport implements MailableReportInterface
{
    private int $refundCount = 0;

    // ... the usual export code, which fills $this->refundCount

    public function summarize(): array
    {
        return [
            new ReportSummaryLine(
                Translator::getInstance()->trans('Refunds', [], 'mymodule', $this->language->getLocale()),
                (string) $this->refundCount,
            ),
        ];
    }
}
```

An export that does not implement the interface is still sent, with its file and no figures.
