'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Clock, Zap } from 'lucide-react'

type QuickWin = {
  name: string
  type: string
  estimatedSavings: number
  implementationTime: string
  complexity: string
  priority: number
}

export function QuickWinsCard({ win, rank }: { win: QuickWin; rank: number }) {
  const complexityColor = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  }[win.complexity] || 'bg-gray-100 text-gray-800'

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            #{rank}
          </Badge>
          <Badge className={complexityColor}>{win.complexity}</Badge>
        </div>
        <CardTitle className="text-xl">{win.name}</CardTitle>
        <CardDescription>{win.type.replace('_', ' ')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Savings */}
        <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <p className="text-sm font-medium">Estimated Monthly Savings</p>
          </div>
          <p className="text-3xl font-bold text-green-600">
            ${win.estimatedSavings.toLocaleString()}
          </p>
        </div>

        {/* Implementation Time */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Implementation:</span>
          <span className="font-medium">{win.implementationTime}</span>
        </div>

        {/* Type Badge */}
        <div className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium capitalize">{win.type.replace('_', ' ')}</span>
        </div>
      </CardContent>
    </Card>
  )
}
