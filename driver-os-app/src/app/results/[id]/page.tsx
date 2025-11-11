import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { CoiDisplay } from './components/CoiDisplay'
import { MaturityLevel } from './components/MaturityLevel'
import { QuickWinsCard } from './components/QuickWinsCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

async function getResults(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/results/${id}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const data = await getResults(params.id)

  if (!data || !data.success) {
    notFound()
  }

  const results = data.data

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-6xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Your AI Quick Wins Report
          </h1>
          <p className="text-xl text-muted-foreground">
            {results.company.name} - {results.company.industry}
          </p>
        </div>

        {/* Variant A: Direct ROI (default) */}
        <div className="space-y-8">
          {/* COI Hero Section */}
          <CoiDisplay coi={results.coi} />

          {/* AI Maturity */}
          <MaturityLevel level={results.maturityLevel} />

          {/* Quick Wins */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Your Top Quick Wins</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.quickWins.slice(0, 3).map((win: any, index: number) => (
                <QuickWinsCard key={index} win={win} rank={index + 1} />
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none">
            <CardHeader>
              <CardTitle className="text-3xl text-white">Ready to Capture These Savings?</CardTitle>
              <CardDescription className="text-blue-100">
                Book a Quick Strike Audit to get your 30-day implementation plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="secondary" className="flex-1 text-lg">
                  Book Quick Strike Audit
                  <span className="ml-2">→</span>
                </Button>
                <Button size="lg" variant="outline" className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20">
                  Download Full Report
                </Button>
              </div>
              <p className="text-sm text-blue-100 text-center">
                $1,500 fixed fee • Money-back if we can't prove the win
              </p>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>All Quick Win Opportunities</CardTitle>
              <CardDescription>Complete breakdown of automation potential</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.quickWins.map((win: any, index: number) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">#{index + 1} - {win.name}</h4>
                        <p className="text-sm text-muted-foreground">{win.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ${win.estimatedSavings.toLocaleString()}/mo
                        </p>
                        <p className="text-sm text-muted-foreground">{win.implementationTime}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
