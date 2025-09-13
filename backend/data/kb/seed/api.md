# Atlan API Documentation

## Authentication

All API requests require authentication using an API token:

```bash
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
     https://your-tenant.atlan.com/api/meta/entity/bulk
```

## Rate Limits

- 1000 requests per minute per API token
- Burst limit: 100 requests per 10 seconds
- Use pagination for large datasets

## Lineage API

### Get Asset Lineage
```bash
GET /api/meta/lineage/{guid}
```

Response includes upstream and downstream relationships with metadata.

### Bulk Lineage Export
```bash
POST /api/meta/lineage/bulk
{
  "guids": ["guid1", "guid2"],
  "depth": 3,
  "direction": "BOTH"
}
```

For complete API documentation: https://developer.atlan.com/api