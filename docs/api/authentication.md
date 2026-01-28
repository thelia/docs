---
title: Authentication
sidebar_position: 2
---

# API Authentication

Thelia 3 API uses **JWT (JSON Web Token)** authentication via the `lexik/jwt-authentication-bundle`.

## Authentication Methods

| Method | Use Case | Routes |
|--------|----------|--------|
| JWT Token | All authenticated API access | `/api/admin/*`, `/api/front/*` (protected) |
| None (public) | Front-office public data | `/api/front/*` (public endpoints) |

## JWT Authentication

### Login Endpoints

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

### Using the Token

Include the JWT token in the `Authorization` header for authenticated requests:

```http
GET /api/admin/products
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
```

### Token Payload

The JWT token contains:

```json
{
    "username": "admin@example.com",
    "type": "Thelia\\Model\\Admin",
    "exp": 1234567890,
    "iat": 1234567800
}
```

The `type` field indicates whether it's an Admin or Customer user.

## Front Routes (Public)

Public front routes (`/api/front/*`) do not require authentication:

```http
GET /api/front/products
GET /api/front/categories
GET /api/front/brands
```

These routes only expose publicly visible data (e.g., `visible=true` products).

### Customer-Authenticated Routes

Some front routes require customer authentication for personalized data:

```http
GET /api/front/carts/current
Authorization: Bearer {customer-jwt-token}
```

## JWT Configuration

JWT keys are configured in your environment. The default configuration uses RSA keys:

```bash
# Generate keys (one-time setup)
php bin/console lexik:jwt:generate-keypair
```

Configure in `.env`:

```bash
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your-passphrase
```

## CORS Configuration

Thelia includes `nelmio/cors-bundle` for CORS support. Configure it in `config/packages/nelmio_cors.yaml`:

```yaml
nelmio_cors:
    defaults:
        origin_regex: true
        allow_origin: ['%env(CORS_ALLOW_ORIGIN)%']
        allow_methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
        allow_headers: ['Content-Type', 'Authorization']
        max_age: 3600
    paths:
        '^/api/':
            allow_origin: ['*']
            allow_headers: ['*']
            allow_methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
```

:::note
CORS configuration is not included by default. You need to create this file if you need cross-origin API access.
:::

## Error Responses

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

## Best Practices

1. **Use HTTPS** - Always use HTTPS in production to protect tokens
2. **Short token lifetime** - Configure appropriate token expiration
3. **Secure key storage** - Protect JWT private keys
4. **Validate on server** - Never trust client-side token validation

## OpenAPI Documentation

The `/api/docs` endpoint includes JWT authentication documentation with "Authorize" button for testing authenticated endpoints.

## Next Steps

- [Resources](./resources) - Creating API resources
- [Endpoints Reference](./endpoints) - Available endpoints
