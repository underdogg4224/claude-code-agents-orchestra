import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { validateRequest } from '@/lib/api/middleware'
import { intakeSubmissionSchema } from '@/lib/validations/intake'
import { prisma } from '@/lib/db/prisma'
import { processAssessment } from '@/lib/scoring'
import type { IntakeStepResponse } from '@/types/api'
import type { IntakeData } from '@/lib/scoring/types'

export async function POST(request: NextRequest) {
  const validation = await validateRequest(request, intakeSubmissionSchema)

  if (!validation.valid) {
    return validation.response
  }

  const { sessionId, step, data } = validation.data

  try {
    // Save intake response
    const intakeResponse = await prisma.intakeResponse.create({
      data: {
        sessionId,
        step,
        data: data as any, // Prisma Json type
        completedAt: step === 4 ? new Date() : null,
        user: {
          connectOrCreate: {
            where: { email: (data as any).email },
            create: {
              email: (data as any).email,
              firstName: (data as any).firstName,
              lastName: (data as any).lastName,
            },
          },
        },
      },
    })

    // If this is the final step, trigger scoring engine
    let assessmentId: string | undefined
    if (step === 4) {
      try {
        // Fetch all steps for this session
        const allSteps = await prisma.intakeResponse.findMany({
          where: { sessionId },
          orderBy: { step: 'asc' },
        })

        if (allSteps.length === 4) {
          // Compile intake data from all steps
          const intakeData: IntakeData = {
            sessionId,
            step1: allSteps[0].data as any,
            step2: allSteps[1].data as any,
            step3: allSteps[2].data as any,
            step4: allSteps[3].data as any,
          }

          // Run scoring engine
          const assessmentResult = await processAssessment(intakeData)
          assessmentId = assessmentResult.assessmentId

          console.log('Assessment completed:', {
            assessmentId,
            maturityLevel: assessmentResult.maturityResult.level,
            monthlyCOI: assessmentResult.coiResult.totalMonthly,
            quickWinCount: assessmentResult.quickWins.length,
          })
        }
      } catch (scoringError) {
        // Log scoring error but don't fail the request
        console.error('Scoring engine error:', scoringError)
        // Could trigger alert/notification here
      }
    }

    const response: IntakeStepResponse = {
      sessionId,
      step,
      nextStep: step < 4 ? step + 1 : undefined,
      isComplete: step === 4,
      resultsId: assessmentId || sessionId, // Use assessmentId if available
    }

    return apiSuccess(response, 201)
  } catch (error) {
    console.error('Intake submission error:', error)
    return apiError('Failed to save intake response', 'DATABASE_ERROR', 500)
  }
}
