/**
 * Test Example for Scoring Engine
 * This file demonstrates the scoring algorithms with sample data
 * Run with: npx ts-node src/lib/scoring/__test-example.ts
 */

import { calculateCOI } from './coi-calculator'
import { assessAIMaturity } from './maturity-assessor'
import { generateQuickWins } from './quick-wins-generator'
import type { CompanyData, AssessmentData } from './types'

// Sample company data
const sampleCompanyData: CompanyData = {
  industry: 'construction',
  size: '51-200',
  processes: [
    {
      processName: 'invoicing',
      hoursPerWeek: 12,
      errorRate: 18,
      toolsUsed: ['Excel', 'Manual entry'],
      priority: 5,
    },
    {
      processName: 'rfis',
      hoursPerWeek: 20,
      errorRate: 25,
      toolsUsed: ['Email', 'Word documents'],
      priority: 5,
    },
    {
      processName: 'timecards',
      hoursPerWeek: 10,
      errorRate: 12,
      toolsUsed: ['Paper', 'Manual'],
      priority: 4,
    },
    {
      processName: 'change_orders',
      hoursPerWeek: 15,
      errorRate: 30,
      toolsUsed: ['Email', 'Manual tracking'],
      priority: 4,
    },
    {
      processName: 'compliance_docs',
      hoursPerWeek: 8,
      errorRate: 8,
      toolsUsed: ['File cabinets', 'Scanned PDFs'],
      priority: 3,
    },
  ],
}

// Sample assessment data
const sampleAssessmentData: AssessmentData = {
  currentAITools: ['QuickBooks (basic)'],
  aiExperience: 'Limited - we use QuickBooks but mostly manual processes',
  technicalCapacity: 'medium',
  companySize: '51-200',
  processCount: 5,
}

console.log('='.repeat(80))
console.log('DRIVER OS V2 - SCORING ENGINE TEST')
console.log('='.repeat(80))
console.log()

// 1. Calculate COI
console.log('1. COST OF INEFFICIENCY (COI) CALCULATION')
console.log('-'.repeat(80))
const coiResult = calculateCOI(sampleCompanyData)

console.log(`Total Monthly COI: $${coiResult.totalMonthly.toLocaleString()}`)
console.log(`Total Annual COI: $${coiResult.totalAnnual.toLocaleString()}`)
console.log()
console.log('Confidence Bands:')
console.log(`  Low:    $${coiResult.confidenceBand.low.toLocaleString()}`)
console.log(`  Medium: $${coiResult.confidenceBand.medium.toLocaleString()}`)
console.log(`  High:   $${coiResult.confidenceBand.high.toLocaleString()}`)
console.log()
console.log('Assumptions:')
console.log(`  Average Hourly Rate: $${coiResult.assumptions.avgHourlyRate}`)
console.log(`  Weeks per Month: ${coiResult.assumptions.weeksPerMonth}`)
console.log(`  Error Cost Multiplier: ${coiResult.assumptions.errorCostMultiplier}x`)
console.log()
console.log('Breakdown by Process:')
coiResult.breakdown.forEach((item, index) => {
  console.log(`  ${index + 1}. ${item.processName}`)
  console.log(`     Monthly Cost: $${item.monthlyCost.toLocaleString()}`)
  console.log(`     Hours Wasted: ${item.hoursWasted} hrs/month`)
  console.log(`     Error Cost: $${item.errorCost.toLocaleString()}`)
  console.log()
})

// 2. Assess AI Maturity
console.log('2. AI MATURITY ASSESSMENT')
console.log('-'.repeat(80))
const maturityResult = assessAIMaturity(sampleAssessmentData)

console.log(`Maturity Level: ${maturityResult.level} - ${maturityResult.label}`)
console.log(`Description: ${maturityResult.description}`)
console.log()
console.log('Dimension Scores (0-100):')
console.log(`  Tool Adoption: ${maturityResult.dimensions.toolAdoption}`)
console.log(`  Technical Capacity: ${maturityResult.dimensions.technicalCapacity}`)
console.log(`  Process Maturity: ${maturityResult.dimensions.processMaturity}`)
console.log(`  Scalability: ${maturityResult.dimensions.scalability}`)
console.log()
console.log('Strengths:')
maturityResult.strengths.forEach((strength, index) => {
  console.log(`  ${index + 1}. ${strength}`)
})
console.log()
console.log('Gaps:')
maturityResult.gaps.forEach((gap, index) => {
  console.log(`  ${index + 1}. ${gap}`)
})
console.log()
console.log('Recommendations:')
maturityResult.recommendations.forEach((rec, index) => {
  console.log(`  ${index + 1}. ${rec}`)
})
console.log()

// 3. Generate Quick Wins
console.log('3. QUICK WIN RECOMMENDATIONS')
console.log('-'.repeat(80))
const quickWins = generateQuickWins(
  sampleCompanyData.processes,
  coiResult.assumptions.avgHourlyRate
)

quickWins.forEach((qw, index) => {
  console.log(`Quick Win #${qw.priority}: ${qw.name}`)
  console.log(`  Process: ${qw.process}`)
  console.log(`  Type: ${qw.type}`)
  console.log(`  Estimated Monthly Savings: $${qw.estimatedSavings.toLocaleString()}`)
  console.log(`  Implementation Time: ${qw.implementationTime}`)
  console.log(`  Complexity: ${qw.complexity}`)
  console.log(`  Tool Suggestions: ${qw.toolSuggestions.join(', ')}`)
  console.log(`  Rationale: ${qw.rationale}`)
  console.log()
})

// Summary
console.log('='.repeat(80))
console.log('SUMMARY')
console.log('='.repeat(80))
console.log(`Current Annual Cost of Inefficiency: $${coiResult.totalAnnual.toLocaleString()}`)
console.log(`AI Maturity Level: ${maturityResult.level} (${maturityResult.label})`)
console.log(`Quick Wins Identified: ${quickWins.length}`)
console.log(
  `Potential First-Year Savings: $${(quickWins.reduce((sum, qw) => sum + qw.estimatedSavings, 0) * 12).toLocaleString()}`
)
console.log()
console.log('Next Steps:')
console.log('1. Review quick wins with stakeholders')
console.log('2. Prioritize based on implementation complexity and ROI')
console.log('3. Schedule Quick Strike Audit to build detailed roadmap')
console.log('='.repeat(80))
