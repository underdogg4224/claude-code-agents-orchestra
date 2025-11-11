// Export Prisma types for use throughout the app
export type {
  User,
  Company,
  IntakeResponse,
  ProcessInventory,
  AIMaturityAssessment,
  CoiCalculation,
  QuickWin,
  Booking,
  Payment,
  EmailLog,
} from '@prisma/client'

// Useful composed types for common query patterns
export type UserWithCompany = User & {
  company: Company | null
}

export type UserWithRelations = User & {
  company: Company | null
  intakeResponses: IntakeResponse[]
  bookings: Booking[]
  payments: Payment[]
}

export type AssessmentWithDetails = AIMaturityAssessment & {
  coiCalculations: CoiCalculation[]
  quickWins: QuickWin[]
}

export type CompanyWithAssessments = Company & {
  processInventories: ProcessInventory[]
  aiMaturityAssessments: AIMaturityAssessment[]
}

export type BookingWithPayment = Booking & {
  payment: Payment | null
  user: User
}

export type PaymentWithBooking = Payment & {
  booking: Booking | null
  user: User
}

// Type imports for re-export
import type {
  User,
  Company,
  IntakeResponse,
  ProcessInventory,
  AIMaturityAssessment,
  CoiCalculation,
  QuickWin,
  Booking,
  Payment,
  EmailLog,
} from '@prisma/client'
