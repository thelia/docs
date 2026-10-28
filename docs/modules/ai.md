---
title: Calling an AI model
sidebar_position: 10
---

# Calling an AI model from a module

Added in Thelia 3.3.

A module that needs a language model does not talk to a provider. It declares what it uses the model for, then sends its requests to a single gateway in the core. The merchant chooses the providers, the models and the budgets; the core applies them, counts what each call costs and writes a log row for every call.

All the types below live in `Thelia\Domain\Ai`. None of them exposes a type of the library that talks to the providers, so a module written against this page does not depend on that library.

This page is for module developers. The merchant side, including what the AI Act asks of a shop, is in [AI and the AI Act](../features/ai-act.md).

## What the core does for you

| Concern | What the core does |
| --- | --- |
| Provider and model | The module asks for a range (`fast`, `standard` or `advanced`) and the capabilities it needs. The merchant assigns one model to each range. A module never names a model. |
| Rate | Requests are counted per actor (administrator, customer, visitor, system) against the limits of the usage. |
| Budget | Before the call, the cost the call can reach is reserved against the monthly budget of the usage and the global monthly cap of the shop. A call that would cross either is refused. |
| Log | One row in `ai_usage_log` per call, refusals included: usage, connection, model, tokens, cost, hashed actor, status, latency, the verdict of every check. The prompt is not stored unless the merchant turns that on for the usage. |
| Cut-off | A usage the merchant turned off, or the global switch, makes the call fail with `InactiveAiUsageException`. |
| Untrusted data | What you pass as untrusted content, and every tool result, is wrapped in delimiters that name its source and tell the model it is data. |
| Output | A structured answer is decoded and checked against your schema before you get it. HTML in a field marked `"contentMediaType": "text/html"` is reduced to the allowed elements. |
| Retries | None. The gateway never retries and never runs a tool: both are yours. |

The checks that always apply are named `limits`, `rate_limit`, `budget`, `untrusted_content`, `output_schema` and `html_sanitizer` (`CoreGuardrail`). They cannot be turned off, and they do not go in the `guardrails` list of a usage.

## Declaring a usage

A usage is the unit the merchant switches on, budgets and audits. Put `#[AsAiUsage]` on the service class that calls the gateway, once per usage (the attribute is repeatable).

```php
use Thelia\Domain\Ai\AiAudience;
use Thelia\Domain\Ai\AiCapability;
use Thelia\Domain\Ai\AiTier;
use Thelia\Domain\Ai\AiTransparency;
use Thelia\Domain\Ai\AsAiUsage;
use Thelia\Domain\Ai\Guardrail\GuardrailMode;

#[AsAiUsage(
    id: 'commerceagents.shopping_assistant',
    purpose: 'Answers the questions of visitors about the catalogue.',
    audience: AiAudience::Public,
    tier: AiTier::Fast,
    capabilities: [AiCapability::Tools, AiCapability::Streaming],
    transparency: AiTransparency::Interactive,
    guardrails: ['mistral_moderation' => GuardrailMode::Block],
    maxInputCharacters: 2000,
)]
final readonly class ShoppingAssistant
{
    // ...
}
```

