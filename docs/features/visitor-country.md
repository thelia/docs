---
title: Visitor Country Detection
sidebar_position: 12
---

# Visitor Country Detection

Added in Thelia 3.3, with Flexy 1.3.

The shop can read the country of an anonymous visitor and use it in two ways: suggest it, with a
banner that the visitor accepts or closes, or apply it, so that the visitor sees the prices of
that country and the country is preselected in the first address form.

The feature ships switched off. A shop that updates keeps its prices and its checkout as they were.

## Turning it on

The settings are on the store configuration screen of the back office, under Configuration, then
Store. Each one is stored under the key shown here.

| Key | Default | Meaning |
| --- | --- | --- |
| `visitor_country_mode` | `off` | `off` changes nothing. `suggest` shows a banner. `apply` uses the detected country. |
| `visitor_country_source` | `header` | `header` reads a header set by a CDN or a proxy. `ip_database` looks the address up in a database file. |
| `visitor_country_header` | `CF-IPCountry` | The name of the header read when the source is `header`. |
| `visitor_country_database` | empty | The file name of the database, read from `local/geoip/`. Only the name, not a path. |

## What the visitor sees

With the mode at `off`, nothing changes and no detection runs.

With `apply`, the detected country of an anonymous visitor becomes its tax country. The prices
on the catalogue and on the cart carry the tax of that country, and the country is preselected in
the first address form of the checkout.

With `suggest`, the shop keeps its default country. The Flexy theme shows a discreet banner once,
for example "You seem to be in Belgium. See prices for Belgium." The visitor can accept it or
close it. The choice is kept for the session, so the banner does not come back on the next page.

If multi-domain is active and a language of the detected country has its own domain, the banner
links to that domain. The shop never redirects a visitor on its own.

With multi-domain, arriving on the domain of a language of the detected country counts as
accepting. When the mode is `suggest`, multi-domain is active, the region of the language of the
session (`BE` for `nl_BE`, the part after the last `_`) is the detected country, and the visitor
has not answered yet, the shop keeps that country and marks the suggestion as answered. The banner
is not shown on that domain, and the prices are those of that country.

### When the mode changes

The mode is read on every request, so a change applies to visitors who already have a session:

- Switching to `apply`: a visitor whose country was detected, and who has no country in use yet,
  gets the detected country on the next request, even when the session was opened in `suggest`
  mode.
- Switching to `suggest`: a country kept while the mode was `apply` is no longer used. Only a
  country the visitor accepted is used in `suggest` mode, so the visitor sees the default country
  and the banner until they answer.
- Switching to `off`: the default country is used again, as before.

Whatever the mode, these rules hold:

- An address entered by the customer always wins. An order is taxed on its billing address, never
  on the detected country.
- A value the shop does not recognise, a forged value, or a country that is not sold on the
  storefront is ignored. The visitor keeps the default country, and no message is shown.
- Detection runs once per session. With source `header`, a request that carries no usable header
  does not close the detection: it runs again on the next request, but a header that is present is
  the answer, even for a country the shop does not show. With source `ip_database`, a lookup that
  finds nothing is remembered for the session.
- Detection does not run from the command line, nor on `/admin`.

## Where the country comes from

### Source `header`

The header is set by the CDN or the proxy in front of the shop. Common examples:

- `CF-IPCountry`, sent by Cloudflare when the IP Geolocation option is enabled;
- `CloudFront-Viewer-Country`, sent by Amazon CloudFront. Add it to the origin request policy,
  or CloudFront does not forward it;
- `X-Vercel-IP-Country`, sent by Vercel;
- a header of your own, set by your proxy, named in `visitor_country_header`.

:::warning The header is trusted only when the proxy sets it
Behind a proxy that rewrites the header, its value is the country of the visitor. Without such a
proxy, the visitor can send the header itself. The detected country is then only a display choice:
it never grants a right, and it never fixes a price.
:::

The header must reach Thelia from the proxy that sets it. Configure the proxy so that it drops any
value the visitor sends with that name, then sets its own.

### Source `ip_database`

The shop looks the visitor's address up in a country database, in the MaxMind DB format (`.mmdb`).
The merchant puts the file in `local/geoip/` and writes its name in `visitor_country_database`.

