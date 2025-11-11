// Industry benchmarks and constants for scoring calculations

// Average hourly rates by role and industry
export const HOURLY_RATES = {
  construction: {
    office_admin: 25,
    project_manager: 65,
    estimator: 55,
    field_supervisor: 45,
    executive: 125,
  },
  manufacturing: {
    office_admin: 22,
    production_manager: 55,
    quality_control: 40,
    maintenance: 35,
    executive: 110,
  },
  professional_services: {
    admin: 30,
    consultant: 85,
    manager: 95,
    executive: 150,
  },
  technology: {
    admin: 28,
    developer: 75,
    manager: 90,
    executive: 140,
  },
  healthcare: {
    admin: 24,
    specialist: 80,
    manager: 70,
    executive: 130,
  },
  retail: {
    admin: 20,
    manager: 45,
    director: 65,
    executive: 100,
  },
  financial_services: {
    admin: 32,
    analyst: 90,
    manager: 110,
    executive: 160,
  },
} as const

// Industry-specific process benchmarks
export const PROCESS_BENCHMARKS = {
  invoicing: {
    typical_hours_per_week: 10,
    typical_error_rate: 15,
    automation_potential: 80,
  },
  rfis: {
    typical_hours_per_week: 15,
    typical_error_rate: 20,
    automation_potential: 60,
  },
  change_orders: {
    typical_hours_per_week: 12,
    typical_error_rate: 25,
    automation_potential: 50,
  },
  timecards: {
    typical_hours_per_week: 8,
    typical_error_rate: 10,
    automation_potential: 90,
  },
  compliance_docs: {
    typical_hours_per_week: 6,
    typical_error_rate: 5,
    automation_potential: 70,
  },
  scheduling: {
    typical_hours_per_week: 10,
    typical_error_rate: 18,
    automation_potential: 65,
  },
  reporting: {
    typical_hours_per_week: 12,
    typical_error_rate: 12,
    automation_potential: 75,
  },
  data_entry: {
    typical_hours_per_week: 20,
    typical_error_rate: 8,
    automation_potential: 85,
  },
  email_management: {
    typical_hours_per_week: 15,
    typical_error_rate: 5,
    automation_potential: 60,
  },
  document_processing: {
    typical_hours_per_week: 14,
    typical_error_rate: 10,
    automation_potential: 70,
  },
} as const

// AI Maturity Level definitions
export const MATURITY_LEVELS = {
  0: {
    label: 'Not Started',
    description: 'No AI tools in use, manual processes dominate',
    characteristics: [
      '100% manual workflows',
      'No digital automation',
      'Paper-based processes',
    ],
  },
  1: {
    label: 'Exploring',
    description: 'Aware of AI but minimal adoption',
    characteristics: [
      'Using basic digital tools',
      'Considering AI solutions',
      'Limited technical capacity',
    ],
  },
  2: {
    label: 'Experimenting',
    description: 'Testing AI tools in limited areas',
    characteristics: [
      '1-2 AI tools adopted',
      'Pilot projects running',
      'Building technical knowledge',
    ],
  },
  3: {
    label: 'Adopting',
    description: 'Multiple AI tools integrated',
    characteristics: [
      '3-5 AI tools in production',
      'Clear ROI demonstrated',
      'Growing AI expertise',
    ],
  },
  4: {
    label: 'Leading',
    description: 'AI-first organization with advanced capabilities',
    characteristics: [
      'Comprehensive AI strategy',
      'Custom AI implementations',
      'Measurable competitive advantage',
    ],
  },
} as const

// Quick win templates by process type
export const QUICK_WIN_TEMPLATES = {
  invoicing: {
    name: 'Automated Invoice Processing',
    type: 'automation',
    tools: ['QuickBooks AI', 'Bill.com', 'Stampli'],
    implementationTime: '2-4 weeks',
    complexity: 'low',
  },
  rfis: {
    name: 'AI-Powered RFI Management',
    type: 'ai_assist',
    tools: ['Procore AI', 'Buildr', 'Fieldwire'],
    implementationTime: '4-6 weeks',
    complexity: 'medium',
  },
  change_orders: {
    name: 'Change Order Automation',
    type: 'automation',
    tools: ['Procore', 'CoConstruct', 'Buildertrend'],
    implementationTime: '3-5 weeks',
    complexity: 'medium',
  },
  timecards: {
    name: 'Digital Timecard System',
    type: 'automation',
    tools: ['ExakTime', 'Clockify', 'TSheets'],
    implementationTime: '1-2 weeks',
    complexity: 'low',
  },
  compliance_docs: {
    name: 'Document Automation System',
    type: 'automation',
    tools: ['DocuSign AI', 'PandaDoc', 'Formstack'],
    implementationTime: '3-4 weeks',
    complexity: 'medium',
  },
  scheduling: {
    name: 'Smart Scheduling Assistant',
    type: 'ai_assist',
    tools: ['Calendly', 'Motion', 'Reclaim.ai'],
    implementationTime: '1-3 weeks',
    complexity: 'low',
  },
  reporting: {
    name: 'Automated Report Generation',
    type: 'automation',
    tools: ['Tableau', 'Power BI', 'Looker'],
    implementationTime: '4-6 weeks',
    complexity: 'medium',
  },
  data_entry: {
    name: 'Intelligent Data Entry',
    type: 'automation',
    tools: ['UiPath', 'Zapier', 'Make.com'],
    implementationTime: '2-4 weeks',
    complexity: 'low',
  },
  email_management: {
    name: 'AI Email Assistant',
    type: 'ai_assist',
    tools: ['Superhuman', 'SaneBox', 'Front AI'],
    implementationTime: '1-2 weeks',
    complexity: 'low',
  },
  document_processing: {
    name: 'OCR Document Processing',
    type: 'automation',
    tools: ['Rossum', 'ABBYY', 'Amazon Textract'],
    implementationTime: '3-5 weeks',
    complexity: 'medium',
  },
} as const

// Default values
export const DEFAULT_WEEKS_PER_MONTH = 4.33
export const DEFAULT_ERROR_COST_MULTIPLIER = 2.5
export const DEFAULT_CONFIDENCE_VARIANCE = 0.2 // ±20%
