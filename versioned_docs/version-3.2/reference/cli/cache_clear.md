---
title: cache:clear
---

## Description
Invalidate all caches

## Usage
```shell
cache:clear [options]
```

## Options
- `--without-assets`    Do not clear the assets cache in the web space
- `--with-images`       Clear images generated in `image_cache_dir_from_web_root` or `web/cache/images` directory
- `--with-documents`    Clear documents generated in `document_cache_dir_from_web_root` or `web/cache/documents` directory


## Example
```shell
php Thelia cache:clear
```
