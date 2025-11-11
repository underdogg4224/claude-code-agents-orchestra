import { QUICK_WIN_TEMPLATES, PROCESS_BENCHMARKS } from './constants'
import type { ProcessData, QuickWin } from './types'

/**
 * Generate prioritized quick win recommendations based on process data
 *
 * @param processes Array of process data with hours, errors, and priority
 * @param avgHourlyRate Average hourly rate for cost calculations
 * @returns Array of prioritized quick win recommendations
 */
export function generateQuickWins(
  processes: ProcessData[],
  avgHourlyRate: number
): QuickWin[] {
  const quickWins: QuickWin[] = []

  // Sort processes by impact score (priority * hours wasted)
  const sortedProcesses = [...processes].sort((a, b) => {
    const aScore = a.priority * a.hoursPerWeek
    const bScore = b.priority * b.hoursPerWeek
    return bScore - aScore // Descending order
  })

  // Generate quick wins for top 3-5 processes
  const topProcesses = sortedProcesses.slice(0, Math.min(5, sortedProcesses.length))

  topProcesses.forEach((process, index) => {
    const processKey = normalizeProcessKey(process.processName)
    const template = QUICK_WIN_TEMPLATES[processKey]
    const benchmark = PROCESS_BENCHMARKS[processKey]

    if (template && benchmark) {
      // Use benchmark data for well-known processes
      const quickWin = createQuickWinFromTemplate(
        process,
        template,
        benchmark,
        avgHourlyRate,
        index + 1
      )
      quickWins.push(quickWin)
    } else {
      // Create generic quick win for custom processes
      const quickWin = createGenericQuickWin(
        process,
        avgHourlyRate,
        index + 1
      )
      quickWins.push(quickWin)
    }
  })

  return quickWins
}

/**
 * Normalize process name to match template keys
 */
function normalizeProcessKey(processName: string): keyof typeof QUICK_WIN_TEMPLATES {
  const normalized = processName.toLowerCase().replace(/[^a-z]/g, '_')

  // Map common variations to our keys
  const mappings: Record<string, keyof typeof QUICK_WIN_TEMPLATES> = {
    'invoicing': 'invoicing',
    'invoice_processing': 'invoicing',
    'billing': 'invoicing',
    'rfis': 'rfis',
    'rfi_management': 'rfis',
    'requests_for_information': 'rfis',
    'change_orders': 'change_orders',
    'change_order_management': 'change_orders',
    'timecards': 'timecards',
    'timecard_management': 'timecards',
    'time_tracking': 'timecards',
    'compliance_docs': 'compliance_docs',
    'compliance_documentation': 'compliance_docs',
    'document_compliance': 'compliance_docs',
    'scheduling': 'scheduling',
    'schedule_management': 'scheduling',
    'reporting': 'reporting',
    'report_generation': 'reporting',
    'data_entry': 'data_entry',
    'manual_data_entry': 'data_entry',
    'email_management': 'email_management',
    'email_processing': 'email_management',
    'document_processing': 'document_processing',
    'document_management': 'document_processing',
  }

  const matchedKey = mappings[normalized]
  if (matchedKey) {
    return matchedKey
  }

  // Try partial matches
  for (const [key, value] of Object.entries(mappings)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value
    }
  }

  // Default to document_processing for unknown
  return 'document_processing'
}

/**
 * Create quick win from template and benchmark data
 */
function createQuickWinFromTemplate(
  process: ProcessData,
  template: typeof QUICK_WIN_TEMPLATES[keyof typeof QUICK_WIN_TEMPLATES],
  benchmark: typeof PROCESS_BENCHMARKS[keyof typeof PROCESS_BENCHMARKS],
  avgHourlyRate: number,
  priority: number
): QuickWin {
  // Calculate potential savings
  const automationPotential = benchmark.automation_potential / 100
  const savableHours = process.hoursPerWeek * automationPotential
  const weeksPerMonth = 4.33
  const monthlySavings = savableHours * weeksPerMonth * avgHourlyRate

  // Factor in error reduction savings
  const errorRate = process.errorRate || benchmark.typical_error_rate
  const errorHours = process.hoursPerWeek * (errorRate / 100)
  const errorSavings = errorHours * weeksPerMonth * avgHourlyRate * 2.5 // 2.5x multiplier

  const totalSavings = monthlySavings + errorSavings

  return {
    name: template.name,
    type: template.type,
    process: process.processName,
    estimatedSavings: Math.round(totalSavings),
    implementationTime: template.implementationTime,
    complexity: template.complexity,
    priority,
    toolSuggestions: [...template.tools],
    rationale: buildRationale(
      process.hoursPerWeek,
      benchmark.automation_potential,
      errorRate,
      process.toolsUsed
    ),
  }
}

