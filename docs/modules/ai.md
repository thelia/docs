---
title: Calling an AI model
sidebar_position: 10
---

# Calling an AI model from a module

Added in Thelia 3.3.

A module that needs a language model does not talk to a provider. It declares what it uses the model for, then sends its requests to a single gateway in the core. The merchant chooses the providers, the models and the budgets; the core applies them, counts what each call costs and writes a log row for every call.

All the types below live in `Thelia\Domain\Ai`. None of them exposes a type of the library that talks to the providers, so a module written against this page does not depend on that library.

This page is for module developers. Two companion pages complete it:

- [Giving tools to an AI](./ai-tools.md): tools a model or an external client can use, with approval by an administrator.
- For the merchant side, see [AI settings and MCP](../features/ai-settings.md) and, for what the AI Act asks of a shop, [AI and the AI Act](../features/ai-act.md).

## What the core does for you

| Concern | What the core does |
| --- | --- |
| Provider and model | The module declares a range (`fast`, `standard` or `advanced`) and the capabilities it needs. The merchant assigns one model to each range, and can choose another range for a usage (see [The merchant can change the range](#the-merchant-can-change-the-range)). A module never names a model. |
| Rate | Requests are counted per actor (administrator, customer, visitor, system) against the limits of the usage. |
| Budget | Before the call, the cost the call can reach is reserved against the monthly budget of the usage and the global monthly cap of the shop. A call that would cross either is refused. |
| Log | One row in `ai_usage_log` per call, refusals included: usage, connection, model, tokens, cost, hashed actor, status, latency, the verdict of every check. The prompt is not stored unless the merchant turns that on for the usage. |
| Cut-off | A usage the merchant turned off, or the global switch, makes the call fail with `InactiveAiUsageException`. |
| Untrusted data | What you pass as untrusted content, and every tool result, is wrapped in delimiters that name its source and tell the model it is data. |
| Output | A structured answer is decoded and checked against your schema before you get it. HTML in a field marked `"contentMediaType": "text/html"` is reduced to the allowed elements. |
| Retries | One retry, before the first byte of the answer has arrived. After that the gateway never replays a request, because a second call would be paid twice. It never runs a tool: that is yours. |

The checks that always apply are named `limits`, `rate_limit`, `budget`, `untrusted_content`, `output_schema` and `html_sanitizer` (`CoreGuardrail`). They cannot be turned off, and they do not go in the `guardrails` list of a usage. The optional checks are described in [Guardrails](#guardrails).

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
| `guardrails` | Optional checks by name, each with its default mode: `Block` stops the call, `Annotate` writes the failure to the log and returns it in the response. The merchant can change the mode through the admin API. |
| `maxInputCharacters` | The default size limit of what a person types (the last user message), in characters. The merchant can change it through the admin API. `null` means no limit of its own. |

A `Public` usage carries one more rule: it stays inactive until the merchant gives it a monthly budget above zero, so a chat open to anonymous visitors never spends money by surprise.

### The merchant can change the range

The `tier` you declare is a default. In the back office the merchant can pick another range for the usage, for example `advanced` for a writing tool that gave poor results on `fast`. Your code does not change: the gateway resolves the range at each call, from the choice of the merchant or else from your declaration.

- `$registry->get($usageId)->tier` is still the range you declared. The register of usages (`thelia:ai:usages`, the back office, the API) shows both: `tier` is the range in force and `declared_tier` the one of the module.
- The model of the range the merchant picks must have every capability the usage declares (tools, structured output, streaming). If it has not, the usage is inactive: `isActive()` returns `false` and a call fails with `InactiveAiUsageException`. This is one more reason to declare only the capabilities you use.
- A merchant who picks the declared range keeps it even if a later version of your module declares another. Choosing the empty option goes back to following the declaration.

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
| `actor` | Who the call is made for. Leave it `null`: the gateway finds the logged-in administrator, then the customer, then the visitor by session or IP address, and the system in a command or a worker. It never assumes an HTTP request exists. For a `Public` or `Customer` usage it takes the logged-in customer, or else the visitor, and never an administrator, even if one is logged in. Set it only to speak for someone else, with `AiActor::admin($id)`, `customer($id)`, `visitor($sessionOrIp)` or `system('process')`. |

A request that asks for something its usage did not declare (tools, a schema, a stream) fails with `AiUsageViolationException`. An invalid value fails at construction with `InvalidAiArgumentException`. Both are bugs of the module, not conditions to handle at run time.

If `finishReason` is `MaxTokens`, the answer reached the output limit. The call does not fail: you get the partial text, the tokens are counted and logged, and `complete` is true. A structured answer cut short does not pass the schema check, and the verdict reason is `truncated`. Raise `maxOutputTokens` or ask for less.

A guardrail in `Annotate` mode does not stop the call. `$response->annotations()` returns the checks that failed, in case you want to show or review them.

### Refusals and the provider request id

A provider can refuse to answer. Anthropic does it with a normal response (HTTP 200) and an empty content; an OpenAI-compatible provider does it with `finish_reason: content_filter` or a `refusal` text. The gateway does not turn this into an exception. You get a response with `finishReason` set to `AiFinishReason::ContentFilter`, an empty `text`, `data` set to `null`, and the tokens the provider counted, which are logged.

```php
use Thelia\Domain\Ai\AiFinishReason;

$response = $this->gateway->complete($request);

if (AiFinishReason::ContentFilter === $response->finishReason) {
    // Nothing usable came back. Do not read $response->text or $response->data.
    $this->logger->notice('The provider refused a request.', [
        'usage' => $request->usageId,
        'category' => $response->refusalCategory,   // e.g. 'cyber' with Anthropic, null when the provider gives none
        'detail' => $response->refusalDetail,       // the provider's own wording, not translated
        'provider_request_id' => $response->providerRequestId,
    ]);

    return null; // degrade the feature: show a generic "I cannot help with this"
}
```

- `refusalCategory` and `refusalDetail` come from the provider (Anthropic `stop_details`, the `refusal` text of OpenAI). Both are `null` for any other answer, and on a stream. Mistral and Ollama document no refusal, so a refusal from them is not mapped.
- A refusal is not a broken JSON answer: when the request has an `outputSchema`, the schema check does not judge a `ContentFilter` response.
- Treat `refusalDetail` like any text from a third party. Log it, do not show it to a visitor.
- `providerRequestId` is the identifier the provider gave to the call: the `request-id` or `x-request-id` header, else the `id` of the body. On a stream only the header is read. It is `null` when the provider gives none (Ollama). It is also written in `ai_usage_log.provider_request_id`, so you can quote it to the provider's support for a given row of the log.

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

## Guardrails

A usage can list optional checks in `guardrails`, each with a default mode. The merchant can change the mode on the edit page of the usage (section Safety checks: Follow the module, Block the request, Let it through and note it, Not applied), or through the admin API (`/api/admin/ai/usage-settings`).

| Name | What it does |
| --- | --- |
| `mistral_moderation` | Sends the text a person typed to the Mistral moderation model. Only the safety categories block (`sexual`, `hate_and_discrimination`, `violence_and_threats`, `dangerous`, `criminal`, `selfharm`, `jailbreaking`). The categories of advice (`health`, `financial`, `law`, `pii`) and any unknown category are noted in the verdict and do not block. The list is the parameter `thelia.ai.moderation.mistral_blocking_categories`. |
| `openai_moderation` | The same, with the OpenAI moderation model. |
| `topic` | A judge of the fast range that tells whether what a visitor wrote stays on the subject of the usage, which is its `purpose`. It reads the input only, so an off-topic message is stopped before the paid call. The judge is itself a usage of the core, `core.guardrail_topic`: it counts against the budget and appears in the log and the register. It is a model, so it can be fooled. |

The moderation models read only the text typed by a person, never your `system` text or a tool result. A guardrail never receives the actor in clear, only a hashed identifier. The model names are the parameters `thelia.ai.moderation.mistral_model` and `thelia.ai.moderation.openai_model`.

A guardrail that is missing, has no usable connection, or fails gives a verdict `unavailable` or `guardrail_error`. In `Block` mode the call is refused; in `Annotate` mode it goes on and the verdict is logged.

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

This section covers a tool your module runs itself, with its own session. To expose the data of the shop (and changes that an administrator approves) to your own agent or to an external client, declare the tool with `#[AsAiTool]` instead: see [Giving tools to an AI](./ai-tools.md).

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

With Anthropic, reasoning is off by default: when the request has no `thinking` option, the adapter sends `thinking: {type: disabled}`. Some models otherwise reason on their own and spend the whole `maxOutputTokens` without writing any text. To ask for reasoning, use the adaptive mode and an effort:

```php
providerOptions: ['anthropic' => ['thinking' => ['type' => 'adaptive'], 'effort' => 'medium']],
```

The `enabled` mode with `budget_tokens` is refused by recent models.

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
| `AiKeyDecryptionException` | The API key of the connection was saved with another application secret and cannot be read. | Tell an administrator to enter the key again in the connection. |
| `AiProviderUnavailableException` | The provider did not answer or answered an error. `retryable` is true for a timeout, an overload or a 5xx. `logId` is set when the call was already logged. | Retry only if `retryable`. The gateway already retried once before the first byte; it never retries after that. There is no automatic switch to another connection. |
| `UnknownAiUsageException`, `AiUsageViolationException`, `InvalidAiArgumentException` | A usage that is not declared, a request outside its declaration, an invalid value. | These are bugs. Do not catch them. |

A refused call writes a row in the log, with the status `rejected` or `blocked` and a cost of zero. The reason is one of `rate_limit`, `budget`, `budget_global` or `jurisdiction`; an input over the size limit is `blocked` with the reason `input_too_long`. The exception is a call to a usage that is unknown, inactive or badly declared: it is not logged, because it is a bug of the module or a switch the merchant turned, not a call.

### Showing a failure to a person

The messages of these exceptions are English, written for the log and the developer. To show a failure on a screen or in a mail, use `AiFailureExplainer::explain()`. It returns a plain sentence in the language asked, for example "The monthly budget of this usage is used up." It works without a request (console, queue worker): the language is the one you pass, else the one of the visitor, else the one of the shop.

```php
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Thelia\Domain\Ai\AiGatewayInterface;
use Thelia\Domain\Ai\AiMessage;
use Thelia\Domain\Ai\AiRequest;
use Thelia\Domain\Ai\Exception\AiExceptionInterface;
use Thelia\Domain\Ai\Service\AiFailureExplainer;

final readonly class SuggestTitleController
{
    public function __construct(private AiGatewayInterface $gateway, private AiFailureExplainer $failures) {}

    #[Route('/admin/module/theliacms/suggest-title', name: 'theliacms.suggest_title', methods: ['POST'])]
    public function __invoke(Request $request): JsonResponse
    {
        try {
            $response = $this->gateway->complete(new AiRequest(
                usageId: 'theliacms.text',
                messages: [AiMessage::user($request->request->getString('brief'))],
                maxOutputTokens: 200,
            ));
        } catch (AiExceptionInterface $failure) {
            return new JsonResponse(
                ['error' => $this->failures->explain($failure, $request->getLocale())],
                Response::HTTP_SERVICE_UNAVAILABLE,
            );
        }

        return new JsonResponse(['title' => $response->text]);
    }
}
```

- The sentences exist in French and English. With any other language the English sentence is shown.
- A failure the explainer has no sentence for comes back with its own message. That includes the refusals of a value that carry a variable part ("must be one of …", "must be a positive number") and the error stored by a connection test: they stay in English.
- The sentences name the connection and tell an administrator what to check (the key, the model, the address). Use them in an administration screen. For a visitor, write your own generic message, as in the table above.
- Nothing the provider wrote and no key is part of a sentence.

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

In a Twig template, use `ai_transparency_notice(usageId[, locale])`. It returns the escaped text, or an empty string when there is nothing to show (not interactive, usage inactive, notice turned off). An unknown usage identifier throws, so a typo is not a silent missing notice. In PHP, `transparencyNotice()` returns `null` in the same cases and throws `UnknownAiUsageException` for an unknown usage.

```twig
{% set notice = ai_transparency_notice('commerceagents.shopping_assistant') %}
{% if notice %}
    <p class="ai-notice">{{ notice }}</p>
{% endif %}
```

The Flexy theme has a component that does this for you. It arrives with Thelia 3.3, in the Flexy theme of the same version. Include it once, above the first message:

```twig
<twig:Molecules:AiNotice:Base usage="commerceagents.shopping_assistant" />
```

- It takes the identifier of the usage, and an optional `locale` (the language of the request, then of the shop, by default).
- It holds no setting and no rule: whether a notice is due, and its text, come from `ai_transparency_notice()`. It renders nothing when the usage is not interactive, is inactive, or when the merchant turned the notice off.
- An identifier the core does not know throws, so a typo is not a silent missing notice.
- Extra attributes (`class`, `id`) go on the notice. It is a polite live region (`role="status"`), so a screen reader announces it when it is inserted.
- The English text reads "You are talking with an AI assistant. Its answers can contain mistakes."

It renders the notice as the informative message of the design system (the `Molecules:SnackBar:Base` component, with its icon), so it looks the same as the other messages of the theme.

**`AiTransparency::Generative`**: the module publishes what the model writes. Each response carries a provenance mark, unless the merchant turned it off.

```php
$provenance = $response->provenance?->toArray();
// ['ai_generated' => true, 'usage' => 'theliacms.page_generation', 'model' => '…',
//  'generated_at' => '2026-10-28T10:15:00+01:00', 'log_id' => 9002]
```

Store the array (or its JSON) with the content, and expose it as machine-readable metadata wherever the content is shown. `provenance` is `null` when the merchant turned the mark off for the usage. `AiProvenance::fromStored()` reads a stored array or JSON back and returns `null` if it is invalid.

Two Twig functions take what you stored, as an array, as JSON or as an `AiProvenance`, and return an empty string if it is not a valid mark:

- `ai_provenance_attributes(mark)` returns the attributes `data-ai-generated="true" data-ai-usage data-ai-model data-ai-generated-at`, already escaped.
- `ai_provenance_label(mark[, locale])` returns a sentence for people, such as "Content generated by an AI (model) on 2026-10-28."

```twig
<article {{ ai_provenance_attributes(page.aiProvenance) }}>
    {{ page.body|raw }}
    <small>{{ ai_provenance_label(page.aiProvenance) }}</small>
</article>
```

The `data-*` form is the choice of Thelia, not a format fixed by the regulation. Check the current guidance before you rely on it. This is not legal advice.

**`AiTransparency::None`** is for an internal job or an administrator tool that publishes nothing. A `Public` or `Customer` usage that declares `None` is shown in the register as to be reviewed, because the declaration does not say whether people talk with it.

`AiUsageRegistryInterface::compliance($usageId)` returns the status of each duty of the usage: the obligation (`article_50_1` or `article_50_2`), the state (`met`, `not_met` or `to_review`) and a translatable message. It is informative: a usage that is not compliant still runs. When a duty is not met, the status carries a `reason` (`notice_turned_off`, `mark_turned_off` or `no_duty_declared`), and `translate()` gives a message in plain words.

The register is also available in the console, for a script or an audit:

```bash
bin/console thelia:ai:usages --format=table   # or json, or csv; add --locale=fr_FR
```

The CSV output is protected against formula injection.

## Settings written from a module

A module that had its own provider settings before 3.3 (a key, a model, a budget) can move them to the settings of the core. Use `Thelia\Domain\Ai\Service\AiSettingsWriter` rather than the Propel models: it is the one door the back office and the admin API use, so a rule is written once, the API key goes through the vault that encrypts it, and a refusal is an `AiExceptionInterface` whose message says what to fix. Nothing is saved when one is raised.

| Method | What it writes |
| --- | --- |
| `saveConnection()` | A connection to a provider. Pass `null` to create one, or the existing `AiConnection` to update it. A blank `$apiKey` keeps the stored key. |
| `assignTier()` | The model of a range. A range has one assignment: pass the one it has to change it. |
| `saveUsageSetting()` | What the merchant decided for a usage: switch, range, budget, limits, pinned model, guardrail modes, notice, mark, prompt storage. |
| `setEnabled()`, `setMonthlyCap()`, `setEuropeanUnionOnly()` | The global switch, the monthly cap of the whole shop (a decimal string, `'0'` for none) and the "EU only" option. |

```php
use Propel\Runtime\ActiveQuery\Criteria;
use Thelia\Domain\Ai\Exception\AiExceptionInterface;
use Thelia\Domain\Ai\Service\AiSettingsWriter;
use Thelia\Model\AiModelQuery;
use Thelia\Model\AiTierAssignmentQuery;
use Thelia\Model\AiConnectionQuery;
use Thelia\Model\AiUsageSettingQuery;

final readonly class LegacySettingsImporter
{
    public function __construct(private AiSettingsWriter $writer) {}

    /** @param array{api_key: string, monthly_budget: string} $legacy */
    public function import(array $legacy): void
    {
        try {
            $connection = $this->writer->saveConnection(
                connection: AiConnectionQuery::create()->findOneByCode('mistral-main'),
                code: 'mistral-main',
                title: 'Mistral',
                provider: 'mistral',
                jurisdiction: null,          // deduced for Mistral; only a compatible server needs it
                baseUrl: null,               // the usual address of the provider
                apiKey: $legacy['api_key'],  // encrypted by the vault, never stored as it is
                apiKeyEnv: null,
                allowPrivateNetwork: false,
                active: true,
            );

            $model = AiModelQuery::create()
                ->filterByProvider('mistral')
                ->filterByName('ministral-3b-latest')
                ->filterByConnectionId(null, Criteria::ISNULL)   // the catalogue of the provider
                ->findOne();

            if (null !== $model) {
                $this->writer->assignTier(
                    AiTierAssignmentQuery::create()->findOneByTier('fast'),
                    'fast',
                    $connection->getId(),
                    $model->getId(),
                );
            }

            $this->writer->saveUsageSetting(
                AiUsageSettingQuery::create()->findOneByUsageId('commerceagents.shopping_assistant'),
                'commerceagents.shopping_assistant',
                enabled: true,
                monthlyBudget: $legacy['monthly_budget'],   // "25.00": a public usage needs a budget above zero to run
            );
        } catch (AiExceptionInterface $refusal) {
            // The message is English and says what to fix: log it, or show it with AiFailureExplainer.
            throw new \RuntimeException('The AI settings could not be migrated: '.$refusal->getMessage(), 0, $refusal);
        }
    }
}
```

- `saveUsageSetting()` writes the whole row. A value you leave out goes back to its default (`null`, `false` or `true` as in the signature), it does not keep what the merchant had set. When you update an existing row, read the current values from the `AiUsageSetting` and pass them again.
- `$tier` is `null` to follow the range the module declared, or `'fast'`, `'standard'`, `'advanced'`. Passing the declared range stores it as the merchant's choice (see [The merchant can change the range](#the-merchant-can-change-the-range)).
- `saveUsageSetting()` checks that the usage exists: the module that declares it must be installed first.
- A range whose model lacks a capability the usage declares is accepted here. The usage then shows as inactive and its calls are refused.
- The writer does not check the rights of an administrator. The code that calls it does, if it runs for one.
- Deleting a connection, a range assignment or a usage setting is not part of the writer.

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
| Does not run tools and retries only before the first byte of the answer. | Runs tools with the rights of the actor, bounds the loop and decides whether to retry later. |
