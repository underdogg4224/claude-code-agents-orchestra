'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const MATURITY_LABELS = {
  0: { label: 'Not Started', color: 'bg-gray-500', description: 'No AI tools in use' },
  1: { label: 'Exploring', color: 'bg-yellow-500', description: 'Aware of AI but minimal adoption' },
  2: { label: 'Experimenting', color: 'bg-blue-500', description: 'Testing AI tools in limited areas' },
  3: { label: 'Adopting', color: 'bg-green-500', description: 'Multiple AI tools integrated' },
  4: { label: 'Leading', color: 'bg-purple-500', description: 'AI-first organization' },
}

export function MaturityLevel({ level }: { level: 0 | 1 | 2 | 3 | 4 }) {
  const maturity = MATURITY_LABELS[level]
  const progress = (level / 4) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          AI Maturity Level
          <Badge className={maturity.color}>{maturity.label}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Level {level} of 4</span>
            <span className="text-sm text-muted-foreground">{progress.toFixed(0)}% mature</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
        <p className="text-muted-foreground">{maturity.description}</p>

        {/* Level Indicators */}
        <div className="grid grid-cols-5 gap-2 pt-4">
          {[0, 1, 2, 3, 4].map((l) => (
            <div
              key={l}
              className={`text-center p-2 rounded ${
                l === level ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              <p className="text-xs font-medium">Level {l}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
