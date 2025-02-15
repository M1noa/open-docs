# API Documentation

This section contains detailed documentation for the Open-Docs API, including authentication, endpoints, and usage examples.

## Overview

The Open-Docs API allows you to programmatically manage your documentation sites, repositories, and configurations. This API follows REST principles and uses JSON for request and response payloads.

## Authentication

All API requests require authentication using an API key. You can generate an API key from your dashboard settings.

```bash
curl -H "Authorization: Bearer your-api-key" \
     https://api.open-docs.com/v1/sites
```

## Rate Limiting

API requests are limited to:
- 100 requests per minute for free accounts
- 1000 requests per minute for premium accounts

## Common Endpoints

### List Documentation Sites

```bash
GET /v1/sites
```

### Create New Site

```bash
POST /v1/sites
```

### Update Site Configuration

```bash
PUT /v1/sites/{site_id}
```

## Error Handling

The API uses conventional HTTP response codes:
- 2xx for successful requests
- 4xx for client errors
- 5xx for server errors

Error responses include a JSON object with details:

```json
{
  "error": {
    "code": "invalid_auth",
    "message": "Invalid API key provided"
  }
}
```