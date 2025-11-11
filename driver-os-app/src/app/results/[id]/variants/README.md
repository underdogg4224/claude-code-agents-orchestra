# Results Page Variants - A/B/C Testing

This folder contains alternative results page variants for conversion optimization.

## Variants Overview

### Variant A (Default - page.tsx)
**Focus:** Direct ROI & Cost Savings
**Target Persona:** CFO, Finance-minded decision makers
**Key Metrics Highlighted:**
- Cost of Inefficiency (COI) in dollars
- Annual savings potential
- Confidence bands
- ROI-focused CTA

**Hypothesis:** Direct financial impact resonates with budget-conscious buyers.

### Variant B (variant-b.tsx)
**Focus:** Operational Efficiency & Time Savings
**Target Persona:** COO, Operations managers
**Key Metrics Highlighted:**
- Hours wasted per month
- FTE equivalent calculations
- Team productivity impact
- Work-life balance benefits

**Hypothesis:** Time reclamation and team efficiency appeals to ops leaders.

### Variant C (variant-c.tsx)
**Focus:** Growth & Revenue Potential
**Target Persona:** CEO, Growth-oriented leaders
**Key Metrics Highlighted:**
- Revenue impact multiplier (2.5x savings)
- Growth capital opportunities
- Market expansion potential
- Competitive advantage framing

**Hypothesis:** Growth potential and strategic advantage drives CEO engagement.

## Implementation Strategy

### Phase 1: Manual Switching (Current)
- Deploy Variant A as default
- Manually test Variants B & C with specific prospects
- Gather qualitative feedback

### Phase 2: URL-Based A/B Testing
- Add query parameter support: `/results/[id]?variant=b`
- Track conversion rates by variant
- Segment by industry/company size

### Phase 3: Automated A/B Testing
- Integrate with analytics platform (PostHog, Mixpanel)
- Automatic variant assignment
- Statistical significance testing
- Winner selection automation

## Metrics to Track

### Primary Conversion Goals:
- CTA click-through rate (Book Audit button)
- Form submission rate
- Calendar booking completion
- Time on page

### Secondary Engagement Metrics:
- Scroll depth
- Component interaction
- Download report clicks
- Social sharing

## Testing Protocol

1. **Sample Size:** Minimum 100 visitors per variant
2. **Duration:** Run for 2-4 weeks or until statistical significance
3. **Significance Level:** p < 0.05
4. **Success Metric:** Booking conversion rate

## Variant Selection Logic (Future)

```typescript
function selectVariant(companyProfile: CompanyProfile): 'a' | 'b' | 'c' {
  // Industry-based routing
  if (companyProfile.industry === 'finance') return 'a' // ROI focus
  if (companyProfile.industry === 'manufacturing') return 'b' // Efficiency focus
  if (companyProfile.industry === 'saas') return 'c' // Growth focus

  // Company size-based routing
  if (companyProfile.employees < 50) return 'c' // Growth potential
  if (companyProfile.employees < 200) return 'b' // Ops efficiency
  return 'a' // Enterprise CFO focus
}
```

## Next Steps

- [ ] Implement URL query parameter support
- [ ] Add analytics tracking events
- [ ] Create variant performance dashboard
- [ ] Document winning variant patterns
- [ ] Create industry-specific variants (Phase 4)
