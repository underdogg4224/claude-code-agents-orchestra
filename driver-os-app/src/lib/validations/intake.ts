import { z } from 'zod'

// Step 1: Company Info
export const step1Schema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  companyName: z.string().min(2, 'Company name is required'),
  industry: z.enum(['construction', 'manufacturing', 'professional_services', 'other']),
  subSegment: z.string().optional(),
  size: z.enum(['1-10', '11-50', '51-200', '200+']),
  annualRevenue: z.string().optional(),
})

// Step 2: Process Inventory
export const step2Schema = z.object({
  processes: z.array(z.object({
    processName: z.string(),
    currentState: z.string(),
    painPoints: z.array(z.string()),
    hoursPerWeek: z.number().min(0).max(168),
    errorRate: z.number().min(0).max(100).optional(),
    toolsUsed: z.array(z.string()),
    priority: z.number().min(1).max(5),
  })).min(1, 'At least one process is required'),
})

// Step 3: AI Usage Assessment
export const step3Schema = z.object({
  currentAITools: z.array(z.string()),
  aiMaturityLevel: z.number().min(0).max(4).optional(),
  aiExperience: z.string(),
  technicalCapacity: z.enum(['low', 'medium', 'high']),
})

// Step 4: Goals & Priorities
export const step4Schema = z.object({
  primaryGoal: z.enum(['save_time', 'reduce_costs', 'increase_revenue', 'improve_compliance']),
  secondaryGoals: z.array(z.string()),
  constraints: z.string().optional(),
  timeline: z.enum(['immediate', '1-3_months', '3-6_months', '6-12_months']),
})

// Complete intake submission
export const intakeSubmissionSchema = z.object({
  sessionId: z.string().cuid(),
  step: z.number().min(1).max(4),
  data: z.union([step1Schema, step2Schema, step3Schema, step4Schema]),
})
