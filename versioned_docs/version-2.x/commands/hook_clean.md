---
title: hook:clean
---

## Description
Clean hooks. It will delete all hooks, then recreate it.

## Usage
```shell 
hook:clean [options] [--] [<module>]
```

## Arguments
- `module`                   The module code to clean up

## Options
- `-y`, `--assume-yes`      Assume to answer yes to all questions


## Example
To clean the hok of Carousel without asking for confirmation
```shell
php Thelia hook:clean -y Carousel
```