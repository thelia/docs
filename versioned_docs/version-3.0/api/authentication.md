---
title: Authentication
sidebar_position: 2
---

# API Authentication

The Thelia 3 API uses JWT (JSON Web Token) authentication via the `lexik/jwt-authentication-bundle`.

The API layer relies on the standalone API Platform distribution rather than the full metapackage. The packages declared in `core/composer.json` are:

- `api-platform/symfony` `^4.3` (standalone, not `api-platform/api-platform`)
- `lexik/jwt-authentication-bundle` `^3.0`
- `nelmio/cors-bundle` `^2.2`

## Authentication methods

| Method | Use Case | Routes |
|--------|----------|--------|
| JWT Token | All authenticated API access | `/api/admin/*`, `/api/front/*` (protected) |
| None (public) | Front-office public data | `/api/front/*` (public endpoints) |

## JWT authentication

### Login endpoints

Thelia provides two login endpoints:

```http
POST /api/admin/login
Content-Type: application/json

{
    "username": "admin@example.com",
    "password": "your-password"
}
```

```http
POST /api/front/login
Content-Type: application/json

{
    "username": "customer@example.com",
    "password": "customer-password"
}
```

### Response

On successful authentication:

```json
{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
    "refresh_token": "9f2c...64 random bytes, hex encoded...",
    "refresh_token_ttl": 2592000
}
```

`token` is the JWT to send on every authenticated request. `refresh_token` is an opaque
value that buys a new one when it expires, and `refresh_token_ttl` is its own lifetime in
seconds.

### Using the token

Include the JWT token in the `Authorization` header for authenticated requests:

```http
GET /api/admin/products
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
```

### Token payload

The JWT token contains:

```json
{
    "username": "admin@example.com",
    "type": "Thelia\\Model\\Admin",
    "exp": 1234567890,
    "iat": 1234567800
}
```

The `type` field indicates whether the user is an Admin or a Customer.

## Refresh tokens

A short-lived JWT keeps the damage of a leaked token small, but it forces the client to
send the credentials again every hour. The refresh token solves that: it is issued
alongside the JWT at login, and exchanged for a fresh pair when the JWT expires.

### Refresh endpoints

```http
POST /api/admin/token/refresh
POST /api/front/token/refresh
Content-Type: application/json

{
    "refresh_token": "9f2c..."
}
```

The endpoints also accept a form-encoded body (`refresh_token=9f2c...`). The response has
the same shape as a login response:

```json
{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
    "refresh_token": "1a7e...",
    "refresh_token_ttl": 2592000
}
```

### How it behaves

- **Opaque, not a JWT.** The value is 64 random bytes, hex encoded. It carries no
  information and cannot be decoded.
- **Single use.** Consuming a refresh token deletes it before the payload is returned, and
  the response carries a new one. Replaying the same value fails.
- **Scoped.** A token issued on `/api/admin/login` only works on
  `/api/admin/token/refresh`, and a token issued on `/api/front/login` only on
  `/api/front/token/refresh`. Presenting one on the other endpoint returns `401`.
- **Stored in its own cache pool.** Refresh tokens live in `thelia.cache.security`, which
  nothing empties on a deployment or on a cache clear, so releasing a new version does not
  sign the clients out. Eviction still invalidates a token and forces a new login: see
  [Application cache](../getting-started/application-cache.md) for the backend and the
  eviction policy to use in production.

| Response | Meaning |
| --- | --- |
| `400` | No `refresh_token` in the request body |
| `401` | Unknown, expired, already used, or wrong-scope token |
| `200` | New JWT and new refresh token |

The lifetime is set by `JWT_REFRESH_TOKEN_TTL` (default `2592000`, i.e. 30 days). See
[JWT configuration](#jwt-configuration).

:::tip
Store the refresh token where the access token is not: it is the credential that survives.
On a browser client, prefer a same-site cookie set by your own backend over
`localStorage`.
:::

## Front routes (public)

Public front routes (`/api/front/*`) do not require authentication:

```http
GET /api/front/products
GET /api/front/categories
GET /api/front/brands
```

These routes only expose publicly visible data (e.g., `visible=true` products).

### Customer-authenticated routes

Some front routes require customer authentication to return personalized data:

```http
GET /api/front/carts/current
Authorization: Bearer {customer-jwt-token}
```

## JWT configuration

JWT keys are configured in your environment. The default configuration uses RSA keys:

```bash
# Generate keys (one-time setup)
php Thelia lexik:jwt:generate-keypair
```

Configure in `.env`:

```bash
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your-passphrase
# Token lifetime in seconds (read by lexik_jwt_authentication.token_ttl)
JWT_TOKEN_TTL=3600
# Refresh token lifetime in seconds
JWT_REFRESH_TOKEN_TTL=2592000
```

:::note
The bundle configuration (`config/packages/lexik_jwt_authentication.yaml`) maps these variables directly: `secret_key`, `public_key`, `pass_phrase` and `token_ttl: '%env(int:JWT_TOKEN_TTL)%'`. Tokens expire after `JWT_TOKEN_TTL` seconds (default `3600`, i.e. one hour). `JWT_REFRESH_TOKEN_TTL` is read by Thelia itself, not by the bundle, and drives the [refresh tokens](#refresh-tokens).
:::

## CORS configuration

Thelia ships with `nelmio/cors-bundle` pre-configured in `config/packages/nelmio_cors.yaml`. The default configuration allows origins matching `CORS_ALLOW_ORIGIN` (set in `.env`):

```yaml
nelmio_cors:
    defaults:
        origin_regex: true
        allow_origin: ['%env(CORS_ALLOW_ORIGIN)%']
        allow_methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE']
        allow_headers: ['Content-Type', 'Authorization']
        expose_headers: ['Link']
        max_age: 3600
    paths:
        '^/': null
```

To allow all origins during development, set in `.env.local`:

```bash
CORS_ALLOW_ORIGIN='^https?://.*$'
```

## Error responses

### 401 Unauthorized

```json
{
    "code": 401,
    "message": "JWT Token not found"
}
```

Or for invalid/expired tokens:

```json
{
    "code": 401,
    "message": "Expired JWT Token"
}
```

### 403 Forbidden

```json
{
    "code": 403,
    "message": "Access Denied"
}
```

## Best practices

1. Always use HTTPS in production to protect tokens in transit.
2. Configure a token lifetime suited to your use case.
3. Keep the JWT private keys out of version control and restrict access to them.
4. Validate tokens on the server. Never trust client-side validation.
5. Treat the refresh token as the credential that survives: store it apart from the access token, and discard it on logout.

## OpenAPI documentation

The `/api/docs` endpoint documents JWT authentication and provides an "Authorize" button for testing authenticated endpoints.

## Next steps

- [Resources](./resources) - Creating API resources
- [Endpoints Reference](./endpoints) - Available endpoints
