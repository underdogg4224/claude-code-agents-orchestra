# Database Schema Documentation

## Overview

This directory contains the Prisma schema definition for the Driver OS v2 application. The schema defines 10 core models for managing the AI Quick Wins assessment workflow.

## Schema Models

### Core Models (10 total)

1. **User** - User accounts with authentication info
   - Fields: email, firstName, lastName, phone
   - Relations: Company (1:1), IntakeResponse (1:many), Bookings (1:many), Payments (1:many), EmailLogs (1:many)

2. **Company** - Company information
   - Fields: name, industry, subSegment, size, annualRevenue, website
   - Relations: User (1:1), ProcessInventory (1:many), AIMaturityAssessment (1:many)

3. **IntakeResponse** - Multi-step form submissions
   - Fields: sessionId, step, data (Json), completedAt
   - Relations: User (many:1)

4. **ProcessInventory** - Specific processes being assessed
   - Fields: processName, currentState, painPoints[], hoursPerWeek, errorRate, toolsUsed[], priority
   - Relations: Company (many:1)

5. **AIMaturityAssessment** - AI maturity scoring (0-4)
   - Fields: maturityLevel, dimensions (Json), strengths[], gaps[], recommendations[]
   - Relations: Company (many:1), CoiCalculation (1:many), QuickWin (1:many)

6. **CoiCalculation** - Cost of Inefficiency calculations
   - Fields: totalMonthly, breakdown (Json), assumptions (Json), confidenceBand (Json)
   - Relations: AIMaturityAssessment (many:1)

7. **QuickWin** - Recommended quick wins
   - Fields: name, type, process, estimatedSavings, implementationTime, complexity, priority, toolSuggestions[]
   - Relations: AIMaturityAssessment (many:1)

8. **Booking** - Quick Strike Audit bookings (Cal.com integration)
   - Fields: calEventId, scheduledAt, duration, type, status, meetingUrl, notes
   - Relations: User (many:1), Payment (1:1 optional)

9. **Payment** - Stripe payment records
   - Fields: stripeSessionId, amount, currency, status, receiptUrl
   - Relations: User (many:1), Booking (1:1 optional)

10. **EmailLog** - Email automation tracking
    - Fields: templateType, subject, sentAt, status, metadata (Json)
    - Relations: User (many:1)

## Database Setup

### Current Status

- Prisma schema is complete and validated
- Prisma Client has been generated successfully
- Migration files will be created once connected to a PostgreSQL database

### Next Steps

1. **Connect to PostgreSQL Database**

   Update `.env` with a real PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/driver_os_v2?schema=public"
   ```

   Options:
   - Local PostgreSQL instance
   - Supabase (recommended for Next.js apps)
   - Neon (serverless PostgreSQL)
   - Railway, Render, or other hosted solutions

2. **Run Initial Migration**
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Verify Database Connection**
   ```bash
   npx prisma db push
   ```

4. **Open Prisma Studio** (optional, for viewing data)
   ```bash
   npx prisma studio
   ```

## Usage in Application

### Importing Prisma Client

```typescript
import { prisma } from '@/lib/db/prisma'

// Example: Create a user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
  },
})

// Example: Query with relations
const userWithCompany = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: { company: true },
})
```

### Type Imports

```typescript
import type {
  User,
  Company,
  UserWithCompany,
  AssessmentWithDetails,
} from '@/types/database'
```

## Key Features

- **CUID IDs**: Collision-resistant unique identifiers for all models
- **Cascading Deletes**: Proper foreign key relationships with onDelete: Cascade
- **Indexes**: Optimized queries on frequently accessed fields
- **Timestamps**: Automatic createdAt/updatedAt tracking
- **JSON Fields**: Flexible storage for complex nested data
- **Array Fields**: Native PostgreSQL array support for string lists

## Schema Validation

The schema has been validated and Prisma Client generated successfully. All models, relations, and constraints are properly defined.

**Status**: ✅ Ready for database connection and migration
