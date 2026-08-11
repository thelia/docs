---
title: Security updates
sidebar_position: 15
---

Thelia does not ship a `composer.lock`. The file is ignored in the `thelia/thelia` repository, and a shop created with `composer create-project` resolves its own lock at install time. The dependency versions your shop runs therefore depend on the day you installed it and the day you last updated, not on the Thelia release you picked.

## Check what your shop actually runs

```bash
composer audit
```

`composer audit` compares the exact versions in your lock file against the advisories published on [packagist.org](https://packagist.org/security-advisories). Run it after each deployment, and put it in your CI if you have one. It reports nothing about Thelia itself, only about the packages Thelia depends on.

## Apply the updates

On a 2.6 install, the constraints declared in `composer.json` already reach the fixed releases of every dependency but one, so a targeted update clears almost every advisory:

```bash
composer update "symfony/*" twig/twig smarty/smarty composer/composer phpunit/phpunit --with-dependencies
```

This lands `symfony/security-http` 6.4.42 (CVE-2026-48489, a firewall bypass rated high), `symfony/mime` 6.4.40, `twig/twig` 3.28.0, `composer/composer` 2.10.2 and `smarty/smarty` 4.5.7. Smarty's CVE-2026-62992 is fixed inside the 4.5 line, so a 2.6 shop does not need a Smarty 5 migration.

After updating, clear the cache and check the front office and the back office:

```bash
php Thelia cache:clear
```

Custom templates are the usual source of surprises here, since a Smarty or Twig patch release can tighten what it accepts.

## The two advisories that stay

Thelia 2.6 requires `api-platform/core ^3.2.9`. The last release of the 3.x line is v3.4.17 and it carries CVE-2026-49858 and CVE-2026-54164. Upstream considers 2.x and 3.x end of life and fixed both from 4.1.30 onwards, with no backport, so `composer audit` keeps reporting them on any 2.6 install. Moving to API Platform 4 on the 2.6 line is a major upgrade with breaking changes, which is why it has not been done in a maintenance release.

Both were reviewed against the 2.6 code, and neither is reachable on a stock install.

**CVE-2026-49858** leaks attributes between users through the JSON:API and HAL normalizers. Three of its four conditions fail independently on Thelia 2.6. The formats are not enabled: `core/lib/Thelia/Config/Resources/packages/api_platform.yaml` declares `json`, `jsonld` and `html` only, and the extension never registers the vulnerable normalizers when `jsonapi` and `jsonhal` are absent. No core resource declares a per-property security expression (`#[ApiProperty(security: ...)]`), which the leak needs to have anything to leak. And the cache that leaks only survives between requests under a worker runtime, whereas 2.6 targets php-fpm, where it dies with the request.

**CVE-2026-54164** is a type confusion on relation IRIs. It needs a writable relation whose property carries no PHP type. Every single-valued relation across the core API resources is natively typed, so a mismatched IRI is rejected by the property accessor before it reaches anything, and `Thelia\Api\Bridge\Propel\Serializer\PlainIdentifierDenormalizer` skips properties without a type as a second line of defence.

Re-run that analysis on your own installation if you do any of the following:

- enable the `jsonapi` or `jsonhal` formats,
- add `#[ApiProperty(security: ...)]` to a property of one of your resources,
- serve the API from FrankenPHP, RoadRunner, Swoole or another worker runtime,
- expose writable relations without a PHP type in your own API resources.

Thelia 3 is not concerned: it runs on API Platform 4.3 and no longer ships Smarty.
