# Model Routing Strategy - Phase 4 Optimization

**Phase 4 Goal:** Reduce monthly costs from $1,058 to $298 (72% reduction) through intelligent model assignment

---

## Overview: Three-Tier Model Strategy

The Agent Orchestra uses three Claude models optimized for different cognitive demands:

| Tier | Model | Cost | Primary Use | Agents | Example |
|------|-------|------|------------|--------|---------|
| **Strategic** | Opus 4 | $0.08/$0.024 | Complex reasoning, multi-agent coordination | 13 | Tech Lead designing system |
| **Implementation** | Sonnet 4.5 | $0.003/$0.006 | Feature development, framework expertise | 21 | React dev building component |
| **Routine** | Haiku 4.5 | $0.00075/$0.0003 | Straightforward tasks, execution | 13 | Running tests, documentation |

**Expected Cost Distribution:**
- Opus (13 agents): ~35% of usage, ~$120/month
- Sonnet (21 agents): ~45% of usage, ~135/month
- Haiku (13 agents): ~20% of usage, ~$43/month
- **Total: $298/month** (vs $1,058 baseline)

---

## Tier 1: Strategic Reasoning (Opus Model) - 13 Agents

**Purpose:** Complex system design, multi-agent coordination, security analysis, architectural planning

**These agents handle:**
- ✓ Complex design decisions requiring deep analysis
- ✓ Multi-step orchestration and coordination
- ✓ Security and architecture reviews
- ✓ High-impact decisions affecting multiple systems
- ✓ Advanced debugging and root cause analysis

### Tier 1 Agents

**Orchestration (1):**
- `@tech-lead-orchestrator` - Multi-agent coordination blueprint creation

**Architecture (4):**
- `@backend-architect` - System design, microservices, scalability
- `@api-architect` - API design, contract definition, compatibility
- `@cloud-architect` - Infrastructure and cloud optimization
- `@database-optimizer` - Query performance, schema design, optimization

**Quality Assurance (2):**
- `@security-auditor` - Vulnerability scanning, security analysis
- `@code-reviewer` - Code quality, best practices, architecture review
- `@debugger` - Complex bug investigation, root cause analysis

**Specialized Tools (1):**
- `@legacy-modernizer` - Refactoring strategy, modernization planning

**Coordinators (4):**
- `@backend-coordinator` - Backend specialist coordination
- `@data-coordinator` - Data specialist coordination
- `@devops-coordinator` - Infrastructure specialist coordination
- `@security-coordinator` - Security specialist coordination

**Rationale:** These agents make high-impact decisions requiring deep reasoning, deal with complex tradeoffs, and coordinate multiple specialists.

---

## Tier 2: Implementation (Sonnet Model) - 21 Agents

**Purpose:** Feature development, framework expertise, tool integration, content creation

**These agents handle:**
- ✓ Writing production code in specific frameworks
- ✓ Framework-specific patterns and best practices
- ✓ Tool and platform integration
- ✓ Design and UI implementation
- ✓ Content creation and documentation

### Tier 2 Agents

**Backend Development (3):**
- `@django-expert` - Django-specific development
- `@laravel-expert` - Laravel-specific development
- `@rails-expert` - Rails-specific development

**Frontend Development (4):**
- `@react-expert` - React component development
- `@nextjs-specialist` - Next.js full-stack development
- `@vue-expert` - Vue.js development
- `@vue-nuxt-expert` - Nuxt.js development

**Mobile Development (1):**
- `@mobile-developer` - React Native & Flutter

**Language Experts (4):**
- `@python-pro` - Python-specific optimization
- `@golang-pro` - Go-specific development
- `@rust-pro` - Rust systems programming
- `@typescript-expert` - TypeScript-specific patterns

**Design (2):**
- `@ui-ux-designer` - User interface design
- `@tailwind-css-expert` - Tailwind CSS implementation

**Specialized Tools (2):**
- `@payment-integration` - Payment gateway integration
- `@game-developer` - Game engine development

**Specialized Domains (3):**
- `@blockchain-developer` - Web3 and blockchain
- `@ai-engineer` - AI model implementation
- `@ml-engineer` - Machine learning models

**Content & Documentation (1):**
- `@documentation-specialist` - API docs, guides

**Coordinators (4):**
- `@frontend-coordinator` - Frontend specialist coordination
- `@integration-coordinator` - Integration specialist coordination
- `@mobile-coordinator` - Mobile specialist coordination
- `@testing-coordinator` - Testing specialist coordination

**Rationale:** These agents primarily implement solutions using specific frameworks/languages where deep pattern knowledge is valuable but reasoning isn't as critical.

---

## Tier 3: Routine Execution (Haiku Model) - 13 Agents

**Purpose:** Straightforward implementations, testing, operations, routine tasks

**These agents handle:**
- ✓ Routine task execution following specifications
- ✓ Testing and quality automation
- ✓ Operations and DevOps tasks
- ✓ Accessibility compliance
- ✓ CMS and platform-specific work

