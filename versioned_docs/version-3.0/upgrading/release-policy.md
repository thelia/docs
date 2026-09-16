---
title: Release Policy
sidebar_position: 4
---

# Release Policy

This page describes how Thelia 3 releases are numbered and branched, and what a shop or a
module can expect from one release to the next. It applies from 3.1.0 onwards.

## One trunk

Every change lands on `main`, and `main` is always taggable. There is no long-lived
development branch waiting for a release, and no branch per upcoming version: what is on
`main` is what the next tag will carry.

## The number is read from the content, at tag time

The version number is not decided by a calendar or announced in advance. When a release is
cut, its content decides:

- the tag carries a feature, a new setting or a schema change, so it is a minor release
  (3.1.0, 3.2.0, and so on);
- the tag carries only fixes, performance work and tests, so it is a patch release (3.1.1).

Merging a feature therefore means *the next tag will be a minor release*, never *a minor
release has to be published now*. Several features can accumulate on `main` and ship in the
same minor.

## A feature ships switched off

Any feature that touches a customer path or the database schema arrives disabled by default.
A shop that updates keeps the behaviour it had, and turns the feature on when it wants it,
from a setting or an environment variable.

This is what keeps `main` publishable at all times, and it is what makes an update to a
minor release a low-risk operation: the new code is in place, the shop still behaves as
before until somebody decides otherwise.

## Maintenance branches

A maintenance branch is created the day a fix has to ship without shipping what is on
`main`, and not before. Cutting `3.1` from the `3.1.0` tag works just as well six months
later as on the day of the release, because a tag is a fixed point.

Until then, a fix ships from the trunk, in the next patch or minor release.

## Compatibility promise

Within the 3.x line:

- an API, a service, an event or a method that has to go is **deprecated in a minor
  release**, keeping its behaviour, and documented as such in the release notes;
- it is **removed in a major release**, never in a minor or a patch one.

The version a module requires in its `Config/module.xml` is a minimum, compared with `>=`
against the running core:

```xml
<thelia>3.0.0</thelia>
```

A module that declares `3.0.0` keeps activating on a 3.1 or a 3.2 shop. Raise the constraint
only when the module starts using something a later release added.

## Reading the release notes

Each release ships its notes on the
[GitHub release](https://github.com/thelia/thelia/releases) of `thelia/thelia`, with three
sections worth reading before an update: the security fixes, the behaviour changes that
apply without being asked for, and the breaking changes. The update procedure itself is on
[Update](./update.md).
