import {
  HOURLY_RATES,
  DEFAULT_WEEKS_PER_MONTH,
  DEFAULT_ERROR_COST_MULTIPLIER,
  DEFAULT_CONFIDENCE_VARIANCE,
} from './constants'
import type { CompanyData, CoiResult, CoiBreakdownItem } from './types'

/**
 * Calculate Cost of Inefficiency (COI) for a company's processes
 *
 * @param data Company data including industry, size, and process details
 * @returns Detailed COI calculation with breakdown and confidence bands
 */
export function calculateCOI(data: CompanyData): CoiResult {
  // Determine average hourly rate based on industry
  const industryKey = normalizeIndustryKey(data.industry)
  const industryRates = HOURLY_RATES[industryKey] || HOURLY_RATES.professional_services

  const avgHourlyRate = calculateAverageRate(industryRates)

  // Calculate breakdown for each process
  const breakdown: CoiBreakdownItem[] = data.processes.map((process) => {
    // Calculate time cost
    const monthlyHours = process.hoursPerWeek * DEFAULT_WEEKS_PER_MONTH
    const timeCost = monthlyHours * avgHourlyRate

    // Calculate error cost
    const errorRate = process.errorRate || 0
    const errorHours = monthlyHours * (errorRate / 100)
    const errorCost = errorHours * avgHourlyRate * DEFAULT_ERROR_COST_MULTIPLIER

    return {
      processName: process.processName,
      monthlyCost: timeCost + errorCost,
      hoursWasted: monthlyHours + errorHours,
      errorCost,
    }
  })

  const totalMonthly = breakdown.reduce((sum, item) => sum + item.monthlyCost, 0)
  const totalAnnual = totalMonthly * 12

  // Calculate confidence bands (±20% for low/high)
  const confidenceBand = {
    low: totalMonthly * (1 - DEFAULT_CONFIDENCE_VARIANCE),
    medium: totalMonthly,
    high: totalMonthly * (1 + DEFAULT_CONFIDENCE_VARIANCE),
  }

  return {
    totalMonthly: Math.round(totalMonthly),
    totalAnnual: Math.round(totalAnnual),
    breakdown: breakdown.map(item => ({
      ...item,
      monthlyCost: Math.round(item.monthlyCost),
      hoursWasted: Math.round(item.hoursWasted * 10) / 10, // Round to 1 decimal
      errorCost: Math.round(item.errorCost),
    })),
    confidenceBand: {
      low: Math.round(confidenceBand.low),
      medium: Math.round(confidenceBand.medium),
      high: Math.round(confidenceBand.high),
    },
    assumptions: {
      avgHourlyRate: Math.round(avgHourlyRate),
      weeksPerMonth: DEFAULT_WEEKS_PER_MONTH,
      errorCostMultiplier: DEFAULT_ERROR_COST_MULTIPLIER,
    },
  }
}

/**
 * Normalize industry string to match HOURLY_RATES keys
 */
function normalizeIndustryKey(industry: string): keyof typeof HOURLY_RATES {
  const normalized = industry.toLowerCase().replace(/\s+/g, '_')

  // Map common variations to our keys
  const mappings: Record<string, keyof typeof HOURLY_RATES> = {
    'construction': 'construction',
    'manufacturing': 'manufacturing',
    'professional_services': 'professional_services',
    'consulting': 'professional_services',
    'technology': 'technology',
    'tech': 'technology',
    'software': 'technology',
    'healthcare': 'healthcare',
    'medical': 'healthcare',
    'retail': 'retail',
    'e-commerce': 'retail',
    'finance': 'financial_services',
    'financial_services': 'financial_services',
    'banking': 'financial_services',
  }

  return mappings[normalized] || 'professional_services'
}

/**
 * Calculate average hourly rate from industry rates object
 */
function calculateAverageRate(rates: Record<string, number>): number {
  const rateValues = Object.values(rates)
  return rateValues.reduce((a, b) => a + b, 0) / rateValues.length
}

/**
 * Calculate COI for a specific process (utility function)
 */
export function calculateProcessCOI(
  hoursPerWeek: number,
  errorRate: number,
  hourlyRate: number
): { timeCost: number; errorCost: number; totalCost: number } {
  const monthlyHours = hoursPerWeek * DEFAULT_WEEKS_PER_MONTH
  const timeCost = monthlyHours * hourlyRate

  const errorHours = monthlyHours * (errorRate / 100)
  const errorCost = errorHours * hourlyRate * DEFAULT_ERROR_COST_MULTIPLIER

  return {
    timeCost: Math.round(timeCost),
    errorCost: Math.round(errorCost),
    totalCost: Math.round(timeCost + errorCost),
  }
}
