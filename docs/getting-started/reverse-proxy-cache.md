---
title: Reverse proxy cache
sidebar_position: 4.6
---

# Reverse proxy cache

A reverse proxy such as Varnish can keep the public pages of your shop and answer anonymous
visitors without running PHP. Thelia decides which pages may be kept, tells the proxy what
each page contains, and asks the proxy to forget a page when the catalogue changes.

:::note Availability
This is part of Thelia 3.3. The setting is on the store configuration screen of the
`default-twig` back office from the theme release that follows it.
:::

This is the third cache of the table on the [application cache](./application-cache.md)
page, the one that holds whole pages. It is off by default, and a shop that does nothing
behaves exactly as before.

## Why a proxy cannot cache a Thelia page by default

The front starts a session for every visitor and sets a `PHPSESSID` cookie on every answer.
A proxy has to treat an answer that sets a cookie as personal, so without help it keeps
nothing, even for a page that is the same for everybody.

Thelia now separates the two cases. For an anonymous visitor on a public catalogue page it
removes the cookie from the answer and marks the page as shareable. Everything else, a
visitor with a cookie, the cart, the checkout, the account, the API, the back office, goes
through untouched.

## Turning it on

Two settings, on the store configuration screen of the back office:

| Setting | Default | Meaning |
| --- | --- | --- |
| `shared_cache_mode` | `disabled` | `disabled`: nothing changes. `announce`: adds `Surrogate-Control: max-age=<ttl>` and leaves `Cache-Control` and the cookies alone, for a proxy you configured to strip the cookies itself (see the warning below). Nothing is announced when the answer sets a cookie other than the session and the cleared cart cookie. `enabled`: removes the cookies of a shareable answer and sets `Cache-Control: public, s-maxage=<ttl>`. |
| `shared_cache_ttl` | `300` | How long a proxy may keep a page, in seconds, between 1 and 86400. |

Change them from the back office, not with an SQL `UPDATE`: the shop reads its settings
through a cache that only the application invalidates.

