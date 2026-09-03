---
title: Rate Limiting
sidebar_position: 8
---

# API Rate Limiting

Thelia caps how fast a single caller can use the API, and how many login attempts it gets. The caps are on by default, and every figure is an environment variable so the person who runs the shop can move it without touching code.

Three things are capped: login attempts on both API login endpoints, token refreshes on both refresh endpoints, and every other call under `/api` on a wider budget that depends on who is calling.

One more cap is not a rate limit but belongs with them: a collection page never returns more than 100 items, whatever `itemsPerPage` asks for. See [Filters & Pagination](./filters).

## What a capped caller gets

A caller over its budget gets `429 Too Many Requests`, a `Retry-After` header in seconds, and the same body every time:

```json
{
    "code": 429,
    "message": "Too many requests. Please retry later."
}
```

The body says nothing about which cap was reached, how much budget is left, or whether the identifier that was tried names an account. That is deliberate: a refusal that varied would answer "does this account exist" for anyone working through a list.

A client should read `Retry-After` and wait. A client that retries immediately makes the shop pay for the refusal twice.

An ordinary authentication failure is unchanged: a wrong password still gets its usual `401` with `{"code": 401, "message": "Invalid credentials."}`, and no `Retry-After`.

## Settings

All figures are per minute. Set them in `.env.local`, in the web server's environment, or wherever your host passes environment variables.

