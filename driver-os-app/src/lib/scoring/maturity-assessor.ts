import { MATURITY_LEVELS } from './constants'
import type { AssessmentData, MaturityResult, MaturityDimensions } from './types'

/**
 * Assess AI maturity level based on company's current state
 *
 * @param data Assessment data including tools, experience, and capacity
 * @returns Detailed maturity assessment with level, dimensions, and recommendations
 */
export function assessAIMaturity(data: AssessmentData): MaturityResult {
  // Calculate dimension scores (0-100)
  const dimensions: MaturityDimensions = {
    toolAdoption: calculateToolAdoption(data.currentAITools, data.processCount),
    technicalCapacity: calculateTechnicalCapacity(data.technicalCapacity),
    processMaturity: calculateProcessMaturity(data.aiExperience),
    scalability: calculateScalability(data.companySize, data.currentAITools.length),
  }

  // Overall maturity level (0-4)
  const level = calculateOverallLevel(dimensions)

  const maturityInfo = MATURITY_LEVELS[level]

  return {
    level,
    label: maturityInfo.label,
    description: maturityInfo.description,
    dimensions,
    strengths: identifyStrengths(dimensions),
    gaps: identifyGaps(dimensions),
    recommendations: generateRecommendations(level, dimensions),
  }
}

/**
 * Calculate tool adoption score based on number of AI tools in use
 */
function calculateToolAdoption(tools: string[], processCount: number): number {
  if (tools.length === 0) return 0

  // Base score on tool count
  let score = 0
  if (tools.length === 1) score = 25
  else if (tools.length <= 2) score = 40
  else if (tools.length <= 3) score = 55
  else if (tools.length <= 5) score = 75
  else score = 90

  // Bonus if tools cover multiple processes
  const coverage = processCount > 0 ? (tools.length / processCount) * 100 : 0
  const coverageBonus = Math.min(coverage * 0.1, 10) // Up to 10 point bonus

  return Math.min(Math.round(score + coverageBonus), 100)
}

/**
 * Calculate technical capacity score
 */
function calculateTechnicalCapacity(capacity: string): number {
  switch (capacity) {
    case 'low':
      return 25
    case 'medium':
      return 60
    case 'high':
      return 90
    default:
      return 25
  }
}

/**
 * Calculate process maturity based on AI experience description
 */
function calculateProcessMaturity(experience: string): number {
  const expLower = experience.toLowerCase()

  // Pattern matching for experience level
  if (expLower.includes('none') || expLower.includes('no experience') || expLower.includes('not started')) {
    return 0
  }
  if (expLower.includes('limited') || expLower.includes('exploring') || expLower.includes('just started')) {
    return 30
  }
  if (expLower.includes('some') || expLower.includes('experimenting') || expLower.includes('testing')) {
    return 55
  }
  if (expLower.includes('significant') || expLower.includes('adopting') || expLower.includes('implementing')) {
    return 75
  }
  if (expLower.includes('extensive') || expLower.includes('advanced') || expLower.includes('leading')) {
    return 95
  }

  // Default to middle if unclear
  return 50
}

/**
 * Calculate scalability score based on company size and tool usage
 */
function calculateScalability(size: string, toolCount: number): number {
  // Company size factor
  let sizeScore = 50
  if (size.includes('200+') || size.includes('500+')) sizeScore = 100
  else if (size.includes('51-200')) sizeScore = 75
  else if (size.includes('11-50')) sizeScore = 50
  else sizeScore = 25

  // Tool count factor
  let toolScore = 0
  if (toolCount === 0) toolScore = 0
  else if (toolCount === 1) toolScore = 30
  else if (toolCount <= 3) toolScore = 60
  else toolScore = 100

  // Weighted average (60% size, 40% tools)
  return Math.round(sizeScore * 0.6 + toolScore * 0.4)
}

/**
 * Calculate overall maturity level from dimension scores
 */
function calculateOverallLevel(dimensions: MaturityDimensions): 0 | 1 | 2 | 3 | 4 {
  const avgScore =
    (dimensions.toolAdoption +
      dimensions.technicalCapacity +
      dimensions.processMaturity +
      dimensions.scalability) /
    4

  if (avgScore < 20) return 0
  if (avgScore < 40) return 1
  if (avgScore < 60) return 2
  if (avgScore < 80) return 3
  return 4
}

