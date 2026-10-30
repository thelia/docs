---
title: Release cycle and support
sidebar_position: 1.5
---

# Release cycle and support

This page explains what a Thelia version number means, which series still receive fixes,
how often releases have shipped so far, and how deprecations work. The disclosure policy
and the table of supported series live in
[SECURITY.md](https://github.com/thelia/thelia/blob/main/SECURITY.md#supported-versions)
in the core repository. If this page and that file differ, the file is right.

## What a version number means

The core follows [semantic versioning](https://semver.org). In `3.x.y`:

- a patch release (`y`) carries fixes only;
- a minor release (`x`) adds features;
- neither breaks code, templates or integrations written against an earlier 3.x release.

A breaking change ships in a major release only, after a deprecation period in the
preceding minor releases. The surface covered by this promise, and what it leaves out, is
listed in the
[backward compatibility promise](https://github.com/thelia/thelia/blob/main/BC-PROMISE.md).
How a tag is chosen and branched is described in the
[Release Policy](../upgrading/release-policy.md).

Modules and themes have their own version numbers. The back-office theme, for example, has
a 1.x line while the core is in 3.x. A module declares the oldest core it works
with in `Config/module.xml`, and that value is a minimum: a module that declares `3.0.0`
keeps activating on a later 3.x core.

## Supported series

Only the two latest minor series are supported. The latest one gets every security fix, the
one before it gets critical security fixes only, and a series reaches its end of support when
the second minor release after it ships. Bug fixes that are not security fixes ship in the
latest series only.

| Series | Branch | Supported | End of support |
|--------|--------|-----------|----------------|
| 3.3 | `3.3` | Yes, security fixes | None yet |
| 3.2 | `3.2` | Critical security fixes only: update to 3.3 | With the 3.4.0 release |
| 3.1 | `3.1` | No: update to 3.3 | 29 October 2026, with the 3.3.0 release |
| 3.0 | None | No: update to 3.3 | 16 September 2026, with the 3.1.0 release |
| 2.6 | `2.6` | No: update to 3.3 | 6 October 2026, with the 3.2.1 release |
| 2.5 and older | None | No | Ended |

Thelia 3 is developed on a single trunk. A security fix ships in the next 3.x release, and a
maintenance branch is only opened the day a fix has to ship without the changes waiting on
`main`. Security fixes are therefore released for the latest 3.x versions only: keep your
installation on the most recent release of its series.

To move a 2.6 shop to Thelia 3, follow [Migrating from Thelia 2](../upgrading/migrate.md).

## How often releases ship

This is an observation, not a commitment. Releases are not tied to a calendar: the version
number is decided from the content at tag time.

| Release | Date |
|---------|------|
| 3.0.0 | 31 August 2026 |
| 3.1.0 | 16 September 2026 |
| 3.2.0 | 2 October 2026 |
| 3.3.0 | 29 October 2026 |

Since 3.0.0, a new minor series has come out every two to four weeks. Patch releases come in
between. Plan updates as a routine task rather than as a rare project: a series stops
receiving fixes when the second minor release after it ships.

## Deprecations

Nothing covered by the compatibility promise is removed or changed without being deprecated
first. The deprecation ships in a minor release, together with its replacement, and the old
code keeps working. The removal happens in a major release, never in a minor or a patch one.

To see what is deprecated:

- the [CHANGELOG](https://github.com/thelia/thelia/blob/main/CHANGELOG.md) lists every
  deprecation and every behavior change under the version that introduces it;
- the [Breaking changes](../upgrading/breaking-changes.md) page lists, release by release,
  what a module or a theme has to change;
- PHP code that uses a deprecated path triggers a deprecation notice, so a test run or a
  development environment shows it before an upgrade does.

The promise was written down in October 2026, during the 3.2 line. Code removed in 3.1.0 and
3.2.0 is listed in the [Release Policy](../upgrading/release-policy.md#compatibility-promise).

Every 3.x release updates a 3.0.0 shop in place. The procedure is on
[Update](../upgrading/update.md).
