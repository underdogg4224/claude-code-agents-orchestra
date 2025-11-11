import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { prisma } from '@/lib/db/prisma'
import type { ResultsResponse } from '@/types/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    // Fetch assessment with related data
    const assessment = await prisma.aIMaturityAssessment.findFirst({
      where: {
        // Use the session ID to find the assessment
        company: {
          user: {
            intakeResponses: {
              some: { sessionId: id },
            },
          },
        },
      },
      include: {
        coiCalculations: true,
        quickWins: {
          orderBy: { priority: 'asc' },
        },
        company: true,
      },
    })

    if (!assessment) {
      return apiError('Assessment not found', 'NOT_FOUND', 404)
    }

    const latestCoi = assessment.coiCalculations[0]

    const response: ResultsResponse = {
      id,
      maturityLevel: assessment.maturityLevel as 0 | 1 | 2 | 3 | 4,
      coi: {
        total: latestCoi?.totalMonthly || 0,
        monthly: latestCoi?.totalMonthly || 0,
        breakdown: (latestCoi?.breakdown as any) || [],
        confidenceBand: (latestCoi?.confidenceBand as any) || {
          low: 0,
          medium: 0,
          high: 0,
        },
      },
      quickWins: assessment.quickWins.map(qw => ({
        name: qw.name,
        type: qw.type,
        estimatedSavings: qw.estimatedSavings,
        implementationTime: qw.implementationTime,
        complexity: qw.complexity,
        priority: qw.priority,
      })),
      company: {
        name: assessment.company.name,
        industry: assessment.company.industry,
        size: assessment.company.size,
      },
      createdAt: assessment.createdAt.toISOString(),
    }

    return apiSuccess(response)
  } catch (error) {
    console.error('Results fetch error:', error)
    return apiError('Failed to fetch results', 'DATABASE_ERROR', 500)
  }
}
