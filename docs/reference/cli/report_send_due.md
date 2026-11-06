---
title: report:send-due
---

## Description
Send the scheduled reports that are due, each period once.

A scheduled report sends an [export](../../features/scheduled-reports.md) by e-mail over a period
relative to the day it goes out. This command looks at every enabled report and sends the ones
whose moment has come, to every recipient.

A period is sent once. The recipients a send failed for are kept and tried again, on their own, by
the next runs, three tries in all over a period. A report that is being sent by another run is skipped, and the command says so.

The command ends with `1` when a report could not be sent to everyone, so that a scheduler can
alert. Its output holds ids and counts only: no amount, name or address, because a scheduler such as
WebScheduler stores what a command prints.

## Usage
```shell
report:send-due [options]
```

## Options
 -    `--dry-run`  Tell which reports are due, without sending nor writing anything.

## Example
```shell
php Thelia report:send-due
```

Check what is due:
```shell
php Thelia report:send-due --dry-run
```

Run it every few minutes. The `thelia` schedule does it every 15 minutes when a worker consumes
`scheduler_thelia` (`THELIA_SCHEDULE_REPORT_MAILS`, default `*/15 * * * *`). A shop that uses a
crontab adds the line and empties the variable. See
[Scheduled reports](../../features/scheduled-reports.md#how-sending-is-triggered).
