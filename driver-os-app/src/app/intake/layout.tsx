import { ReactNode } from 'react'

export default function IntakeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Driver OS v2 Assessment</h1>
          <p className="text-muted-foreground">
            Discover your AI quick wins in 4 simple steps
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