/**
 * Identify strengths based on dimension scores
 */
function identifyStrengths(dimensions: MaturityDimensions): string[] {
  const strengths: string[] = []

  if (dimensions.toolAdoption >= 70) {
    strengths.push('Strong AI tool adoption across multiple processes')
  } else if (dimensions.toolAdoption >= 50) {
    strengths.push('Good foundation of AI tools in place')
  }

  if (dimensions.technicalCapacity >= 70) {
    strengths.push('High technical capacity to implement AI solutions')
  } else if (dimensions.technicalCapacity >= 50) {
    strengths.push('Adequate technical skills for AI adoption')
  }

  if (dimensions.processMaturity >= 70) {
    strengths.push('Mature digital processes ready for automation')
  } else if (dimensions.processMaturity >= 50) {
    strengths.push('Established processes with automation potential')
  }

  if (dimensions.scalability >= 70) {
    strengths.push('Infrastructure ready to scale AI capabilities')
  } else if (dimensions.scalability >= 50) {
    strengths.push('Growing organization with expansion potential')
  }

  // If no clear strengths, provide encouraging message
  if (strengths.length === 0) {
    strengths.push('Clear opportunity to build competitive advantage through AI')
  }

  return strengths
}

/**
 * Identify gaps based on dimension scores
 */
function identifyGaps(dimensions: MaturityDimensions): string[] {
  const gaps: string[] = []

  if (dimensions.toolAdoption < 40) {
    gaps.push('Limited AI tool usage - significant automation opportunities available')
  }

  if (dimensions.technicalCapacity < 40) {
    gaps.push('Need to build technical expertise and AI literacy')
  }

  if (dimensions.processMaturity < 40) {
    gaps.push('Manual processes dominate - high potential for digitization')
  }

  if (dimensions.scalability < 40) {
    gaps.push('Infrastructure not yet ready for large-scale AI deployment')
  }

  return gaps
}

/**
 * Generate recommendations based on maturity level and dimensions
 */
function generateRecommendations(level: number, dimensions: MaturityDimensions): string[] {
  const recommendations: string[] = []

  if (level === 0) {
    // Not Started
    recommendations.push('Start with one high-impact, low-complexity automation project')
    recommendations.push('Build AI literacy through training and workshops')
    recommendations.push('Evaluate quick-win tools with free trials or pilot programs')
    recommendations.push('Identify an internal AI champion to drive adoption')
  } else if (level === 1) {
    // Exploring
    recommendations.push('Focus on 2-3 high-ROI processes for AI implementation')
    recommendations.push('Document current workflows before automating')
    recommendations.push('Set measurable goals for AI tool adoption')
    recommendations.push('Build a small cross-functional AI task force')
  } else if (level === 2) {
    // Experimenting
    recommendations.push('Expand AI tools to 3-5 core business processes')
    recommendations.push('Measure and document ROI on current AI investments')
    recommendations.push('Create internal AI best practices and playbooks')
    recommendations.push('Consider hiring or training dedicated AI/automation specialists')
  } else if (level === 3) {
    // Adopting
    recommendations.push('Integrate AI tools into unified workflows and systems')
    recommendations.push('Explore custom AI solutions for unique business needs')
    recommendations.push('Share best practices and success stories across teams')
    recommendations.push('Develop a comprehensive AI strategy and roadmap')
  } else {
    // Leading
    recommendations.push('Drive industry AI innovation and thought leadership')
    recommendations.push('Consider building proprietary AI capabilities')
    recommendations.push('Mentor other organizations in AI adoption')
    recommendations.push('Explore advanced AI technologies (ML, custom models)')
  }

  // Add dimension-specific recommendations
  if (dimensions.technicalCapacity < 60) {
    recommendations.push('Invest in technical training for key staff members')
  }

  if (dimensions.processMaturity < 60) {
    recommendations.push('Map and document all critical business processes')
  }

  return recommendations
}
