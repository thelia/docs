---
title: Two-Factor Authentication
sidebar_position: 6
---

# Two-Factor Authentication

Since Thelia 3.2, an administrator can protect their account with a time-based one-time code (TOTP, [RFC 6238](https://www.rfc-editor.org/rfc/rfc6238)) on top of the password. Any authenticator app that scans a TOTP QR code works. A leaked password is then no longer enough to open the back office or to get an admin API token.

The feature covers both ways in: the back-office sign-in form and `POST /api/admin/login` (see [API authentication](../api/authentication.md#two-factor-authentication)).

:::warning Requires the `default-twig` back office
Only the `default-twig` back-office template ships the screens of the second factor. A shop still running the Smarty `default` template must not turn the [obligation](#requiring-it-for-every-administrator) on, and an administrator who enabled a second factor there cannot sign in until [`admin:two-factor:reset`](#lost-phone-and-lost-backup-codes) removes it.
:::

## Enabling it for your account

1. Open **Account security** from the top bar of the back office. The same entry is in the row menu of your own account in **Configuration > Administrators**.
2. Click **Enable two-step verification**. The page shows a QR code and the same secret as a setup key, for apps that cannot scan.
3. Add the account to your authenticator app, then type the six-digit code it shows. A wrong code leaves the account unprotected and the page stays open.
4. The next page shows ten backup codes. **They are shown once.** Copy them somewhere other than your phone.

The secret shown during the activation lives in your session only. It is written to the database when a first valid code proves that the app has it.

The authenticator parameters are fixed: SHA-1, six digits, a 30-second period, with one step of tolerance on each side of the current one for clock drift. The app label is the store name (or `Thelia` when the store has none) and the administrator login.

## Signing in

Once the second factor is on, the password form no longer signs the administrator in. It sends them to a second page (`admin.two-factor.verify`) where they type either:

- the six-digit code of the authenticator app, or
- one backup code.

A pending sign-in expires after five minutes and ends after five wrong codes. **Back to the login page** gives the password form back.

A code is accepted once. A code that was already used, even by a request that arrives at the same time as the first one, is refused, so wait for the next code of the app after a sign-in.

The remember-me cookie of a protected account no longer opens the back office on its own. It skips the password and asks for the code, on back-office pages only, and five wrong codes retire it. Enabling, disabling or resetting the second factor retires the remember-me token of the account.

### Backup codes

- There are ten per account, ten characters each, lowercase letters and digits. Spaces and dashes are ignored when one is typed.
- Each one works once. The admin log records every use and how many are left.
- **Account security** shows how many remain and generates ten new ones. The previous codes stop working at once.

### Wrong codes

Two counters apply, on top of the usual login throttling:

| Counter | Limit | Effect |
| --- | --- | --- |
| Per address | Same firewall as the login form (`BruteforceForm`) | Slows down one machine. Active in production only, and while `form_firewall_active` is on. |
| Per account | 10 wrong codes within 10 minutes, with no right code between them | Every code is refused for that account until the window empties. Counted whatever the door (back office or API) and however many addresses the guesses come from. |

Each attempt is counted before its code is checked, so requests sent together cannot all slip under the limit.

## Disabling it

On **Account security**, **Disable** asks for the account password. It removes the secret and the backup codes. If the shop [requires the second factor](#requiring-it-for-every-administrator), the administrator is sent back to the activation page on their next request.

## Requiring it for every administrator

The `admin_two_factor_required` setting makes the second factor mandatory. It is off on a fresh install and after an update to 3.2, and it is hidden from the configuration variables list.

To turn it on, tick **Require two-step verification for every administrator** in the **Administrators** card of the store configuration (`/admin/configuration/store`). Programmatically, the value is `'1'` in the `config` table under that name.

With the setting on:

- An administrator without a second factor who signs in is sent to the activation page. They can reach nothing but that page and the logout until it is done. This includes back-office controllers of modules outside `/admin`.
- The rule is checked on every back-office request, not only at sign-in. An administrator who disables their second factor, or whose second factor another administrator resets, is sent back to the activation on their next page.
- The admin API gives such an account no token, no refresh, and refuses a token issued before with `403`. See [API authentication](../api/authentication.md#two-factor-authentication).

An administrator who only uses the API has to sign in once to the back office to enable the second factor: the API gives them no token until then. Tell your administrators before turning the setting on.

## Lost phone and lost backup codes

There are two ways out, both of which leave the account with its password alone until a new second factor is enabled.

From the back office, another administrator opens **Configuration > Administrators** and chooses **Reset the two-step verification** in the row menu of the account. This needs the update permission on administrators. An administrator cannot reset their own second factor, and only a superadministrator can reset a superadministrator.

From the command line, for the administrator who has no one to reset them, or when no one can sign in:

```bash
php bin/console admin:two-factor:reset <login>
```

With DDEV: `ddev exec php bin/console admin:two-factor:reset <login>`. The command exits with a failure when no administrator has that login, and succeeds with a message when the account has no second factor.

After a reset, the secret and all the backup codes are deleted and the remember-me token is retired. A refresh token issued under the old second factor stops working as well.

## What is stored

| Table | Content |
| --- | --- |
| `admin_two_factor` | The shared secret (Base32), the activation date and the last accepted time step. |
| `admin_two_factor_backup_code` | One row per backup code: a bcrypt hash and the date of use. |

Both are deleted with the administrator.

:::note Known limit
The shared secret is stored in the database as is, unencrypted, so a leaked database gives the secret away. Backup codes are only stored as hashes. Encrypting the secret waits for a vault of the shop secrets.
:::

Every activation, deactivation, reset, backup code use and failed code is written to the admin log (action `TWO_FACTOR`, and `LOGIN` for the sign-in itself). The code that was typed is never logged. The admin log also no longer keeps the `Cookie` and `Authorization` headers of a request.

## For developers

### Using the manager from a module or a template

`Thelia\Domain\Admin\TwoFactor\AdminTwoFactorManager` is the service to call. It is autowirable.

| Method | Use |
| --- | --- |
| `isEnabledFor(Admin $admin): bool` | Whether the account has a second factor. |
| `isRequired(): bool` | Whether `admin_two_factor_required` is on. |
| `mustEnrol(Admin $admin): bool` | Required and not yet enabled. |
| `remainingBackupCodeCount(Admin $admin): int` | Unused backup codes. |
| `regenerateBackupCodes(Admin $admin): array` | Ten new codes, returned in clear once. Throws a `LogicException` when the account has no second factor. |
| `disable(Admin $admin): void` | Removes the second factor of the account. |
| `resetOnBehalfOf(Admin $admin, Admin $resetBy): void` | Reset by a peer, logged under the peer. Throws a `LogicException` when both are the same administrator. |
| `verify(Admin $admin, string $code): TwoFactorVerification` | Checks a TOTP code or a backup code and consumes it. Every attempt counts toward the per-account limit until a code is accepted. |

A module that exposes its own sign-in must call `verify()` and honour the result, or it bypasses the second factor.

### Templates

The back-office template renders three pages: `two-factor-verify`, `two-factor-setup` and `two-factor-backup-codes`. The routes are `admin.two-factor.verify`, `admin.two-factor.check`, `admin.two-factor.cancel`, `admin.two-factor.setup` and `admin.two-factor.confirm`. A custom back-office template must provide the three pages.

### API

The login of the admin API takes the code in a `code` field. A refresh token remembers the second factor the account had when it was issued. See [API authentication](../api/authentication.md#two-factor-authentication).
