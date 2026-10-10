---
title: Pages with TheliaCMS
sidebar_position: 10
---

# Pages with TheliaCMS

Available from Thelia 3.2.

TheliaCMS (`thelia/cms-module`) is a module that turns a Thelia shop into a site with pages. It gives the back office a visual page builder, a tree of pages with addresses that follow the tree, a bin, menus, forms and a media library. A published page is plain HTML and CSS: it ships no builder JavaScript.

It is not part of the skeleton. You install it on top of a Thelia 3.2 project, and the content slots and the back-office navigation hooks that 3.2 introduced are what let it plug into a theme without changing the theme.

## Requirements

| Requirement | Why |
| --- | --- |
| Thelia 3.2 or later | The module answers the [content slots](/docs/front-office/content-slots) and the [back-office navigation](/docs/back-office/navigation) of that version. |
| PHP 8.3 or later | The module's own requirement. |
| MySQL 5.6+ or MariaDB 10.0.5+ | The front-office search uses a native `FULLTEXT` index. Activation fails on an older server. |
| URL rewriting on | Every page is served on a rewritten address. Activation fails while `rewriting_enable` is off. |

## Install

```bash
composer require thelia/cms-module
php Thelia module:refresh
php Thelia module:activate TheliaCMS
php Thelia cache:clear
```

Composer also installs the page builder bundle and the TheliaLibrary module, which stores the images.

Activation creates the tables and the access rights, and generates the page addresses. It also seeds:

- two menus, `main` and `footer`;
- on the first activation, four legal pages (legal notice, privacy policy, cookies, accessibility statement), unpublished, in each language the module has a text for (English and French).

A legal page cannot be published while it still holds the sample text the module wrote. The refusal applies to the back-office button and to the command line alike.

Deactivating the module removes the rewritten addresses it owns, so the site answers 404 instead of 500. Reactivating puts them back.

## Next to Page, TheliaBlocks and the contents of the shop

A fresh Flexy install already has two modules that edit content: Page and TheliaBlocks (see [what a fresh install contains](/docs/getting-started/what-a-fresh-install-contains)). TheliaCMS runs next to them with its own tables, screens and addresses. It does not read what they store, and they ignore it.

The contents and folders of the shop are not CMS pages. They stay in Folders, which the CMS section of the back-office menu links to. Nothing is converted, whether contents, Page pages or TheliaBlocks groups.

Both Page and TheliaCMS can serve a home page on `/`. Set one in a single module only.

## The page tree

**CMS > Pages** shows the tree one level at a time. A page can be filed under another one, and the address of a page is the chain of its slugs: a page "Conseil et accompagnement" under "Nos services" answers on `/nos-services/conseil-et-accompagnement`. Each language has its own slug. Leave the field empty and the slug comes from the title.

A page has a title, a slug, a parent, a layout, a publication window and a visibility, plus SEO fields: meta title and description, social title and description, canonical URL, `noindex` and `nofollow`. The title, the slug and the SEO fields are per language. The parent, the layout, the visibility and the publication window are shared by every language. The content is per language too: the French and English versions of a page are two independent canvases.

Rules to know:

- `admin`, `api`, `assets`, `cache`, `media`, `sitemap`, `robots.txt`, `site-icon`, `recherche`, `search`, `error` and a few Symfony debug paths cannot be the slug of a page. The rewriting router runs before the Symfony routes, so a page called `admin` would shadow the back office. A slug derived from the title is checked too, so a page titled "Search" needs a slug of its own.
- Moving a page, or renaming it, rewrites the address of everything under it, in every language. It happens inside the transaction of the save, so a branch is never half moved. On a site of several hundred pages, moving a page near the root takes a moment.
- An address that differs from a page address only by a trailing slash answers 301 to the form without it. Addresses that belong to other views (a product, a category, a content) are left alone.
- With a search or a filter active, the tree turns into a flat list of results and the reorder arrows disappear, since a position moved from a filtered list would be a position among pages you cannot see.

## Redirections

Renaming a page, or moving it in the tree, keeps its previous address as a 301 towards the new one. The redirection lives in the core `rewriting_url` table, like any other rewritten URL.

These redirections are not restored by deactivating and reactivating the module: a page stores the address it answers on, not the list of the ones it used to answer on.

