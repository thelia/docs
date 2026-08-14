---
title: Update
sidebar_position: 2
---

# Updating Thelia

## Update components

Update Thelia and its dependencies:

```bash
composer update thelia/thelia
```

For a specific version:

```bash
composer require thelia/thelia:^3.1
```

## Update the database

After updating, apply database migrations:

```bash
php Thelia thelia:install
```

This command applies database schema updates, new migrations, and any required data updates.

## Update assets

Composer reinstalls the template packages, so whatever they had compiled is gone. Rebuild the
front-office assets:

```bash
php Thelia importmap:install
php Thelia tailwind:build
```

If the Twig back-office is active, rebuild it too. It uses Webpack Encore and ships no `dist/`:

```bash
cd templates/backOffice/default-twig && npm install && npm run build
```

## Clear the cache

Always clear the cache after an update:

```bash
php Thelia cache:clear
```

## Updating modules

Update modules separately:

```bash
composer update thelia/module-name
```

After module updates:

```bash
php Thelia module:refresh
php Thelia cache:clear
```

## Recommendations

1. Back up your database before updating.
2. Test updates on a staging environment first.
3. Review the changelog for breaking changes.
4. Update only modules that are compatible with your Thelia version.
