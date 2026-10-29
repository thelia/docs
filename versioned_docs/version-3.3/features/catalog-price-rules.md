---
title: Catalog Price Rules
sidebar_position: 8
---

# Catalog Price Rules

Added in Thelia 3.2.

A catalog price rule prices a slice of the catalog without touching a single product sheet.
"20% off the Winter category in January" or "9.90 on brand X for these customers" are each one
rule. The new price shows in the listings, on the product page, in the cart, on the order and
through the front API.

The rule follows the catalog. A product filed in the Winter category on January 15th is priced
by the rule from that moment. The rule stops at midnight on February 1st without any job having
to run.

A rule is made of three things:

- A scope: which products it prices.
- An audience: everyone, or the customers named on the rule.
- An effect: a percentage off, an amount off per currency, or a fixed price per currency.

On top of that a rule has a priority, a "stop" flag, optional dates, and a choice to show the
catalog price struck through.

## Creating a rule

Back office: **Tools > Catalog price rules**, then **New rule**. Type a name: the rule is created
turned off, and its other settings are set on the edit screen.

| Field | Meaning |
| --- | --- |
| Rule name, description | Free text, translatable. |
| Turn this rule on | A rule only prices while it is on. |
| Priority | Rules covering the same product apply from the smallest priority to the largest, then by creation order. The default is 100. |
| Stop examining the other rules | Once this rule has applied to a product, the following rules are skipped for it. |
| Start date, end date | Both optional. Without an end date the rule runs until it is turned off. The end date must be after the start date. |
| Effect | Percentage off, amount off per currency, or fixed price per currency. |
| Percentage taken off | Between 0 and 100. Used by the percentage effect. |
| Value per currency | Used by the amount and fixed price effects. Typed tax included, at the shop location. A currency left blank is not priced by the rule. At least one currency is required. |
| Show the catalog price struck through | Shows the original price next to the rule price. |
| Who this rule prices for | Everyone, or named customers only. |

Amounts and fixed prices are typed tax included, like the offsets of a flash sale. Customer
groups are not available yet: the audience is everyone or a list of customers. A rule reserved
for named customers needs at least one customer, and changing the audience needs the permission
to view customers.

### The scope

The scope is a set of criteria:

- Categories, with or without the categories below them (the **A category criterion also covers
  the categories below it** switch).
- Brands.
- Product templates.
- Feature values.
- Attribute values.
- Named products. A named product is covered whatever the other criteria say about it.

The criteria combine with AND: a product has to match every type of criterion that names
something. Within one type, naming several values means any of them. A type left empty restricts
nothing, so a rule with no criterion at all covers the whole catalog.

Deleting a category or a brand a rule names never widens the rule: the deleted target matches
nothing. The rule list flags such a criterion so the merchant can remove it.

### Previewing before turning on

**Preview prices** shows, for the rule as the form stands, how many products and sale elements
it covers and the price of each one before and after, tax included, per currency. A greyed price
is one the rule leaves unchanged. Use it before turning a rule on.

## How rules combine

Two rules covering the same product apply by ascending priority, then by ascending id. Each one
works on the price the previous one left. A rule with the stop flag is the last one examined for
the products it applies to.

A rule always starts from the catalog price (`product_price.price`) and replaces the promo
price the visitor would otherwise see. That includes a manual promo price and a running flash
sale: while a rule covers a product, the visitor sees the rule price.

Nothing is ever written into `product_price` or `product_sale_elements.promo`. The manual promo
price is back the moment the rule ends. A rule that would take a price below zero floors it at
zero and logs it.

The customer discount, if the customer has one, applies on top of the rule price, exactly as it
applies to a promo price.

### With reserved sales

A [reserved sale](./reserved-sales.md) comes after the rules. A customer named on a reserved sale
gets its discount only when it beats the price they would otherwise pay (the rule price included).

## Where the price applies

| Place | Behaviour |
| --- | --- |
| Product loops | The `product` and `product_sale_elements` loops return the rule price in place of the promo price. The `PROMO_PRICE`, `IS_PROMO` and `BEST_PRICE` outputs follow it, and `SHOW_ORIGINAL_PRICE` of the `product` loop carries the struck-through choice. |
| Product page | The sale elements of the product carry the rule price. |
| Cart | The price is written into the cart line (`cart_item.promo_price`) by `Thelia\Action\Cart`. |
| Order | The order freezes the price the cart line carried. An order keeps the price it was placed at after the rule ends. |
| Front API | `/api/front/products` and `/api/front/product_sale_elements` return the rule price. |

