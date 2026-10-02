---
title: Application cache
sidebar_position: 4.5
---

# Application cache

Thelia stores what it has already computed so it does not compute it twice. Where those
entries live is a hosting decision, made with one environment variable and no change to the
code of the shop.

## Three caches, one name

Most of the confusion around caching in Thelia comes from three different things sharing the
word.

| | What it holds | Where it lives | What empties it |
| --- | --- | --- | --- |
| Container cache | The compiled service container, routes, translations, compiled templates | `var/cache/<env>` | `php Thelia cache:clear`, `php Thelia thelia:cache:clear`, the back office button |
| Application cache | What the shop computed and wants to read back: catalog payloads, API refresh tokens, rate limit counters | `var/pools/<env>`, or a cache server | `php Thelia cache:pool:clear <pool>`, and for the catalog pool only, `php Thelia thelia:cache:clear` and the back office button |
| HTTP cache | Whole pages, held by a reverse proxy in front of Thelia | The proxy | The proxy |

This page is about the second one. The container cache is rebuilt from the code and is
emptied on every deployment; the application cache is not, which is exactly the point. The
HTTP cache is a separate subject and is configured on the proxy, not in Thelia.

## Choosing a backend

`THELIA_CACHE_DSN` decides where every application pool is stored.

```bash
# .env.local, or the environment of the hosting

# Left empty: the cache stays on the local file system, in var/pools/<env>.
THELIA_CACHE_DSN=

# Redis on the same machine
THELIA_CACHE_DSN=redis://localhost:6379

# Redis with a password, a database number and TLS
THELIA_CACHE_DSN=rediss://:the-password@cache.example.org:6379/2

# Memcached
THELIA_CACHE_DSN=memcached://localhost:11211
```

`redis://`, `rediss://`, `valkey://`, `valkeys://` and `memcached://` are accepted. The
container reads the variable when the pool is first used, so nothing in the code of the shop
changes in either direction.

:::note No extra dependency
Redis needs either the `redis` PHP extension or the `predis/predis` package; Memcached needs
the `memcached` extension. Thelia requires neither: install the one your hosting offers. A
shop on a shared hosting without any of them keeps the file system cache and works.
:::

Credentials belong in `.env.local` or in the secret store of the hosting, never in a
committed file. The cache server holds API refresh tokens, each of which is worth a session,
so it must not be reachable from the internet.

### When the backend is unreachable

A data source name that cannot be honoured stops the request with an explicit error naming
the variable, and the password is not repeated in the message:

```
THELIA_CACHE_DSN is set to "redis://cache.example.org:6379", which cannot be used as a cache
backend: Redis connection failed: ...
```

There is no automatic fall back to the disk. A shop that silently kept working on local
files while believing its cache was shared would serve inconsistent pages across its front
ends and sign API clients out at random. Once the cache server answers again, the shop
returns to normal with no intervention.

## The pools

```bash
php Thelia cache:pool:list
```

| Pool | What it holds | What clearing it costs |
| --- | --- | --- |
| `cache.app` | The general application cache | Nothing visible; entries are recomputed |
| `thelia.cache.data_access` | Normalized catalog payloads read by the front, when `THELIA_DATA_ACCESS_CACHE=1` | The next pages are slower until the pool refills |
| `thelia.cache.security` | API refresh tokens | Every API client has to sign in again |
| `cache.rate_limiter` | Request counters of the API rate limits | Counters restart from zero |
| `cache.http_client.pool` | Responses of the Symfony HTTP client, when a caller asks it to cache them | The next outgoing call is made again instead of being read back |
| `cache.system` and the pools built on it | Metadata Thelia derives from the code: API resources, validation, Twig components | Nothing visible; rebuilt on the next request |

### Emptying

Four commands are easy to mistake for one another.

```bash
# The container cache only. No application pool is touched.
php Thelia cache:clear

# The container cache, the web assets, and the catalog pool
# (it dispatches the shop's own cache clear event). The API
# refresh tokens and the rate limit counters are left alone.
# This is what the back office button under
# Configuration > Advanced configuration does.
php Thelia thelia:cache:clear

# One named pool, and nothing else.
php Thelia cache:pool:clear thelia.cache.data_access

# Expired entries in every pool, without emptying anything valid.
php Thelia cache:pool:prune
```

