---
title: Default Response Headers
sidebar_position: 3
---

# Default Response Headers

Since Thelia 3.1, every response to a main request carries three security headers:

| Header | Value | What it does |
| --- | --- | --- |
| `X-Content-Type-Options` | `nosniff` | The browser trusts the declared content type instead of guessing it. |
| `X-Frame-Options` | `SAMEORIGIN` | Another site cannot put the shop in a frame. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | A link out carries the origin, not the full path and query string. |

They are set **only when absent**, so a theme, a module or a reverse proxy that writes its own
value keeps the last word. `Thelia\Core\EventListener\ResponseHeadersListener` does the work, on
the kernel response event, at priority `-1024` so that everything else has already had its say.

Sub-requests are left alone: only the main request gets the headers.

## When you have to override one

A shop that is displayed inside a frame on another domain has to write its own `X-Frame-Options`,
or the browser will refuse to render it. Set the header before the listener runs, from a listener
of your own on the same event at any priority above `-1024`:

```php
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

#[AsEventListener(event: KernelEvents::RESPONSE)]
final readonly class PartnerFrameHeaders
{
    public function __invoke(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $headers = $event->getResponse()->headers;
        $headers->set('Content-Security-Policy', "frame-ancestors 'self' https://partner.example.com");
        $headers->set('X-Frame-Options', 'SAMEORIGIN');
    }
}
```

The listener sees `X-Frame-Options` already set and leaves it alone, and the browser reads the
`frame-ancestors` directive, which wins over `X-Frame-Options` wherever both are understood. That
is the only portable way to name another host: `X-Frame-Options` itself knows nothing beyond
`SAMEORIGIN` and `DENY`.

Setting the header at the reverse proxy works just as well: the listener does not overwrite a
header the response already carries, and a proxy that adds its own after PHP has answered wins by
definition.