| Argument | Meaning |
| --- | --- |
| `id` | `<module>.<purpose>`, lower case, unique in the shop. Each part starts with a letter and holds letters, digits and `_`; the module part is 55 characters at most and the purpose 72. By convention the first part is the module code in lower case. |
| `purpose` | One sentence saying what the usage does. It is shown in the register of AI usages. |
| `audience` | Who the usage answers to: `Public` (anonymous visitors), `Customer`, `Admin` or `System` (jobs and commands). |
| `tier` | The range of model: `Fast`, `Standard` or `Advanced`. |
| `capabilities` | What the model must be able to do: `StructuredOutput`, `Tools`, `Vision`, `Streaming`. The model assigned to the range must have all of them, or the usage is inactive. A request can only use the capabilities its usage declared. |
| `transparency` | `None`, `Interactive` (a person talks with the model) or `Generative` (the module publishes what the model writes). See [Showing that an AI is involved](#showing-that-an-ai-is-involved). |
| `guardrails` | Optional checks by name, each with its default mode: `Block` stops the call, `Annotate` writes the failure to the log and returns it in the response. The merchant can change the mode. |
| `maxInputCharacters` | The default size limit of what a person types (the last user message), in characters. The merchant can change it. `null` means no limit of its own. |

Two audiences carry a rule: a `Public` usage stays inactive until the merchant gives it a monthly budget above zero, so a chat open to anonymous visitors never spends money by surprise.

The module skeleton loads the classes of a module with `autoconfigure(true)`, and the core reads the attribute on every autoconfigured service, so a module needs no extra registration. A usage the module declares appears in the register of AI usages of the back office.

```php
use Thelia\Domain\Ai\AiUsageRegistryInterface;

if (!$registry->isActive('commerceagents.shopping_assistant')) {
    return; // do not render the chat widget
}
```

`isActive()` tells whether a request would pass the settings now: the usage is on, a model with the right capabilities is assigned to its range, a public usage has a budget, and the budget is not spent. Use it to hide a feature. The gateway checks again at every call, so it is a convenience, not a guard. `get($usageId)` returns the declaration and `all()` lists every declared usage.

## Sending a request

Inject `AiGatewayInterface`. `complete()` returns the whole answer.

```php
use Thelia\Domain\Ai\AiGatewayInterface;
use Thelia\Domain\Ai\AiMessage;
use Thelia\Domain\Ai\AiRequest;

$response = $this->gateway->complete(new AiRequest(
    usageId: 'theliacms.text',
    messages: [AiMessage::user($brief)],
    system: 'You write short texts for a Thelia shop.',
    maxOutputTokens: 800,
    correlationId: 'theliacms.text.'.$jobId,
));

$response->text;          // the answer
$response->finishReason;  // AiFinishReason::Completed, MaxTokens, ToolCalls, ContentFilter or Other
$response->cost;          // '0.00006968', a decimal string
$response->currency;      // 'USD'
$response->logId;         // the row of ai_usage_log
```

Everything in `AiRequest` except `usageId` and `messages` is optional.

| Argument | Meaning |
| --- | --- |
| `usageId` | A usage your module declared. |
| `messages` | The conversation. It holds at least one message and the last one is a user message or a tool result. |
| `system` | Your instructions. Never put in it something a person typed. |
| `untrustedContents` | Data to read, never to obey (see [Untrusted content](#untrusted-content)). |
| `outputSchema` | A JSON schema the answer must follow (see [Structured output](#structured-output)). |
| `tools` | Tools your module runs itself (see [Tools](#tools)). |
| `maxOutputTokens` | Between 1 and 1 000 000, and below the limit of the usage. `null` takes the limit of the usage. |
| `providerOptions` | Native options of one provider (see [Provider options](#provider-options)). |
| `correlationId` | Groups the turns of one task in the log. 64 characters at most, letters, digits and `. _ : -`. |
| `actor` | Who the call is made for. Leave it `null`: the gateway finds the logged-in administrator, then the customer, then the visitor by session or IP address, and the system in a command or a worker. It never assumes an HTTP request exists. Set it only to speak for someone else, with `AiActor::admin($id)`, `customer($id)`, `visitor($sessionOrIp)` or `system('process')`. |

A request that asks for something its usage did not declare (tools, a schema, a stream) fails with `AiUsageViolationException`. An invalid value fails at construction with `InvalidAiArgumentException`. Both are bugs of the module, not conditions to handle at run time.

If `finishReason` is `MaxTokens`, the text or the structured data may be cut short.

A guardrail in `Annotate` mode does not stop the call. `$response->annotations()` returns the checks that failed, in case you want to show or review them.

### Streaming

`stream()` returns the answer as it is produced.

```php
use Thelia\Domain\Ai\Stream\StreamCompleted;
use Thelia\Domain\Ai\Stream\TextDelta;
use Thelia\Domain\Ai\Stream\ToolCallReceived;

foreach ($this->gateway->stream($request) as $event) {
    match (true) {
        $event instanceof TextDelta => $sse->send('delta', $event->text),
        $event instanceof ToolCallReceived => $this->pending->add($conversationId, $event->toolCall),
        $event instanceof StreamCompleted => $sse->send('done', ['log' => $event->response->logId]),
        default => null,
    };
}
```

- The last event is `StreamCompleted`. Its `response` is what `complete()` would have returned, with tokens, cost and log row.
- Ignore an event you do not know. The list of events can grow in 3.x, which is why the `match` ends with `default => null`.
- The checks run when the iteration starts, so the exceptions of `complete()` come from the first iteration, not from the call to `stream()`.
- The log row is written when the stream ends. If you stop iterating before the end, the row is written anyway, with the status `aborted` and the tokens known at that moment.
- Output guardrails run on the whole text, at the end. A delta already sent cannot be taken back, so on a stream they can annotate but not block. A blocking input check works as usual.

## Untrusted content

Text that a third party wrote can contain instructions aimed at the model: a web page, a review, a competitor listing. Never paste it in `system` or in a user message. Pass it as `UntrustedContent`; the gateway wraps it in delimiters naming its source and tells the model it is data.

```php
use Thelia\Domain\Ai\UntrustedContent;
use Thelia\Domain\Ai\UntrustedSource;

new AiRequest(
    usageId: 'theliacms.page_generation',
    messages: [AiMessage::user($brief)],
    untrustedContents: [
        new UntrustedContent(UntrustedSource::WebPage, $pageText, $pageUrl),
    ],
    // ...
);
```

| Source | For |
| --- | --- |
| `WebPage` | A page read on the web. |
| `VisitorInput` | Text a visitor or customer typed: a review, a message, a search. |
| `CompetitorOffer` | An offer of a competitor: title, description, seller. |
| `Document` | A file or a message received from a third party. |

`reference` says where the content comes from (a URL, an offer identifier) for the model and for the log. It holds 1 to 2048 bytes and never a person's name or email address.

Two cases are already covered. The last user message of a `Public` or `Customer` usage is treated as untrusted input, with its size limit and the optional moderation. Every tool result is delimited as untrusted too, whatever the tool, because it can carry text from a third party.

## Structured output

Give an `AiOutputSchema` to get an array instead of free text.

```php
use Thelia\Domain\Ai\AiOutputSchema;

new AiRequest(
    // ...
    outputSchema: new AiOutputSchema('cms_page', [
        'type' => 'object',
        'properties' => [
            'title' => ['type' => 'string'],
            'body' => ['type' => 'string', 'contentMediaType' => 'text/html'],
        ],
        'required' => ['title', 'body'],
    ]),
);
```

- The usage must declare `AiCapability::StructuredOutput`.
- The schema has `"type": "object"` at its root. The name starts with a letter and holds letters, digits, `_` and `-`, 64 characters at most.
- `$response->data` holds the decoded answer, already checked against the schema.
- A field marked `"contentMediaType": "text/html"` is sanitized by the core. A module that already sanitizes can keep doing so on top.

## Tools

A tool is a function of your module that the model can ask you to run. The gateway only describes it: it does not run it.

```php
use Thelia\Domain\Ai\AiToolCall;
use Thelia\Domain\Ai\AiToolDefinition;

$tools = [
    new AiToolDefinition(
        'list_categories',
        'Lists the categories of the catalogue with their URL.',
        ['type' => 'object', 'properties' => ['limit' => ['type' => 'integer']]],
    ),
];
```

The usage must declare `AiCapability::Tools`. Tool names are unique in a request. The input schema has `"type": "object"` at its root.

When the model wants a tool, the response has `hasToolCalls()` true and `finishReason` is `ToolCalls`. You run each `AiToolCall`, then ask again with the assistant message and the results, under the same `correlationId` so the log groups the turns.

```php
for ($turn = 1; $turn <= 12; ++$turn) {
    $response = $this->gateway->complete($request);

    if (!$response->hasToolCalls()) {
        return $response->data;
    }

    $results = array_map(
        fn (AiToolCall $call): AiMessage => AiMessage::toolResult($call->id, $this->tools->run($call)),
        $response->toolCalls,
    );
    $request = $request->withMessages(AiMessage::fromResponse($response), ...$results);
}

throw new \RuntimeException('The task needs more than 12 turns.');
```

- Bound the loop yourself, as above. The gateway does not.
- `AiMessage::fromResponse($response)` builds the assistant message from the response, tool calls included. Use it rather than `AiMessage::assistant()`: it also carries `providerState`, an opaque value some providers need back on the next turn (signed reasoning blocks, container identifiers). Do not read it or change it.
- `AiMessage::toolResult($toolCallId, $result)` takes a string or an array; an array is encoded as JSON. Each result answers a tool call of an earlier assistant message, or the request is refused.
- `$call->arguments` is what the model wrote. Validate it against the input schema of the tool before you use it.
- By default the adapter places a cache point at the end of `system` and on the last message, for the providers that support one, so that the next turns of a loop read the start of the conversation from the cache.

To let the model read a URL, write a local tool that fetches the page with the shop's HTTP client, and send the page back as a tool result, or pass it as `UntrustedContent(UntrustedSource::WebPage, …)`. This works with every provider and does not depend on a tool the provider would run on its side.

## Provider options

`providerOptions` passes native options to one provider, keyed by the provider name (a value of `AiProvider`: `mistral`, `anthropic`, `openai`, `openai_compatible`, `scaleway`, `ovhcloud`, `albert`, `ollama`, `thelia_ai`).

```php
providerOptions: ['anthropic' => ['effort' => 'high']],
```

The options are applied only when the connection resolved for the request is of that provider. With a Mistral connection, the `anthropic` entry is not sent.

This is a way out that nothing governs. The usage does not declare it, the core does not check it, and a tool the provider runs on its side (a web plugin, for instance) costs no more in the log than what the provider announces. Prefer the declared features whenever one fits.

## Costs outside the gateway

A module can pay a service that is not a language model: a scoring API, a search API. To make the budget of the usage and the log count it, use `AiCostRecorderInterface`. Ask before the call, record after.

```php
use Thelia\Domain\Ai\AiActor;
use Thelia\Domain\Ai\AiCostRecorderInterface;
use Thelia\Domain\Ai\AiExternalCost;
use Thelia\Domain\Ai\AiJurisdiction;
use Thelia\Domain\Ai\AiTokenUsage;

$this->costs->authorize('pricewatch.offer_judgement', 'typesafe', AiJurisdiction::OutsideEuropeanUnion, '0.001');

$started = hrtime(true);
$result = $this->client->judge($offer);

$this->costs->record(new AiExternalCost(
    usageId: 'pricewatch.offer_judgement',
    provider: 'typesafe',
    operation: 'jev-latest',
    cost: sprintf('%.8F', $result->costUsd),
    tokenUsage: new AiTokenUsage($result->inputTokens, 0),
    latencyMilliseconds: intdiv(hrtime(true) - $started, 1_000_000),
    correlationId: 'pricewatch.collect.'.$runId,
    actor: AiActor::system('pricewatch:collect'),
));
```

- `authorize()` checks what the gateway checks before its own calls: the usage exists and is active, the service passes the optional "EU only" setting, and the budget of the usage and the global cap are not reached. `$maximumCost` is the highest cost the call can reach, a positive decimal with a point; it counts as already spent, so a call that would cross the budget is refused before it runs. The default `'0'` only checks that the budget is not reached yet.
- `record()` returns the identifier of the log row. It never fails because of the budget: the cost counts from the moment it is written.
- `cost` is a decimal string such as `0.00009870`: up to 8 digits before the point and 8 after. Convert a float with `sprintf('%.8F', $amount)`. `(string) 1.2E-7` is not a decimal and is refused.
- `provider` is lower case, 32 characters at most. `currency` defaults to `USD` and is an uppercase ISO code. `status` is `Succeeded` by default; `Failed` is allowed, the statuses the gateway owns are not.
- A usage that only does this still needs its `#[AsAiUsage]`, as `AiAudience::System` for example.

## Exceptions

All of them implement `Thelia\Domain\Ai\Exception\AiExceptionInterface`. Catch the interface to degrade a feature whatever goes wrong, or the classes below to react.

| Exception | Raised when | What the module does |
| --- | --- | --- |
| `InactiveAiUsageException` | The usage is off, the global switch is off, a public usage has no budget, or no assigned model has the capabilities it needs. | Hide the feature. Asking again will not help. |
| `AiBudgetExceededException` | The budget of the usage or the global monthly cap is reached (`globalCap` tells which). | Hide the feature until next month or until the merchant raises the budget. |
| `AiRateLimitExceededException` | The actor sent too many requests. `retryAfter` may hold the time to wait. | Ask the person to try again later. |
| `AiGuardrailBlockedException` | A guardrail in `Block` mode refused the request or the answer. `verdict` says which and why; `logId` is set when the call was already paid. | Show a generic refusal. Never show `verdict->reason` to a visitor: it is for the log. |
| `AiJurisdictionRefusedException` | Only when the merchant turned on "EU only", and the connection or service is outside the EU. | Point to the setting in the back office. |
| `AiProviderUnavailableException` | The provider did not answer or answered an error. `retryable` is true for a timeout, an overload or a 5xx. `logId` is set when the call was already logged. | Retry only if `retryable`. The gateway does not retry. There is no automatic switch to another connection. |
| `UnknownAiUsageException`, `AiUsageViolationException`, `InvalidAiArgumentException` | A usage that is not declared, a request outside its declaration, an invalid value. | These are bugs. Do not catch them. |

A refused call still writes a row in the log, with the status `rejected` or `blocked` and a cost of zero.

## Showing that an AI is involved

The EU AI Act asks a shop to tell people when they talk with an AI and to mark generated content. The core provides the tools, turns them on by default and never blocks a usage; your module declares which duty applies and uses the tools.

**`AiTransparency::Interactive`**: a person talks with the model. Show the notice before the person writes, on every state of your interface.

```php
$notice = $registry->transparencyNotice('commerceagents.shopping_assistant');

if (null !== $notice) {
    // render it above the input
}
```

`transparencyNotice($usageId, $locale = null)` returns the translated text, in the current locale when `$locale` is `null`, or `null` when the usage is not interactive or the merchant turned the notice off: show nothing then.

<!-- TODO écran : the Twig function and the Flexy component that render this notice are not delivered yet; add their names and one example once they are. -->

**`AiTransparency::Generative`**: the module publishes what the model writes. Each response carries a provenance mark, unless the merchant turned it off.

```php
$provenance = $response->provenance?->toArray();
// ['ai_generated' => true, 'usage' => 'theliacms.page_generation', 'model' => '…',
//  'generated_at' => '2026-10-28T10:15:00+01:00', 'log_id' => 9002]
```

Store the array with the content, and expose it as machine-readable metadata wherever the content is shown. `provenance` is `null` when the merchant turned the mark off for the usage.

**`AiTransparency::None`** is for an internal job or an administrator tool that publishes nothing. A `Public` or `Customer` usage that declares `None` is shown in the register as to be reviewed, because the declaration does not say whether people talk with it.

`AiUsageRegistryInterface::compliance($usageId)` returns the status of each duty of the usage: the obligation (`article_50_1` or `article_50_2`), the state (`met`, `not_met` or `to_review`) and a translatable message. It is informative: a usage that is not compliant still runs.

## Testing

`AiResponse` is built by the gateway. A module builds one only in a test double of the gateway, and its constructor validates its arguments the same way: the cost is a decimal string, `logId` is at least 1, a response that stops for tool calls holds at least one.

## What the core guarantees, and what stays with you

| The core | Your module |
| --- | --- |
| Refuses a call outside the budget, the rate or the size limit of the usage. | Handles the refusal and hides or degrades the feature. |
| Wraps untrusted content and tool results in delimiters. | Puts third-party text in `untrustedContents`, never in `system`. |
| Checks a structured answer against the schema and sanitizes marked HTML. | Validates tool arguments, and sanitizes HTML outside the marked fields. |
| Writes one row per call, with a hashed actor and no prompt by default. | Does not store prompts or personal data elsewhere without a reason. |
| Provides the notice and the provenance mark. | Shows the notice and stores and exposes the mark. |
| Does not run tools and does not retry. | Runs tools with the rights of the actor, bounds the loop and decides whether to retry. |
