---
title: Customer Tags
sidebar_position: 6
---

# Customer Tags

Added in Thelia 3.1.

A shop needs its own words for its customers: a wholesaler, a bad payer, someone met at a trade
show. Tags are free-text markers a merchant puts on a customer record, with no meaning imposed by
the core.

## What a tag is

A tag has a label, unique across the shop, and a colour. Creating one with a label already taken
is refused, and the message names the tag standing in the way, so a merchant does not have to go
looking for it.

Tags attach through `tag_element`, which is deliberately polymorphic: it stores a tag id, an
element key and an element id. The core only uses the `customer` element key today, and the table
is ready for whatever else a shop tags later.

Two tags can be merged, which moves every attachment of the absorbed tag onto the surviving one.

## Where they show

The customer list carries a tag column and filters on a tag, reading the tags of every row in one
query rather than one per row. A tag is attached from the customer sheet, or created from the tag
configuration screen.

## API

An admin resource exposes the tags and their attachments:

| Operation | Endpoint |
| --- | --- |
| List, create | `GET`, `POST /api/admin/tags` |
| Read, replace, update, delete | `GET`, `PUT`, `PATCH`, `DELETE /api/admin/tags/{id}` |
| List, attach | `GET`, `POST /api/admin/tag-elements` |
| Read, detach | `GET`, `DELETE /api/admin/tag-elements/{id}` |

## Pruning orphans

An attachment can outlive what it pointed at. `tag:prune-orphans` finds the attachments whose
customer is gone, and reports without touching anything unless it is told to:

```bash
# Report what would be removed
php Thelia tag:prune-orphans

# Remove it
php Thelia tag:prune-orphans --force
```

## Personal data

A tag is an internal marker, not something the customer told the shop, so it is deliberately
absent from the personal data export handed to a customer. Anonymizing a customer deletes their
tag attachments, since the marker only makes sense against an identified person. See
[Personal data](../security/personal-data.md).

## For developers

`Thelia\Domain\Tagging\Service\TagService` holds the operations: creating, attaching, detaching,
merging and pruning. The models are `Thelia\Model\Tag` and `Thelia\Model\TagElement`, whose
`ELEMENT_KEY_CUSTOMER` constant is the key the core stores.
