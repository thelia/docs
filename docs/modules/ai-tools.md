---
title: Giving tools to an AI
sidebar_position: 11
---

# Giving tools to an AI

Added in Thelia 3.3.

A tool is a function of your module that an AI can use to read the shop or to propose a change to it. You declare it once, with an attribute. The core then offers it to two kinds of caller:

- an agent of your own module, which talks to a model through the [gateway](./ai.md) and asks the core which tools it may use;
- an external client such as an AI assistant on a desktop, which connects to the shop through the MCP server of the core. The merchant side of this, tokens included, is in [AI settings and MCP](../features/ai-settings.md).

The rules are the same for both:

- A tool that reads runs at once, with the rights of the person it works for, read again at every call.
- A tool that changes the shop has no effect when it is called. It describes the change, the core stores it, and an administrator approves or rejects it in the back office. Only then does your code change anything.
- Every call is logged.

This page is for module developers. For the types of the gateway and the declaration of a usage, see [Calling an AI model from a module](./ai.md).

## A tool that reads

Put `#[AsAiTool]` on a service class that implements `AiReadToolInterface`. The module skeleton loads its classes with `autoconfigure(true)`, and the core reads the attribute on every autoconfigured service, so there is nothing else to register. A disabled module offers no tool.

```php
use Thelia\Core\Security\AccessManager;
use Thelia\Core\Security\Resource\AdminResources;
use Thelia\Domain\Ai\Tool\AiReadToolInterface;
use Thelia\Domain\Ai\Tool\AiToolContext;
use Thelia\Domain\Ai\Tool\AiToolRisk;
use Thelia\Domain\Ai\Tool\AsAiTool;

#[AsAiTool(
    name: 'commerceagents_search_products',
    description: 'Searches the catalogue by reference or title. Returns at most 20 products with their variants (pse_id) and pre-tax prices.',
    resource: AdminResources::PRODUCT,
    access: AccessManager::VIEW,
    risks: [AiToolRisk::PrivateData],   // stock and purchase prices are not public
)]
final readonly class SearchProductsTool implements AiReadToolInterface
{
    public function __construct(private CatalogReader $catalog) {}   // a service of your module

    public function inputSchema(): array
    {
        return [
            'type' => 'object',
            'additionalProperties' => false,
            'required' => ['query'],
            'properties' => [
                'query' => ['type' => 'string', 'minLength' => 2, 'maxLength' => 100],
                'limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 20],
            ],
        ];
    }

    public function execute(array $arguments, AiToolContext $context): array
    {
        $products = $this->catalog->search($arguments['query'], $arguments['limit'] ?? 5, $context->locale);

        return ['count' => \count($products), 'products' => $products];
    }
}
```

`CatalogReader` stands for whatever your module uses to read its data. The core does not provide it.

What the registry does around `execute()`:

- It checks the arguments against `inputSchema()` before your code runs. A call that does not match is answered with the list of the faulty paths (`/limit: must be at most 20`), never the value. Validate nothing twice, but do not trust what the schema cannot say (an identifier that exists, a right on one object).
- `execute()` returns an associative array. A list at the root is a failure, so wrap it (`['products' => [...]]`). An empty array is sent as `{}`.
- The result is limited in size: `maxResultBytes` (16 384 bytes by default, 262 144 at most). A larger result is refused with a message asking to narrow the query or to ask for fewer items. Design the tool to paginate or to cap its output.
- To report a failure the model can understand, throw `AiToolFailedException` with a message that is safe to show to it. The message goes back as it is. Never put a secret, personal data or a stack trace in it. Any other exception is logged by the application and the caller only sees "The tool failed."

## The attribute