Two details on the loops. When a public rule is on, the `min_price` and `max_price` orders and
filters of the `product` loop read the rule prices. What a rule reserved for named customers
gives is not in these orders: a customer entitled to such a rule sees a listing ordered by the
public prices. The `promo="1"` filter still reads `product_sale_elements.promo` and knows nothing
of the rules.

## Converting a flash sale

On **Tools > Sales**, the action **Convert to a catalog price rule** builds turned-off rules from
a sale: its dates, audience and customers, its percentage or amount per currency, and its
products as named-product criteria. The sale is left as it is.

A sale selects (product, attribute value) pairs with OR, which one rule cannot express. The pairs
are grouped by their set of attribute values and each group becomes one rule, with a warning.

## Keeping prices up to date

The rule prices are stored as dated segments in a table of their own, so an opening or a closing
takes effect at the second. The core rewrites them itself when:

- a rule is created, changed, turned on or off, or deleted;
- a product, its categories, template, feature values or sale elements change, in the back
  office or through the admin API;
- a category, brand, template, feature value or attribute value a rule names changes or is
  deleted;
- a tax, a tax rule or a currency changes.

A change touching more sale elements than the `catalog_price_rule_inline_recompute_limit` shop
setting (5000 by default) is not replayed during the request. The rule is flagged as pending
("Prices pending" in the list) and the recompute command finishes the job.

```bash
php bin/console catalog-price-rule:recompute            # pending rules, then purge of segments already over
php bin/console catalog-price-rule:recompute --full     # rebuild the scope and prices of every rule
php bin/console catalog-price-rule:recompute --rule=12  # one rule, by id
php bin/console catalog-price-rule:recompute --product=340  # one product against every rule, by id
php bin/console catalog-price-rule:recompute --purge-only   # only drop the segments already over
```

Schedule it with the system cron, next to `sale:check-activation`. Every few minutes is plenty:
the dates are carried by the segments, and the command only catches up what the events could not
finish. The **Recompute pending prices** button of the rule list does the same as the default run.

The command exits with 1 when it fails or when `--rule` names a rule that does not exist.

### Shared API cache

A public rule gives everyone the same price, so the front API responses stay cacheable while it
runs. A rule reserved for named customers makes the answer depend on who asks: the two endpoints
above bypass the shared cache while such a rule is on. The cache is flushed on every
`CATALOG_PRICE_RULE_*` event and by the recompute command.

## For developers

### Reading rules through the API

The admin API exposes rules read-only: `GET /api/admin/catalog_price_rules` and
`GET /api/admin/catalog_price_rules/{id}`, filterable by `id`, `audienceMode`, `effectType` and
`active`, and ordered by `priority`, `startDate` or `endDate`. A rule is written through its
events, which is what rebuilds its scope and its stored prices.

### Events

Create, change, toggle and delete a rule by dispatching these events, as the back office does:

| Constant | Event class |
| --- | --- |
| `TheliaEvents::CATALOG_PRICE_RULE_CREATE` | `Thelia\Core\Event\CatalogPriceRule\CatalogPriceRuleCreateEvent` |
| `TheliaEvents::CATALOG_PRICE_RULE_UPDATE` | `CatalogPriceRuleUpdateEvent` (constructor takes the rule id, same payload as a creation) |
| `TheliaEvents::CATALOG_PRICE_RULE_TOGGLE_ACTIVITY` | `CatalogPriceRuleToggleActivityEvent` (rule id, optional wanted state; without one the rule is flipped) |
| `TheliaEvents::CATALOG_PRICE_RULE_DELETE` | `CatalogPriceRuleDeleteEvent` (rule id) |
| `TheliaEvents::CATALOG_PRICE_RULE_RECOMPUTE` | `CatalogPriceRuleRecomputeEvent` (one rule when named, every pending rule otherwise) |

The creation event carries the whole definition: locale, title, description, `active`,
`priority`, `stopProcessing`, dates, `effectType`, `percentageValue`, `effectValuesByCurrency`
(currency id to amount or price, tax included), `audienceMode`, `customerIds`,
`displayInitialPrice`, `includeSubcategories` and `criteria` (criterion type to list of target
ids). The core validates it and throws `Thelia\Domain\Pricing\Rule\Exception\InvalidCatalogPriceRuleException`
on a refusal. After the action has run, `getCatalogPriceRule()` returns the rule.

