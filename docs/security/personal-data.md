---
title: Personal data
sidebar_position: 2
---

# Personal data

Thelia ships the tools a shop needs to answer a customer asking for their data, or for
its deletion: an export, an anonymization that keeps the accounting record, and a
retention policy. Modules plug into all three through a single interface.

## Exporting what the shop knows about someone

`customer:export-personal-data` writes, as JSON, everything the shop holds about one
customer: the account, the address book, the orders with their frozen order addresses
and products, the carts, and the newsletter subscription.

```shell
php Thelia customer:export-personal-data customer@example.com --output-file=export.json
```

The same export is available from the back-office, on the customer sheet. There, the
archive is streamed in the response: it is never written under the web root nor into a
shared cache, the response is marked `private, no-store, must-revalidate`, and the admin
log records the export without writing the customer name back into the database.

See [`customer:export-personal-data`](../reference/cli/customer_export_personal_data.md).

## Anonymizing instead of deleting

Deleting an account would take away orders a business is required to keep. Anonymization
erases the identity and leaves the accounting record intact.

| Erased | Kept |
| --- | --- |
| Account identity: last name, first name, email (replaced by `anonymous-<id>@anonymous.invalid`), password, remember-me and confirmation tokens, sponsor. The account is disabled. | Orders: reference, invoice number and date, amounts, taxes, coupons, status history |
| Address book (`address`) and cart addresses (`cart_address`) | Country and state of the order address, which justify the VAT rate applied |
| Identity frozen on the order addresses (`order_address`): title, company, SIRET, VAT number, name, address, postcode, city, phone numbers | The order itself, still attached to the now anonymous account |
| Carts, newsletter subscription, account version history (`customer_version`) | Admin log entries: which administrator did what, and when |
| Identity copied into the admin log: the message and the posted request payload | |

```shell
php Thelia customer:anonymize customer@example.com
```

The whole operation runs in a single Propel transaction: if a module fails, nothing is
written. `customer.anonymized_at` records the date of the first erasure, which makes the
operation traceable and idempotent: running it twice does not move the date.

See [`customer:anonymize`](../reference/cli/customer_anonymize.md).

:::note Deleting an account is still possible
`CUSTOMER_DELETEACCOUNT` and the back-office delete button are unchanged. Anonymization is
the alternative for a shop that must keep its invoices.
:::

## Declaring the personal data a module holds

A shop rarely runs core alone. A loyalty balance, a support ticket or a stored payment
token belong to the module that stores them. Implement
`Thelia\Domain\Customer\Service\CustomerPersonalDataProviderInterface` and the module is
called automatically on both the export and the anonymization: no configuration, no tag
to declare.

```php
// local/modules/Loyalty/Service/LoyaltyPersonalData.php
<?php

declare(strict_types=1);

namespace Loyalty\Service;

use Loyalty\Model\LoyaltyPointQuery;
use Thelia\Domain\Customer\Service\CustomerPersonalDataProviderInterface;
use Thelia\Model\Customer;

class LoyaltyPersonalData implements CustomerPersonalDataProviderInterface
{
    public function getPersonalDataSectionName(): string
    {
        return 'loyalty';
    }

    public function exportPersonalData(Customer $customer): array
    {
        return LoyaltyPointQuery::create()
            ->filterByCustomerId($customer->getId())
            ->find()
            ->toArray();
    }

    public function anonymizePersonalData(Customer $customer): void
    {
        LoyaltyPointQuery::create()
            ->filterByCustomerId($customer->getId())
            ->delete();
    }
}
```

Three rules apply:

- The section name must not collide with a core section (`customer`, `addresses`,
  `orders`, `carts`, `newsletter`) nor with another provider. Prefer the module code.
- `exportPersonalData()` returns a structure suitable for JSON serialization, or an empty
  array when there is nothing.
- `anonymizePersonalData()` runs inside the anonymization transaction. Throwing rolls the
  whole operation back, including what core already anonymized.

The provider is also called when the retention policy anonymizes a dormant account, so a
module erases its share on a scheduled run exactly as on a manual one.

## Retention: not keeping what is no longer needed

`maintenance:purge` deletes stale data. Every period is a configuration variable, so a
shop sets its own.

| Data | Configuration variable | Default |
| --- | --- | --- |
| Carts without an order | `purification_cart_no_order_days` | 60 days |
| Anonymous carts | `purification_cart_anonymous_days` | 30 days |
| Admin logs | `purification_admin_logs_days` | 180 days |
| Form firewall records (they hold IP addresses) | `purification_form_firewall_days` | 1 day |
| Identity of accounts that never ordered | `purification_customer_no_order_days` | `0`, off |
| Identity of accounts whose last order is old | `purification_customer_after_last_order_days` | `0`, off |

```shell
php Thelia maintenance:purge --dry-run
php Thelia maintenance:purge
```

:::caution Customer retention is off by default, on purpose
Erasing an identity cannot be undone, and the shop is the only one that knows how long it
is allowed to keep the data. Both customer periods default to `0`, which keeps the
retention off. Set them explicitly, and run `--dry-run` first.
:::

The two customer periods are distinct because an account that has ordered is also tied to
an accounting retention obligation: an account that never ordered ages from its creation
date, an account that ordered ages from its last order. An account already anonymized is
skipped, so a nightly run does the work once per account.

The form firewall threshold never goes below the longest waiting period configured, so a
purge cannot hand a blocked IP address a fresh set of attempts.

See [`maintenance:purge`](../reference/cli/maintenance_purge.md).

## Adding a module purge to the same run

`maintenance:purge` dispatches `TheliaEvents::MAINTENANCE_PURGE` at the end of its run. A
module listens to it, purges its own tables, and appends a line to the report:

```php
#[AsEventListener(event: TheliaEvents::MAINTENANCE_PURGE)]
public function purgeOldQuotes(MaintenancePurgeEvent $event): void
{
    $deleted = QuoteQuery::create()
        ->filterByCreatedAt(new \DateTime('-1 year'), Criteria::LESS_THAN)
        ->delete();

    $event->addResult(sprintf('<comment>Quotes (>1 year):</comment> <info>%d deleted</info>', $deleted));
}
```

## What Thelia does not provide

To be explicit, so nobody promises it:

- No cookie consent banner. It belongs to the theme or to a module.
- No self-service account deletion from the front-office. Both operations are available
  from the CLI and the back-office only.
- Neither the export nor the anonymization is exposed through the API.
- No application-level encryption of personal columns at rest.

## See also

- [Security policy](./security-policy.md)
- [`customer:anonymize`](../reference/cli/customer_anonymize.md),
  [`customer:export-personal-data`](../reference/cli/customer_export_personal_data.md),
  [`maintenance:purge`](../reference/cli/maintenance_purge.md)
