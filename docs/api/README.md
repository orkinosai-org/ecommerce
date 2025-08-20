# API Documentation

This document provides an overview of the REST API endpoints for the e-commerce platform.

## 📋 API Overview

The API follows RESTful conventions and returns JSON responses. All API endpoints are prefixed with `/api/v1/`.

### Base URL

- **Development**: `http://localhost:8000/api/v1/`
- **Production**: `https://yourdomain.com/api/v1/`

### Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "errors": null
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "message": "Error message",
  "errors": {
    "field": ["Error description"]
  }
}
```

## 🔐 Authentication Endpoints

### Register User

```http
POST /api/v1/auth/register/
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe"
    },
    "tokens": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
  }
}
```

### Login

```http
POST /api/v1/auth/login/
```

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com"
    },
    "tokens": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
  }
}
```

### Refresh Token

```http
POST /api/v1/auth/token/refresh/
```

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## 👤 User Endpoints

### Get User Profile

```http
GET /api/v1/users/profile/
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip_code": "10001",
      "country": "US"
    }
  }
}
```

### Update User Profile

```http
PUT /api/v1/users/profile/
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+1234567890"
}
```

## 🛍️ Product Endpoints

### List Products

```http
GET /api/v1/products/
```

**Query Parameters:**
- `search` - Search by name or description
- `category` - Filter by category ID
- `min_price` - Minimum price filter
- `max_price` - Maximum price filter
- `ordering` - Sort by: `name`, `price`, `-created_at`, etc.
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 20, max: 100)

**Example:**
```http
GET /api/v1/products/?search=laptop&category=1&min_price=500&ordering=-created_at&page=1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 150,
    "next": "http://localhost:8000/api/v1/products/?page=2",
    "previous": null,
    "results": [
      {
        "id": 1,
        "name": "MacBook Pro 16\"",
        "description": "Powerful laptop for professionals",
        "price": "2499.00",
        "sale_price": "2299.00",
        "sku": "MBP16-001",
        "category": {
          "id": 1,
          "name": "Laptops",
          "slug": "laptops"
        },
        "images": [
          {
            "id": 1,
            "image": "http://localhost:8000/media/products/mbp16.jpg",
            "alt_text": "MacBook Pro 16 inch",
            "is_primary": true
          }
        ],
        "stock_quantity": 25,
        "is_available": true,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Get Product Details

```http
GET /api/v1/products/{id}/
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "MacBook Pro 16\"",
    "description": "Powerful laptop for professionals with M2 Pro chip",
    "price": "2499.00",
    "sale_price": "2299.00",
    "sku": "MBP16-001",
    "category": {
      "id": 1,
      "name": "Laptops",
      "slug": "laptops"
    },
    "images": [
      {
        "id": 1,
        "image": "http://localhost:8000/media/products/mbp16.jpg",
        "alt_text": "MacBook Pro 16 inch",
        "is_primary": true
      }
    ],
    "specifications": {
      "processor": "Apple M2 Pro",
      "memory": "16GB",
      "storage": "512GB SSD",
      "display": "16.2-inch Liquid Retina XDR"
    },
    "stock_quantity": 25,
    "is_available": true,
    "average_rating": 4.8,
    "review_count": 42,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

## 📂 Category Endpoints

### List Categories

```http
GET /api/v1/categories/
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices and accessories",
      "image": "http://localhost:8000/media/categories/electronics.jpg",
      "parent": null,
      "children": [
        {
          "id": 2,
          "name": "Laptops",
          "slug": "laptops",
          "product_count": 25
        }
      ],
      "product_count": 150
    }
  ]
}
```

## 🛒 Cart Endpoints

### Get Cart

```http
GET /api/v1/cart/
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "items": [
      {
        "id": 1,
        "product": {
          "id": 1,
          "name": "MacBook Pro 16\"",
          "price": "2499.00",
          "sale_price": "2299.00",
          "image": "http://localhost:8000/media/products/mbp16.jpg"
        },
        "quantity": 1,
        "unit_price": "2299.00",
        "total_price": "2299.00"
      }
    ],
    "total_items": 1,
    "subtotal": "2299.00",
    "tax": "183.92",
    "total": "2482.92",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

### Add Item to Cart

```http
POST /api/v1/cart/items/
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

### Update Cart Item

```http
PUT /api/v1/cart/items/{item_id}/
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "quantity": 3
}
```

### Remove Cart Item

```http
DELETE /api/v1/cart/items/{item_id}/
```

**Headers:** `Authorization: Bearer <token>`

## 📦 Order Endpoints

### List Orders

