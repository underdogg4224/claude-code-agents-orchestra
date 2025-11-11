'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, AlertCircle } from 'lucide-react'

type CoiData = {
  total: number
  monthly: number
  breakdown: Array<{
    processName: string
    monthlyCost: number
    hoursWasted: number
  }>
  confidenceBand: {
    low: number
    medium: number
    high: number
  }
}

export function CoiDisplay({ coi }: { coi: CoiData }) {
  const annualCost = coi.monthly * 12

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <Badge variant="destructive">Opportunity Identified</Badge>
        </div>
        <CardTitle className="text-2xl">Cost of Inefficiency</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Big Number */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">Monthly Hidden Costs</p>
          <p className="text-6xl md:text-7xl font-bold text-orange-600">
            ${coi.monthly.toLocaleString()}
          </p>
          <p className="text-xl text-muted-foreground mt-2">
            ${annualCost.toLocaleString()}/year in manual work
          </p>
        </div>

        {/* Confidence Band */}
        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
          <p className="text-sm font-medium mb-2">Confidence Range</p>
          <div className="flex justify-between text-sm">
            <span>Low: ${coi.confidenceBand.low.toLocaleString()}</span>
            <span className="font-bold">Medium: ${coi.confidenceBand.medium.toLocaleString()}</span>
            <span>High: ${coi.confidenceBand.high.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-orange-600 h-2 rounded-full" style={{ width: '60%' }} />
          </div>
        </div>

        {/* Top Cost Drivers */}
        <div>
          <p className="text-sm font-medium mb-3">Top Cost Drivers</p>
          <div className="space-y-2">
            {coi.breakdown.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-white/50 dark:bg-black/20 rounded p-3">
                <div>
                  <p className="font-medium capitalize">{item.processName.replace('_', ' ')}</p>
                  <p className="text-xs text-muted-foreground">{item.hoursWasted.toFixed(1)} hours/month wasted</p>
                </div>
                <p className="font-bold text-orange-600">${item.monthlyCost.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