| Argument | Meaning |
| --- | --- |
| `name` | `<module>_<action>`, lower case, 64 characters at most. The prefix is the code of the module that declares the tool, in lower case (`CommerceAgents\` gives `commerceagents_`). `thelia_` is reserved for the core. A name is unique in the shop. |
| `description` | What the tool does, written for the model: it decides from this text whether to call the tool. 2 048 characters at most. |
| `audiences` | Who may be offered the tool: a list of `AiAudience` (`Admin`, `Customer`, `Public`). The default is `[Admin]`. `System` is not allowed: a job has no right of its own and acts for the administrator who configured it. |
| `resource` or `module` | The right the tool needs, for administrator tools. `resource` is a constant of `AdminResources` (`admin.product`). `module` is the code of your own module, for a right your module defines. Name one, not both. |
| `access` | `AccessManager::VIEW`, `CREATE`, `UPDATE` or `DELETE`. |
| `risks` | The legs of the lethal trifecta the tool brings (see [Risks](#risks)). |
| `mcp` | `true` by default. `false` keeps the tool away from external clients (see [Keeping a tool away from MCP](#keeping-a-tool-away-from-mcp)). |
| `maxResultBytes` | The size of the JSON a result may take, 262 144 at most. |

The core checks the declaration when the container is built. A declaration that breaks a rule stops the build with the reason:

- The name follows the pattern and the prefix of the module, and is unique.
- A tool reads (`AiReadToolInterface`) or writes (`AiWriteToolInterface`), never both and never neither.
- A tool for administrators names exactly one right. An empty right is refused, because the access check would let every administrator through. The `resource` must be a constant of `AdminResources`, and the `module` must be the module that declares the tool.
- A tool that reads asks for `VIEW`. A tool that writes asks for `CREATE`, `UPDATE` or `DELETE` and is offered to `Admin` only.
- A tool for `Customer` or `Public` reads public data: it declares no right and no `private_data` risk. A tool cannot mix `Admin` with these audiences: declare two tools.
- `inputSchema()` has `"type": "object"` and `"additionalProperties": false`. An empty `properties` is sent to the providers as an object.

## A tool that changes the shop

A write tool implements `AiWriteToolInterface`. It has two steps, and the model only ever triggers the first.

1. `propose()` describes the change. It has no effect: apply nothing and send nothing from it.
2. `apply()` makes the change. It is called only when an administrator approves the proposal in the back office.

```php
use Thelia\Core\Security\AccessManager;
use Thelia\Core\Security\Resource\AdminResources;
use Thelia\Domain\Ai\Tool\AiApprovedChange;
use Thelia\Domain\Ai\Tool\AiChangeProposal;
use Thelia\Domain\Ai\Tool\AiToolContext;
use Thelia\Domain\Ai\Tool\AiWriteToolInterface;
use Thelia\Domain\Ai\Tool\AsAiTool;
use Thelia\Domain\Ai\Tool\Exception\AiStaleChangeException;
use Thelia\Domain\Ai\Tool\Exception\AiToolFailedException;

#[AsAiTool(
    name: 'commerceagents_update_price',
    description: 'Proposes a new pre-tax price for one variant (pse_id from commerceagents_search_products), in the default currency. Nothing changes until an administrator approves it.',
    resource: AdminResources::PRODUCT,
    access: AccessManager::UPDATE,
)]
final readonly class UpdatePriceTool implements AiWriteToolInterface
{
    public function __construct(private VariantPrices $prices) {}   // a service of your module

    public function inputSchema(): array
    {
        return [
            'type' => 'object',
            'additionalProperties' => false,
            'required' => ['pse_id', 'price'],
            'properties' => [
                'pse_id' => ['type' => 'integer', 'minimum' => 1],
                'price' => ['type' => 'string', 'pattern' => '^[0-9]{1,10}(\\.[0-9]{1,6})?$'],   // a decimal as a string, never a float
            ],
        ];
    }

    public function propose(array $arguments, AiToolContext $context): AiChangeProposal
    {
        $current = $this->prices->ofDefaultCurrency($arguments['pse_id'])
            ?? throw new AiToolFailedException('This variant has no price in the default currency.');

        return new AiChangeProposal(
            target: 'product_sale_elements:'.$arguments['pse_id'],
            summary: \sprintf('Price of %s: %s → %s %s excl. tax', $current->reference, $current->price, $arguments['price'], $current->currency),
            before: ['price' => $current->price],
            after: ['price' => $this->prices->normalize($arguments['price'])],
        );
    }

    public function apply(AiApprovedChange $change): void
    {
        $pseId = (int) substr($change->target, \strlen('product_sale_elements:'));

        // The shop may have changed between the proposal and the approval.
        if ($this->prices->ofDefaultCurrency($pseId)?->price !== $change->before['price']) {
            throw new AiStaleChangeException('The price changed since the proposal.');
        }

        $this->prices->update($pseId, $change->after['price']);
    }
}
```

`VariantPrices` is a service of your module, here. The two methods are used in this way:

- `AiChangeProposal`: `target` says what the change touches (128 bytes at most), `summary` is plain text for the administrator (512 characters at most), `before` and `after` are JSON arrays (32 768 bytes at most each). `before` is what `apply()` checks again.
- The administrator reads more than the summary. The approval screen shows the summary, the full arguments and the state after the change, always escaped. The summary is written from a request of the model, so it is not enough to decide on. Put in `after` what the change will really do.
- `propose()` can run again. It runs once when the model calls the tool. The approval service can run it again, in the context of the administrator, when the arguments are amended before the approval. Keep it free of side effects.
- `apply()` runs in a transaction of its own. Throw `AiStaleChangeException` when the shop no longer matches `$change->before`: the transaction is rolled back, the approval is marked failed and its message is shown to the administrator. `AiToolFailedException` does the same. Any other exception also marks it failed, with a generic reason; the detail goes to the application log.
- Do not send anything out of the database from `apply()`: an e-mail, a message to a channel, a webhook. Wait for the transaction to be committed: dispatch it from a post-commit listener or send a message to the bus. A later failure would otherwise roll back a change that was already announced.
- `AiApprovedChange` gives you `approvalId`, `toolName`, `target`, the `arguments`, `before`, `after`, the `approverAdminId` and who proposed the change (`proposedBy`, an `AiActorType`).

When the model calls a write tool, it receives:

```json
{"status": "pending_approval", "approval_id": 31, "summary": "Price of MUG-THELIA: 16.500000 → 14.90 EUR excl. tax", "expires_at": "2026-10-29T10:14:03+00:00"}
```

A proposal expires after 24 hours unless the merchant changed `ai_tool_approval_ttl_hours`. The agent can tell the person that the change waits for their approval. Nothing is written to the shop before it.

## Who is offered a tool

A tool is offered to a caller when all of these are true:

- The audience of the usage that asks is in the `audiences` of the tool. Through MCP the audience is `Admin`.
- If you passed `only` to `offer()`, the tool is in the list.
- Through MCP, the tool has `mcp: true`, and the MCP server is on.
- For the `Admin` audience, the actor is an administrator and holds the right of the tool: the `resource` or `module` with the `access`. Through MCP, the token must cover that right too, so the right in force is the intersection of the rights of the administrator and the scopes of the token.

In short: the offer is the rights of the actor, limited by the audience.

- The rights are read from the database, not from a session, at each `offer()` and again at each `call()`. A right taken away stops the next call.
- An administrator who is logged in but talks to a `public` or `customer` usage is offered only the tools of that audience, never an administrator tool.
- A usage of the `System` audience is offered no tool.
- A tool that is not offered is answered like a tool that does not exist (`Unknown tool: <name>`). The caller cannot learn which names exist. Only the log tells the two cases apart (`denied` against `unknown_tool`).

## Using the registry in your own agent

Inject `AiToolRegistryInterface` next to the gateway. The usage that runs the agent has `AiAudience::Admin` here, so that an administrator is offered the administrator tools.

```php
use Thelia\Domain\Ai\AiActorResolverInterface;
use Thelia\Domain\Ai\AiAudience;
use Thelia\Domain\Ai\AiCapability;
use Thelia\Domain\Ai\AiGatewayInterface;
use Thelia\Domain\Ai\AiMessage;
use Thelia\Domain\Ai\AiRequest;
use Thelia\Domain\Ai\AiTier;
use Thelia\Domain\Ai\AiTransparency;
use Thelia\Domain\Ai\AsAiUsage;
use Thelia\Domain\Ai\Tool\AiToolContext;
use Thelia\Domain\Ai\Tool\AiToolRegistryInterface;

