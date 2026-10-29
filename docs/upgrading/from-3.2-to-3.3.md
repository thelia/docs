---
title: Updating from 3.2 to 3.3
sidebar_position: 2.3
---

# Updating from 3.2 to 3.3

This page lists what is specific to the move from Thelia 3.2 to 3.3. The procedure itself
(backup, Composer, database script, cache, assets, modules) is on [Update](./update.md); the
steps below come on top of it. If you start from 3.1, apply
[Updating from 3.1 to 3.2](./from-3.1-to-3.2.md) first.

Thelia 3.3 ships Symfony Messenger and the [background jobs](../architecture/background-jobs.md).
Nothing waits for a worker after the update: `MESSENGER_TRANSPORT_DSN` stays empty and every job
runs at once, as before, until you name a queue.

## Symfony recipes

- The core requires `symfony/messenger`. When Composer applies the Symfony recipe of that
  package instead of the Thelia one, it writes `config/packages/messenger.yaml` and adds
  `MESSENGER_TRANSPORT_DSN=doctrine://default?auto_setup=0` to `.env`, and every mail then waits
  for a worker. Delete the `config/packages/messenger.yaml` the Symfony recipe wrote: the core
  configures Messenger itself. A `messenger.yaml` of your own, such as one that routes a module
  message, stays. Unless a worker runs, also delete that line, so `async` stays synchronous.
- The Symfony recipe of `symfony/scheduler` writes `src/Schedule.php`. Delete it too: the core
  declares its own `thelia` schedule.

## Queues and workers

- Going back from a queue to no queue leaves the jobs still waiting in `messenger_messages`.
  Let a worker empty the queues before you empty `MESSENGER_TRANSPORT_DSN`.
- The core configures Messenger for the whole application: its serializer, its bus, its
  `failure_transport` and the routing of its messages come before the configuration of the
  project. An application that already queued messages of its own (`App\Message\…`) gets a
  `LogicException` on dispatch until their classes are listed in the
  `thelia.messenger.allowed_message_classes` parameter. A module message is accepted when it
  lives in the namespace of an active module and has a handler.
