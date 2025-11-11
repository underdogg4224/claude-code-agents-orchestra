# Driver OS v2 API Documentation

This document describes the API endpoints available in the Driver OS v2 application.

## Base URL

```
http://localhost:3000/api
```

## Endpoints

### Health Check

Check the health status of the API and database connection.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-10T12:00:00.000Z",
  "database": "connected"
}
```

**Status Codes:**
- `200` - Service is healthy
- `503` - Service is unhealthy (database disconnected)

---

### Submit Intake Form

Submit a step of the intake form.

**Endpoint:** `POST /api/intake`

**Request Body:**
```json
{
  "sessionId": "clxxx...",
  "step": 1,
  "data": {
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "companyName": "ABC Construction",
    "industry": "construction",
    "subSegment": "residential",
    "size": "11-50",
    "annualRevenue": "$1M-$5M"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "clxxx...",
    "step": 1,
    "nextStep": 2,
    "isComplete": false
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00.000Z"
  }
}
```

**Status Codes:**
- `201` - Intake step saved successfully
- `400` - Validation error
- `500` - Database error

**Validation Schemas by Step:**

**Step 1 - Company Info:**
- `email` (required): Valid email address
- `firstName` (required): Min 2 characters
- `lastName` (required): Min 2 characters
- `phone` (optional): String
- `companyName` (required): Min 2 characters
- `industry` (required): Enum ['construction', 'manufacturing', 'professional_services', 'other']
- `subSegment` (optional): String
- `size` (required): Enum ['1-10', '11-50', '51-200', '200+']
- `annualRevenue` (optional): String

**Step 2 - Process Inventory:**
- `processes` (required): Array of process objects (min 1)
  - `processName`: String
  - `currentState`: String
  - `painPoints`: Array of strings
  - `hoursPerWeek`: Number (0-168)
  - `errorRate` (optional): Number (0-100)
  - `toolsUsed`: Array of strings
  - `priority`: Number (1-5)

**Step 3 - AI Usage Assessment:**
- `currentAITools`: Array of strings
- `aiMaturityLevel` (optional): Number (0-4)
- `aiExperience`: String
- `technicalCapacity`: Enum ['low', 'medium', 'high']

**Step 4 - Goals & Priorities:**
- `primaryGoal`: Enum ['save_time', 'reduce_costs', 'increase_revenue', 'improve_compliance']
- `secondaryGoals`: Array of strings
- `constraints` (optional): String
- `timeline`: Enum ['immediate', '1-3_months', '3-6_months', '6-12_months']

---

### Get Assessment Results

Retrieve the assessment results for a completed intake session.

**Endpoint:** `GET /api/results/[id]`

**Path Parameters:**
- `id` - The session ID (CUID format)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "maturityLevel": 2,
    "coi": {
      "total": 50000,
      "monthly": 50000,
      "breakdown": [
        {
          "processName": "Project Scheduling",
          "monthlyCost": 20000,
          "hoursWasted": 100
        }
      ],
      "confidenceBand": {
        "low": 40000,
        "medium": 50000,
        "high": 60000
      }
    },
    "quickWins": [
      {
        "name": "Automated Scheduling Assistant",
        "type": "AI Tool",
        "estimatedSavings": 10000,
        "implementationTime": "2-4 weeks",
        "complexity": "Medium",
        "priority": 1
      }
    ],
    "company": {
      "name": "ABC Construction",
      "industry": "construction",
      "size": "11-50"
    },
    "createdAt": "2025-11-10T12:00:00.000Z"
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00.000Z"
  }
}
```

**Status Codes:**
- `200` - Results retrieved successfully
- `404` - Assessment not found
- `500` - Database error

---

### Create Checkout Session

Create a Stripe checkout session for payment.

**Endpoint:** `POST /api/payment/create-checkout`

**Request Body:**
```json
{
  "resultsId": "clxxx...",
  "email": "john@example.com",
  "bookingDate": "2025-11-15T14:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/...",
    "sessionId": "cs_test_..."
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00.000Z"
  }
}
```

**Status Codes:**
- `201` - Checkout session created successfully
- `400` - Validation error
- `500` - Payment processing error

---

### Stripe Webhook Handler

Handle Stripe webhook events (for internal use only).

**Endpoint:** `POST /api/payment/webhook`

**Headers:**
- `stripe-signature` - Stripe webhook signature

**Status Codes:**
- `200` - Webhook processed successfully
- `500` - Webhook processing error

---

### Create Booking

Create a Cal.com booking for a consultation call.

**Endpoint:** `POST /api/booking`

**Request Body:**
```json
{
  "userId": "clxxx...",
  "dateTime": "2025-11-15T14:00:00.000Z",
  "timezone": "America/New_York",
  "paymentId": "clxxx..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": "booking_clxxx..._1699999999999",
    "calendarLink": "https://cal.com/driver-os/consultation",
    "meetingUrl": "https://meet.google.com/xxx-xxxx-xxx",
    "scheduledAt": "2025-11-15T14:00:00.000Z"
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00.000Z"
  }
}
```

**Status Codes:**
- `201` - Booking created successfully
- `400` - Validation error
- `500` - Booking creation error

---

## Standard Response Format

All API responses follow this standard format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-10T12:00:00.000Z",
    "requestId": "optional-request-id"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00.000Z"
  }
}
```

## Error Codes

- `VALIDATION_ERROR` - Request validation failed (400)
- `NOT_FOUND` - Resource not found (404)
- `DATABASE_ERROR` - Database operation failed (500)
- `PAYMENT_ERROR` - Payment processing failed (500)
- `BOOKING_ERROR` - Booking creation failed (500)
- `WEBHOOK_ERROR` - Webhook processing failed (500)
- `INTERNAL_ERROR` - Generic internal error (500)

## Testing

### Using cURL

**Health Check:**
```bash
curl http://localhost:3000/api/health
```

**Submit Intake (Step 1):**
```bash
curl -X POST http://localhost:3000/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "clxxx...",
    "step": 1,
    "data": {
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "companyName": "Test Company",
      "industry": "construction",
      "size": "11-50"
    }
  }'
```

**Get Results:**
```bash
curl http://localhost:3000/api/results/clxxx...
```

## TODO: Future Integrations

- [ ] Stripe API integration for real payment processing
- [ ] Cal.com API integration for real booking creation
- [ ] Webhook signature verification for Stripe
- [ ] Rate limiting middleware
- [ ] API authentication/authorization
- [ ] Request logging and analytics
- [ ] Error monitoring (e.g., Sentry)
