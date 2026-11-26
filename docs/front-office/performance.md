---
title: Performance
sidebar_position: 12
---

# Performance

**In short.** The core measures the Flexy storefront with Lighthouse on every change of its main
branch, every night and every release, and fails when a page gets worse than its written
reference. The figures below are those of the reference. They are lab figures of a demo shop:
they compare one version of Thelia with another, not your shop with another.

## Figures of the theme

Reference of 2026-11-17: Thelia core of that day with Flexy `bf04b3b4d` (development branch). Each figure is the median of four measures of three runs, made on the same code.

### Desktop

| Page | Perf. | A11y | Best pr. | SEO | FCP | LCP | CLS | TBT | Transferred | Requests |
|---|---|---|---|---|---|---|---|---|---|---|
| Home (`/`) | 99 | 100 | 100 | 100 | 0.83 s | 0.83 s | 0.004 | 0.00 s | 220 KiB | 30 |
| Contact (`/contact`) | 99 | 100 | 100 | 100 | 0.81 s | 0.81 s | 0.000 | 0.00 s | 213 KiB | 29 |
| Content (`/a-propos.html`) | 99 | 100 | 100 | 100 | 0.82 s | 0.82 s | 0.002 | 0.00 s | 223 KiB | 32 |
| Search results (`/search?query=t`) | 99 | 100 | 100 | 66 | 0.83 s | 0.83 s | 0.001 | 0.00 s | 231 KiB | 35 |
| Category (`/chairs.html`) | 98 | 98 | 100 | 100 | 0.83 s | 0.84 s | 0.001 | 0.00 s | 275 KiB | 49 |
| Product (`/barbara-1.html`) | 78 | 100 | 100 | 100 | 0.83 s | 0.90 s | 0.455 | 0.00 s | 1105 KiB | 53 |
| Account (`/account`) | 98 | 100 | 100 | 100 | 0.83 s | 0.83 s | 0.001 | 0.00 s | 221 KiB | 32 |
| Addresses (`/account/addresses`) | 99 | 100 | 100 | 100 | 0.80 s | 0.80 s | 0.002 | 0.00 s | 213 KiB | 31 |
| Orders (`/account/orders`) | 99 | 96 | 100 | 100 | 0.80 s | 0.80 s | 0.001 | 0.00 s | 215 KiB | 32 |
| Purchase lists (`/account/purchase-lists`) | 98 | 98 | 100 | 100 | 0.88 s | 0.88 s | 0.002 | 0.00 s | 255 KiB | 30 |

### Mobile

| Page | Perf. | A11y | Best pr. | SEO | FCP | LCP | CLS | TBT | Transferred | Requests |
|---|---|---|---|---|---|---|---|---|---|---|
| Home (`/`) | 96 | 100 | 100 | 100 | 2.07 s | 2.07 s | 0.004 | 0.00 s | 220 KiB | 30 |
| Contact (`/contact`) | 99 | 100 | 100 | 100 | 1.68 s | 1.68 s | 0.000 | 0.00 s | 213 KiB | 29 |
| Content (`/a-propos.html`) | 99 | 100 | 100 | 100 | 1.68 s | 1.68 s | 0.001 | 0.00 s | 223 KiB | 32 |
| Search results (`/search?query=t`) | 88 | 100 | 100 | 66 | 2.47 s | 3.33 s | 0.001 | 0.00 s | 230 KiB | 35 |
| Category (`/chairs.html`) | 87 | 100 | 100 | 100 | 2.53 s | 3.49 s | 0.001 | 0.00 s | 267 KiB | 48 |
| Product (`/barbara-1.html`) | 60 | 100 | 100 | 100 | 3.19 s | 3.85 s | 0.928 | 0.00 s | 1024 KiB | 46 |
| Account (`/account`) | 90 | 100 | 100 | 100 | 2.75 s | 2.82 s | 0.001 | 0.00 s | 221 KiB | 32 |
| Addresses (`/account/addresses`) | 92 | 100 | 100 | 100 | 2.71 s | 2.74 s | 0.008 | 0.00 s | 221 KiB | 32 |
| Orders (`/account/orders`) | 88 | 96 | 100 | 100 | 2.98 s | 3.19 s | 0.002 | 0.00 s | 222 KiB | 33 |
| Purchase lists (`/account/purchase-lists`) | 82 | 98 | 100 | 100 | 3.49 s | 3.63 s | 0.001 | 0.00 s | 255 KiB | 30 |

