import { calculateCOI } from './coi-calculator'
import { assessAIMaturity } from './maturity-assessor'
import { generateQuickWins } from './quick-wins-generator'
import { prisma } from '@/lib/db/prisma'
import type { IntakeData, AssessmentOutput } from './types'

/**
 * Main orchestrator function for processing intake assessment
 * Calculates COI, assesses AI maturity, generates quick wins, and saves to database
 *
 * @param data Complete intake data from all 4 steps
 * @returns Assessment results with IDs and all calculated metrics
 */
export async function processAssessment(data: IntakeData): Promise<AssessmentOutput> {
  try {
    // 1. Calculate Cost of Inefficiency (COI)
    const coiResult = calculateCOI({
      industry: data.step1.industry,
      size: data.step1.size,
      processes: data.step2.processes,
    })

    // 2. Assess AI Maturity Level
    const maturityResult = assessAIMaturity({
      currentAITools: data.step3.currentAITools,
      aiExperience: data.step3.aiExperience,
      technicalCapacity: data.step3.technicalCapacity,
      companySize: data.step1.size,
      processCount: data.step2.processes.length,
    })

    // 3. Generate Quick Win Recommendations
    const quickWins = generateQuickWins(
      data.step2.processes,
      coiResult.assumptions.avgHourlyRate
    )

    // 4. Find or create user
    const user = await prisma.user.findUnique({
      where: { email: data.step1.email },
      include: { company: true },
    })

    if (!user) {
      throw new Error(`User not found for email: ${data.step1.email}`)
    }

    // 5. Create or update company record
    let company = user.company
    if (!company) {
      company = await prisma.company.create({
        data: {
          userId: user.id,
          name: data.step1.company,
          industry: data.step1.industry,
          size: data.step1.size,
        },
      })
    } else {
      // Update company info if changed
      company = await prisma.company.update({
        where: { id: company.id },
        data: {
          name: data.step1.company,
          industry: data.step1.industry,
          size: data.step1.size,
        },
      })
    }

    // 6. Save AI Maturity Assessment
    const assessment = await prisma.aIMaturityAssessment.create({
      data: {
        companyId: company.id,
        maturityLevel: maturityResult.level,
        dimensions: maturityResult.dimensions as any, // Prisma Json type
        strengths: maturityResult.strengths,
        gaps: maturityResult.gaps,
        recommendations: maturityResult.recommendations,
      },
    })

    // 7. Save COI Calculation
    await prisma.coiCalculation.create({
      data: {
        assessmentId: assessment.id,
        totalMonthly: coiResult.totalMonthly,
        breakdown: coiResult.breakdown as any, // Prisma Json type
        assumptions: coiResult.assumptions as any, // Prisma Json type
        confidenceBand: coiResult.confidenceBand as any, // Prisma Json type
      },
    })

    // 8. Save Process Inventory
    await Promise.all(
      data.step2.processes.map((process) =>
        prisma.processInventory.create({
          data: {
            companyId: company!.id,
            processName: process.processName,
            currentState: 'Identified in intake assessment',
            painPoints: [], // Can be expanded in future iterations
            hoursPerWeek: process.hoursPerWeek,
            errorRate: process.errorRate || 0,
            toolsUsed: process.toolsUsed,
            priority: getPriorityLabel(process.priority),
          },
        })
      )
    )

    // 9. Save Quick Wins
    await Promise.all(
      quickWins.map((qw) =>
        prisma.quickWin.create({
          data: {
            assessmentId: assessment.id,
            name: qw.name,
            type: qw.type,
            process: qw.process,
            estimatedSavings: qw.estimatedSavings,
            implementationTime: qw.implementationTime,
            complexity: qw.complexity,
            priority: qw.priority,
            toolSuggestions: qw.toolSuggestions,
          },
        })
      )
    )

    return {
      assessmentId: assessment.id,
      coiResult,
      maturityResult,
      quickWins,
    }
  } catch (error) {
    console.error('Error processing assessment:', error)
    throw new Error(`Failed to process assessment: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Convert numeric priority to label
 */
function getPriorityLabel(priority: number): string {
  if (priority >= 4) return 'High'
  if (priority >= 3) return 'Medium'
  return 'Low'
}

/**
 * Retrieve assessment results by ID
 */
export async function getAssessmentResults(assessmentId: string) {
  const assessment = await prisma.aIMaturityAssessment.findUnique({
    where: { id: assessmentId },
    include: {
      company: {
        include: {
          user: true,
          processInventories: true,
        },
      },
      coiCalculations: true,
      quickWins: {
        orderBy: { priority: 'asc' },
      },
    },
  })

  if (!assessment) {
    throw new Error(`Assessment not found: ${assessmentId}`)
  }

  return assessment
}

/**
 * Get latest assessment for a company
 */
export async function getLatestAssessment(companyId: string) {
  const assessment = await prisma.aIMaturityAssessment.findFirst({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    include: {
      coiCalculations: true,
      quickWins: {
        orderBy: { priority: 'asc' },
      },
    },
  })

  return assessment
}

/**
 * Get all assessments for a company (for tracking progress over time)
 */
export async function getAssessmentHistory(companyId: string) {
  const assessments = await prisma.aIMaturityAssessment.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    include: {
      coiCalculations: true,
      quickWins: {
        orderBy: { priority: 'asc' },
      },
    },
  })

  return assessments
}

// Re-export individual scoring functions for direct use
export { calculateCOI } from './coi-calculator'
export { assessAIMaturity } from './maturity-assessor'
export { generateQuickWins } from './quick-wins-generator'

// Re-export types
export type * from './types'
