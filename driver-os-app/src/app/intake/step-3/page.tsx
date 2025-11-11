'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { step3Schema } from '@/lib/validations/intake'
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

type Step3FormData = z.infer<typeof step3Schema>

const commonAITools = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Microsoft Copilot',
  'GitHub Copilot',
  'Custom AI Solution',
  'None',
]

export default function Step3Page() {
  const router = useRouter()
  const { step3, setStep3, setCurrentStep, sessionId } = useIntakeStore()

  const [selectedTools, setSelectedTools] = useState<string[]>(step3.currentAITools || [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: step3 as Step3FormData,
  })

  const toggleTool = (tool: string) => {
    const newTools = selectedTools.includes(tool)
      ? selectedTools.filter(t => t !== tool)
      : [...selectedTools, tool]
    setSelectedTools(newTools)
    setValue('currentAITools', newTools)
  }

  const onSubmit = async (data: Step3FormData) => {
    try {
      const formData = {
        ...data,
        currentAITools: selectedTools,
      }
      setStep3(formData)

      // Submit to API
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, step: 3, data: formData }),
      })

      if (!response.ok) throw new Error('Failed to submit')

      setCurrentStep(4)
      router.push('/intake/step-4')
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit. Please try again.')
    }
  }

  return (
    <div className="container max-w-3xl mx-auto py-10">
      <ProgressIndicator currentStep={3} />

      <Card>
        <CardHeader>
          <CardTitle>AI Usage Assessment</CardTitle>
          <CardDescription>
            Tell us about your current AI experience and technical capacity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label>Current AI Tools (Select all that apply)</Label>
              <div className="flex flex-wrap gap-2 mt-3">
                {commonAITools.map((tool) => (
                  <Badge
                    key={tool}
                    variant={selectedTools.includes(tool) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/90"
                    onClick={() => toggleTool(tool)}
                  >
                    {tool}
                  </Badge>
                ))}
              </div>
              {errors.currentAITools && (
                <p className="text-sm text-destructive mt-1">{errors.currentAITools.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="aiExperience">AI Experience *</Label>
              <Textarea
                id="aiExperience"
                {...register('aiExperience')}
                placeholder="Describe your team's experience with AI tools. Have you tried any automation? What worked or didn't work?"
                rows={4}
              />
              {errors.aiExperience && (
                <p className="text-sm text-destructive mt-1">{errors.aiExperience.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="technicalCapacity">Technical Capacity *</Label>
              <Select onValueChange={(value) => setValue('technicalCapacity', value as any)} defaultValue={step3.technicalCapacity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select technical capacity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    Low - Limited technical team, prefer no-code solutions
                  </SelectItem>
                  <SelectItem value="medium">
                    Medium - Some technical staff, can handle basic integrations
                  </SelectItem>
                  <SelectItem value="high">
                    High - Strong technical team, comfortable with custom development
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.technicalCapacity && (
                <p className="text-sm text-destructive mt-1">{errors.technicalCapacity.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="aiMaturityLevel">
                AI Maturity Level (Optional - Rate 0-4)
              </Label>
              <Select
                onValueChange={(value) => setValue('aiMaturityLevel', parseInt(value))}
                defaultValue={step3.aiMaturityLevel?.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select maturity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 - No AI usage</SelectItem>
                  <SelectItem value="1">1 - Exploring/experimenting</SelectItem>
                  <SelectItem value="2">2 - Pilot projects</SelectItem>
                  <SelectItem value="3">3 - Active deployment</SelectItem>
                  <SelectItem value="4">4 - Mature AI integration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCurrentStep(2)
                  router.push('/intake/step-2')
                }}
              >
                ← Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Next Step →'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
