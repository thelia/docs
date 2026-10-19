---
title: Customer Accounts and Forms
sidebar_position: 8
---

# Customer Accounts and Forms

Two modules act on the forms a customer fills in: one collects the identifiers of business
customers, the other blocks automated submissions.

| Module | What it does | Default state | Needs |
| --- | --- | --- | --- |
| SiretManagement | SIRET and intra-community VAT number of business customers | Active | Optional API key |
| ReCaptcha | Anti-spam check on the customer forms | Inactive | A Google reCAPTCHA site key and secret key |

## Business identifiers (SiretManagement)

### What it does

The module checks the SIRET number (French company identifier) and the intra-community VAT number
of business customers.

On the Flexy forms that already carry these identifiers, the registration step with a company and
the address forms, the module adds no field of its own: the customer fills in one SIRET field and one
VAT number field. The module checks them on the server when the form is submitted and keeps a copy
for its own use:

- for a French address, the SIRET: its length, or its existence in the SIRENE directory when an API
  key is set;
- for an address in the European Union, the VAT number: its format, and its existence in VIES when
  that check is turned on.

The VAT number entered in the address is the one printed on the invoice.

The account profile form has no native identifier fields, so the module adds its own SIRET and VAT
number fields there.

Independently of the module, the core refuses a French VAT number that is not `FR` followed by a two-character
key and the nine digits of the SIREN.

### Set it up

On `/admin/module/SiretManagement`:

- an API key for the SIRENE directory, optional. With a key, the SIRET is checked against the
  directory;
- the VIES check of the VAT number, optional, which asks the European Commission service whether
  the number exists.

### Without a key

Only the length of the SIRET is checked.

Module: [thelia-modules/SiretManagement](https://github.com/thelia-modules/SiretManagement)

## Anti-spam (ReCaptcha)

### Set it up

1. Register the shop's domain in the Google reCAPTCHA admin console and get a site key and a secret
   key.
2. Activate the ReCaptcha module.
3. Open `/admin/module/ReCaptcha` and enter both keys. The secret key is not displayed back once
   saved.

### What it does

With both keys, the contact, registration, password-forgotten and login forms are protected. A
submission that fails the check is refused by the server, whatever the browser sent.

### Without keys

No captcha is displayed and the forms work as without the module.

Module: [thelia-modules/ReCaptcha](https://github.com/thelia-modules/ReCaptcha)
