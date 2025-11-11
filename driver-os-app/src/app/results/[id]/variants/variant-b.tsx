'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, TrendingDown } from 'lucide-react'

export function VariantB({ results }: { results: any }) {
  return (
    <div className="space-y-8">
      {/* Hero: Time Savings Focus */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <Badge className="bg-blue-600">Time Reclaimed</Badge>
          </div>
          <CardTitle className="text-2xl">Your Team's Hidden Time Drain</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Hours Wasted Per Month</p>
            <p className="text-6xl md:text-7xl font-bold text-blue-600">
              {results.coi.breakdown.reduce((acc: number, item: any) => acc + item.hoursWasted, 0).toFixed(0)}
            </p>
            <p className="text-xl text-muted-foreground mt-2">
              That's {(results.coi.breakdown.reduce((acc: number, item: any) => acc + item.hoursWasted, 0) / 160).toFixed(1)} Full-Time Employees
            </p>
          </div>

          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">What Your Team Could Do Instead:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Focus on strategic initiatives</span>
              </li>
              <li className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-blue-600" />
                <span>Reduce overtime and burnout</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Improve work-life balance</span>
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <h3 className="font-semibold mb-3">Top Time Wasters</h3>
            <div className="space-y-2">
              {results.coi.breakdown.slice(0, 3).map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center bg-white/50 dark:bg-black/20 rounded p-3">
                  <p className="font-medium capitalize">{item.processName.replace('_', ' ')}</p>
                  <p className="font-bold text-blue-600">{item.hoursWasted.toFixed(1)} hrs/mo</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA: Ops Efficiency Angle */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none">
        <CardHeader>
          <CardTitle className="text-3xl text-white">Let's Reclaim Your Team's Time</CardTitle>
          <CardDescription className="text-blue-100">
            Get a detailed efficiency audit and 30-day automation plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="secondary" className="flex-1 text-lg">
              Book Efficiency Audit
              <span className="ml-2">→</span>
            </Button>
            <Button size="lg" variant="outline" className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20">
              Download Time Analysis
            </Button>
          </div>
          <p className="text-sm text-blue-100 text-center">
            Fixed-fee engagement • See results in 30 days
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
