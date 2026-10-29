---
title: What the Back Office Offers
sidebar_position: 7
---

# What the Back Office Offers

This page describes what the `default-twig` back office does for the people who use it, screen by screen. For how the bundle is built, see [Back-Office Development](./index.md). The rights named below are the ones an administration profile grants: view, create, update and delete, per resource.

## Dashboard

The home page of the back office (`/admin/home`) is titled **Dashboard**. It opens on the last 30 days. The period buttons are **Today**, **7 days**, **30 days**, **90 days**, **This month** and **This year**, and the choice travels in the `period` query parameter. Any other value falls back to 30 days.

The page holds:

- Four figure cards: **Revenue**, **Orders**, **Average order** and **New customers**. Each one shows the change against the previous period of the same length, which ends just before the chosen one starts. No change is shown when the previous period has nothing to compare with.
- Alerts above the cards, each linking to the matching filtered list.
- A **Revenue trend** chart (daily) and an **Order status** chart.
- The **Recent orders**, **Top selling products** and **Low stock** lists.

Some rules decide what a figure means:

- **Revenue** adds up the orders in the paid, processing and sent statuses. **Orders** counts every order created in the period, whatever its status. **Average order** is the revenue divided by that count.
- The alert **unpaid orders over 48h** counts the orders still in the not paid status that were created at least 48 hours ago. The alert **orders awaiting shipment** counts the orders in the paid or processing status. Neither follows the period.
- A third alert appears when [order returns](../features/order-returns.md) are enabled: return requests that have waited for an answer for more than 48 hours.
- **Recent orders** shows the 8 latest orders, and the **Order status** chart counts every order, both whatever the period.
- **Top selling products** ranks the products of the period by units sold and shows the first 5, with the units and the amount sold. The ranking counts the order lines of every status, unpaid and cancelled orders included.
- **Low stock** lists the 5 combinations with the lowest stock, among those at 5 units or fewer.

Each block checks its own right, and a block a profile may not see is not computed. The order figures, the charts, the alerts on orders, recent orders and top selling products need the view right on orders. **New customers** needs it on customers, and **Low stock** on products. The return alert needs the view right on order returns.

Modules add their own blocks through the `home.block` hook, shown under the figures. The hooks `home.top`, `home.bottom` and `home.js` are also available. See [Hooks](./hooks.md).

## Catalog

### Bulk actions on products

In **Catalog > Products**, ticking products shows a toolbar with a **Bulk actions** menu:

| Action | Needs | What it does |
| --- | --- | --- |
| **Edit** | Update on products | Opens a form to change several fields at once |
| **Put online**, **Take offline** | Update on products | Changes the visibility of the selection |
| **Delete** | Delete on products | Deletes the selection after a confirmation |

The **Edit** form changes only the fields that are filled in: a field left on **Unchanged** keeps each product's value. It can set:

- the online status,
- the default category,
- the product template (**No template** removes it),
- the brand (**No brand** removes it),
- additional categories to add or remove,
- associated contents to add or remove,
- related products to add or remove, for the relation type chosen in the form.

