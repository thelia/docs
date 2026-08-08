---
title: Upgrading from the twig branch
sidebar_position: 3
---

# Upgrading from the twig branch

Before the first tagged release, Thelia 3 was distributed from the `twig` branch of each
repository, and projects followed it with `dev-twig` constraints. Those constraints track a
moving branch. Replace them with the released versions.

## Update the constraints

`thelia/core` and the project skeleton are released as `3.0.0-beta1`, the templates as
`1.0.0-beta1`:

```json
{
    "require": {
        "thelia/thelia-skeleton": "^3.0.0-beta1",
        "thelia/core": "^3.0.0-beta1",
        "thelia/flexy": "^1.0.0-beta1",
        "thelia/backoffice-default-twig-template": "^1.0.0-beta1",
        "thelia/email-default-template": "^1.0.0-beta1",
        "thelia/pdf-default-template": "^1.0.0-beta1"
    }
}
```

A project created with `composer create-project thelia/thelia-project` only requires
`thelia/thelia-skeleton`; `thelia/core` and the templates arrive as transitive dependencies. Only
change what your own `composer.json` declares.

Every Thelia module is tagged at the same time, each with its own new major version. The version
differs from one module to the next, so read it on the module page on
[Packagist](https://packagist.org/packages/thelia/) before writing the constraint:

```json
{
    "require": {
        "thelia/rewrite-url-module": "^3.0"
    }
}
```

## Allow the beta stability

`3.0.0-beta1` and `1.0.0-beta1` are pre-releases. Stability flags are not transitive: a dependency
accepting a beta is not enough, the root `composer.json` has to allow it.

```json
{
    "minimum-stability": "beta",
    "prefer-stable": true
}
```

`prefer-stable` keeps every package that has a stable release on that stable release, so only the
Thelia packages resolve to a beta.

## Run the update

Update the packages you changed, and nothing else:

```bash
composer update thelia/thelia-skeleton thelia/flexy \
    thelia/backoffice-default-twig-template --with-dependencies
```

A bare `composer update` also moves every unrelated dependency to its latest version. If something
breaks afterwards, you no longer know which change caused it. Keep the update scoped.

## After the update

Clear the cache:

```bash
php Thelia cache:clear
```

Rebuild the front-office assets. Composer reinstalls the template packages from scratch, and the
compiled `dist/` directory does not survive that:

```bash
cd templates/frontOffice/flexy
npm install
npm run build
```

Then open the front office and `/admin`, and check that both render.

## Custom modules

A module declares the Thelia version it requires in `Config/module.xml`. The running version is
`3.0.0-beta1` and the comparison drops the pre-release suffix, so `3.0.0` is the highest value a
module can ask for:

```xml
<thelia>3.0.0</thelia>
```

Anything above it, `3.0.1` for instance, makes the module fail to activate with `The module
<name> requires Thelia 3.0.1 or newer`.

The constraint is a minimum, so a module still declaring `<thelia>2.5.0</thelia>` keeps working.
Raise it to `3.0.0` once the module no longer supports Thelia 2.

## Thelia 2 projects

A Thelia 2 project following `dev-main` has to move off `main`: that branch now carries Thelia 3.
Thelia 2 maintenance continues on the `2.6` branch:

```json
{
    "require": {
        "thelia/thelia": "dev-2.6"
    }
}
```