- With a queue, the web servers and the workers must share `var/data-transfer/import/` and
  `var/cache/export/`, and a deployment must not empty them while jobs wait. See
  [Running the workers](../getting-started/background-workers.md#deploying).
- On an AMQP queue, set `MESSENGER_HEAVY_TRANSPORT_DSN`: otherwise the exports and imports share
  the queue of `async`, are read by its worker and tried again three times like its jobs.

## Rights

- Launching an import from the back office takes the `UPDATE` right on `admin.import`; `VIEW`
  now only shows the imports and their jobs. Review the profiles of the administrators who
  import.
- The new screen Configuration > System > Background jobs answers to the resource
  `admin.configuration.background-jobs`, which the update gives to no profile: grant it to the
  profiles that follow the jobs. Until then, only super-administrators see it.

## Dependencies

- The core requires `doctrine/dbal ^4.2`: a project or a module held on DBAL 3 moves to DBAL 4.

## The database script

`php local/setup/update.php` runs `setup/update/sql/3.3.0.sql`. It creates the tables of the new
features (the AI layer, the queue table `messenger_messages`, sale units, delivery dates and
slots, postal code rules on delivery zones, payment parts), adds the rights and the settings they
need, and converts or completes some existing data:

- The promotional price of an order line becomes a `DECIMAL(16,6)` on a shop that came from
  Thelia 2. Orders placed before the conversion keep the total of their invoice.
- Missing country titles and the German titles of the four checkout steps are filled in. A title
  an administrator edited is kept.
- The availability, customer rating and price facets become visible on every category listing
  that already shows facets. A merchant who does not want one hides it in the "Filters" section
  of the category or of the template.
- The settings `shared_cache_mode` (`disabled`) and `shared_cache_ttl` arrive. An update changes
  nothing until you set them: see [Reverse proxy cache](../getting-started/reverse-proxy-cache.md).

## The AI layer

The AI layer stays off after the update: no model is called until an administrator adds a
connection and a module declares a usage that needs it. See
[AI settings and MCP](../features/ai-settings.md) and
[Calling an AI model from a module](../modules/ai.md).

- The script creates nine tables (`ai_connection`, `ai_model`, `ai_tier_assignment`,
  `ai_usage_setting`, `ai_usage_log`, `ai_budget_reservation`, `ai_tool_token`,
  `ai_tool_approval`, `ai_tool_call_log`), the rights `admin.configuration.ai` and
  `admin.configuration.ai-mcp`, and the settings `ai_enabled`, `ai_monthly_cap`, `ai_eu_only`,
  `ai_log_retention_days`, `ai_mcp_enabled`, `ai_tool_approval_ttl_hours` and
  `ai_tool_token_max_days`. A setting the shop already holds is left alone.
- The core requires `symfony/ai-platform`, the bridges `symfony/ai-anthropic-platform`,
  `symfony/ai-generic-platform`, `symfony/ai-mistral-platform`, `symfony/ai-ollama-platform` and
  `symfony/ai-open-ai-platform` (all `^0.15`), `symfony/mcp-bundle` (`^0.15`) and `nyholm/psr7`
  (`^1.8`). A project that pins one of them must allow these versions.
- Composer may apply the Symfony recipes of these packages and write
  `config/packages/ai_*_platform.yaml` and `config/packages/mcp.yaml`. They do no harm and you can
  delete them: the shop reads its connections from the database, and the core registers its own
  MCP server.
- The MCP server on `/api/mcp` is off (`ai_mcp_enabled` is `0`) until an administrator switches
  it on and creates tokens. If the shop is served on a host other than `url_site`, set
  `THELIA_MCP_ALLOWED_HOSTS` to the host names the endpoint must accept.
- The key of a connection is read from a `THELIA_AI_*_KEY` or `THELIA_AI_*_TOKEN` variable, or
  from the usual variable of the provider when the connection points at that provider's own
  address. A connection saved before with another variable name is refused.
- The embedded price list no longer holds models the providers do not serve (13 Mistral names and
  six OpenAI entries). A range or a usage that points at one keeps working from its row in
  `ai_model`; choose another model when the provider says the model does not exist. Scaleway
  models are listed without the vendor prefix (`llama-3.3-70b-instruct`): choose the model again
  on a range that used a prefixed name.
- OpenAI is now sent `store: false`. A connection to the European region
  (`https://eu.api.openai.com`) needs dated model names such as `gpt-5.4-nano-2026-03-17`.

## Back-office theme

The `default-twig` theme requires `thelia/core ^3.3`: update both together. The screens of the AI
layer, the background jobs and the new features ship with the theme.

## Behaviour changes

- Returns on the front API. An order that does not exist, or a line that does not belong to the
  order, answers 422 instead of 400. A return on an order that is cancelled, refunded or not paid
  yet answers with a message that says so, where it used to say the return window had closed. A
  client that reads the status or the message follows.
- A loop given a `lang` argument that names no language throws an `InvalidArgumentException`
  instead of reading the language of the session. A template that passes a misspelled or removed
  language fails on its next render.
- With `default_lang_without_translation` set to `0`, the front loops and `attr()` no longer
  return the items and texts that have no translation in the requested language.
- An import is one transaction. A row its rules refuse is reported and the import goes on. A row
  the database cannot save cancels the whole import. The rows written stay locked until the end,
  so run a large stock or price import outside trading hours. A listener of `IMPORT_BEGIN`,
  `IMPORT_FINISHED` or `IMPORT_SUCCESS` runs inside that transaction: what it writes is cancelled
  with the import, what it sends (a mail, a file, a job queued in the shop database) is not.
- An uploaded import is checked by its content as well as its name. An archive is refused when it
  holds more than 1000 entries, more than 512 MB once extracted, a link, or a name outside its
  folder.
- `maintenance:purge` also deletes the failed jobs older than 30 days.
- A combination saved with a new `ean_code` that is not a GTIN is refused: a 422 on `eanCode`
  from the admin API, a refused row from the stock import. Spaces and hyphens are removed. Codes
  already stored stay as they are until they change.
- The name of a cached image rendition covers all its options, so each rendition is generated
  again once, on its first request. The old files stay until `image-cache:clear` or
  `thelia:cache:clear` empties the cache.
- The messages `customer_account_created` and `customer_account_changed` no longer receive the
  customer's password. The templates of the default e-mail theme keep rendering without it. A
  template or a module that reads `password` from these messages gets nothing.
- Delivery. An order whose delivery address was moved to another country, state, postal code or
  city after the cart copied it is refused with `delivery-address-moved` until the address is
  chosen again. A cart whose carrier the postal code rules of its zones refuse is refused when the
  order is placed. A zone without a rule takes every postal code, as before.
- A mail written in the order history (`email_sent`) is now recorded once the mail server has taken
  the mail. With a queue, that is the worker, later, and the author of the line is `system`.

## Exports and imports files

Exports, their archives and uploaded imports are created with mode 0640, in folders made with
mode 0770. A folder made before keeps its mode. When the web server and the workers run under two
users of one group, check `var/data-transfer/import` and the export folder of the cache, and give
them `chmod 0770` if needed. Run any crontab or deployment script that exports or runs
`maintenance:purge` under the same system user as the web server, or under users that share a
group.

## Mails and queues

- Send the mails of a module through `MailerFactory`. It gives each mail an identifier that guards
  against a second delivery. A mail sent with the Symfony mailer directly carries none, and is sent
  again if the queue hands its job out a second time.
- A failed job replayed from the back office and with `messenger:failed:retry` at the same moment
  may be sent twice. Replay a job from one place at a time.
- A Redis or AMQP queue is read by the workers as the shop's own. Whoever can write to it can send
  mails through the mail server of the shop and replay exports and imports. Keep such a server
  private.

## For module and theme developers

The full list, with the exact signatures, is in the 3.3.0 section of
[`CHANGELOG.md`](https://github.com/thelia/thelia/blob/main/CHANGELOG.md). In short:

- Many services gain a constructor argument without a default: `ImportHandler`, `MailerFactory`,
  `ResourceService`, `CartGuard`, `OrderFacade`, `CheckoutSelectionProcessor`,
  `DeliveryModuleResourceBuilder`, `DeliveryModuleEligibilityChecker`, `CheckoutValidationService`,
  `Action\Module`, `Action\Customer` and the return processors, among others. A module that builds
  one by hand passes the new argument. A module that reads it from the container has nothing to do.
- `PostageEstimator::estimatePostageForCountry()` and `AreaDeliveryModuleQuery::findByCountryAndModule()`
  take a last argument `?string $zipCode = null`. A class that overrides one declares it too.
- `ExportHandler::export()`, `ImportHandler::import()` and `ImportHandler::validateUpload()` take a
  new optional last argument. `AbstractArchiver` implements the new `ClosableArchiverInterface`.
- `ReservedSaleVisibility` hands over to `ProductVisibility`. A subclass that overrode its methods
  declares a `ProductVisibilityRuleInterface` instead.
- `CART_SET_PAYMENT_MODULE` also resets the stored payment method of the cart unless the event
  names one.
- In the `default-twig` theme, `ExportImportController` is gone. Its routes are served by
  `ExportController`, `ImportController`, `DataTransferListController`, `ExportJobController` and
  `ImportJobController`. Three controllers (`MailingSystemController`, `MessagePreviewController`,
  `PasswordResetController`) take new constructor arguments.
- In Flexy, the `Delivery`, `Invoice` and `Payment` organisms and `CheckoutController::payAction()`
  take new arguments. A child theme that overrides one declares them and passes them on.
- `DELETE /api/admin/customers/{id}` runs the same deletion as the back office and answers 409 for
  a customer who has orders, where it used to fail with a 500.
