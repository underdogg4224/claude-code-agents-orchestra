'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { step2Schema } from '@/lib/validations/intake'
import { useIntakeStore } from '@/lib/store/intake'
import { ProgressIndicator } from '@/components/intake/ProgressIndicator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { z } from 'zod'

type Step2FormData = z.infer<typeof step2Schema>

export default function Step2Page() {
  const router = useRouter()
  const { step2, setStep2, setCurrentStep, sessionId } = useIntakeStore()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: (step2.processes ? step2 : {
      processes: [{
        processName: '',
        currentState: '',
        painPoints: [''],
        hoursPerWeek: 0,
        toolsUsed: [''],
        priority: 3,
      }]
    }) as Step2FormData,
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'processes',
  })

  const onSubmit = async (data: Step2FormData) => {
    try {
      setStep2(data)

      // Submit to API
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, step: 2, data }),
      })

      if (!response.ok) throw new Error('Failed to submit')

      setCurrentStep(3)
      router.push('/intake/step-3')
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit. Please try again.')
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <ProgressIndicator currentStep={2} />

      <Card>
        <CardHeader>
          <CardTitle>Process Inventory</CardTitle>
          <CardDescription>
            Identify 1-3 key processes that could benefit from AI automation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-6 space-y-4 relative">
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-4 right-4"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}

                <h3 className="text-lg font-semibold">Process {index + 1}</h3>

                <div>
                  <Label htmlFor={`processes.${index}.processName`}>Process Name *</Label>
                  <Input
                    id={`processes.${index}.processName`}
                    {...register(`processes.${index}.processName`)}
                    placeholder="e.g., Bid estimation, Invoice processing"
                  />
                  {errors.processes?.[index]?.processName && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.processes[index]?.processName?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`processes.${index}.currentState`}>Current State *</Label>
                  <Textarea
                    id={`processes.${index}.currentState`}
                    {...register(`processes.${index}.currentState`)}
                    placeholder="Describe how this process currently works"
                    rows={3}
                  />
                  {errors.processes?.[index]?.currentState && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.processes[index]?.currentState?.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`processes.${index}.hoursPerWeek`}>Hours per Week *</Label>
                    <Input
                      id={`processes.${index}.hoursPerWeek`}
                      type="number"
                      {...register(`processes.${index}.hoursPerWeek`, { valueAsNumber: true })}
                      placeholder="10"
                    />
                    {errors.processes?.[index]?.hoursPerWeek && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.processes[index]?.hoursPerWeek?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`processes.${index}.priority`}>Priority (1-5) *</Label>
                    <Input
                      id={`processes.${index}.priority`}
                      type="number"
                      min="1"
                      max="5"
                      {...register(`processes.${index}.priority`, { valueAsNumber: true })}
                      placeholder="3"
                    />
                    {errors.processes?.[index]?.priority && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.processes[index]?.priority?.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor={`processes.${index}.errorRate`}>Error Rate % (Optional)</Label>
                  <Input
                    id={`processes.${index}.errorRate`}
                    type="number"
                    min="0"
                    max="100"
                    {...register(`processes.${index}.errorRate`, { valueAsNumber: true })}
                    placeholder="5"
                  />
                </div>
              </div>
            ))}

            {errors.processes && typeof errors.processes === 'object' && 'message' in errors.processes && (
              <p className="text-sm text-destructive">{errors.processes.message}</p>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => append({
                processName: '',
                currentState: '',
                painPoints: [''],
                hoursPerWeek: 0,
                toolsUsed: [''],
                priority: 3,
              })}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Process
            </Button>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCurrentStep(1)
                  router.push('/intake/step-1')
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
