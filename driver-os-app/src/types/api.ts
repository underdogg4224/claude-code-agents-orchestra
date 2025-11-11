// Standard API response wrapper
export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    timestamp: string
    requestId?: string
  }
}

// Intake API responses
export type IntakeStepResponse = {
  sessionId: string
  step: number
  nextStep?: number
  isComplete: boolean
  resultsId?: string
}

// Results API responses
export type ResultsResponse = {
  id: string
  maturityLevel: 0 | 1 | 2 | 3 | 4
  coi: {
    total: number
    monthly: number
    breakdown: ProcessCost[]
    confidenceBand: {
      low: number
      medium: number
      high: number
    }
  }
  quickWins: QuickWinItem[]
  company: {
    name: string
    industry: string
    size: string
  }
  createdAt: string
}

export type ProcessCost = {
  processName: string
  monthlyCost: number
  hoursWasted: number
}

export type QuickWinItem = {
  name: string
  type: string
  estimatedSavings: number
  implementationTime: string
  complexity: string
  priority: number
}

// Payment API responses
export type CheckoutResponse = {
  checkoutUrl: string
  sessionId: string
}

// Booking API responses
export type BookingResponse = {
  bookingId: string
  calendarLink: string
  meetingUrl?: string
  scheduledAt: string
}
