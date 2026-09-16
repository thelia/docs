---
title: Product Relation Types
sidebar_position: 7
---

# Product Relation Types

Added in Thelia 3.1.

Two products could be related in one way only: one was an accessory of the other. A relation now
carries a type, and a merchant defines the types the shop needs.

## The shipped types

Three types ship, all visible on a fresh install:

| Code | Reciprocal | Meaning |
| --- | --- | --- |
| `accessory` | No | What the historical accessory relation was. |
| `cross_selling` | Yes | Relating A to B also relates B to A. |
| `up_selling` | No | A better version of the product. |

Each carries a translated title and description, a position, and a stable code a theme or a
module refers to. A merchant creates, renames, reorders, hides and deletes types from the back
office. Deleting a type a shop still uses is refused rather than taking its relations along.

Positions are scoped to the product *and* the type, so reordering one block leaves the others
where they were. A product cannot be related to itself.

## What an existing shop gets

The `accessory` table gains a `type_id` column pointing at the new types. The update backfills
every relation already saved with the `accessory` type, then makes the column mandatory, so a
shop keeps exactly the relations it had, under the type it had them under.

The table keeps its columns and its name, so a module querying `AccessoryQuery` keeps working
unchanged.

:::caution The `accessory` table is no longer a pure junction table
Propel therefore no longer generates the many-to-many helpers it used to put on `Product` and
`ProductQuery`: `getProductsRelatedByAccessory()`, `addProductRelatedByAccessory()` and their
neighbours are gone. Nothing in the core, the bundled themes or the published modules called
them. A module that did goes through `AccessoryQuery`, or through the facade below.
:::

## For developers

`Thelia\Domain\Catalog\Product\ProductFacade` gains three methods:

```php
$facade->addAssociation($productId, $associatedProductId, $typeCode);
$facade->removeAssociation($productId, $associatedProductId, $typeCode);
$facade->getAssociations($productId, $typeCode);   // $typeCode is optional
```

`addAccessory()` and `removeAccessory()` are kept, as thin wrappers over the two first with the
`accessory` type code, and the three accessory events still fire, so nothing that worked before
has to change.

Three events come with the typed relations:

| Constant | Name |
| --- | --- |
| `TheliaEvents::PRODUCT_ADD_ASSOCIATION` | `action.productAddProductAssociation` |
| `TheliaEvents::PRODUCT_REMOVE_ASSOCIATION` | `action.productRemoveProductAssociation` |
| `TheliaEvents::PRODUCT_UPDATE_ASSOCIATION_POSITION` | `action.updateProductAssociationPosition` |

The two first carry a `ProductAssociationEvent`, which names the product, the associated product,
the type code, whether reciprocity applies and whether the legacy accessory event should be
announced alongside.

### API

| Resource | Admin | Front |
| --- | --- | --- |
| Types | `GET`, `POST /api/admin/product_association_types`, `GET`, `PUT`, `PATCH`, `DELETE /api/admin/product_association_types/{id}` | `GET /api/front/product_association_types`, `GET /api/front/product_association_types/{id}` |
| Relations | `GET`, `POST /api/admin/product_associations`, `GET`, `DELETE /api/admin/product_associations/{id}` | `GET /api/front/product_associations`, `GET /api/front/product_associations/{id}` |

The front resources are read-only, and are what a theme reads to render one block per relation
type on the product page. See
[Adding product sections](../front-office/flexy-theme/customization.md#adding-product-sections).

The legacy `accessory` loop is unchanged and still returns accessories only. See the
[Accessory loop reference](../reference/loops/Accessory.md).
