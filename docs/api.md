# API Documentation

This document provides detailed information about the E-Commerce Platform REST
API.

## Base URL

```
Production: https://api.ecommerce-platform.com/v1
Development: http://localhost:5000/api/v1
```

## Authentication

### JWT Token Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Authentication Endpoints

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

#### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Products API

### Get All Products

```http
GET /products?page=1&limit=20&category=electronics&sort=price&order=asc
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `category` (optional): Filter by category ID
- `sort` (optional): Sort field (name, price, createdAt)
- `order` (optional): Sort order (asc, desc)
- `search` (optional): Search term for name/description
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Wireless Headphones",
      "description": "High-quality wireless headphones with noise cancellation",
      "price": 199.99,
      "categoryId": "456e7890-e89b-12d3-a456-426614174000",
      "category": {
        "id": "456e7890-e89b-12d3-a456-426614174000",
        "name": "Electronics"
      },
      "stockQuantity": 50,
      "images": [
        "https://example.com/images/headphones-1.jpg",
        "https://example.com/images/headphones-2.jpg"
      ],
      "sku": "WH-001",
      "averageRating": 4.5,
      "reviewCount": 128,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:45:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Get Product by ID

```http
GET /products/{productId}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Wireless Headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "price": 199.99,
    "category": {
      "id": "456e7890-e89b-12d3-a456-426614174000",
      "name": "Electronics"
    },
    "stockQuantity": 50,
    "images": ["https://example.com/images/headphones-1.jpg"],
    "sku": "WH-001",
    "specifications": {
      "battery": "30 hours",
      "connectivity": "Bluetooth 5.0",
      "weight": "250g"
    },
    "reviews": [
      {
        "id": "review-1",
        "userId": "user-1",
        "userName": "John Doe",
        "rating": 5,
        "comment": "Excellent sound quality!",
        "createdAt": "2024-01-18T09:15:00Z"
      }
    ],
    "averageRating": 4.5,
    "reviewCount": 128,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z"
  }
}
```

### Create Product (Admin Only)

```http
POST /products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "categoryId": "456e7890-e89b-12d3-a456-426614174000",
  "stockQuantity": 100,
  "sku": "NP-001",
  "images": [
    "https://example.com/images/new-product.jpg"
  ],
  "specifications": {
    "color": "Black",
    "material": "Plastic"
  }
}
```

## Categories API

### Get All Categories

```http
GET /categories
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174000",
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "parentId": null,
      "children": [
        {
          "id": "789e0123-e89b-12d3-a456-426614174000",
          "name": "Audio",
          "parentId": "456e7890-e89b-12d3-a456-426614174000"
        }
      ],
      "productCount": 45,
      "isActive": true
    }
  ]
}
```

## Cart API

### Get User Cart

```http
GET /cart
Authorization: Bearer <user_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "cart-123",
    "userId": "user-123",
    "items": [
      {
        "id": "item-1",
        "productId": "123e4567-e89b-12d3-a456-426614174000",
        "product": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "Wireless Headphones",
          "price": 199.99,
          "images": ["https://example.com/images/headphones-1.jpg"]
        },
        "quantity": 2,
        "unitPrice": 199.99,
        "totalPrice": 399.98
      }
    ],
    "totalItems": 2,
    "totalAmount": 399.98,
    "updatedAt": "2024-01-20T14:45:00Z"
  }
}
```

### Add Item to Cart

```http
POST /cart/items
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "productId": "123e4567-e89b-12d3-a456-426614174000",
  "quantity": 1
}
```

### Update Cart Item

```http
PUT /cart/items/{itemId}
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "quantity": 3
}
```

### Remove Item from Cart

```http
DELETE /cart/items/{itemId}
Authorization: Bearer <user_token>
```

## Orders API

### Get User Orders

```http
GET /orders?page=1&limit=10&status=completed
Authorization: Bearer <user_token>
```

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by order status

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "order-123",
      "userId": "user-123",
      "status": "completed",
      "totalAmount": 399.98,
      "items": [
        {
          "id": "orderitem-1",
          "productId": "123e4567-e89b-12d3-a456-426614174000",
          "productName": "Wireless Headphones",
          "quantity": 2,
          "unitPrice": 199.99,
          "totalPrice": 399.98
        }
      ],
      "shippingAddress": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "payment": {
        "method": "stripe",
        "status": "completed",
        "transactionId": "pi_1234567890"
      },
      "tracking": {
        "number": "1Z999AA1234567890",
        "carrier": "UPS",
        "status": "delivered"
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-18T16:22:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10
  }
}
```

### Create Order

```http
POST /orders
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "123e4567-e89b-12d3-a456-426614174000",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "billingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "stripe",
  "paymentToken": "pm_1234567890"
}
```

### Get Order by ID

```http
GET /orders/{orderId}
Authorization: Bearer <user_token>
```

## User API

### Get User Profile

```http
GET /users/profile
Authorization: Bearer <user_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "addresses": [
      {
        "id": "addr-1",
        "type": "shipping",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA",
        "isDefault": true
      }
    ],
    "preferences": {
      "newsletter": true,
      "notifications": true
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update User Profile

```http
PUT /users/profile
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1987654321"
}
```

## Reviews API

### Get Product Reviews

```http
GET /products/{productId}/reviews?page=1&limit=10&sort=rating&order=desc
```

### Create Review

```http
POST /products/{productId}/reviews
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent product! Highly recommended.",
  "images": [
    "https://example.com/user-review-image.jpg"
  ]
}
```

## Search API

### Search Products

```http
GET /search?q=wireless headphones&category=electronics&page=1&limit=20
```

**Query Parameters:**

- `q`: Search query
- `category` (optional): Filter by category
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `rating` (optional): Minimum rating
- `page` (optional): Page number
- `limit` (optional): Items per page
- `sort` (optional): Sort field (relevance, price, rating)

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400): Invalid input data
- `UNAUTHORIZED` (401): Invalid or missing authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `RATE_LIMITED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **General API**: 100 requests per minute per authenticated user
- **Search API**: 50 requests per minute per IP

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Order Status Updates

Webhook events are sent when order status changes:

```json
{
  "event": "order.status.updated",
  "data": {
    "orderId": "order-123",
    "status": "shipped",
    "previousStatus": "processing",
    "timestamp": "2024-01-20T14:45:00Z"
  }
}
```

### Payment Events

```json
{
  "event": "payment.completed",
  "data": {
    "paymentId": "pay-123",
    "orderId": "order-123",
    "amount": 399.98,
    "currency": "USD",
    "timestamp": "2024-01-20T14:45:00Z"
  }
}
```

## SDKs and Libraries

### JavaScript/Node.js

```bash
npm install @ecommerce/api-client
```

```javascript
import { EcommerceAPI } from '@ecommerce/api-client';

const api = new EcommerceAPI({
  baseURL: 'https://api.ecommerce-platform.com/v1',
  apiKey: 'your-api-key',
});

const products = await api.products.getAll({ page: 1, limit: 20 });
```

## Postman Collection

Import our Postman collection for easy API testing:

- [Download Collection](./postman-collection.json)
- Environment variables included for development and production

## OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:

- Development: http://localhost:5000/api-docs
- Production: https://api.ecommerce-platform.com/docs

For questions or support, please contact our API team or create an issue in the
GitHub repository.
