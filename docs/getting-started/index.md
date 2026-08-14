---
title: Getting Started
sidebar_position: 1
---

# Getting Started

Install Thelia 3 and get your store running.

## Prerequisites

- **PHP 8.3 or 8.4** with extensions: PDO_MySQL, openssl, intl, gd, curl, dom
- **Composer 2+**
- **MySQL 8.0+** or **MariaDB 10.6+**
- **Node.js and npm**, only to build the Twig back-office theme
- A **GitHub token** for Composer, see the next section

## Give Composer a GitHub token

Thelia publishes its Symfony Flex recipes in the `thelia/thelia-recipes` repository, and Composer
reads them through the GitHub API. Without a token that API answers with a rate limit. Flex then
falls back on generated recipes without reporting anything, the `config/packages/*.yaml` files
Thelia expects are never written, and the install fails much later on an unrelated message, most
often `You must either configure a "public_key" or a "secret_key"`.

Create a token on [github.com/settings/tokens](https://github.com/settings/tokens). No scope is
needed, the recipes are public. Give it to Composer once:

```bash
composer config --global github-oauth.github.com <your-token>
```

With DDEV, run the same command inside the container so the Composer that installs the project
reads it:

```bash
ddev composer config --global github-oauth.github.com <your-token>
```

## Start a new store

```bash
composer create-project thelia/thelia-project my-shop --stability=beta
cd my-shop
```

Thelia 3.0.0-beta3 is a pre-release, so `--stability=beta` is required for Composer to select it.
The skeleton gives you a project without the core sources in your repository. From there, follow
either of the two setups below, starting at `bin/install`.

To work on Thelia itself, clone the repository instead: `git clone https://github.com/thelia/thelia.git`.

## With DDEV (recommended)

```bash
git clone https://github.com/thelia/thelia.git
cd thelia

ddev start
ddev composer install
ddev exec php bin/install --frontoffice_theme=flexy
ddev exec bash -c "cd templates/backOffice/default-twig && npm install && npm run build"
ddev launch
```

`bin/install` builds the assets the active front-office theme needs, so the front office answers
right after the install. The `default-twig` back-office is the exception: it is built with Webpack
Encore, its `dist/` directory is not shipped in the package, and until `npm run build` has run,
`/admin` fails with *"Could not find the entrypoints file from Webpack"*.

Your store is at https://thelia.ddev.site, with the back-office at `/admin`. DDEV derives that
hostname from the directory name, so a project created in `my-shop/` answers on
https://my-shop.ddev.site. Run `ddev describe` to check.

To add demo data and an admin account:

```bash
ddev exec php bin/install --frontoffice_theme=flexy \
    --with-demo --with-admin \
    --admin_login=admin --admin_password=admin123
```

## Without DDEV

```bash
git clone https://github.com/thelia/thelia.git
cd thelia
composer install

php bin/install --database_host=localhost --database_name=thelia \
    --database_user=root --database_password=secret \
    --frontoffice_theme=flexy --with-demo --with-admin

(cd templates/backOffice/default-twig && npm install && npm run build)

php -S localhost:8000 -t public
```

## Next steps

| Guide | Description |
|-------|-------------|
| [DDEV Installation](./ddev.md) | Detailed DDEV setup, commands, and services |
| [Standard Installation](./installation.md) | Manual PHP/MySQL setup for production |
| [Install Reference](./install-reference.md) | All `bin/install` options and env vars |
| [Configuration](./configuration.md) | Environment variables and Symfony config |
| [First Steps](./first-steps.md) | Create your first product |