TheliaCMS has no screen to manage redirections by hand. Its `composer.json` suggests `thelia/rewrite-url-module` for that, and for a log of 404 errors.

## The page builder

The builder has its own full-screen route, `/admin/cms/pages/{id}/builder`. The editor panel holds three families of blocks:

- Page blocks, ten of them to start a page from: hero, text and image, call to action, quote, testimonials, key figures, logos, gallery, questions and answers, and a section that groups other blocks. They output semantic markup with `cms-*` class names, and the module ships the stylesheet that styles them, so a page looks right on a theme that knows nothing about the CMS. A theme restyles them by overriding that stylesheet.
- Reusable blocks (**CMS > Blocks**), written once and placed on as many pages as you like. A page holds a reference, not a copy, so editing the block updates every page that shows it. A block still used by a page cannot be deleted.
- Live content, rendered by the server on every visit instead of being stored in the page: the latest news, a menu, a reusable block, a form, and the video, map and social embeds.

The video, map and social blocks load nothing from a third party until the visitor presses the button. Until then the page shows a poster or a card and says which company will receive the request.

Working with drafts:

- Drafts autosave every 30 seconds, and leaving with unsaved work asks first.
- **Preview the draft** gives a signed link valid 72 hours. Someone without a back-office account can open it. It answers `X-Robots-Tag: noindex, nofollow`.
- Publishing sanitizes the content on the server, rewrites the images (see below) and extracts the text for the search index.
- Content is stored per language, so each language is published on its own.

To publish from a script, use the command. It runs the same steps as the button:

```bash
php Thelia thelia_cms:publish --page 12 --page 13
php Thelia thelia_cms:publish --all --dry-run
```

`--all` publishes every draft of every page that is not in the bin, including pages someone is half way through rewriting. Run it with `--dry-run` first.

A page whose draft would show nothing is refused wherever the publication comes from.

A page renders with `cmspage.html.twig` from the active theme when the theme has one, and with the module's own template otherwise. The template calls four hooks, each receiving the page as `page`: `cmspage.top`, `cmspage.content.before`, `cmspage.content.after` and `cmspage.bottom`.

## The bin

Deleting a page moves it to **CMS > Pages > Bin**. The bin lists each page with the date of deletion and the time it has left. Restoring a page brings back whatever was nested under it. A page whose parent is still in the bin waits for that parent.

The bin empties itself after 30 days. The `trash_retention_days` setting changes that, and `0` keeps everything until someone deletes it by hand. Purging a page deletes its content in every language, its revisions, its search entry and its addresses.

The clean-up runs with [`maintenance:purge`](/docs/reference/cli/maintenance_purge), and on demand with `thelia_cms:pages:purge-trash`, which accepts `--dry-run`.

## Menus

**CMS > Menus** manages menus by code. An entry points at a CMS page, a content, a folder, a web address, or at nothing. An entry with no target is a group heading. Without its own label, an entry shows the title of its target in the language being read.

A menu is three levels deep at most. Entries are reordered with the move buttons or by dragging a row. An entry whose target was deleted, unpublished or left unpublished in the current language is left out of the menu in that language, and the back office lists it with the reason. A heading that still has usable children stays.

A theme reads a menu with the `cms_menu(code, locale)` Twig function, which returns data (`label`, `url`, `blank`, `children`, `active`, `in_trail`) and leaves the markup to the theme. The locale defaults to the one being served. `cms_page_alternates()` returns the current page in each language it is published in, which is what a language switcher needs.

## Forms

**CMS > Forms** manages forms by code. A page places one with the Form block, and stores only the code: fields, wording and recipients are read when the page is served, so adding a field does not mean republishing pages.

A field is one of nine types: text, email, textarea, select, checkbox, radio, phone, date, and consent. Labels, help texts and list choices are written per language. A field with no label in a language is left out of the form in that language.

The consent field is never ticked in advance. The answer stores the exact sentence the visitor read and the moment they agreed.

Recipients are set on the form and nowhere else. A recipient never comes from the page or from the request.

There is no captcha. Three checks run without asking anything of the visitor:

