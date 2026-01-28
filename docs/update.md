---
title: Update
sidebar_position: 14
---

# Updating Thelia

## Update Components

Update Thelia and its dependencies:

```bash
composer update thelia/thelia
```

For a specific version:

```bash
composer require thelia/thelia:^3.1
```

## Update Database

After updating, apply database migrations:

```bash
php Thelia thelia:install
```

This command handles:
- Database schema updates
- New migrations
- Required data updates

## Update Assets

Rebuild front-office assets after updates:

```bash
npm install
npm run build
```

## Clear Cache

Always clear the cache after an update:

```bash
php Thelia cache:clear
```

## Module Updates

Update modules separately:

```bash
composer update thelia/module-name
```

After module updates:

```bash
php Thelia module:refresh
php Thelia cache:clear
```

## Best Practices

1. **Backup** your database before updating
2. **Test** updates on a staging environment first
3. **Review** the changelog for breaking changes
4. **Update** modules compatible with your Thelia version