| Variable | Default | Counted per | Applies to |
|----------|---------|-------------|------------|
| `THELIA_API_RATE_LIMIT_LOGIN_ATTEMPTS` | `10` | caller and identifier | `POST /api/front/login`, `POST /api/admin/login` |
| `THELIA_API_RATE_LIMIT_LOGIN_ATTEMPTS_PER_CLIENT` | `50` | caller | the same two endpoints |
| `THELIA_API_RATE_LIMIT_TOKEN_REFRESH` | `20` | caller | `POST /api/front/token/refresh`, `POST /api/admin/token/refresh` |
| `THELIA_API_RATE_LIMIT_ANONYMOUS` | `200` | caller address | `/api/**` when the caller is not authenticated |
| `THELIA_API_RATE_LIMIT_FRONT_AUTHENTICATED` | `800` | customer account | `/api/**` for a logged-in customer |
| `THELIA_API_RATE_LIMIT_ADMIN` | `2000` | administrator account | `/api/**` for a logged-in administrator |
| `THELIA_API_RATE_LIMIT_ALLOWLIST` | *(empty)* | n/a | see [Exempting a caller](#exempting-a-caller) |

```bash
# .env.local
THELIA_API_RATE_LIMIT_ANONYMOUS=400
THELIA_API_RATE_LIMIT_LOGIN_ATTEMPTS=5
```

All windows are sliding: a caller cannot spend a whole budget twice by straddling the moment a fixed window would roll over.

### Why login has two figures

`THELIA_API_RATE_LIMIT_LOGIN_ATTEMPTS` is counted per caller and per identifier, so ten wrong passwords on one account is the ceiling. `THELIA_API_RATE_LIMIT_LOGIN_ATTEMPTS_PER_CLIENT` is counted per caller alone, so trying one password across many accounts hits a wall too.

Keep the second well above the first. An office behind one address shares it, and a figure set too close to the first locks the whole office out the moment a couple of colleagues mistype.

### Why authenticated callers are counted by account

An anonymous caller is counted by address, because that is all there is to count. An authenticated one is counted by its account, so a whole office, a shared VPN or a mobile network behind one address is not held to a single budget, and a caller that misbehaves is throttled without its neighbours noticing.

The administration budget is the highest of the three because one back-office screen fans out into several API calls.

## Successful logins are not counted

The login cap counts failures. A working integration that logs in, gets a token and uses it never comes near it. Only a caller whose attempts keep failing spends that budget.

## Exempting a caller

A stock feed, an order export or a search indexer legitimately calls faster than any browser. `THELIA_API_RATE_LIMIT_ALLOWLIST` takes a comma-separated list of addresses and CIDR ranges that are not counted:

```bash
THELIA_API_RATE_LIMIT_ALLOWLIST=203.0.113.7,198.51.100.0/24,2001:db8::/32
```

What it costs, and what it does not cover:

- It exempts the general budget and the token refresh budget. It never exempts login attempts: an integration holds a token, it does not log in over and over, so there is no legitimate reason to uncap that.
- It is read from the caller's address only, never from anything the caller sends. A header or a query parameter would let any caller exempt itself.
- There is no exemption by token. A token is a secret that rotates, and pinning one in configuration on every server is a worse problem than the one it solves.
- An exempt address is uncapped, and so is anything that can reach the API from it: another container on the same host, a compromised job, a proxy that forwards on its behalf. Keep the list to addresses you control, and as narrow as your network allows.

Prefer giving the integration its own account and raising `THELIA_API_RATE_LIMIT_FRONT_AUTHENTICATED` over exempting an address: the budget still exists, and the integration is still visible in the logs.

### A headless storefront rendered on the server

A storefront that renders on the server, a Next.js or Nuxt front in front of Thelia, calls `/api/front` anonymously on behalf of every visitor it serves, and it does so from its own address. Thelia sees one caller, so the whole storefront shares the anonymous budget of 200 a minute. A handful of simultaneous visitors is enough to reach it, and Thelia then answers `429` to the storefront, which turns into an error page for people who never called the API themselves.

Put the storefront's address in `THELIA_API_RATE_LIMIT_ALLOWLIST`. If you would rather keep a ceiling on it, raise `THELIA_API_RATE_LIMIT_ANONYMOUS` to something the storefront cannot reach at its expected traffic instead, and measure it under load rather than guessing.

Either way, the storefront still has to cap its own visitors, because Thelia cannot tell them apart any more. They all reach it as one address, so nothing on the Thelia side notices or refuses a single visitor calling the storefront a thousand times a minute. Only the storefront sees the visitor addresses, so that is where the cap on them has to live.

## Behind a proxy or a load balancer

Read this before deploying. Without it, everything above counts wrongly.

An application behind a reverse proxy, a load balancer or a CDN sees the proxy's address on every request, not the visitor's. All three caps are counted per caller, so every visitor in the world shares one budget: the shop starts refusing its own customers, and one caller trying passwords spends everybody's login attempts.

Symfony reads the real address from the forwarded headers only when it is told which proxies to trust:

```bash
# .env.local: the addresses of your own proxies, never a range you do not control
TRUSTED_PROXIES=10.0.0.0/8,192.168.0.0/16
```

```yaml
# config/packages/framework.yaml
framework:
    trusted_proxies: '%env(TRUSTED_PROXIES)%'
    trusted_headers: ['x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto', 'x-forwarded-port', 'x-forwarded-prefix']
```

Two rules that matter more than the syntax. List your own proxies rather than a wildcard: a caller whose address is trusted can claim to be any address it likes, which turns the cap off for whoever knows the trick and pins it on whoever they name. Then check what the shop actually sees, because a refused login is written to the log with the caller's address (see below). If every line shows one address and it is your proxy's, the configuration is not in effect yet.

Limiting further upstream, at the proxy or in a web application firewall, still works and still helps. It is not a replacement: a proxy counts requests, and cannot tell a login attempt from a page of catalogue.

## Running on more than one server

The counters live in the application cache pool (`cache.rate_limiter`, backed by `cache.app`). On a single server the default filesystem cache is enough.

On more than one server, a filesystem cache is local to each: the effective cap becomes the configured figure multiplied by the number of servers, and it drifts as callers land on different ones. Point `cache.app` at a store all the servers share, Redis or Memcached, and the caps hold across the fleet:

```yaml
# config/packages/cache.yaml
framework:
    cache:
        app: cache.adapter.redis
        default_redis_provider: '%env(REDIS_URL)%'
```

Two more things follow from the counters living in a cache:

- A cache flush resets them. Deliberate, and harmless: the caps rebuild on the next call.
- The store is on the hot path of every API call, one read and one write per request. A store that is slow or unreachable makes the API slow.

## The log of refused authentications

Every refused authentication is written at `warning` level on the `security` channel, which ships to a file of its own. A wrong password, an account that does not exist, a caller over its login budget and a refused token refresh all land there. The handler rotates the file daily and keeps thirty days, so the file on disk carries the date:

```
var/log/security-<env>-<YYYY-MM-DD>.log
```

```
[2026-01-15T10:12:03+01:00] security.WARNING: API login refused. {"caller":"203.0.113.7","identifier":"thelia","endpoint":"/api/admin/login","refusal":"Symfony\\Component\\Security\\Core\\Exception\\BadCredentialsException"} []
```

Each line names the caller, the identifier that was aimed at, the endpoint, and the kind of refusal. It never carries the password, whole or in part.

It is a separate file on purpose. The main handler only writes its buffer out when something errors, and a run of failed logins produces warnings and nothing else, so it would never reach the disk. The file is also the thing to point a log watcher or a ban tool at, and it is kept for thirty rotations rather than seven, because an attempt spread over weeks is only visible if the weeks are still there.

A refused token refresh names no identifier: a refresh token is opaque, and a caller trying one has not said who it claims to be.

## In the test environment

The caps are real in the test environment too, and a test suite that logs in for every case and issues hundreds of calls a minute from one address looks exactly like what they are there to refuse.

Thelia's own `.env.test` therefore raises every figure out of the way, and each test that wants to reach a cap lowers the one it is about to reach before its kernel boots. Do the same in your project:

```bash
# .env.test
THELIA_API_RATE_LIMIT_LOGIN_ATTEMPTS=100000
THELIA_API_RATE_LIMIT_LOGIN_ATTEMPTS_PER_CLIENT=100000
THELIA_API_RATE_LIMIT_TOKEN_REFRESH=100000
THELIA_API_RATE_LIMIT_ANONYMOUS=100000
THELIA_API_RATE_LIMIT_FRONT_AUTHENTICATED=100000
THELIA_API_RATE_LIMIT_ADMIN=100000
```

The counters outlive a single test, so a test that reaches a cap should clear the `cache.rate_limiter` pool in its `setUp()` and use a caller address of its own. Otherwise it passes alone and fails when the suite replays it inside the same minute.

## The shop does not cap itself

A theme reads its data through the API, so a busy shop would be the first thing to hit the anonymous cap if those reads were counted. The busier it got, the harder it would refuse.

They are not counted. The theme and the back-office read in process, through the state providers directly, rather than calling the shop over HTTP. Only calls that actually arrive over HTTP under `/api` are counted.

## Where it lives in the code

| Piece | File |
|-------|------|
| Limits and their defaults | `core/lib/Thelia/Config/Resources/parameters/api_rate_limit.php` |
| Rate limiter policies | `core/lib/Thelia/Config/Resources/packages/framework.php` |
| Login attempt counting | `core/lib/Thelia/Core/Security/RateLimiter/ApiLoginRateLimiter.php` |
| The 429 answer | `core/lib/Thelia/Core/Security/RateLimiter/RateLimitedResponse.php` |
| Exemption list | `core/lib/Thelia/Core/Security/RateLimiter/RateLimitAllowlist.php` |
| General budget | `core/lib/Thelia/Api/EventListener/ApiRateLimitListener.php` |
| Token refresh budget | `core/lib/Thelia/Api/EventListener/TokenRefreshRateLimitListener.php` |
| Log of refusals | `core/lib/Thelia/Core/Security/EventListener/AuthenticationFailureLogListener.php` |

The general budget is checked on `kernel.request` at priority 7, after the firewall has said who is calling and before API Platform reads anything, so a refused call does not load or serialize a thing.

## Next steps

- [Authentication](./authentication) - JWT login, refresh tokens, CORS
- [Filters & Pagination](./filters) - `itemsPerPage` and the page ceiling
