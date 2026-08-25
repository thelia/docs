---
title: Security Policy
sidebar_position: 1
---

# Security Policy

Thelia is free and open source software stewarded by [OpenStudio](https://www.openstudio.fr).
This page describes the security lifecycle of the project: how vulnerabilities are
reported, how fixes are developed and released, and how you are informed.

The canonical disclosure policy — contact, scope, response targets and supported
versions — lives in the repository:
[SECURITY.md](https://github.com/thelia/thelia/blob/main/SECURITY.md).

## Reporting a vulnerability

Never use a public issue, discussion or pull request for a security problem. Report it
privately:

- Preferred: open a private report from the
  [Security tab](https://github.com/thelia/thelia/security/advisories/new) of the
  affected repository ("Report a vulnerability").
- Or email [contact@thelia.net](mailto:contact@thelia.net) with `[SECURITY]` in the
  subject line.

We acknowledge reports within 72 hours, triage within 7 days, and aim to release a fix
for a confirmed vulnerability within 90 days. Disclosure is coordinated with the
reporter: details stay confidential until a fixed release is available.

## How a fix is developed

1. The report is triaged privately by the maintainers: impact, affected components,
   affected series.
2. The fix is developed in a private workspace (GitHub draft security advisory and its
   temporary private fork), so nothing leaks before the release.
3. Like any change to Thelia, the fix is reviewed by a maintainer and must pass the
   full test suites and static analysis before it is merged.
4. The fix is applied to every supported series (currently 3.0 and 2.6).

## How a fix is released

Security fixes ship as regular patch releases on each supported series — there is no
separate hotfix channel. Each release is:

- tagged on GitHub with a GitHub release, which makes it available through
  [Packagist](https://packagist.org/packages/thelia/thelia) immediately,
- accompanied by a CycloneDX SBOM (software bill of materials) generated from
  `composer.lock` and attached to the GitHub release.

## How you are informed

- A **GitHub Security Advisory** is published on the affected repository once the fixed
  release is available, with a CVE identifier requested through GitHub for
  vulnerabilities affecting released versions.
- The **release notes** of the fixed version reference the advisory.

To stay informed, watch the [thelia/thelia](https://github.com/thelia/thelia)
repository (Watch → Custom → Security alerts) and enable
[Dependabot alerts](https://docs.github.com/en/code-security/dependabot/dependabot-alerts/about-dependabot-alerts)
on your own project so GitHub warns you when a Thelia package you depend on is affected
by a published advisory.

## Keeping your installation secure

- Stay on the most recent release of your series: security fixes only target the
  latest 3.0 and 2.6 versions.
- Run [`composer audit`](https://getcomposer.org/doc/03-cli.md#audit) regularly (or in
  your CI): it checks every installed package, Thelia included, against known security
  advisories.
- Report anything suspicious privately — see above.