/**
 * Create generic quick win for processes without templates
 */
function createGenericQuickWin(
  process: ProcessData,
  avgHourlyRate: number,
  priority: number
): QuickWin {
  // Assume 50% automation potential for unknown processes
  const automationPotential = 0.5
  const savableHours = process.hoursPerWeek * automationPotential
  const weeksPerMonth = 4.33
  const monthlySavings = savableHours * weeksPerMonth * avgHourlyRate

  // Determine complexity based on hours and existing tools
  let complexity: string = 'medium'
  if (process.hoursPerWeek < 5 && process.toolsUsed.length > 0) {
    complexity = 'low'
  } else if (process.hoursPerWeek > 15 || process.toolsUsed.length === 0) {
    complexity = 'high'
  }

  // Estimate implementation time based on complexity
  let implementationTime: string
  if (complexity === 'low') {
    implementationTime = '2-3 weeks'
  } else if (complexity === 'medium') {
    implementationTime = '4-6 weeks'
  } else {
    implementationTime = '6-8 weeks'
  }

  return {
    name: `Optimize ${process.processName}`,
    type: 'process_improvement',
    process: process.processName,
    estimatedSavings: Math.round(monthlySavings),
    implementationTime,
    complexity,
    priority,
    toolSuggestions: suggestGenericTools(process.processName),
    rationale: `Currently spending ${process.hoursPerWeek} hrs/week on this process. Automation can potentially reduce time by 50% and improve accuracy.`,
  }
}

/**
 * Build detailed rationale for quick win
 */
function buildRationale(
  hoursPerWeek: number,
  automationPotential: number,
  errorRate: number,
  currentTools: string[]
): string {
  const parts: string[] = []

  parts.push(`Currently spending ${hoursPerWeek} hrs/week on this process`)

  if (automationPotential >= 70) {
    parts.push(`High automation potential (${automationPotential}%)`)
  } else {
    parts.push(`Can automate ${automationPotential}% with modern tools`)
  }

  if (errorRate > 10) {
    parts.push(`Error rate of ${errorRate}% creates rework and delays`)
  }

  if (currentTools.length === 0) {
    parts.push('No tools currently in use - greenfield opportunity')
  } else if (currentTools.some(tool => tool.toLowerCase().includes('manual') || tool.toLowerCase().includes('excel'))) {
    parts.push('Currently using manual/spreadsheet methods - ready for upgrade')
  }

  return parts.join('. ') + '.'
}

/**
 * Suggest generic tools based on process name
 */
function suggestGenericTools(processName: string): string[] {
  const nameLower = processName.toLowerCase()

  if (nameLower.includes('data') || nameLower.includes('entry')) {
    return ['Zapier', 'Make.com', 'UiPath']
  }

  if (nameLower.includes('document') || nameLower.includes('file')) {
    return ['DocuSign', 'PandaDoc', 'Adobe Sign']
  }

  if (nameLower.includes('email') || nameLower.includes('communication')) {
    return ['Superhuman', 'Front', 'Help Scout']
  }

  if (nameLower.includes('schedule') || nameLower.includes('calendar')) {
    return ['Calendly', 'Motion', 'Reclaim.ai']
  }

  if (nameLower.includes('report') || nameLower.includes('analytics')) {
    return ['Tableau', 'Power BI', 'Looker']
  }

  // Default suggestions
  return ['Process automation tools', 'Workflow software', 'Custom integration']
}

/**
 * Calculate ROI metrics for a quick win
 */
export function calculateQuickWinROI(
  quickWin: QuickWin,
  implementationCost: number
): {
  monthlyROI: number
  breakEvenMonths: number
  annualReturn: number
} {
  const monthlyROI = quickWin.estimatedSavings - (implementationCost / 12)
  const breakEvenMonths = implementationCost / quickWin.estimatedSavings
  const annualReturn = (quickWin.estimatedSavings * 12 - implementationCost) / implementationCost

  return {
    monthlyROI: Math.round(monthlyROI),
    breakEvenMonths: Math.round(breakEvenMonths * 10) / 10,
    annualReturn: Math.round(annualReturn * 100) / 100,
  }
}