- a hidden field that only a robot fills in;
- a signed timestamp of when the form was served: a message sent in under 3 seconds, more than 12 hours after the form was served, or with a stamp this site did not issue, is dropped;
- a cap on how many messages one sender can send, which reuses the core `form_firewall_attempts` and `form_firewall_time_to_wait` settings and applies while `form_firewall_active` is on. Only accepted messages count.

**CMS > Forms > Answers** lists what a form received and can search by email address. An answer can be exported as CSV or JSON, or deleted. The address a message came from is never stored, only a keyed hash of it.

Each form states how long its answers are kept, 365 days by default. `thelia_cms:forms:purge` deletes them, and so does `maintenance:purge`.

## Media

**CMS > Media** stores images in TheliaLibrary. It accepts JPEG, PNG and WebP. SVG is refused, because it can carry script.

Alternative text is required in every language unless the image is marked decorative. A decorative image is published with an empty `alt`, and the choice is recorded. An image used by a page cannot be deleted.

At publication every image becomes a `<picture>` with a WebP alternative, a `srcset` when smaller widths exist, explicit `width` and `height` when the dimensions of the image are known, and lazy loading on every image but the first.

## Site settings

These settings change how the site answers. Most are edited under **CMS > Settings**. The home page is chosen from the page list, and `heading_check_mode` and `footer_menu_hook` have no screen: they are module configuration values.

| Setting | Default | Meaning |
| --- | --- | --- |
| `home_page_id` | none | The page served on `/`. Its own slug then answers 301 to `/`. |
| `site_mode` | `commerce` | `vitrine` makes `/cart`, `/order` and `/checkout` answer 404 and moves CMS to the top of the back-office menu. Switching back undoes it. |
| `404_page_id` | none | A CMS page served, with a 404 status, when an address does not exist. |
| `maintenance_active` | `0` | `1` closes the site with a 503 and a `Retry-After` header. |
| `maintenance_allowlist` | empty | IP addresses and CIDR ranges that still see the site while it is closed. |
| `maintenance_page_id` | none | The CMS page shown while the site is closed. |
| `heading_check_mode` | `warn` | `warn` reports heading problems and publishes anyway. `block` refuses to publish. |
| `trash_retention_days` | `30` | See [the bin](#the-bin). |
| `footer_menu_hook` | off | Renders the `footer` menu in the `layout.footer.top` hook, for a theme that reads neither `cms_menu('footer')` nor the `footer_links` content slot. Flexy reads the slot, so leave it off there. |

Saving showcase mode also creates an Editor profile: pages, menus, media, forms and news, with no access to the shop, to these settings or to free HTML. Assign it under **Configuration > Administrators**.

## Permissions

Six resources are seeded on activation with no access granted. Open them per profile under **Configuration > Administrators**.

| Resource | Covers |
| --- | --- |
| `admin.cms.page` | The page tree, the builder, reusable blocks, templates, publication. |
| `admin.cms.menu` | Menus and their entries. |
| `admin.cms.media` | The media library. |
| `admin.cms.form` | Forms and their answers. |
| `admin.cms.settings` | The settings screen. |
| `admin.cms.custom-code` | Free HTML in the editor, and `<iframe>` in published content. |

Every route under `/admin/cms` is guarded by the resource of its section.

## How it plugs into the core

The module uses two extension points of the core, so a theme needs no change to show it:

- [Content slots](/docs/front-office/content-slots). The module registers a resolver at priority `100`. The `main` menu answers the `header_links` slot and the `footer` menu answers `footer_links`. A menu takes its slot over as soon as it holds one entry. While it is empty, the slot keeps the folders and contents of the shop, so activating the module changes nothing on the front until someone builds a menu. The consent slots, such as the terms of sale linked from the checkout, stay with the contents of the shop. A theme that calls `content_slot('header_links')`, Flexy included, shows the CMS menu without any change.
- [Back-office navigation](/docs/back-office/navigation). The module registers a voter that hides the Folders section of the back-office menu. The CMS section links to the folders instead, so the content of the site has one place in the menu. The routes and the `admin.folder` permission of the folders do not change.

## More

The [TheliaCMS repository](https://github.com/thelia-modules/TheliaCMS) documents the sitemap and search integration, the shared cache tags, the export and import commands, and how to add a block of your own.
