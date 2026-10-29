---
title: Payments
sidebar_position: 2
---

# Payments

Four payment methods ship with the distribution. Two are offline and need no third party, two
connect to an online payment provider.

| Module | Payment | Default state | Needs |
| --- | --- | --- | --- |
| Cheque | Cheque, paid after the order | Active | Nothing |
| WireTransfer | Bank transfer, paid after the order | Active | The shop's bank details |
| PayPal | PayPal account or card, through PayPal | Inactive | A PayPal REST application |
| StripePayment | Card and other methods, through Stripe | Inactive | A Stripe account |

A payment method that is not configured is never offered at checkout. A shop can therefore keep
these modules active while it gathers its keys: the customer only sees the methods that work.

After the order, the confirmation page of the Flexy theme says "Your payment has been confirmed" only
when the order is paid. For an order still to be paid, such as a cheque or a bank transfer, it says
"Your order has been placed".

## Bank transfer (WireTransfer)

### Set it up

Open `/admin/module/WireTransfer` and fill in:

- the account holder name;
- the IBAN and the BIC, which are checked for a valid format when you save;
- an optional message shown to the customer with the bank details.

Once the order is placed, the bank details are displayed on the order confirmation page and in
the confirmation e-mail. The order stays unpaid until you mark it as paid in the back office, once
the transfer has reached the account.

### Without the bank details

Bank transfer is not offered at checkout.

Module: [thelia-modules/WireTransfer](https://github.com/thelia-modules/WireTransfer)

## PayPal

### Set it up

1. Create a REST application in the PayPal developer dashboard, for the sandbox and for live.
2. Activate the PayPal module.
3. Open `/admin/module/PayPal` and enter:
   - the sandbox client ID, secret and merchant ID;
   - the live client ID, secret and merchant ID;
   - the sandbox switch, which selects the set of credentials in use;
   - the list of allowed IP addresses.

In sandbox mode, only visitors whose IP address is in the allowed list see PayPal at checkout. Add
your own address to test, and leave real customers out of test payments.

### Without credentials

As long as the client ID or the secret of the active mode (sandbox or live) is empty, PayPal is not
offered at checkout.

Module: [thelia-modules/PayPal](https://github.com/thelia-modules/PayPal)

## Stripe (StripePayment)

### Set it up

1. Activate the StripePayment module.
2. Open `/admin/module/StripePayment` and enter the secret key and the publishable key from the
   Stripe dashboard, then tick **enabled**.
3. Choose a secure URL segment. It is part of the webhook address and makes it hard to guess.
4. In the Stripe dashboard, create a webhook endpoint pointing to:

   ```text
   https://<your-shop>/module/StripePayment/stripe_webhook/<secure-url-segment>/listen
   ```

   and subscribe it to the events `checkout.session.completed`, `payment_intent.succeeded` and
   `payment_intent.payment_failed`.
5. Copy the signing secret of that webhook into the **webhook signing secret** field.

The webhook is how the shop learns that a payment succeeded or failed: without it, orders paid on
Stripe stay unpaid in the back office.

With the Flexy theme, use the Checkout mode, where the customer pays on a page hosted by Stripe and
comes back to the shop. The embedded card form ("Elements" mode) does not render in Flexy.

### Without keys

Stripe is not offered at checkout and no Stripe script is loaded on the shop's pages.

Module: [thelia-modules/StripePayment](https://github.com/thelia-modules/StripePayment)

## Cheque

Active and ready on a fresh install. The order is placed unpaid and you mark it as paid once the
cheque is cashed.

Module: [thelia-modules/Cheque](https://github.com/thelia-modules/Cheque)

## Other payment providers

Other connectors are available as Composer packages in the
[thelia-modules](https://github.com/thelia-modules) organization. To write your own, see
[Payment modules](../../modules/payment-modules.md).
