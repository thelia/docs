---
title: stock:reservation:purge
---

## Description
Clear the stock reservations of cart lines that have run out. See [Stock, preorder and low stock alerts](../../features/stock.md#stock-reservation).

What a cart can buy never waits for this command: a reservation past its time is not counted, whether or not the purge ran. The command only clears the dates and tells the modules, through `STOCK_RELEASED`, that the stock is free.

## Usage
```shell
  stock:reservation:purge [options]
```

## Options
 -    `--batch-size=BATCH-SIZE`  Lines cleared per statement. Default: 500.

The schedule of the core runs it every 10 minutes. Change that with the `THELIA_SCHEDULE_STOCK_RESERVATION_PURGE` environment variable, a cron expression.
