import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Step1Data = {
  email: string
  firstName: string
  lastName: string
  phone?: string
  companyName: string
  industry: string
  subSegment?: string
  size: string
  annualRevenue?: string
}

type Step2Data = {
  processes: Array<{
    processName: string
    currentState: string
    painPoints: string[]
    hoursPerWeek: number
    errorRate?: number
    toolsUsed: string[]
    priority: number
  }>
}

type Step3Data = {
  currentAITools: string[]
  aiMaturityLevel?: number
  aiExperience: string
  technicalCapacity: string
}

type Step4Data = {
  primaryGoal: string
  secondaryGoals: string[]
  constraints?: string
  timeline: string
}

type IntakeStore = {
  sessionId: string | null
  currentStep: number
  step1: Partial<Step1Data>
  step2: Partial<Step2Data>
  step3: Partial<Step3Data>
  step4: Partial<Step4Data>

  // Actions
  setSessionId: (id: string) => void
  setCurrentStep: (step: number) => void
  setStep1: (data: Partial<Step1Data>) => void
  setStep2: (data: Partial<Step2Data>) => void
  setStep3: (data: Partial<Step3Data>) => void
  setStep4: (data: Partial<Step4Data>) => void
  reset: () => void
}

export const useIntakeStore = create<IntakeStore>()(
  persist(
    (set) => ({
      sessionId: null,
      currentStep: 1,
      step1: {},
      step2: {},
      step3: {},
      step4: {},

      setSessionId: (id) => set({ sessionId: id }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setStep1: (data) => set((state) => ({ step1: { ...state.step1, ...data } })),
      setStep2: (data) => set((state) => ({ step2: { ...state.step2, ...data } })),
      setStep3: (data) => set((state) => ({ step3: { ...state.step3, ...data } })),
      setStep4: (data) => set((state) => ({ step4: { ...state.step4, ...data } })),
      reset: () => set({
        sessionId: null,
        currentStep: 1,
        step1: {},
        step2: {},
        step3: {},
        step4: {},
      }),
    }),
    {
      name: 'intake-storage',
    }
  )
)
