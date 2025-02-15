# Authentication

## Overview

This documentation covers the authentication methods supported by our API. We use JSON Web Tokens (JWT) for secure authentication.

## Authentication Methods

### Bearer Token

Most API endpoints require authentication using a Bearer token in the Authorization header:

```http
GET /api/v1/resources
Authorization: Bearer your-token-here
```

### API Key

Some endpoints support API key authentication:

```http
GET /api/v1/resources?api_key=your-api-key
```

## Getting Access Tokens

### User Authentication

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

Response:

```json
{
  "token": "your-jwt-token",
  "expires_in": 3600
}
```

### Token Refresh

```http
POST /api/v1/auth/refresh
Authorization: Bearer your-refresh-token
```

## Error Responses

### Invalid Credentials

```json
{
  "error": "invalid_credentials",
  "message": "The provided credentials are incorrect"
}
```

### Token Expired

```json
{
  "error": "token_expired",
  "message": "The access token has expired"
}
```

## Security Best Practices

1. Always use HTTPS
2. Never share your tokens
3. Implement token refresh mechanism
4. Use appropriate token expiration times
5. Implement rate limiting