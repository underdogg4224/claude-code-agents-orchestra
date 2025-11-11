# Scoring Engine - Driver OS v2

The scoring engine is the core business logic module that analyzes intake form responses and generates actionable insights for prospective clients.

## Overview

The scoring engine consists of three main calculators:

1. **COI Calculator** - Calculates Cost of Inefficiency based on process data
2. **AI Maturity Assessor** - Evaluates company's AI adoption maturity (0-4 scale)
3. **Quick Wins Generator** - Identifies high-impact, low-effort automation opportunities

## Architecture

```
src/lib/scoring/
├── index.ts                 # Main orchestrator and exports
├── types.ts                 # TypeScript type definitions
├── constants.ts             # Industry benchmarks and templates
├── coi-calculator.ts        # COI calculation logic
├── maturity-assessor.ts     # AI maturity assessment
├── quick-wins-generator.ts  # Quick win identification
└── __test-example.ts        # Test file with sample data
```

## Usage

### Basic Usage

```typescript
import { processAssessment } from '@/lib/scoring'

// After collecting intake data from all 4 steps
const result = await processAssessment({
  sessionId: 'abc123',
  step1: { /* company info */ },
  step2: { /* process inventory */ },
  step3: { /* AI experience */ },
  step4: { /* goals and timeline */ }
})

console.log(result.assessmentId)           // Database ID
console.log(result.coiResult.totalMonthly) // Monthly COI
console.log(result.maturityResult.level)   // AI maturity level
console.log(result.quickWins)              // Quick win recommendations
```

### Individual Calculators

```typescript
import { calculateCOI, assessAIMaturity, generateQuickWins } from '@/lib/scoring'

// Calculate COI only
const coiResult = calculateCOI({
  industry: 'construction',
  size: '51-200',
  processes: [/* process data */]
})

// Assess maturity only
const maturityResult = assessAIMaturity({
  currentAITools: ['QuickBooks'],
  aiExperience: 'Limited',
  technicalCapacity: 'medium',
  companySize: '51-200',
  processCount: 5
})

// Generate quick wins only
const quickWins = generateQuickWins(processes, avgHourlyRate)
```

## 1. COI Calculator

Calculates the financial cost of manual, inefficient processes.

### Algorithm

```
Monthly COI = Σ (Process Time Cost + Error Cost)

Process Time Cost = Hours per Week × Weeks per Month × Hourly Rate
Error Cost = Hours × Error Rate × Hourly Rate × Error Multiplier (2.5x)
```

### Industry Hourly Rates

Built-in rates for:
- Construction (admin: $25, PM: $65, estimator: $55, etc.)
- Manufacturing (admin: $22, PM: $55, QC: $40, etc.)
- Professional Services (admin: $30, consultant: $85, etc.)
- Technology, Healthcare, Retail, Financial Services

### Confidence Bands

Returns low/medium/high estimates (±20% variance):

```typescript
confidenceBand: {
  low: totalMonthly * 0.8,
  medium: totalMonthly,
  high: totalMonthly * 1.2
}
```

### Example Output

```json
{
  "totalMonthly": 26938,
  "totalAnnual": 323256,
  "breakdown": [
    {
      "processName": "invoicing",
      "monthlyCost": 4747,
      "hoursWasted": 61.3,
      "errorCost": 1473
    }
  ],
  "confidenceBand": {
    "low": 21550,
    "medium": 26938,
    "high": 32326
  },
  "assumptions": {
    "avgHourlyRate": 63,
    "weeksPerMonth": 4.33,
    "errorCostMultiplier": 2.5
  }
}
```

## 2. AI Maturity Assessor

Evaluates company's AI adoption maturity across 4 dimensions.

### Maturity Levels

| Level | Label | Description |
|-------|-------|-------------|
| 0 | Not Started | No AI tools, 100% manual |
| 1 | Exploring | Aware of AI, minimal adoption |
| 2 | Experimenting | Testing 1-2 AI tools |
| 3 | Adopting | 3-5 AI tools in production |
| 4 | Leading | AI-first organization |

### Scoring Dimensions (0-100)

1. **Tool Adoption** - Number and coverage of AI tools
2. **Technical Capacity** - Team's ability to implement AI (low/medium/high)
3. **Process Maturity** - Digital process readiness
4. **Scalability** - Infrastructure and company size

### Calculation

```
Overall Level = Average of 4 dimensions mapped to 0-4 scale:
  < 20: Level 0
  20-39: Level 1
  40-59: Level 2
  60-79: Level 3
  80+: Level 4
```

### Example Output

```json
{
  "level": 2,
  "label": "Experimenting",
  "description": "Testing AI tools in limited areas",
  "dimensions": {
    "toolAdoption": 27,
    "technicalCapacity": 60,
    "processMaturity": 30,
    "scalability": 57
  },
  "strengths": [
    "Adequate technical skills for AI adoption",
    "Growing organization with expansion potential"
  ],
  "gaps": [
    "Limited AI tool usage - significant automation opportunities available"
  ],
  "recommendations": [
    "Expand AI tools to 3-5 core business processes",
    "Measure and document ROI on current AI investments"
  ]
}
```

