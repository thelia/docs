---
title: AI settings and MCP
sidebar_position: 12
---

# AI settings and MCP

Added in Thelia 3.3.

Thelia 3.3 lets modules use language models, and lets an AI assistant outside your shop use some tools of the shop, under your control. This page explains the settings you manage and how to connect an external assistant. What the European AI Act asks of a shop is in [AI and the AI Act](./ai-act.md). Module developers: [Calling an AI model from a module](../modules/ai.md) and [Giving tools to an AI](../modules/ai-tools.md).

You find everything under **Configuration > Artificial intelligence**. The page has nine tabs under its title: Connections (it opens first), Models, Ranges, Usages, Register, Consumption, Tools, Approvals and MCP tokens. The **Add a connection** button is at the top right. The Connections tab lists the connections in a table with the columns Name, Identifier, Provider, Data processed, API key, Status, Last test and Actions.

## Getting started

1. Open the **Connections** tab, add a connection to a provider and give its API key.
2. Use **Test now** on the connection to check the address and the key.
3. Open the **Ranges** tab and choose a model for each range you want to use.
4. Open the **Usages** tab. Each module that uses AI lists what it does there. Give a monthly budget to the usages open to your visitors.

Your shop pays the provider directly.

## Connections

A connection is the link between your shop and a company that runs AI models, with your account and your key. You need one before any AI feature works.