The source needs the optional PHP library `maxmind-db/reader`:

```bash
composer require maxmind-db/reader
```

If the library or the database is missing, or the database cannot be read, the shop writes a
warning to its log and keeps the default country.

The server must see the real address of the visitor. Behind a proxy, declare your proxies as
trusted proxies, as explained in [the trusted proxies section](../getting-started/cdn.md#3-the-trusted-proxies)
and in [the proxy section of the rate limiting page](../api/rate-limiting.md#behind-a-proxy-or-a-load-balancer).
Without them, every visitor has the address of the proxy, and so the country of the proxy.

A lookup that finds nothing is remembered for the session. A database installed after the fact
is therefore read by new sessions only: a visitor whose session already ran the lookup keeps the
default country until the session ends.

Databases that are compatible, listed with their licence. This list does not recommend one:

- MaxMind GeoLite2 Country: a free account and a licence agreement are required. The merchant is
  responsible for the updates.
- DB-IP IP to Country Lite: licensed under CC BY 4.0, which requires attribution.

Whichever database you use, its updates are your responsibility. An old database keeps assigning
addresses to the countries they had when it was built.

## The token of the banner

The banner posts a stateless CSRF token: it is the same for every visitor and checks the origin of
the request, not a session, so the banner does not depend on who the page was built for. Its
identifier is `thelia_country_suggestion`, and the Flexy theme declares it under
`framework.csrf_protection.stateless_token_ids` in its own `config/packages/csrf.yaml`. There is
nothing to add to the `config/packages/csrf.yaml` of the shop.

## Caching

While the detection is active, in `suggest` or `apply` mode, the pages are not shared by the
cache of the shop, whatever the source: each visitor gets a page built for them, and the answer
carries no `Vary` header for the country. In `off` mode the shared cache behaves as it did before
the feature.

A CDN or a reverse proxy in front of the shop therefore has nothing to key on and nothing to
configure for the country. Make sure it does not cache these pages on its own, against the
`Cache-Control` the shop sends: a cache that ignores it serves the page built for the first visitor
to every visitor of the same URL, banner and prices included. See the
[reverse proxy cache](../getting-started/reverse-proxy-cache.md) and the
[CDN](../getting-started/cdn.md) pages.

### Module authors

A resolver of your own reads something the cache cannot see, such as a cookie or the IP address.
The core already keeps the pages out of the shared cache while the detection is active, so the
page that depends on your resolver is covered. A page of your own, built from the detected
country outside the detection modes, must be answered with a private response
(`Cache-Control: private`).

## Personal data

The IP address is neither logged nor stored for this feature. Only the detected country is kept, in
the session of the visitor.

## For developers

The detected country is exposed by the facade `Thelia\Domain\Localization\VisitorCountryFacade`.
A module reads it there rather than from the request headers.

| Method | Returns |
| --- | --- |
| `mode()` | The mode set in the back office: `off`, `suggest` or `apply`. |
| `detectedCountry()` | The country found for the visitor, or `null` when the mode is `off` or nothing was found. |
| `currentCountry()` | The country the visitor shops in: the one applied or accepted, else the default country of the shop. |
| `suggestion()` | The country to offer, in `suggest` mode, to a visitor with no account who has not answered yet; otherwise `null`. |
| `accept($countryId)` | Keeps that country for the session, and answers the suggestion. `false`, with nothing written, when the mode is `off`, when the country is not the detected one, when it is not visible in the shop, or when there is no session. |
| `decline()` | Records that the visitor closed the suggestion, and forgets a country kept while the mode was `apply`. |

The detection runs once per session, before the page is rendered, so these methods do not
read the request again. `CountryService::getPreselectedCountry()` gives the country an address
form opens on.

A module can provide its own source by implementing
`Thelia\Domain\Localization\VisitorCountry\VisitorCountryResolverInterface`. Its method
`resolve(Request): ?string` returns an ISO 3166-1 alpha-2 code, such as `BE`, or `null`.

The front API exposes the mode and the detected country. It informs and applies nothing: the
answer is built from the request alone, without a session, and a headless front decides what to do
with it.

```http
GET /api/front/visitor_country
```

```json
{"mode": "suggest", "detected": "BE"}
```
