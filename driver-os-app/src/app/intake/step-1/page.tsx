'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { step1Schema } from '@/lib/validations/intake'
import { useIntakeStore } from '@/lib/store/intake'
import { ProgressIndicator } from '@/components/intake/ProgressIndicator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { z } from 'zod'

type Step1FormData = z.infer<typeof step1Schema>

export default function Step1Page() {
  const router = useRouter()
  const { step1, setStep1, setCurrentStep, setSessionId, sessionId } = useIntakeStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: step1 as Step1FormData,
  })

  const onSubmit = async (data: Step1FormData) => {
    try {
      setStep1(data)

      // Generate session ID if not exists
      const currentSessionId = sessionId || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setSessionId(currentSessionId)

      // Submit to API
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: currentSessionId, step: 1, data }),
      })

      if (!response.ok) throw new Error('Failed to submit')

      setCurrentStep(2)
      router.push('/intake/step-2')
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit. Please try again.')
    }
  }

  return (
    <div className="container max-w-3xl mx-auto py-10">
      <ProgressIndicator currentStep={1} />

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Tell us about your company so we can tailor the assessment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" {...register('firstName')} />
                {errors.firstName && (
                  <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" {...register('lastName')} />
                {errors.lastName && (
                  <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input id="phone" type="tel" {...register('phone')} placeholder="+1 (555) 123-4567" />
            </div>

            {/* Company Info */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Company Details</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input id="companyName" {...register('companyName')} />
                  {errors.companyName && (
                    <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select onValueChange={(value) => setValue('industry', value as any)} defaultValue={step1.industry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="professional_services">Professional Services</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.industry && (
                    <p className="text-sm text-destructive mt-1">{errors.industry.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="size">Company Size *</Label>
                  <Select onValueChange={(value) => setValue('size', value as any)} defaultValue={step1.size}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="200+">200+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.size && (
                    <p className="text-sm text-destructive mt-1">{errors.size.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="annualRevenue">Annual Revenue (Optional)</Label>
                  <Input
                    id="annualRevenue"
                    {...register('annualRevenue')}
                    placeholder="e.g., $1M-$5M"
                  />
                </div>

                <div>
                  <Label htmlFor="subSegment">Sub-segment (Optional)</Label>
                  <Input
                    id="subSegment"
                    {...register('subSegment')}
                    placeholder="e.g., Commercial Construction, Residential, etc."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
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
