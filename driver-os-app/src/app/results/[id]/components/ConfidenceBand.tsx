'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info } from 'lucide-react'

type ConfidenceBandProps = {
  low: number
  medium: number
  high: number
  current?: 'low' | 'medium' | 'high'
}

export function ConfidenceBand({ low, medium, high, current = 'medium' }: ConfidenceBandProps) {
  const positions = {
    low: 20,
    medium: 50,
    high: 80,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="w-5 h-5" />
          Confidence Range
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Range Display */}
        <div className="relative">
          <div className="flex justify-between mb-2 text-sm">
            <div className="text-center flex-1">
              <p className="text-muted-foreground">Conservative</p>
              <p className="font-bold text-green-600">${low.toLocaleString()}</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-muted-foreground">Expected</p>
              <p className="font-bold text-blue-600">${medium.toLocaleString()}</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-muted-foreground">Optimistic</p>
              <p className="font-bold text-orange-600">${high.toLocaleString()}</p>
            </div>
          </div>

          {/* Visual Band */}
          <div className="relative h-12 bg-gradient-to-r from-green-100 via-blue-100 to-orange-100 dark:from-green-950 dark:via-blue-950 dark:to-orange-950 rounded-lg">
            {/* Marker */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-black dark:bg-white transition-all"
              style={{ left: `${positions[current]}%` }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <Badge variant="default">Your Estimate</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-muted p-3 rounded-lg text-sm">
          <p className="font-medium mb-1">How we calculate this:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• <strong>Conservative:</strong> Minimum viable automation (20th percentile)</li>
            <li>• <strong>Expected:</strong> Typical implementation results (50th percentile)</li>
            <li>• <strong>Optimistic:</strong> Best-case full automation (80th percentile)</li>
          </ul>
        </div>

        {/* Confidence Level */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Confidence Level:</span>
          <Badge variant="outline" className="text-base">
            {current === 'low' && '70% Confidence'}
            {current === 'medium' && '85% Confidence'}
            {current === 'high' && '95% Confidence'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