| Field | What it is |
| --- | --- |
| Name and identifier | The name you recognise it by, and a short identifier without spaces (`mistral-main`). The log and the modules refer to the connection by its identifier. |
| Provider | Mistral AI (France), Anthropic (Claude), OpenAI, Compatible service (OpenAI format), Scaleway (France), OVHcloud (France), Albert (French State), Ollama (your own server) or Thelia AI. |
| Server address | Empty for the usual address of the provider. Fill it in for your own server or a compatible service. The address must use `https`. Plain `http` is accepted only for a server on a private network, or when a developer has turned on the `thelia.ai.allow_insecure_urls` parameter of the shop. |
| Where the data is processed | Asked only for a compatible service or your own server, with the choices "In the European Union" and "Outside the European Union". For the other providers it is deduced (see [AI and the AI Act](./ai-act.md#providers-and-where-data-goes)). |
| API key | Stored encrypted. It is never displayed again, not even to administrators. Leave the field empty when you edit a connection to keep the stored key. |
| Environment variable holding the key | Optional, for a server that keeps its secrets out of the database. When set, it wins over the saved key. |
| The server is on a private network | Tick it only for a server of your own network (Ollama, for example). Otherwise addresses of a private network are refused. |
| Connection in use | Untick to stop using a connection without deleting it. A connection or a model that a range uses cannot be deleted: assign another one to the range first. |

**Test now** sends one very short message to the provider. It costs a fraction of a cent at most. The list shows the result of the last test.

If the application secret of your shop (`APP_SECRET`) changes, or you restore a database from another shop, the saved keys can no longer be read. The calls fail and the message asks you to enter the key again in the connection.

The form is titled **New connection**, or **Edit the connection** for an existing one. On an existing connection, the card **Test the connection** under the form holds the **Test now** button and the result of the last test (Worked or Failed, with the date).

### European Union only

Below the list, in the block **European Union only**, the option **Refuse providers outside the European Union** is off by default (click **Save** to apply it). European providers are the defaults, and the others stay allowed. Turn it on to refuse every AI call that would process data outside the EU, including paid services of a module that run outside the EU.

## Models and ranges

The **Models** tab lists the models Thelia knows, with their price per million tokens. The table has the columns Model identifier, Display name, Input price, Output price, Context size, Abilities and Origin (Shipped for the models that come with Thelia), with an **Edit** link per row and an **Add a model** button at the top right. A token is about three quarters of a word. Edit a price if your contract differs, or add a model the list does not know. The prices let Thelia estimate the cost of each call and respect your budgets. They are not what the provider bills you: check your contract.

A module never asks for a precise model. It asks for a **range**:

| Range | For |
| --- | --- |
| Fast and economical range | Quick, simple tasks: chat, sorting, short answers. Pick a small, cheap model. |
| Standard range | Everyday writing and analysis. A good balance between quality and price. |
| Advanced range | Long texts and complex tasks. Pick the strongest model you accept to pay for. |

In the **Ranges** tab you choose, once, which model serves each range. Change it later and every feature on that range follows. The model must belong to a connection you have set up.

In **Configuration > Artificial intelligence > Ranges**, the page has one drop-down per range, labelled **Fast and economical range**, **Standard range** and **Advanced range**, each with the choice "No model" and the models of your active connections, and a **Save** button. While you have no active connection, a message says so and asks you to add one in the Connections tab.

### A different range for one usage

A module declares the range it needs, but you can choose another one for a given usage. Open the usage in the **Usages** tab and pick the range in **Range of this usage**. Pick a stronger range if a feature writes poorly, or a cheaper one to save money.

- The model of the range you pick must be able to do what the module needs (tools, structured answers, streaming). If it cannot, the usage stops, and the Usages list says why.
- If you pick the range the module declares, your choice is kept even if the module later declares another range. Choose the option "As declared by the module" to follow the module again.
- Model for this usage pins one model for the usage and ignores the range. By default the usage follows its range. Pin a model only if the usage needs its own.

## Usages

A usage is one thing a module asks the AI to do, for example answering your visitors. The **Usages** tab lists them in a table with the columns Usage, Module, Audience, Range, Tools, Tools together, Monthly budget, Status, Article 50, Why it does not run and Actions (a **Configure** button).

Open a usage to change:

| Setting | Effect |
| --- | --- |
| Allow this usage | Switch it off to stop the usage at once, without touching the module. |
| Range of this usage | See above. |
| Monthly budget (US dollars) | When the month has used this amount, the usage stops until the next month. Leave empty for no cap of its own. **A usage open to your visitors does not run without a budget above zero.** |
| Model for this usage | See above. |
| Mistral moderation, OpenAI moderation, Topic check | Optional safety checks on what is sent to the model and on its answer. Each one is set to Follow the module (the default), Block the request, Let it through and note it, or Not applied. |
| Requests per minute, Requests per day | Rate limits of the usage. Empty means no limit for this kind of usage. |
| Length of the answer (tokens) | Cap on the length of an answer. |
| Length of what a person types (characters) | Cap on the size of a message. Empty means no limit. |
| Keep the prompts in the log | Off by default: the log keeps the cost, the model and the checks, not the text sent. |
| Days the prompts are kept | Retention period, used only when the prompts are kept (30 days by default). |
| Tell people they are talking to an AI | The notice of Article 50(1). On by default. |
| Mark generated content as made by an AI | The mark of Article 50(2). On by default. |

Amounts are in US dollars, as the providers bill them. Nothing is converted.

The same settings are also available through the admin API, under `/api/admin/ai/usage-settings`. A usage does not store the text of its prompts unless you turn that on, with a retention period; the texts can hold personal data, so turn it on only to investigate.

The **Register** tab is the list of every usage with its provider, its model, its tools and its duties. You can export it as CSV or JSON. See [AI and the AI Act](./ai-act.md).

To open the edit page, go to **Configuration > Artificial intelligence > Usages** and click **Configure** on the row. The form has these sections, from top to bottom: the switch and the range, the budget and the model, **Safety checks**, **Limits**, **Privacy** and **Transparency (Article 50)**, then **Cancel** and **Save**.

## Consumption, budgets and the global switch

The **Consumption** tab shows the calls and their cost, for the period you choose (fields **From** and **To**, then **Show**), in four tables: By usage, By module, By model and By day, each with the columns Calls and Cost (US dollars). It also holds the **Global settings**:

- **AI is allowed in the shop** is the master switch. Turn it off and no module can use AI, whatever its own settings say. It also turns off the MCP server.
- **Monthly cap for the whole shop (US dollars)**. `0` means no cap. All usages together stop when the month reaches it.

A call is refused before it is made when it would cross the budget of its usage or the cap of the shop. The cost the call can reach is reserved first, so budgets hold even when many calls come at once.

The Global settings block, with its **Save** button, is at the top of **Configuration > Artificial intelligence > Consumption**; the period fields and the four tables follow.

## Tools, approvals and the MCP server

A tool is something a module lets an AI do in your shop: read products, or propose a change. The **Tools** tab lists them with the columns Tool (name and description), Module, Effect (Reads, or Proposes a change (needs approval)), Right needed (for example "View admin.product"), Audience, Available over MCP (Yes or No) and Risks (for example "Private data").

Three rules apply to every tool:

- The AI never gets more rights than the person it works for. The rights are read again at each call. Take a right away from an administrator, and the next call is refused.
- A tool that changes something only proposes. Nothing happens until an administrator approves it.
- Every call is logged.

The tab is read only: it shows what modules declare, and has no switch.

### The approval console

The **Approvals** tab lists the proposals waiting for your decision, the ones you have the right to decide, with the columns Proposal, Tool, Target, Proposed on and Expires on, and a **Review** button on each row. When nothing is waiting, it says "Nothing is waiting for your decision." Open one to read exactly what would change:

- the summary written by the tool (**Summary**),
- the full **Arguments**, the **State before** and the **State after the change**,
- who proposed it (**Proposed by**, with the token if it came from an assistant), when, and when it expires.

The summary is written from a request of the AI, so it is not enough to decide. Read the arguments and the state after the change.

You can **Approve and apply**, or **Reject** with an optional **Reason (optional)**. Only an administrator signed in to the back office can decide. An AI assistant, the API and the console cannot. You can only approve a change if you hold the right the tool needs, today.

- A proposal expires after 24 hours, and is then no longer applicable. A shop that needs another delay can set the variable `ai_tool_approval_ttl_hours`.
- If the change cannot be applied (the shop changed since the proposal, for example), the proposal is marked failed with the reason, and nothing is applied.
- If a change was interrupted while being applied (a server stopped at that moment), it appears at the top of the list. Check in your shop whether the change was applied, then use **Close as failed** and answer "What did you check?". Thelia never replays a change by itself.
- Revoking a token, or deleting an administrator, rejects the proposals still waiting that came from them.

A banner at the top of the list, "Some changes were interrupted while being applied.", points to those. The page of a proposal is titled **Proposed change** and shows the module and the target above the summary.

### Connecting an AI assistant over MCP

MCP (Model Context Protocol) is a standard that lets an AI assistant use tools of another system. The MCP server of Thelia lets an assistant outside your shop, a desktop assistant or a development tool, use the tools that modules offer, in your name.

#### Which assistants can connect

The server accepts a token that you create and the assistant sends in a header. It does not offer the sign-in flow (OAuth) that some assistants require. This is what the documentation of the vendors said on 28 October 2026:

- Claude Code documents adding an HTTP server with a header, which is what Thelia expects. This was read in its documentation and not tried.
- Le Chat (Mistral) offers custom MCP connectors with a bearer token, as its documentation describes. This was read in its documentation and not tried with a real account.
- Claude (claude.ai, desktop and mobile apps) expects a sign-in flow by default, which Thelia does not provide. A fixed header is a beta for a limited set of organizations, entered by an owner of the organization, and it is a credential of the organization, not of a person. Check with Anthropic whether your organization has it.

Thelia 3.3 has no OAuth server. If your assistant requires it, it cannot connect yet.

#### 1. Turn the server on

The MCP server is off by default. Open **Configuration > Artificial intelligence > MCP tokens**. At the top, the line **MCP server enabled** has a button **Switch on** (and **Switch off** once it is on, with the badge Active). The choice is stored in the system variable `ai_mcp_enabled`. **AI is allowed in the shop** (Consumption tab) must be on too.

While it is off, every request to the server gets a 404 and the MCP tokens tab says so ("The MCP server is switched off, so no token works yet.").

#### 2. Check the allowed hosts

The server only answers for known host names, to protect against a web page that tries to talk to your shop through your browser (DNS rebinding). By default it accepts:

- the host of the address of your shop,
- the domain of each language, if your shop uses one domain per language,
- `localhost`, `127.0.0.1` and `[::1]`.

If your assistant reaches the shop through another name, set the environment variable `THELIA_MCP_ALLOWED_HOSTS` to a comma-separated list of host names, without port: `shop.example.com,www.example.com`. When it is set, it replaces the default list. The MCP tokens tab warns you when the address you use now is not accepted.

#### 3. Create a token

Open the **MCP tokens** tab. The tab appears when you hold the right `admin.configuration.ai-mcp` (view), and you need its create right to make a token.

1. Under **Create a token**, give the token a **Name** to recognise the assistant that uses it.
2. Under **What the token may do**, choose its scopes: the **Parts of the back office**, the **Kind of access** (view, create, update, delete), or **Modules (codes separated by commas)**. Choose at least one.
3. Click **Create the token**.
4. Copy the token now ("Copy your token now: it is shown only once."). It starts with `thelia_mcp_` and is shown only once. Thelia keeps a fingerprint only and cannot show it again.

A token:

- belongs to you and takes your rights as they are at each request, reduced by its scopes. It can use a tool only when its scopes and your own rights both allow it, so it never does more than you can.
- expires after 90 days. The longest life allowed is 365 days, or the value of `ai_tool_token_max_days` if you set it.
- shows its last use in the list, which has the columns Name, Token, Reach, Expires on, Last used and Status, and a **Revoke** button. A red **Trifecta** badge follows the name of a token whose tools reach the three risks together. **Revoke** it when you stop using the assistant: the effect is immediate, at the next request.
- opens `/api/mcp` and nothing else of the shop.

**Give this token all my rights (no scopes)** makes the token able to propose anything you may do in the shop. It is risky: prefer scopes. A stronger warning shows for a super-administrator. Create one token per assistant.

The token appears once, in a box titled **Your token**, above the list.

#### 4. Connect the assistant

The assistant needs two things:

- the address of the server: `https://<your-shop>/api/mcp`,
- the token, sent in the header `Authorization: Bearer <token>`.

For Claude Code, for example:

```bash
claude mcp add --transport http my-shop https://shop.example.com/api/mcp \
  --header "Authorization: Bearer <your token>"
```

Replace the address and the token with yours. For another assistant, look for "custom MCP connector" or "remote MCP server" in its documentation and give it the address and the bearer token. The server speaks HTTP, one JSON-RPC message per request.

Once connected, the assistant sees the tools that its token allows and nothing else. A tool it is not allowed to use is absent from its list and, if called by name, answered as if it did not exist.

#### Limits and errors

| What you see | Why |
| --- | --- |
| 401 | No token, an unknown, revoked or expired token, a token of an administrator who no longer exists. |
| 404 | The MCP server is off. |
| 429, with a `Retry-After` | A token may make 60 requests per minute and 2 000 per day. |
| 400 | A batch of messages. The server refuses batches: send one message per request. |
| 413 | A request body larger than 256 KiB. |
| "Unknown tool" | The tool does not exist, is not allowed for this token, or is kept away from MCP by its module. |

The tools that change something answer that the change is waiting for approval. You decide in the Approvals tab.

The result of a tool is raw JSON. The assistant must treat it as text from the outside, because it can contain text written by a customer or a third party.

### What "lethal trifecta" means

An AI assistant becomes dangerous when it holds three things at once:

1. it can read **private data** of your shop (stock, purchase prices, customers, orders),
2. it reads **text that someone outside wrote** (a review, a web page, a message),
3. it can **send something out** (an e-mail, a request to another system).

With all three, a hostile sentence hidden in a review could ask the assistant to send your private data to a stranger. Nobody has to hack anything, because the assistant simply obeys the text.

Thelia flags this and does not block it. You see the "Tools together" column in the Usages tab, and a "Trifecta" badge and a warning on a token that reaches the three. What protects you most is the approval step, as nothing that changes the shop happens without a person. To reduce the risk: narrow the scopes of the token, switch off the usages that do not need all three, and read each proposal.

## What you keep

- Keep the global cap and budgets realistic, and read the Consumption tab.
- Keep tokens short-lived, narrow and one per assistant. Revoke the ones you no longer use.
- Read the arguments of a proposal before approving it.
- Treat the token like a password: do not put it in a ticket or a chat.
