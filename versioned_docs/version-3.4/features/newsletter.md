---
title: Newsletter
sidebar_position: 15
---

# Newsletter

Added in Thelia 3.4.

A shop that does not send a newsletter can turn the sign-up off. Nothing changes until the setting is switched: a fresh install and an updated shop both start with the newsletter on.

## Turn the newsletter off

The setting is the configuration variable `newsletter_enabled`:

| Value | Effect |
| --- | --- |
| `1` | The shop offers the sign-up. This is the default. |
| `0` | The shop takes no new sign-up and hides every box that offers one. |

The install seeds `1`. The `3.4.0` update script adds the variable with the same value, and keeps a value that is already set, so running it again changes nothing.

An administrator who may update the newsletter turns it on or off with the button at the top of **Tools > Newsletter**. The page shows the current state, and the change is written to the administration log. Anyone else sees the state without the button. You can also set the variable `newsletter_enabled` directly. In code, read it with `ConfigQuery::isNewsletterEnabled()`; any value other than `0` counts as on.

## What stops

With the newsletter off:

- The `NEWSLETTER_SUBSCRIBE` event records nothing, and its propagation is stopped. The listeners that run after the core one do not act on an address the shop did not keep: the confirmation e-mail and the synchronisations of a module are skipped.
- `NEWSLETTER_UPDATE` saves the subscriber but no longer sets `unsubscribed` back to `0`. An address that left stays out.
- `CustomerCreateForm` and `CustomerProfileUpdateForm` have no `newsletter` field, so the account forms show no checkbox. A theme or a module that reads `$form->get('newsletter')` must test `$form->has('newsletter')` first.
- The Flexy theme hides the newsletter block of the footer, and the sentences that list the benefits of an account no longer promise the newsletter. The `newsletter_enabled()` Twig function of the theme tells a template whether to show a sign-up.

## What keeps working

Whatever the value:

- Unsubscribing.
- The back-office actions of **Tools > Newsletter**: the list, the CSV export and **Unsubscribe**.
- The `/api/admin/news_letters` operations. See [API endpoints](../api/endpoints#newsletter-subscribers).

## For module authors

When the newsletter is off, a `NewsletterEvent` dispatched for `NEWSLETTER_SUBSCRIBE` carries no subscriber. `NewsletterEvent::getNewsletter()` fails on the uninitialised property, so call `NewsletterEvent::hasNewsletter()` first:

```php
$this->dispatcher->dispatch($event, TheliaEvents::NEWSLETTER_SUBSCRIBE);

if ($event->hasNewsletter()) {
    $subscriber = $event->getNewsletter();
}
```

See [events](../reference/events#newsletter) for the four newsletter events.