#[AsAiUsage(
    id: 'commerceagents.merchant_assistant',
    purpose: 'Answers an administrator about the catalogue and proposes changes.',
    audience: AiAudience::Admin,
    tier: AiTier::Fast,
    capabilities: [AiCapability::Tools],
    transparency: AiTransparency::Interactive,
)]
final readonly class MerchantAssistant
{
    public function __construct(
        private AiGatewayInterface $gateway,
        private AiToolRegistryInterface $tools,
        private AiActorResolverInterface $actors,
    ) {}

    public function answer(int $conversationId, string $question, string $locale): string
    {
        $offer = $this->tools->offer(
            new AiToolContext(
                actor: $this->actors->resolve(),   // the administrator who is logged in, never taken from the model
                usageId: 'commerceagents.merchant_assistant',
                correlationId: 'commerceagents.conversation.'.$conversationId,
                locale: $locale,
            ),
            only: ['commerceagents_search_products', 'commerceagents_update_price'],
        );

        $request = new AiRequest(
            usageId: 'commerceagents.merchant_assistant',
            messages: [AiMessage::user($question)],
            system: 'You assist the merchant of a Thelia shop. Changes are proposals the merchant approves.',
            tools: $offer->definitions,
            maxOutputTokens: 2048,
            correlationId: $offer->context->correlationId,
            actor: $offer->context->actor,
        );

        for ($turn = 1; $turn <= 6; ++$turn) {
            $response = $this->gateway->complete($request);

            if (!$response->hasToolCalls()) {
                return $response->text;
            }

            $request = $request->withMessages(
                AiMessage::fromResponse($response),
                ...$this->tools->answer($response->toolCalls, $offer->context),
            );
        }

        throw new \RuntimeException('The assistant needs more than 6 turns.');
    }
}
```

- `offer($context, $only)` returns an `AiToolOffer`: the `definitions` to give to `AiRequest::$tools`, the `context` to keep (it carries the list of the tools offered, frozen), and `lethalTrifecta` (see [Risks](#risks)).
- `answer($calls, $context)` runs the tool calls of a response and returns the messages to send back, one per call. Use it rather than a loop of `call()`: every call gets its result, as the providers require, even a call that is refused.
- `call($call, $context)` runs one call and returns an `AiToolResult` with the `status`, the `content`, the `approvalId` of a proposal and the `logId`.
- `describe()` lists the declared tools, for a screen or an audit.
- Take the actor from `AiActorResolverInterface`, never from what the model wrote. For a usage of the `Public` or `Customer` audience the resolver gives the logged-in customer or else the visitor, never an administrator.
- A context built with the public constructor is a context of the gateway: no token and no list of tools. `call()` or `answer()` on a context that did not come from `offer()`, or for a tool outside the list, answers `unknown_tool`.
- A tool call does not count as an AI usage and has no cost. The next turn of the model counts tokens, budget and rate as usual. The log of the gateway and the log of the tools share the `correlationId`, so you can join them.
- The usage must declare `AiCapability::Tools`, as for any tool.

### What the model gets back

| Status | What the model receives |
| --- | --- |
| `succeeded` | The array your tool returned (`{}` when empty). |
| `pending_approval` | `{"status":"pending_approval","approval_id":31,"summary":"…","expires_at":"…"}`. |
| `invalid_arguments` | `{"error":"invalid_arguments","details":["/limit: must be at most 20"]}`. |
| `unknown_tool` and `denied` | `{"error":"unknown_tool","message":"Unknown tool: <name>"}`, the same for both. |
| `limited` | `{"error":"limited","message":"Too many tool calls for this task, try again later."}`. |
| `result_too_large` | `{"error":"result_too_large","message":"Narrow the query or ask for fewer items."}`. |
| `failed` | `{"error":"failed","message":"<your AiToolFailedException message>"}`, or `"The tool failed."`. |

Limits on the gateway side:

- 8 tool calls are run per response. The following ones are answered `limited`.
- 50 tool calls per `correlationId` in a sliding window of 15 minutes. Without a `correlationId` the limit applies to the actor and the usage together. Always pass a `correlationId`.
- Bound the loop of your agent yourself, as in the example: the registry does not.

The result of a tool is delimited as untrusted content for the model, whatever the tool, because it can carry text written by a third party.

## Keeping a tool away from MCP

By default a tool is also offered to external clients over MCP. Set `mcp: false` when it makes no sense outside your own interface, for example a tool that opens a page of the back office in the browser of the person who is chatting.

```php
#[AsAiTool(
    name: 'commerceagents_open_admin_page',
    description: 'Opens a page of the back office for the person who is chatting.',
    resource: AdminResources::PRODUCT,
    access: AccessManager::VIEW,
    mcp: false,
)]
```

The tool stays available to your agent through the registry. Through MCP it is absent from `tools/list` and answered `Unknown tool` if called by name.

For the tools that are offered, the MCP client gets standard hints with each one: `readOnlyHint` is `true` for a read tool. `destructiveHint` is `true` for a tool with `access` `DELETE`. `openWorldHint` is `true` for a tool with the `external_communication` risk.

## Risks

A model that holds three things at once can be turned against the shop by a text it reads: access to private data, exposure to text a third party wrote, and a way to send something out. The `risks` of a tool say which of the three it brings:

| `AiToolRisk` | The tool |
| --- | --- |
| `PrivateData` | Returns data that is not public: stock, purchase prices, customers, orders. |
| `UntrustedContent` | Returns text a third party wrote: reviews, web pages, messages. |
| `ExternalCommunication` | Sends something out of the shop: an e-mail, a message, a request to another system. |

Declare the risks honestly. `AiToolOffer::$lethalTrifecta` is `true` when the tools of the offer together cover the three. The core signals the combination in the back office (the Tools together column of the Usages tab, the Trifecta column of the MCP tokens tab) and never blocks it. The protection that remains is the approval of every change by a person.

If your agent has such an offer, narrow it with `only`, or accept that every proposal must be read with care.

## What stays local to your module

The registry works on the data of the shop, with the rights of an administrator, and public reads without personal data. It has no direct write.

A tool that acts for the person who talks to the agent (add to the cart, a wish list, subscribe a visitor to the newsletter, prepare an order) stays in your module. Run it yourself with the real session of the visitor, like the `read_url` tool in [Calling an AI model from a module](./ai.md#tools). The gateway never runs a tool, so nothing obliges you to go through the registry.

## Tools of the core

The core ships two tools to try the mechanism, both guarded by the right on products:

- `thelia_search_products` reads the catalogue.
- `thelia_update_product_price` proposes a new price, applied after approval.

## What is logged

- Each call writes a row in `ai_tool_call_log`: tool, effect (read or write), channel, status, actor (the identifier in clear for an administrator, a hash for a customer or a visitor), token, `correlationId`, size and latency. The arguments are kept for 30 days, then purged.
- Each proposal is a row in `ai_tool_approval` with its decision, the administrator who decided and the reason of a failure. A proposal that was never decided expires.
- The decision of an administrator writes a line in the log of the back office.
