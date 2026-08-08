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
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
}
```

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
```

:::note
The bundle configuration (`config/packages/lexik_jwt_authentication.yaml`) maps these variables directly: `secret_key`, `public_key`, `pass_phrase` and `token_ttl: '%env(int:JWT_TOKEN_TTL)%'`. Tokens expire after `JWT_TOKEN_TTL` seconds (default `3600`, i.e. one hour).
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

## OpenAPI documentation

The `/api/docs` endpoint documents JWT authentication and provides an "Authorize" button for testing authenticated endpoints.

## Next steps

- [Resources](./resources) - Creating API resources
- [Endpoints Reference](./endpoints) - Available endpoints
