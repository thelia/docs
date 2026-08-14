---
sidebar_position: 11
title: Contribute
---

# Contribute

Thelia is hosted on [GitHub](https://github.com/thelia/thelia). To contribute, fork the repository
and open a [pull request](https://docs.github.com/en/pull-requests), or report a problem in the
[issue tracker](https://github.com/thelia/thelia/issues).

## Set up a development checkout

Clone the repository and install it with DDEV, which is the setup the project is tested against:

```bash
git clone https://github.com/thelia/thelia.git
cd thelia

ddev start
ddev composer config --global github-oauth.github.com <your-token>
ddev composer install
ddev exec php bin/install --frontoffice_theme=flexy --with-demo --with-admin
ddev exec bash -c "cd templates/backOffice/default-twig && npm install && npm run build"
```

The GitHub token is not optional: Composer reads the Thelia Flex recipes through the GitHub API,
and an anonymous call is rate-limited. Flex then falls back on auto-generated recipes without
saying so, and the install fails later on a message that names none of this. Any token works, no
scope needed.

`bin/install` builds the front-office assets itself. The `default-twig` back-office is the one
build left to do by hand, because it uses Webpack Encore and ships no `dist/`.

See [DDEV Installation](./getting-started/ddev.md) for the full setup, or
[Standard Installation](./getting-started/installation.md) if you prefer a local PHP and MySQL stack.

## Coding standards

Thelia 3 runs on PHP 8.3 and 8.4, and follows [PSR-12](https://www.php-fig.org/psr/psr-12/), through the
Symfony ruleset of [PHP CS Fixer](https://cs.symfony.com/). The configuration lives in
`.php-cs-fixer.dist.php` at the root of the repository, so you never have to configure the rules
yourself:

```bash
ddev exec composer cs-diff    # report violations without changing anything
ddev exec composer cs         # fix them in place
```

New PHP files declare strict types:

```php
<?php

declare(strict_types=1);
```

## Before opening a pull request

Three checks must be green. Run them before you push, because the CI runs the same ones:

```bash
ddev exec composer cs-diff    # coding standards
ddev exec composer phpstan    # static analysis
ddev exec composer test       # the full test suite
```

`composer test` prepares a dedicated test database, then runs the unit, integration, api,
http-flexy and http-backoffice suites. It never touches your development database. `composer ci`
chains the three commands in one call.

If PHPStan reports errors on generated Propel classes that you did not touch, its result cache is
likely stale; `composer phpstan-fresh` clears it and re-runs the analysis.

See [Testing](./testing/index.md) for how to write tests and what each suite covers.

## Pull request workflow

Fork [Thelia](https://github.com/thelia/thelia), then work on a branch. Never commit on `main`: keep
it in sync with the upstream repository.

```bash
git checkout -b my-branch main
```

Once your work is done, rebase it on the current `main` and push it to your fork:

```bash
git remote add upstream https://github.com/thelia/thelia.git
git checkout main
git pull --ff-only upstream main
git checkout my-branch
git rebase main
git push origin my-branch
```

Then open the pull request as described in the
[GitHub documentation](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request).

A few things make a pull request easier to review:

- One concern per pull request. Unrelated fixes belong in separate ones.
- Commit messages in English, one line, prefixed with the type of change (`feat:`, `fix:`, `docs:`,
  `refactor:`, `test:`, `chore:`).
- A change in behaviour comes with a test that fails without the fix.
- Do not reformat code you are not changing: it hides the actual diff.

## Changing the database schema

The Propel schema of the core models is `local/config/schema.xml`. After editing it, regenerate the
model classes and the SQL that `bin/install` applies:

```bash
# generate the Propel base classes
vendor/thelia/propel/bin/propel build -v \
    --input-dir=local/config/ --output-dir=core/lib/ --enable-identifier-quoting

# generate setup/thelia.sql
vendor/thelia/propel/bin/propel sql:build -v \
    --input-dir=local/config/ --output-dir=setup/
rm setup/sqldb.map
```

Commit the regenerated classes and `setup/thelia.sql` along with your schema change. An existing
installation is not migrated by these files: add the corresponding statements to an update script in
`setup/update/sql/` so that stores already in production can upgrade.

For a module, the equivalent commands are `module:generate:model` and `module:generate:sql`, which
read the module's own `schema.xml`. See the [CLI reference](./reference/cli/index.md).

## Translations

The core strings ship as PHP catalogs in `core/lib/Thelia/Config/I18n/{locale}.php`; a template or a
module carries its own `I18n/{locale}.php`. These versioned files are the ones a contribution
touches. Merchant edits made in the back-office go to `local/I18n/`, which is not versioned and is
never part of a pull request.

When you add a translatable string, add it at least to `en_US.php` in the same pull request, so no
release ships an untranslated key. See
[Internationalization](./reference/internationalization.md) for the domains, the fallback rules and
the back-office translation screen.

## Contributing to this documentation

The documentation lives in [thelia/docs](https://github.com/thelia/docs) and is built with
Docusaurus. Every page has an **Edit this page** link at the bottom that opens the right file on
GitHub.
