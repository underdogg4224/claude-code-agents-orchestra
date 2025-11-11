'use client'

import { Progress } from '@/components/ui/progress'
import { Check } from 'lucide-react'

const steps = [
  { number: 1, title: 'Company Info' },
  { number: 2, title: 'Process Inventory' },
  { number: 3, title: 'AI Usage' },
  { number: 4, title: 'Goals & Priorities' },
]

export function ProgressIndicator({ currentStep }: { currentStep: number }) {
  const progress = ((currentStep - 1) / 3) * 100

  return (
    <div className="w-full mb-8">
      <Progress value={progress} className="h-2 mb-6" />
      <div className="flex justify-between">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                step.number < currentStep
                  ? 'bg-primary text-primary-foreground'
                  : step.number === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.number < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                step.number
              )}
            </div>
            <span className="text-sm text-center">{step.title}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
