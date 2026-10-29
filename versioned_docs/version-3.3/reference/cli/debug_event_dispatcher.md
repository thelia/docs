---
title: debug:event-dispatcher
---

## Description
Displays all configured listeners

## Usage
```shell
debug:event-dispatcher [options] [--] [<event>]
```

## Arguments
- `event`        An event name or a part of the event name

## Options
- `--dispatcher=DISPATCHER`  To view events of a specific event dispatcher [default: "event_dispatcher"]
- `--format=FORMAT`  The output format  (txt, xml, json, or md) [default: "txt"]
- `--raw`  To output raw description



## Example
To list all event that have "product" in name and their listeners    
```shell
php Thelia debug:event-dispatcher product
```