Listen to the same events to react to a change, for instance to log it or to flush your own cache.

### Adding a criterion type

A module adds a criterion type, say "supplier", by shipping one service implementing
`Thelia\Domain\Pricing\Rule\Scope\ScopeCriterionResolverInterface`. The interface is autoconfigured
with the `thelia.catalog_price_rule.criterion` tag, so implementing it is enough.

```php
<?php

namespace MyModule\PriceRule;

use Thelia\Domain\Pricing\Rule\Scope\ScopeCriterionResolverInterface;
use Thelia\Model\CatalogPriceRule;

final class SupplierCriterionResolver implements ScopeCriterionResolverInterface
{
    public function type(): string
    {
        return 'supplier';
    }

    public function predicate(array $targetIds, CatalogPriceRule $rule): string
    {
        // Only the `pse` (product_sale_elements) and `p` (product) aliases are readable.
        // The ids are integers inlined by the resolver: nothing else is bound.
        return \sprintf('p.supplier_id IN (%s)', implode(',', array_map('intval', $targetIds)));
    }
}
```

The rule editor then stores criteria of that type, and the core asks the module for their SQL
predicate when it computes the scope. A criterion type that no installed resolver answers for
makes the rule cover nothing, and the back office flags it.

### Adding an audience mode

`Thelia\Domain\Pricing\Rule\Audience\AudienceResolverInterface` (tag
`thelia.catalog_price_rule.audience`) answers, for one `audience_mode` value, which turned-on
rules a customer is entitled to. The core ships the named customers mode. Customer groups
(`audience_mode` 2) are modelled and will plug in here.

### Pricing by rules of your own

`Thelia\Domain\Pricing\CatalogPriceResolverInterface` is the contract every reader of a price
(loops, front API, product page service, cart) asks, once for the sale elements it is about to
show. A module that prices by rules of its own decorates it: it answers for the sale elements it
covers and hands the rest to the core resolver.

```php
use Symfony\Component\DependencyInjection\Attribute\AsDecorator;
use Symfony\Component\DependencyInjection\Attribute\AutowireDecorated;
use Thelia\Domain\Pricing\CatalogPriceResolverInterface;

#[AsDecorator(CatalogPriceResolverInterface::class)]
final class MyPriceResolver implements CatalogPriceResolverInterface
{
    public function __construct(
        #[AutowireDecorated] private readonly CatalogPriceResolverInterface $inner,
    ) {
    }

    // resolve(array $productSaleElementsIds, Currency $currency, ?Customer $customer, ?\DateTimeInterface $now = null): array
}
```

`resolve()` returns `Thelia\Domain\Pricing\ResolvedCatalogPrice` objects keyed by sale element id,
untaxed. A sale element absent from the answer keeps its catalog price. The core alias to
`Rule\CatalogPriceRuleResolver` is declared in `Config/Resources/services/core/pricing.php`, so a
decorator of a module does not remove it.

If your prices depend on the visitor or on the cart, also decorate
`Thelia\Domain\Pricing\PricingActivityChecker` and answer `hasVisitorDependentPricing()`. The
core then makes the shared API cache step aside.

### Where things live

| Piece | Place |
| --- | --- |
| Tables and migration | `local/config/schema.xml`, `setup/update/sql/3.2.0.sql` |
| Arithmetic (pure) | `core/lib/Thelia/Domain/Pricing/Rule/Engine/` |
| Scope, audience, storage | `core/lib/Thelia/Domain/Pricing/Rule/{Scope,Audience,Storage}/` |
| Repricing after a change | `Thelia\Domain\Pricing\Rule\RuleRepricer` |
| Resolution and combination with promos and reserved sales | `Thelia\Domain\Pricing\EffectivePriceResolver` |
| Events and actions | `core/lib/Thelia/Core/Event/CatalogPriceRule/`, `Thelia\Action\CatalogPriceRule`, `Thelia\Action\CatalogPriceRuleCatalogSync` |
| Flash sale conversion | `Thelia\Domain\Pricing\Rule\Conversion\SaleToPriceRuleConverter` |
| Command | `Thelia\Command\CatalogPriceRuleRecomputeCommand` |
| Back-office screens | `default-twig` theme, `/admin/catalog-price-rule` |

The full technical reference, with the data model, the arithmetic and the stored segments, is
`docs/catalog-price-rules.md` in the `thelia/thelia` repository.