On mobile, the performance score, FCP and LCP of one measure can land far from these medians:
on the same code they jump between two values. See [what is not held by a threshold](#what-is-not-held-by-a-threshold).

The home page of the demo is a page of the CMS, with a short text and three teasers.

The product page is the weak point: its first gallery image, the largest element of the page, is loaded lazily and has no dimensions, and the information block below it moves when the images arrive. The search results page scores 66 in SEO because it asks not to be indexed, on purpose.

Scores are out of 100. FCP and LCP are the times until the first content and the largest
content are painted, CLS the layout shift, TBT the time the main thread is blocked during the
load. Transferred is the weight sent over the network, compressed; Requests the number of
requests the page makes.

INP, the interaction metric of the Core Web Vitals, needs a real visitor clicking: Lighthouse
measures TBT instead, which moves with the JavaScript run at load.

## How the figures are measured

| | |
|---|---|
| Shop | Fresh install with the demo data (`bin/install --with-demo`): about thirty products |
| Mode | `APP_ENV=prod`, assets compiled and precompressed by `asset-map:compile` |
| Server | Apache and PHP-FPM, PHP 8.3, over HTTP/2 with TLS, with the `public/.htaccess` of the release |
| Machine | GitHub-hosted runner, 4 vCPU Intel(R) Xeon(R) 6975P-C, 15 GB |
| Tool | Lighthouse 12.6.1 through Lighthouse CI 0.15.1, in the Chrome of Puppeteer 25.16.0 |
| Presets | Desktop (`preset: desktop`) and mobile (Lighthouse default: simulated slow 4G and a slower CPU) |
| Runs | 3 per page and preset; a measure keeps the median of the three. The reference is the median of four measures |
| Pages | The ten pages of `setup/audit/lighthouserc.default.yaml`. The four account pages are measured signed in as the demo customer, through the sign-in form |

Before measuring, the job checks that Flexy is the active theme, that the debug toolbar is off,
and that a stylesheet is served from its precompressed copy. A page that redirects fails the
measure: an account page measured signed out would be the sign-in form under another name.

The workflow is `.github/workflows/lighthouse.yml` of the core. Each release carries the figures
measured on it, as `lighthouse.md` and two JSON files attached to the release on GitHub.

## Measure it yourself

On a shop of yours, or on a fresh install with the demo data, served in production:

```bash
npm install --prefix /tmp/lhci @lhci/cli@0.15.1 puppeteer@25.16.0
export PATH="/tmp/lhci/node_modules/.bin:$PATH"

mkdir -p /tmp/lighthouse/desktop
node setup/audit/lighthouse.mjs config --origin https://my-shop.test --preset desktop \
  --output /tmp/lighthouse/desktop/lighthouserc.yaml

export LIGHTHOUSE_CUSTOMER_EMAIL=test@thelia.net LIGHTHOUSE_CUSTOMER_PASSWORD=thelia
cd /tmp/lighthouse/desktop && lhci collect --config=lighthouserc.yaml && cd -

node setup/audit/lighthouse.mjs summary --preset desktop --results /tmp/lighthouse/desktop/.lighthouseci
```

Run Lighthouse CI from the folder of the generated file: it writes its results in
`.lighthouseci` there, and loads the sign-in script relative to it. Use a customer of your own
shop for the account pages. `--preset mobile` gives the mobile figures.

On another machine the figures move: a faster processor lowers the times, a slower network
raises them. Compare a measure with another made on the same machine, and read the scores of
this page as an order of magnitude. On mobile, compare the times and the performance score with
the ranges of [what is not held by a threshold](#what-is-not-held-by-a-threshold), not with a
single median: one measure lands on either of two values.

## The thresholds

`setup/audit/lighthouse-budget.json` holds, for each page and preset, the reference measure with
its date and commit, and a tolerance per metric. The job fails when a median is worse than the
reference moved by the tolerance, and names the page and the metric:

| Metric | Desktop | Mobile |
|---|---|---|
| Performance score | −5 points | none |
| Accessibility score | −2 points | −2 points |
| Best practices score | −5 points | −5 points |
| SEO score | −2 points | −2 points |
| FCP | +25 % +100 ms | none |
| LCP | +25 % +100 ms, none on the product page | none |
| CLS | +0.05 | +0.05, none on the product page |
| TBT | +20 % +50 ms | +50 % +200 ms |
| Transferred weight | +10 % | +10 % |
| Requests | +3 | +3 |

The tolerances are set from the gaps between measures of the same code on GitHub runners, so
that the noise of a shared machine does not fail the job. On desktop the times moved by 25 % at
most over seven measures (0.68 to 0.85 s on the content page), inside their tolerance, and the
desktop performance score by 4 points at most. The accessibility, best practices and SEO scores,
the layout shift, the blocking time, the weight and the request count did not move, except the
mobile layout shift of the product page, and keep tight thresholds on both presets.

### What is not held by a threshold

Some figures move too much between two measures of the same code to tell a regression from the
noise. They are measured and published like the others, but fail nothing; the summary of each
measure lists them under its table, with the reason.

- **Mobile FCP, LCP and performance score.** Lighthouse simulates the slow 4G of the mobile
  preset from what it recorded during the load. The Google Fonts files of Flexy come from the
  internet, and finish before or after the real first paint from one run to the next; when they
  finish before, the simulation counts them, and the times jump by about 1.5 s. Over the 21 runs
  per page of 2026-11-17, the mobile FCP is 1.68 s when none had finished (median of 52 runs) and 3.18 s when
  all seven had (median of 91 runs). The performance score follows the times. More runs do not
  help: a median of 15 runs per page still moves by up to 62 %.
- **Desktop LCP and mobile CLS of the product page.** Its largest element is the first gallery
  image, loaded lazily: it is painted early or late, 0.83 to 1.49 s between two measures on
  desktop. On mobile, the gallery images, which have no dimensions, shift the page or not before
  Lighthouse stops recording: the CLS is 0.928 or 0 from one run to the next.

Gaps between seven measures of the same code (2026-11-17, median of three runs each):

| Page | Mobile perf. | Mobile FCP | Mobile LCP |
|---|---|---|---|
| Home (`/`) | 87 to 99 | 1.67 to 3.18 s | 1.67 to 3.18 s |
| Contact (`/contact`) | 87 to 99 | 1.68 to 3.18 s | 1.68 to 3.18 s |
| Content (`/a-propos.html`) | 86 to 99 | 1.67 to 3.07 s | 1.67 to 3.34 s |
| Search results (`/search?query=t`) | 85 to 91 | 1.70 to 3.26 s | 3.20 to 3.34 s |
| Category (`/chairs.html`) | 84 to 90 | 1.80 to 3.27 s | 3.41 to 3.49 s |
| Product (`/barbara-1.html`) | 45 to 74 | 2.58 to 3.19 s | 3.40 to 7.38 s |
| Account (`/account`) | 86 to 99 | 1.68 to 3.19 s | 1.71 to 3.34 s |
| Addresses (`/account/addresses`) | 86 to 99 | 1.69 to 3.12 s | 1.86 to 3.33 s |
| Orders (`/account/orders`) | 87 to 88 | 2.96 to 3.11 s | 3.18 to 3.19 s |
| Purchase lists (`/account/purchase-lists`) | 82 to 85 | 3.34 to 3.57 s | 3.34 to 3.64 s |

These figures get a threshold again once the theme serves its fonts itself and loads the first
gallery image without delay, with its dimensions.

The reference is changed by hand, in a commit that says why: after an improvement is acquired,
to keep it, or when a change accepts a cost and says so. It is never rewritten from the last
run, which would let a slow drift through. `summary` prints the values of a run in the format
of the budget file, ready to be reviewed and pasted.

## Limits

- **Lab, not field.** These are measures in a controlled browser, not the experience of real
  visitors on their devices. The field figures of a shop come from its own visitors (Chrome
  User Experience Report, a RUM tool).
- **A demo shop.** Thirty products, a few categories, no third-party script, no tracking, no
  chat. A shop with a large catalogue or many modules has other figures; how the theme holds
  with volume is a separate measure.
- **A shared machine.** GitHub runners do not have constant performance. A measure made there
  compares with another made there.
- **The accessibility score is an indicator.** It counts automated checks; the
  [accessibility statement](./accessibility.md) is what tells the conformance of the theme.
