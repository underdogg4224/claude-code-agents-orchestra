'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function CompletePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  useEffect(() => {
    if (sessionId) {
      // Clear local storage after successful completion
      localStorage.removeItem('intake-storage')

      // Redirect to results page after 2 seconds
      setTimeout(() => {
        router.push(`/results/${sessionId}`)
      }, 2000)
    }
  }, [sessionId, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Processing Your Assessment...</h1>
        <p className="text-muted-foreground">Generating your personalized report</p>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        </div>
      </div>
    </div>
  )
}

export default function CompletePage() {
  return (
    <Suspense fallback={<div className="container max-w-2xl mx-auto py-16 text-center">Loading...</div>}>
      <CompletePageContent />
    </Suspense>
  )
}
