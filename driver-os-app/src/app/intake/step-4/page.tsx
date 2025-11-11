'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { step4Schema } from '@/lib/validations/intake'
import { useIntakeStore } from '@/lib/store/intake'
import { ProgressIndicator } from '@/components/intake/ProgressIndicator'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { z } from 'zod'
import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

type Step4FormData = z.infer<typeof step4Schema>

const secondaryGoalOptions = [
  'Improve data accuracy',
  'Enhance customer satisfaction',
  'Scale operations faster',
  'Reduce manual errors',
  'Better decision-making',
  'Competitive advantage',
]

export default function Step4Page() {
  const router = useRouter()
  const { step4, setStep4, setCurrentStep, sessionId, reset } = useIntakeStore()

  const [selectedSecondaryGoals, setSelectedSecondaryGoals] = useState<string[]>(
    step4.secondaryGoals || []
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: step4 as Step4FormData,
  })

  const toggleSecondaryGoal = (goal: string) => {
    const newGoals = selectedSecondaryGoals.includes(goal)
      ? selectedSecondaryGoals.filter(g => g !== goal)
      : [...selectedSecondaryGoals, goal]
    setSelectedSecondaryGoals(newGoals)
    setValue('secondaryGoals', newGoals)
  }

  const onSubmit = async (data: Step4FormData) => {
    try {
      const formData = {
        ...data,
        secondaryGoals: selectedSecondaryGoals,
      }
      setStep4(formData)

      // Submit final step to API
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, step: 4, data: formData }),
      })

      if (!response.ok) throw new Error('Failed to submit')

      const result = await response.json()

      // Clear the store after successful submission
      setCurrentStep(4)

      // Redirect to results or thank you page
      router.push(`/intake/complete?sessionId=${sessionId}`)
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit. Please try again.')
    }
  }

  return (
    <div className="container max-w-3xl mx-auto py-10">
      <ProgressIndicator currentStep={4} />

      <Card>
        <CardHeader>
          <CardTitle>Goals & Priorities</CardTitle>
          <CardDescription>
            Help us understand what success looks like for your company.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="primaryGoal">Primary Goal *</Label>
              <Select onValueChange={(value) => setValue('primaryGoal', value as any)} defaultValue={step4.primaryGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your primary goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="save_time">Save Time - Automate repetitive tasks</SelectItem>
                  <SelectItem value="reduce_costs">Reduce Costs - Cut operational expenses</SelectItem>
                  <SelectItem value="increase_revenue">Increase Revenue - Boost sales and efficiency</SelectItem>
                  <SelectItem value="improve_compliance">Improve Compliance - Better documentation and tracking</SelectItem>
                </SelectContent>
              </Select>
              {errors.primaryGoal && (
                <p className="text-sm text-destructive mt-1">{errors.primaryGoal.message}</p>
              )}
            </div>

            <div>
              <Label>Secondary Goals (Select all that apply)</Label>
              <div className="flex flex-wrap gap-2 mt-3">
                {secondaryGoalOptions.map((goal) => (
                  <Badge
                    key={goal}
                    variant={selectedSecondaryGoals.includes(goal) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/90"
                    onClick={() => toggleSecondaryGoal(goal)}
                  >
                    {goal}
                  </Badge>
                ))}
              </div>
              {errors.secondaryGoals && (
                <p className="text-sm text-destructive mt-1">{errors.secondaryGoals.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="timeline">Timeline *</Label>
              <Select onValueChange={(value) => setValue('timeline', value as any)} defaultValue={step4.timeline}>
                <SelectTrigger>
                  <SelectValue placeholder="When do you want to implement AI?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate - Ready to start now</SelectItem>
                  <SelectItem value="1-3_months">1-3 months - Planning phase</SelectItem>
                  <SelectItem value="3-6_months">3-6 months - Future consideration</SelectItem>
                  <SelectItem value="6-12_months">6-12 months - Long-term planning</SelectItem>
                </SelectContent>
              </Select>
              {errors.timeline && (
                <p className="text-sm text-destructive mt-1">{errors.timeline.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="constraints">Constraints or Concerns (Optional)</Label>
              <Textarea
                id="constraints"
                {...register('constraints')}
                placeholder="Any budget constraints, technical limitations, or specific concerns?"
                rows={4}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                By submitting this assessment, you'll receive a personalized AI roadmap
                identifying your top 3 quick wins within 24-48 hours.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCurrentStep(3)
                  router.push('/intake/step-3')
                }}
              >
                ← Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Assessment
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