For the online status and the template, products that already have the requested value are skipped and the confirmation message counts only the products that changed. Each batch is written to the [administration log](#administration-logs): an edit with the number of products and the changes made, a deletion with the references of the deleted products.

### Category tree

**Tree view**, at the top of **Catalog > Categories**, opens the whole category tree on one page (`/admin/categories/tree`). Each line shows the title, whether the category is online, and its position. The titles are those of the default language of the shop.

Dragging a category onto another one makes it a child of that category. Dropping it on the root drop zone moves it to the top level. The page reloads when the move succeeds. A category cannot become its own child, nor go under one of its own descendants: the server refuses the move and nothing changes.

Viewing the tree needs the view right on categories, and moving a category needs the update right.

## Orders

The order list changes the status of several orders at once. With the update right on orders, a tick box appears on each row. Once orders are ticked, a toolbar offers **Move the selected orders to** a status.

The [status graph](../features/order-status-transitions.md) decides order by order. The menu only offers the statuses that every ticked order can reach. When there is none, the page says so and asks to narrow the selection. When the form is sent, the server checks again: the orders that may take the new status are moved, and the references of the others are listed in a warning as skipped. A failure on one order is reported by its reference and does not stop the others.

A batch is written to the [administration log](#administration-logs) as one line with the code of the target status and the number of orders moved.

## Customers

The customer sheet (**Customers**, then a customer) starts with an **Overview** band, then the form, then collapsible sections.

The band shows **Total spent**, **Orders**, **Average basket**, **First order**, **Last order** and **Customer since**. Every figure but **Customer since** counts the paid, processing and sent orders only, like the dashboard revenue. The number of orders left out (cancelled, refunded, unpaid) is shown under **Orders**. When the customer ordered in several currencies, the amounts are added up without conversion and the band says so. An administrator without the view right on orders sees only **Customer since**, and the orders section is not shown to them.

Other sections:

- **Carts** loads when it is opened. It shows the cart in progress, meaning the latest one with activity in the last 24 hours, and the abandoned carts, up to 20. Carts older than the `purification_cart_no_order_days` setting (60 days by default) are not looked for, because the [`maintenance:purge`](../reference/cli/maintenance_purge.md) command removes them.
- **Addresses** and **Orders** list the addresses and the orders of the customer.
- Modules add sections through the `customer.tab` hook.
- **Personal data** holds **Download personal data**, which streams the personal data of the customer as a JSON file, and **Anonymize this customer**. The export needs the view right on customers and the anonymization the delete right. [Personal data](../security/personal-data.md) lists what the export contains and what the anonymization erases and keeps.

**Send a password reset link**, at the top of the sheet, mails the customer the usual lost-password message with a link to choose a new password. The link is valid for one hour unless the `password_reset_link_lifetime` setting says otherwise. The button needs the update right on customers and is not shown for a customer who ordered without an account or whose account is anonymized. The same customer can be sent at most 3 links per hour, and this limit is separate from the one a customer spends on the storefront. A refusal and a mail that did not leave are both reported on the sheet.

## Tools

### CSV templates for imports

Each page of **Tools > Import** has a **Download a CSV template** button. The file contains only the header row: the columns the import expects. It is named after the reference of the import, in lower case, as in `<import>-template.csv`. The button is absent when the import declares no columns.

### Newsletter subscribers

**Tools > Newsletter** lists the subscribers who have not unsubscribed, most recent first, with sortable columns. **Export CSV** downloads the file `newsletter-subscribers-<date>.csv`, with the columns `email`, `firstname`, `lastname`, `locale` and `created_at`.

The **Unsubscribe** action of a row marks the subscriber as unsubscribed. The row stays in the database and leaves the list. The export reads the whole table, so unsubscribed subscribers are in the file too, with no column to tell them apart.

Viewing and exporting need the view right on the newsletter, and **Unsubscribe** needs the delete right.

## Configuration

### System information

**Configuration > System information** (`/admin/configuration/system-information`) gathers what a developer or a host asks for when a shop misbehaves:

| Block | Content |
| --- | --- |
| Thelia | Version, environment, debug mode, active back-office and front-office templates, project root |
| PHP | Version, server API, `memory_limit`, `post_max_size`, `upload_max_filesize`, `max_execution_time`, timezone, OPcache |
| PHP extensions | Whether each extension of a fixed list (`curl`, `dom`, `fileinfo`, `gd`, `intl`, `json`, `openssl`, `pdo`, `pdo_mysql`, `simplexml`, `zip`) is loaded |
| Symfony | Version, end of maintenance and end of life dates |
| Database | Server version, database name, driver, character set, collation, `sql_mode` |
| Cache and logs | Cache and log directories with their write status, cache size, Thelia log level |

**Copy the summary** puts the whole page in the clipboard as plain text, ready to paste in a support request. The cache size reads **Not computed** when the cache directory holds more than 50,000 files. The page needs the view right on the advanced configuration or on the cache.

Modules add content at the bottom through the `system-information.bottom` hook.

### Administration logs

**Configuration > Administration logs** lists what administrators did, filtered by period (the last 7 days by default), administrator, resource and module. Two things are kept out of an entry:

- The request stored with it has no `Cookie`, `Authorization` or HTTP Basic header.
- A failed back-office sign-in is logged without the request body, so a password typed by mistake is not kept.

The screen needs the view right on the administration logs. See [Two-Factor Authentication](./two-factor-authentication.md) for what that feature writes to the log.

### Administrators

**Configuration > Administrators** applies one rule to accounts. An administrator who has a profile is limited by it, and only a superadministrator (an account with no profile) can:

- create an account with no profile,
- edit or delete a superadministrator account,
- reset the second factor of a superadministrator.

An administrator with a profile cannot change the profile of their own account, and nobody can delete their own account.

## Small screens

On a narrow screen, the lists of orders, customers, products, coupons, sales, catalog price rules, order returns, currencies, countries and languages hide their secondary columns. A chevron at the start of each row expands a detail line with the hidden values. When a sortable column is hidden, a **Sort by** form with a direction and a **Sort** button replaces the clickable headers. Other lists, such as the newsletter subscribers, drop their secondary columns below a given width and have no detail line.

A DataTable column declares the width it appears from with `visibleFrom` (`sm`, `md`, `lg`, `xl` or `xxl`).
