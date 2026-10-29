---
title: hook:clean
---

## Description
Clean hooks. It deletes all hooks, then recreates them.

## Usage
```shell 
hook:clean [options] [--] [<module>]
```

## Arguments
- `module`                   The module code to clean up

## Options
- `-y`, `--assume-yes`      Assume to answer yes to all questions


## Example
To clean the hooks of Carousel without asking for confirmation
```shell
php Thelia hook:clean -y Carousel
```