`shared_cache_ttl` is also the upper bound on how stale a page can be when a change raises no
purge (see [what is not purged](#what-is-not-purged)), so choose it with that in mind.

:::warning The `announce` mode trusts your proxy
In `announce` mode the answer still carries `Set-Cookie: PHPSESSID` and still says it is
cacheable (`Surrogate-Control`). A proxy that applies `Surrogate-Control` and does not remove
the cookie keeps the session of the first visitor and serves it to everybody who follows.
Use this mode only with a proxy you configured to remove `Set-Cookie` from such an answer, as
the VCL of the [`announce` section](#the-announce-mode-with-varnish) does, and check it with
the requests of [checking that it works](#checking-that-it-works): the second answer must be
a `HIT` and the visitor must receive no `Set-Cookie`. When in doubt, use
`enabled`: Thelia then removes the cookies itself and never marks an answer that sets one as
public.
:::

## What is shared

An answer is shared only when all of these hold:

- it is a `200` to a `GET` or `HEAD` request;
- the request carries no cookie, no `Authorization` header and is not an XHR;
- the page is a home page, a category, a product, a content, a folder or a brand;
- the first segment of the path is not `admin`, `api`, `open_api`, `_components`, `_profiler`,
  `_wdt`, `account`, `checkout`, `customer`, `order`, `password`, `login`, `logout`,
  `register`, `address`, `cart-reminder` or `back-to-cart`, nor starts with one of them
  followed by `-` or `_`. Only the first segment counts: the list of views above is what
  keeps the other pages out;
- no price depends on the visitor: no catalogue price rule reserved to a named audience and
  no reserved sale is active (while one is, no page is shared);
- every resource the page read through `resources()` is one that does not depend on the
  visitor. A page that read an account, a cart, or more than 200 distinct keys (a list counts for one) stays personal.

A page that sets a cookie is never public. In `enabled` mode the cookies are removed first,
and if one cannot be removed the answer is left as it was.

A shared answer carries `Vary: X-Forwarded-Proto, X-Forwarded-Port, X-Forwarded-Host`, plus
`X-Forwarded-Prefix` and `Forwarded` when the shop trusts proxies and those headers
(`framework.trusted_headers`), because the absolute URLs of the page are built from them when
Thelia sits behind a trusted proxy. Varnish honours `Vary` on its own.

:::warning Do not let a visitor choose these headers
A page is kept for everybody. A visitor who sends `X-Forwarded-Prefix: //evil.example` to a
proxy that passes it on would get links and script addresses pointing to that host in the
page every other visitor is then served. The proxy must drop the forwarded headers a visitor
sent and set its own, which the VCL below does for `X-Forwarded-Prefix` and `Forwarded`. If
your proxy does not honour `Vary`, overwrite those headers, and vary on the host when one
installation serves several hosts.
:::

## Telling the proxy what a page contains

When the mode is not `disabled`, a catalogue page lists the objects it read in a header the
proxy can search by:

| Proxy | Header | Separator |
| --- | --- | --- |
| Varnish (xkey) | `xkey` | a space |
| Souin and other proxies that read surrogate keys | `Surrogate-Key` | `, ` |

Which header is sent follows `SHARED_CACHE_PURGER` (below); while it is empty, both are sent.

The keys are:

| Key | A page carries it when it read |
| --- | --- |
| `thelia` | any tagged page |
| `product-42`, `category-7`, `brand-3`, `content-9`, `folder-2` | that object |
| `products`, `categories`, `brands`, `contents`, `folders` | the list of that kind |
| `product_sale_elements`, `product_images`, `product_sale_elements_product_image`, `product_videos`, `product_sale_elements_product_video`, `product_associations`, `product_association_types`, `tfilters` | the list of what hangs under a product |
| `features`, `feature_values`, `attributes`, `attribute_values`, `languages`, `sales`, `countries`, `currencies`, `taxes` | the list of that resource, which a change of that resource purges with every other page |

A resource that is not one of the five first kinds is tagged by its list only, never by one
of its items, because a change can only purge a list.

### Keys for your own module

A page is shared only if everything it read through `resources()` is on the list in the
parameter `thelia.shared_cache.readable_prefixes`. A path that is not on the list makes the
page personal, which is safe and costs only the gain. A module that reads its own API
resource from a catalogue page can add its prefix to that parameter. It must then purge the
key it creates, which is the name of the resource (`/api/front/my_resources` is tagged
`my_resources`), by providing its own purge through `SharedCachePurgerInterface` or by
dispatching one of the events above. No module has used this extension point yet, so treat
it as untested. A resource that no event purges must not be added. The loops,
Propel queries and Live components that read data without `resources()` are invisible to the
keys: `shared_cache_ttl` is their only bound.

## Purging when something changes

The purge is sent when the request that changed the data ends, so the proxy is never asked
before the database is written.

| Change | Purged |
| --- | --- |
| A product, a feature value of a product, a clone, the hiding of a combination | `product-<id>` and the lists that can show it |
| A category or a brand | the object, its list, `products` and `tfilters` |
| A content | the object and the lists of contents |
| A folder | the object, `folders` and the lists of contents |
| A product, category, content, folder or brand written through the admin API | the same as its back-office edit |
| Any other catalogue model written through the API | every page |
| The deletion of a combination | every page, the product of a deleted combination being unknown |
| The save of the store configuration screen, or any write of a shop setting | every page, the setting `shared_cache_mode` included: switching to `disabled` empties what a proxy kept |
| A sale, a catalogue price rule, a feature, an attribute, a product association type, a tax or a tax rule, a currency, a template, a product video, a setting, a language, a hook, a module activation, meta data, a finished import, a change of position of contents, accessories, associations or combinations, an image or a document saved, updated, moved, hidden or deleted, a country, a state or a delivery area, a module updated, moved or deleted, a hook deactivated, a feature or an attribute added to or removed from every template, a translation file written, a cache clear | every page (`thelia`) |

While the mode is not `disabled`, every purge also flushes the data access cache pool, so a
page rebuilt right after a purge cannot read a stale answer. In `disabled` mode the pool is
left to its own invalidation, as before.

Nothing is sent until you configure it:

```bash
# .env.local, or the environment of the hosting

# varnish (xkey), souin or surrogate-key. Empty or "none": no purge is sent.
SHARED_CACHE_PURGER=varnish

# The proxies to purge, separated by commas. Each one is purged on its own.
# A login in an address (http://login:password@varnish:6081) is sent as basic
# authentication and never kept in the address; percent encode its reserved characters.
# An address that cannot be read is reported by its position in the list, never by its text.
SHARED_CACHE_PURGE_URLS=http://varnish:6081

# Sent in the X-Thelia-Purge-Secret header, so the proxy can refuse a purge it did not expect.
SHARED_CACHE_PURGE_SECRET=a-long-random-string
```

Thelia sends an HTTP `PURGE` to each URL, with the keys in the `xkey` header (Varnish) or the
`Surrogate-Key` header (the others). The secret is a shared password, not a signature: keep
it in `.env.local` or the secret store of the hosting, and restrict `PURGE` to the addresses
of your web servers in the proxy as well.

A proxy that does not answer, or a wrong setting, is logged and never breaks the action of
the administrator. A proxy that is down does not keep the others from being purged. Redirects
are not followed, so the secret never leaves the host it was meant for.

A module can replace the proxy by providing its own implementation of
`Thelia\Core\SharedCache\SharedCachePurgerInterface`.

## A Varnish configuration

This configuration needs the `xkey` module (`varnish-modules`; the official `varnish` Docker
image carries it). It was tried against Varnish 7.6.

```vcl
vcl 4.1;

import xkey;

backend default {
    .host = "127.0.0.1";   // the web server running Thelia
    .port = "8080";
}

// The addresses allowed to purge: the web servers running Thelia.
acl purgers {
    "127.0.0.1";
}

sub vcl_recv {
    // A visitor must not choose the headers Thelia builds the links of a kept page from.
    // Remove X-Forwarded-Prefix too only if no component of yours sets it on purpose.
    unset req.http.X-Forwarded-Prefix;
    unset req.http.Forwarded;

    if (req.method == "PURGE") {
        if (!client.ip ~ purgers) {
            return (synth(405, "Not allowed"));
        }
        // Must be the value of SHARED_CACHE_PURGE_SECRET.
        if (req.http.X-Thelia-Purge-Secret != "a-long-random-string") {
            return (synth(403, "Wrong secret"));
        }
        if (!req.http.xkey) {
            return (synth(400, "No key"));
        }
        set req.http.n-gone = xkey.purge(req.http.xkey);
        return (synth(200, "Purged " + req.http.n-gone));
    }
}

// Optional: tells you at a glance whether a page came from the cache.
sub vcl_deliver {
    if (obj.hits > 0) {
        set resp.http.X-Cache = "HIT";
    } else {
        set resp.http.X-Cache = "MISS";
    }
}
```

In `enabled` mode nothing else is needed. The default behaviour of Varnish already does the
rest: it does not look up a request that carries a cookie, it does not store an answer that
sets one, it reads `s-maxage` and it honours `Vary`.

If TLS ends in front of Varnish, the component that ends it must set `X-Forwarded-Proto`, and
Thelia must trust the proxies that forward to it (`TRUSTED_PROXIES`, see
[rate limiting](../api/rate-limiting.md)), otherwise the absolute URLs of a cached page are
built with the wrong scheme.

### The `announce` mode with Varnish

In `announce` mode the answer keeps its `Set-Cookie` and its `Cache-Control: private`, so
Varnish stores nothing until you tell it to trust `Surrogate-Control`, and the VCL below is
what keeps the session cookie out of the cache: without its `unset beresp.http.Set-Cookie`,
a proxy that stores the answer would serve one visitor's session to the others. Add this to the VCL
(and keep the `PURGE` and `vcl_deliver` parts above); it was tried against Varnish 7.6:

```vcl
import std;

sub vcl_backend_response {
    if (beresp.http.Surrogate-Control ~ "max-age=[0-9]+") {
        set beresp.ttl = std.duration(regsub(beresp.http.Surrogate-Control, ".*max-age=([0-9]+).*", "\1") + "s", 0s);
        unset beresp.http.Set-Cookie;
    }
}
```

A page without `Surrogate-Control`, and every request that carries a cookie, still goes
through to Thelia. Use this mode when you want the cookie removal to be yours to control;
otherwise `enabled` does the same with less to configure.

### Souin and other surrogate key proxies

Use `SHARED_CACHE_PURGER=souin` or `surrogate-key`. The keys are sent in `Surrogate-Key`,
separated by `, `, and the purge is a `PURGE` with that header. Thelia's tests check
the header these two send, but neither has been tried against a running proxy: check the
separator and the purge route on your proxy before relying on them.

## Checking that it works

1. Turn the mode to `enabled`, then request a product page twice without a cookie:

   ```bash
   curl -s -D - -o /dev/null https://shop.example.org/product-slug | grep -i -E "^(x-cache|cache-control|set-cookie|xkey|age)"
   curl -s -D - -o /dev/null https://shop.example.org/product-slug | grep -i -E "^(x-cache|age)"
   ```

   The first answer is a `MISS`, has `Cache-Control: public, s-maxage=...`, an `xkey`
   header and no `Set-Cookie`. The second is a `HIT`.

2. Request the same page with a cookie (`-H 'Cookie: PHPSESSID=x'`): it must be a `MISS`
   every time and must never be shared with the visitor without a cookie.

3. Edit that product in the back office, then request the page again: a `MISS` with the new
   content, then a `HIT`. If the page stays a `HIT` with the old content, read the log of the
   shop for a purge failure and check `SHARED_CACHE_PURGE_URLS` and the secret.

## What is not purged

These changes raise no catalogue event, so a shared page can be out of date by up to
`shared_cache_ttl`:

- the stock sold by an order;
- an import of prices or stock that does not end with the `IMPORT_SUCCESS` event (a finished import of the back office or of the command line purges every page);
- the move of a category in the tree and the association of a combination with an image from
  the back-office theme;
- the reorder of the media of a product and the quick edit of a document title, from the
  back-office theme;
- a page that read data through a loop or a Live component that is not in `resources()`.

The countdown of a running sale is computed when the page is built, so it can be late by up
to `shared_cache_ttl`, and a sale that starts or ends is only noticed when the sale status
is next updated.

## Limits

- The session is still started and written for each anonymous request. Only its cookie is
  removed, so the shared cache saves the rendering, not the session store.
- The proxy must ignore, for lookup, the requests that carry a cookie: those are never shared.
  Varnish does so by default.
- A module that sets its own cache headers on a response of the views above can have them
  replaced when the mode is `enabled`. The pages of TheliaCMS are not concerned: they render
  their own view, which is never shared.
- A module that personalises a page without a cookie, by IP address or by a request header,
  is invisible to the policy and would be served to everyone. Do not install it behind a
  shared cache, or have it set `Cache-Control: no-store` on its answers. `private` is not
  enough: Symfony sets it on every answer that touched the session, so it cannot be told
  apart, and Thelia replaces it on a page it shares.
- The purge is synchronous, at the end of the request. A proxy that does not answer holds the
  request for up to 5 seconds, on a server that cannot close the connection to the browser
  first (mod_php, the development server).
- Measure before concluding: compare `curl -w '%{time_starttransfer}'` three times on a page
  without and with the cache, and read the number of SQL queries with
  `SHOW GLOBAL STATUS LIKE 'Questions'` before and after a request. The gain depends on the
  shop, its theme and its hosting: measure it on yours.
- The forms: a form whose token is tied to the session, served from a shared page, fails on
  its first submission and passes on the second. The Flexy theme lists three forms with
  stateless tokens, the add to cart, the coupon code and the customer login (see
  [forms](../reference/forms.md)); audit any other form of your theme or of a module before
  sharing the page that carries it.