`cache:clear` rebuilds `var/cache/<env>` and leaves every application pool as it was: the
pools live in `var/pools/<env>`, outside that directory, or on a cache server. Nothing in
either command empties `thelia.cache.security`, which is what keeps a deployment from
signing the API clients out.

## Keeping installations apart

Pool keys are prefixed with a seed that defaults to the install path plus the environment,
so one cache server can serve several shops, and the development and the production of one
shop, without any of them reading the keys of another.

Set `THELIA_CACHE_PREFIX_SEED` when several machines serve the **same** shop from different
paths and you want them to share one cache:

```bash
THELIA_CACHE_PREFIX_SEED=acme-shop
```

Leave it unset rather than empty: an empty seed puts every shop in the same keyspace. The
seed is read when the container is compiled, so a change takes effect after
`php Thelia cache:clear`.

## In production

- **Eviction policy.** A cache server set to `allkeys-lru` drops the oldest keys when memory
  runs out, refresh tokens included, and the API clients holding them have to sign in again.
  That is a reconnection, not an error, but it is visible. Prefer `volatile-lru`, which only
  drops keys that carry an expiry, or `noeviction` with a `maxmemory` sized for the shop and
  an alert on memory use.
- **A database of its own.** Give Thelia its own Redis database, or its own instance, rather
  than sharing one with a queue or a session store that has different durability needs.
- **Token lifetime.** `JWT_REFRESH_TOKEN_TTL` (default 30 days) sets how long a refresh token
  stays valid. A shorter lifetime lowers what an evicted or stolen token is worth.
- **Pruning, on the file system.** An entry that expires and is never read again stays on
  the disk. `php Thelia cache:pool:prune` removes those, and nothing valid, so it belongs in
  a nightly cron on a shop that keeps its cache on disk. On a cache server it has nothing to
  do, since the server expires its own keys, and reports so without failing.
- **Measure before concluding.** On a single server, the file system cache backed by opcache
  can beat a remote cache on small keys. What a shared cache buys is that several front ends
  see the same entries, and that they survive a deployment. Compare page timings on your own
  traffic rather than assuming a gain.

## Checking that it works

```bash
# The pools Thelia knows about
php Thelia cache:pool:list

# The cache server answers
redis-cli -h localhost ping

# Keys appear once the shop has served a page and signed an API client in
redis-cli -h localhost --scan
```

Each key is prefixed with the ten character namespace of its pool, so a shop sharing a cache
server with another one sees only its own prefixes:

```
ksnN1VFryY:jwt_refresh_d4511f064f16b892e5f6720216a550e1...
JEP31NKSVz:671b3e97ae4b1646e4d2c63d165b3672d1af8370
```

To watch the traffic live while browsing the shop:

```bash
redis-cli -h localhost monitor
```

## Troubleshooting

**A page shows data that no longer exists.** Clear the catalog pool:
`php Thelia cache:pool:clear thelia.cache.data_access`, or `php Thelia thelia:cache:clear`,
which takes that pool with the container cache. `php Thelia cache:clear` will not do it. The
pool is also flushed on its own whenever a catalog record changes, so a lasting staleness
points at an import that writes around the models rather than at the cache.

**A template change does not show up.** That is the container cache, not this one:
`php Thelia cache:clear`.

**API clients are signed out at every deployment.** Check that the pool is actually on a
shared backend (`THELIA_CACHE_DSN`) and that `THELIA_CACHE_PREFIX_SEED` is the same on every
machine; a seed that varies gives each machine its own keyspace.

**Two shops read each other's data.** They share a seed. Give each one its own
`THELIA_CACHE_PREFIX_SEED`, or its own cache database.

**Requests fail with `THELIA_CACHE_DSN is set to ...`.** The cache server is unreachable or
the PHP extension is missing. `redis-cli ping` from the web server answers that first
question; `php -m | grep redis` answers the second.
