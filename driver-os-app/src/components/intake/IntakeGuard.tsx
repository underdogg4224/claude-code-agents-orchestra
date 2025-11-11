'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useIntakeStore } from '@/lib/store/intake'

interface IntakeGuardProps {
  requiredStep: number
  children: React.ReactNode
}

export function IntakeGuard({ requiredStep, children }: IntakeGuardProps) {
  const router = useRouter()
  const { currentStep, sessionId } = useIntakeStore()

  useEffect(() => {
    // Allow access if user is on the correct step or has already completed it
    if (currentStep < requiredStep) {
      // Redirect to the current step if user tries to skip ahead
      router.push(`/intake/step-${currentStep}`)
    }

    // Redirect to step 1 if no session exists and trying to access later steps
    if (!sessionId && requiredStep > 1) {
      router.push('/intake/step-1')
    }
  }, [currentStep, requiredStep, router, sessionId])

  // Only render children if user is on the correct step
  if (currentStep >= requiredStep) {
    return <>{children}</>
  }

  // Show loading state while redirecting
  return (
    <div className="container max-w-3xl mx-auto py-10 text-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  )
}
