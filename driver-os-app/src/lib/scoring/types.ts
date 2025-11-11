// Scoring-specific TypeScript types

export type ProcessData = {
  processName: string
  hoursPerWeek: number
  errorRate?: number
  toolsUsed: string[]
  priority: number
}

export type CompanyData = {
  industry: string
  size: string
  processes: ProcessData[]
}

export type CoiBreakdownItem = {
  processName: string
  monthlyCost: number
  hoursWasted: number
  errorCost: number
}

export type CoiResult = {
  totalMonthly: number
  totalAnnual: number
  breakdown: CoiBreakdownItem[]
  confidenceBand: {
    low: number
    medium: number
    high: number
  }
  assumptions: {
    avgHourlyRate: number
    weeksPerMonth: number
    errorCostMultiplier: number
  }
}

export type MaturityDimensions = {
  toolAdoption: number
  technicalCapacity: number
  processMaturity: number
  scalability: number
}

export type AssessmentData = {
  currentAITools: string[]
  aiExperience: string
  technicalCapacity: 'low' | 'medium' | 'high'
  companySize: string
  processCount: number
}

export type MaturityResult = {
  level: 0 | 1 | 2 | 3 | 4
  label: string
  description: string
  dimensions: MaturityDimensions
  strengths: string[]
  gaps: string[]
  recommendations: string[]
}

export type QuickWin = {
  name: string
  type: string
  process: string
  estimatedSavings: number
  implementationTime: string
  complexity: string
  priority: number
  toolSuggestions: string[]
  rationale: string
}

export type IntakeData = {
  sessionId: string
  step1: {
    email: string
    firstName: string
    lastName: string
    phone?: string
    company: string
    industry: string
    size: string
  }
  step2: {
    processes: ProcessData[]
  }
  step3: {
    currentAITools: string[]
    aiExperience: string
    technicalCapacity: 'low' | 'medium' | 'high'
  }
  step4: {
    goals: string[]
    timeline: string
    budget?: string
  }
}

export type AssessmentOutput = {
  assessmentId: string
  coiResult: CoiResult
  maturityResult: MaturityResult
  quickWins: QuickWin[]
}
