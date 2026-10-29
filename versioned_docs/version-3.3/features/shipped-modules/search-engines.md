---
title: Search Engines
sidebar_position: 3
---

# Search Engines

Two modules help search engines index the shop and keep the ranking of a page when its address
changes. Both are active on a fresh install and need no key.

| Module | What it does | Default state |
| --- | --- | --- |
| RewriteUrl | Redirects old URLs to the new ones | Active |
| Sitemap | Tunes the XML sitemap served by the theme | Active |

## Redirect old URLs (RewriteUrl)

### What it does

When you change the URL of an object, such as a product or a category, in its **SEO** tab, the
previous URL is kept and answers with a permanent redirect (301) to the new one. Links and
search results that point to the old address keep working.

For addresses that do not come from a shop object, for instance the pages of a previous site, add
manual rules on `/admin/module/RewriteUrl`. A rule matches either a plain text path or a regular
expression, and can be limited to requests that would otherwise end in a 404. In a regular
expression, escape the slashes (`\/`).

### Without settings

Changes made in the SEO tab are redirected as described above. No manual rule exists until you add
one.

Module: [thelia-modules/RewriteUrl](https://github.com/thelia-modules/RewriteUrl)

## Sitemap

### What it does

The Flexy theme serves the sitemap itself, whether the Sitemap module is active or not:

| URL | Content |
| --- | --- |
| `/sitemap.xml` | Index of the files below |
| `/sitemap-categories.xml` | Visible top-level categories |
| `/sitemap-products.xml` | Products |
| `/sitemap-content.xml` | Reserved for contents, lists no URL yet |
| `/sitemap-images.xml` | Product images |

The files are cached. Add `?flush=1` to a sitemap URL to rebuild it after a large catalogue change.
Declare `https://<your-shop>/sitemap.xml` in the search engines' webmaster tools.

The Sitemap module adds what the theme does not decide on its own:

- a default priority and change frequency per object type, and the image settings, on
  `/admin/module/Sitemap`;
- a priority field on the edit page of each product and category, to rank one object above the
  default;
- when several languages are active, each URL is listed once per language, with `hreflang`
  alternates pointing to the other languages.

### When the module is inactive

The theme still serves the sitemap, with its own defaults and without the per-language alternates.

Module: [thelia-modules/Sitemap](https://github.com/thelia-modules/Sitemap)