```http
GET /api/v1/orders/
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` - Filter by order status
- `date_from` - Orders from date (YYYY-MM-DD)
- `date_to` - Orders to date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "results": [
      {
        "id": 1,
        "order_number": "ORD-2024-001",
        "status": "delivered",
        "total": "2482.92",
        "created_at": "2024-01-15T10:30:00Z",
        "items": [
          {
            "product_name": "MacBook Pro 16\"",
            "quantity": 1,
            "price": "2299.00"
          }
        ]
      }
    ]
  }
}
```

### Get Order Details

```http
GET /api/v1/orders/{id}/
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_number": "ORD-2024-001",
    "status": "delivered",
    "items": [
      {
        "id": 1,
        "product": {
          "id": 1,
          "name": "MacBook Pro 16\"",
          "sku": "MBP16-001"
        },
        "quantity": 1,
        "unit_price": "2299.00",
        "total_price": "2299.00"
      }
    ],
    "shipping_address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip_code": "10001",
      "country": "US"
    },
    "billing_address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip_code": "10001",
      "country": "US"
    },
    "subtotal": "2299.00",
    "tax": "183.92",
    "shipping": "0.00",
    "total": "2482.92",
    "payment_status": "paid",
    "created_at": "2024-01-15T10:30:00Z",
    "tracking_number": "1Z999AA1234567890"
  }
}
```

### Create Order

```http
POST /api/v1/orders/
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "shipping_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "country": "US"
  },
  "billing_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "country": "US"
  },
  "payment_method": "stripe",
  "payment_token": "tok_1234567890"
}
```

## ⭐ Review Endpoints

### List Product Reviews

```http
GET /api/v1/products/{product_id}/reviews/
```

**Query Parameters:**
- `rating` - Filter by rating (1-5)
- `ordering` - Sort by: `-created_at`, `rating`, `-rating`

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 25,
    "results": [
      {
        "id": 1,
        "user": {
          "username": "johndoe",
          "first_name": "John"
        },
        "rating": 5,
        "title": "Excellent laptop!",
        "comment": "Very fast and reliable. Great for development work.",
        "verified_purchase": true,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Create Review

```http
POST /api/v1/products/{product_id}/reviews/
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rating": 5,
  "title": "Excellent laptop!",
  "comment": "Very fast and reliable. Great for development work."
}
```

## 🔍 Search Endpoints

### Search Products

```http
GET /api/v1/search/
```

**Query Parameters:**
- `q` - Search query
- `category` - Filter by category
- `min_price` - Minimum price
- `max_price` - Maximum price
- `sort` - Sort by: `relevance`, `price`, `-price`, `name`, `-created_at`

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "laptop",
    "count": 25,
    "facets": {
      "categories": [
        {
          "id": 1,
          "name": "Laptops",
          "count": 20
        }
      ],
      "price_ranges": [
        {
          "range": "0-500",
          "count": 5
        },
        {
          "range": "500-1000",
          "count": 10
        }
      ]
    },
    "results": [
      {
        "id": 1,
        "name": "MacBook Pro 16\"",
        "price": "2499.00",
        "sale_price": "2299.00",
        "image": "http://localhost:8000/media/products/mbp16.jpg",
        "rating": 4.8,
        "review_count": 42
      }
    ]
  }
}
```

## 💳 Payment Endpoints

### Create Payment Intent

```http
POST /api/v1/payments/create-intent/
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 248292,
  "currency": "usd",
  "order_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "client_secret": "pi_1234567890_secret_abc123",
    "payment_intent_id": "pi_1234567890"
  }
}
```

## 📊 Analytics Endpoints

### Dashboard Stats (Admin only)

```http
GET /api/v1/analytics/dashboard/
```

**Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_orders": 1250,
    "total_revenue": "125000.00",
    "total_customers": 850,
    "total_products": 150,
    "recent_orders": [
      {
        "id": 1,
        "order_number": "ORD-2024-001",
        "customer": "John Doe",
        "total": "2482.92",
        "status": "pending"
      }
    ],
    "top_products": [
      {
        "id": 1,
        "name": "MacBook Pro 16\"",
        "sales_count": 25,
        "revenue": "57475.00"
      }
    ]
  }
}
```

## 🚫 Error Codes

### HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

### Common Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["This field is required."],
    "password": ["Password must be at least 8 characters long."]
  }
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "message": "Authentication credentials were not provided.",
  "errors": null
}
```

**Permission Error (403):**
```json
{
  "success": false,
  "message": "You do not have permission to perform this action.",
  "errors": null
}
```

**Not Found Error (404):**
```json
{
  "success": false,
  "message": "Product not found.",
  "errors": null
}
```

## 📝 Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated users**: 1000 requests per hour
- **Anonymous users**: 100 requests per hour
- **Admin users**: 5000 requests per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 🔧 Webhook Endpoints

### Stripe Webhooks

```http
POST /api/v1/webhooks/stripe/
```

Handles Stripe webhook events for payment processing:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.dispute.created`

---

For interactive API documentation, visit `/api/docs/` when running the development server.