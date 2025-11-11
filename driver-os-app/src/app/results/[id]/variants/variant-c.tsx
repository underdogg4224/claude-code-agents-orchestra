'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Rocket, TrendingUp, Target, Zap } from 'lucide-react'

export function VariantC({ results }: { results: any }) {
  const annualSavings = results.coi.monthly * 12
  const potentialRevenue = annualSavings * 2.5 // Assumes reinvestment multiplier

  return (
    <div className="space-y-8">
      {/* Hero: Growth Potential Focus */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-5 h-5 text-purple-600" />
            <Badge className="bg-purple-600">Growth Opportunity</Badge>
          </div>
          <CardTitle className="text-2xl">Your Untapped Growth Potential</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Potential Revenue Impact</p>
            <p className="text-6xl md:text-7xl font-bold text-purple-600">
              ${potentialRevenue.toLocaleString()}
            </p>
            <p className="text-xl text-muted-foreground mt-2">
              From reinvesting ${annualSavings.toLocaleString()} in annual savings
            </p>
          </div>

          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">What This Growth Capital Could Fund:</p>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Market Expansion</p>
                  <p className="text-xs text-muted-foreground">New markets & products</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Sales Team Growth</p>
                  <p className="text-xs text-muted-foreground">2-3 new sales reps</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Marketing Campaigns</p>
                  <p className="text-xs text-muted-foreground">Aggressive growth ads</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Rocket className="w-4 h-4 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Product Innovation</p>
                  <p className="text-xs text-muted-foreground">R&D investments</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="font-semibold mb-3">Capital Currently Trapped In:</h3>
            <div className="space-y-2">
              {results.coi.breakdown.slice(0, 3).map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center bg-white/50 dark:bg-black/20 rounded p-3">
                  <p className="font-medium capitalize">{item.processName.replace('_', ' ')}</p>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">${item.monthlyCost.toLocaleString()}/mo</p>
                    <p className="text-xs text-muted-foreground">${(item.monthlyCost * 12).toLocaleString()}/yr</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA: Growth/Revenue Angle */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none">
        <CardHeader>
          <CardTitle className="text-3xl text-white">Ready to Unlock This Growth Capital?</CardTitle>
          <CardDescription className="text-purple-100">
            Transform inefficiency into competitive advantage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="secondary" className="flex-1 text-lg">
              Book Growth Strategy Session
              <span className="ml-2">→</span>
            </Button>
            <Button size="lg" variant="outline" className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20">
              See Full Growth Plan
            </Button>
          </div>
          <p className="text-sm text-purple-100 text-center">
            $1,500 investment • 10x ROI potential in year one
          </p>
        </CardContent>
      </Card>

      {/* Social Proof / Case Study Teaser */}
      <Card>
        <CardHeader>
          <CardTitle>How Other Companies Used These Savings</CardTitle>
          <CardDescription>Real growth stories from efficiency optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-purple-600 pl-4">
              <p className="font-semibold">SaaS Company, 50 employees</p>
              <p className="text-sm text-muted-foreground mt-1">
                Saved $180K annually → Hired 2 sales reps → Increased ARR by $500K
              </p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <p className="font-semibold">Professional Services, 30 employees</p>
              <p className="text-sm text-muted-foreground mt-1">
                Saved $120K annually → Invested in marketing → 40% increase in lead generation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
