---
title: order:remind-unpaid
---

## Description
Send the payment reminders of the unpaid orders and cancel them, as the reminder schedule of the shop says.

## Usage
```shell
  order:remind-unpaid [options]
```

## Options
 -    `--dry-run`  List what the run would do, without sending or changing anything.
 -    `--limit=LIMIT`  The most orders a run acts on, oldest first; the next run goes on. Default: 200.

The schedule is set in the back office, under Configuration > Unpaid order reminders, or
with `thelia:config`:

| Configuration variable | Example | Meaning |
| --- | --- | --- |
| `unpaid_order_reminder_schedule` | `24:order_payment_reminder,72:order_payment_reminder,168:cancel` | steps, in hours from the creation of the order: the code of the mail to send, or `cancel` |
| `unpaid_order_reminder_excluded_modules` | `Cheque` | payment modules whose orders are neither reminded nor cancelled |

Both are empty after an update: nothing is sent until a schedule is written. See
[Unpaid order reminders](../../features/unpaid-order-reminders.md) for what a run does.

The command exits with `1` when a step failed (the table says which), so the scheduler of
the host can report it.

## Scheduling
Run it every fifteen minutes or every hour; the steps are counted in hours.

```shell
# crontab of the user that runs the shop
*/15 * * * * cd /var/www/shop && php Thelia order:remind-unpaid >> var/log/unpaid-order-reminders.log 2>&1
```

Two runs never work at the same time: the second one finds the lock
(`thelia.unpaid_order_reminder`) and stops. The lock lives in the store `LOCK_DSN` names,
`flock` by default, which only holds on one server: a shop served by several web servers
that each run the task points `LOCK_DSN` at a store they share (Redis, the database), or
schedules the task on one of them only.

The links of the mails are built on the address of the shop, `url_site`: a scheduled task
has no request to read the host from. Set it, or the links carry the default host of the
router.

## Examples
See what a run would do:
```shell
php Thelia order:remind-unpaid --dry-run
```

Remind at 24 and 72 hours, cancel after a week, leave cheques alone:
```shell
php Thelia thelia:config set unpaid_order_reminder_schedule "24:order_payment_reminder,72:order_payment_reminder,168:cancel"
php Thelia thelia:config set unpaid_order_reminder_excluded_modules "Cheque"
```
