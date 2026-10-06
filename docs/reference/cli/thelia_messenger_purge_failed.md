---
title: thelia:messenger:purge-failed
---

## Description
Delete the background jobs set aside in the failure transport for longer than a number of days.

A job that failed every attempt is kept in the `failed` transport, with everything it was
dispatched with, until someone replays or removes it (`messenger:failed:show`,
`messenger:failed:retry`, `messenger:failed:remove`). A failed order mail holds the address of
the customer and the content of the order, so these jobs must not be kept forever. This command
deletes the old ones.

## Usage
```shell
  thelia:messenger:purge-failed [options]
```

## Options
 -    `--older-than=DAYS`  Age in days from which a failed job is deleted. Defaults to `30`. Takes a whole number of days.
 -    `--dry-run`  Count the jobs that would be deleted, and delete nothing.

The age of a job is counted from the date it was set aside. When `failed` is in the shop
database, the default (`doctrine://default?queue_name=failed`), that is the `created_at` of its
row, and the old jobs are counted or deleted in one SQL statement however many there are. With
any other failure transport, every job is read and dated by its last `RedeliveryStamp`; a job
that carries none is kept. The default of `--older-than` is
`Thelia\Messenger\FailedMessagePurger::RETENTION_DAYS`.

The `thelia` schedule runs the command every day at 04:00 when a worker consumes
`scheduler_thelia` (`THELIA_SCHEDULE_FAILED_JOBS_PURGE`, default `0 4 * * *`). A shop that runs
its tasks from a crontab adds it there.

## Examples
Count the failed jobs older than 30 days:
```shell
php Thelia thelia:messenger:purge-failed --dry-run
```

Delete the failed jobs set aside for more than 14 days:
```shell
php Thelia thelia:messenger:purge-failed --older-than=14
```

:::tip
Record the retention period in the GDPR register. See
[Background jobs](../background-jobs.md) and [Personal data](../../security/personal-data.md).
:::