## 3. Quick Wins Generator

Identifies high-impact, low-effort automation opportunities.

### Algorithm

1. **Score processes** by `priority × hours_per_week`
2. **Select top 3-5** processes
3. **Match to templates** (10 built-in process types)
4. **Calculate savings** using automation potential

### Built-in Templates

- **Invoicing** - 80% automation potential, 2-4 weeks, low complexity
- **RFI Management** - 60% automation potential, 4-6 weeks, medium complexity
- **Change Orders** - 50% automation potential, 3-5 weeks, medium complexity
- **Timecards** - 90% automation potential, 1-2 weeks, low complexity
- **Compliance Docs** - 70% automation potential, 3-4 weeks, medium complexity
- **Scheduling** - 65% automation potential, 1-3 weeks, low complexity
- **Reporting** - 75% automation potential, 4-6 weeks, medium complexity
- **Data Entry** - 85% automation potential, 2-4 weeks, low complexity
- **Email Management** - 60% automation potential, 1-2 weeks, low complexity
- **Document Processing** - 70% automation potential, 3-5 weeks, medium complexity

### Savings Calculation

```
Savable Hours = Hours per Week × (Automation Potential / 100)
Monthly Savings = Savable Hours × 4.33 × Hourly Rate

Error Savings = Error Hours × 4.33 × Hourly Rate × 2.5

Total Savings = Monthly Savings + Error Savings
```

### Example Output

```json
[
  {
    "name": "AI-Powered RFI Management",
    "type": "ai_assist",
    "process": "rfis",
    "estimatedSavings": 6683,
    "implementationTime": "4-6 weeks",
    "complexity": "medium",
    "priority": 1,
    "toolSuggestions": ["Procore AI", "Buildr", "Fieldwire"],
    "rationale": "Currently spending 20 hrs/week. Can automate 60%..."
  }
]
```

## Database Integration

The `processAssessment()` orchestrator automatically saves results to:

- **AIMaturityAssessment** - Main assessment record
- **CoiCalculation** - COI breakdown and assumptions
- **ProcessInventory** - Individual process records
- **QuickWin** - Quick win recommendations
- **Company** - Company info (created/updated)

## Testing

Run the test example:

```bash
npx tsx src/lib/scoring/__test-example.ts
```

Output shows:
- Complete COI breakdown
- AI maturity dimensions and recommendations
- Prioritized quick wins with savings estimates
- Summary with potential first-year savings

## Constants & Customization

All benchmarks and rates are in `constants.ts`:

- **HOURLY_RATES** - Industry-specific labor rates
- **PROCESS_BENCHMARKS** - Typical hours, error rates, automation potential
- **MATURITY_LEVELS** - Definitions for levels 0-4
- **QUICK_WIN_TEMPLATES** - Tool suggestions and timelines

To add a new industry:

```typescript
export const HOURLY_RATES = {
  // ... existing industries
  your_industry: {
    role_1: 50,
    role_2: 75,
    role_3: 100,
  },
}
```

To add a new process template:

```typescript
export const PROCESS_BENCHMARKS = {
  // ... existing processes
  your_process: {
    typical_hours_per_week: 10,
    typical_error_rate: 15,
    automation_potential: 70,
  },
}

export const QUICK_WIN_TEMPLATES = {
  your_process: {
    name: 'Your Process Automation',
    type: 'automation',
    tools: ['Tool A', 'Tool B'],
    implementationTime: '3-5 weeks',
    complexity: 'medium',
  },
}
```

## Error Handling

The orchestrator wraps each calculator in try-catch:

```typescript
try {
  const result = await processAssessment(intakeData)
  // Success
} catch (error) {
  console.error('Scoring engine error:', error)
  // Logs error but doesn't fail intake submission
}
```

Individual calculators throw descriptive errors:

- User/company not found
- Invalid industry/process data
- Database connection issues

## Performance

Typical execution time: **< 500ms**

- COI calculation: ~50ms
- Maturity assessment: ~30ms
- Quick wins generation: ~100ms
- Database operations: ~200ms

No external API calls required - all calculations are local.

## Future Enhancements

Potential improvements:

1. **Machine Learning** - Train on historical data to improve predictions
2. **Industry Benchmarking** - Compare against industry averages
3. **Custom Processes** - User-defined process templates
4. **ROI Tracking** - Post-implementation actual vs. estimated savings
5. **Multi-language Support** - Internationalization for global markets
6. **Advanced Analytics** - Trend analysis, peer comparisons

## Related Files

- **API Route**: `src/app/api/intake/route.ts` - Triggers scoring after step 4
- **Database**: `prisma/schema.prisma` - Schema definitions
- **Types**: `src/types/api.ts` - Shared type definitions
- **Validations**: `src/lib/validations/intake.ts` - Input validation schemas

## Support

For questions or issues, contact the development team or refer to:
- Project documentation: `driver_os-V2_PRD.md`
- Database schema: `prisma/schema.prisma`
- Test examples: `__test-example.ts`