### Tier 3 Agents

**Quality Assurance (2):**
- `@test-automator` - Automated testing, test suite creation
- `@accessibility-specialist` - WCAG compliance, a11y testing

**DevOps & Infrastructure (2):**
- `@devops-engineer` - CI/CD, containers, deployment
- `@database-admin` - Backups, replication, monitoring

**Data & AI (3):**
- `@data-scientist` - Data analysis and modeling
- `@data-engineer` - Data pipeline implementation
- `@mlops-engineer` - ML operations and deployment

**Specialized Domains (2):**
- `@crypto-trader` - Crypto trading automation
- `@arbitrage-bot` - Arbitrage bot development
- `@crypto-analyst` - Crypto analysis
- `@crypto-risk-manager` - Risk management
- `@defi-strategist` - DeFi strategy
- `@quant-analyst` - Quantitative analysis

**Specialized Tools (2):**
- `@directus-developer` - Headless CMS development
- `@drupal-developer` - Drupal module development

**Coordinators (2):**
- `@quality-coordinator` - QA specialist coordination
- `@documentation-coordinator` - Documentation coordination

**Note:** One coordinator is assigned to Tier 3 because its primary function is coordination of routine tasks.

**Rationale:** These agents execute well-defined, straightforward work that doesn't require complex reasoning.

---

## Model Fallback Strategy

If a higher-tier agent is unavailable or overloaded:

**Opus → Sonnet Fallback:**
- Use when complex decision needs faster execution
- Slightly reduced quality but acceptable for time-critical tasks
- Example: Architecture review under deadline

**Sonnet → Haiku Fallback:**
- Use for simpler implementation tasks
- Risk: May miss edge cases, requires code review
- Example: Simple UI component, standard crud endpoint

**Manual Override:**
- User can request specific model for any task
- Logged for analysis and cost tracking
- Example: "Use Opus for this critical security audit"

---

## Cost Calculation Model

**Monthly Cost Estimation:**

**Input costs (per 1M tokens):**
- Opus: $80
- Sonnet: $3
- Haiku: $0.75

**Output costs (per 1M tokens):**
- Opus: $24
- Sonnet: $6
- Haiku: $0.30

**Usage Pattern (typical month):**
- Strategic decisions (Opus): 500K tokens input, 100K tokens output
  - Cost: (500 × 0.08) + (100 × 0.024) = $44.40
- Implementation (Sonnet): 3M tokens input, 1.5M tokens output
  - Cost: (3000 × 0.003) + (1500 × 0.006) = $13.50
- Routine execution (Haiku): 2M tokens input, 1M tokens output
  - Cost: (2000 × 0.00075) + (1000 × 0.0003) = $1.80

**Monthly Total: ~$298** (vs baseline ~$1,058)

---

## Implementation Details

### YAML Frontmatter Format

Each agent specifies model in frontmatter:

```yaml
---
name: agent-name
description: Brief description
model: opus|sonnet|haiku
---
```

### Model Routing Logic (CLAUDE.md)

```
When assigning specialist agent:
1. Classify task complexity (Simple/Complex)
2. Identify task category (strategic/implementation/routine)
3. Select from appropriate tier
4. If unavailable, use fallback tier
5. Log selection for cost tracking
```

### Monitoring & Optimization

Track per-month:
- Token usage by model tier
- Cost per agent
- Fallback frequency
- Performance metrics per tier

Optimize quarterly:
- Move agents between tiers based on actual usage
- Adjust fallback thresholds
- Refine cost estimation

---

## Migration Plan

**Phase 4 Week 9 Implementation:**

1. **Monday:** Design finalization
   - Review all agents for tier assignment
   - Validate cost calculations
   - Create migration checklist

2. **Tuesday-Wednesday:** YAML Updates
   - Batch 1: Update 10 agents (Tier 1 specialists)
   - Batch 2: Update 15 agents (Tier 2 implementations)
   - Batch 3: Update 12 agents (Tier 3 routine + coordinators)

3. **Thursday:** Testing
   - Run representative missions
   - Verify model routing
   - Check cost calculations
   - Validate fallback logic

4. **Friday:** Optimization & Documentation
   - Fine-tune tier assignments
   - Update CLAUDE.md with routing logic
   - Create monitoring dashboard
   - Document any adjustments

---

## Success Criteria

✅ **Phase 4 Week 9 Gate:**
- [ ] All agents assigned to correct tier
- [ ] Model field in all YAML frontmatter
- [ ] Routing logic implemented in CLAUDE.md
- [ ] Fallback strategy tested and working
- [ ] Cost calculation validated
- [ ] <5% performance degradation vs baseline
- [ ] 45% cost reduction verified (strategic tier optimization)

---

## Related Documents

- `.claude/PHASE-4-PLAN.md` - Full Phase 4 implementation plan
- `.claude/metrics/system.json` - System metrics tracking
- `CLAUDE.md` - Master orchestration rules with routing logic
- Individual agent files - Model field in YAML frontmatter

