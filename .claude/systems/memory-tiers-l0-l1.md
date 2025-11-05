# Memory Tier System: L0 & L1 Implementation (Phase 2)

## Overview

A two-tier memory system manages context efficiently during complex missions:

- **L0: Working Memory** - Current task context only (8K tokens max)
- **L1: Short-Term Memory** - Session state (32K tokens max)

## L0: Working Memory (Immediate Context)

**Purpose:** Keep immediate task context available without bloat

**Tmax (Input Limit):** 8,000 tokens
**Tretained (Output Limit):** 1,000 tokens (auto-archived when exceeded)

**Contains:**
- Current user request
- Active agent assignments
- Specialist being worked with right now
- Files currently being edited
- Real-time task progress
- Current errors or blockers

**Lifecycle:**
1. Task starts → L0 populated with immediate context
2. Work progresses → L0 updated with current state
3. Task completes or switches → L0 archived to L1, cleared
4. Token count exceeds 80% → Begin compression

**Example L0 Context:**

```json
{
  "task_id": "T042",
  "current_specialist": "@react-expert",
  "active_files": ["LoginForm.tsx", "auth.hook.ts"],
  "current_request": "Add email validation to login form",
  "progress": {
    "step": 1,
    "status": "implementing validation logic",
    "completed": ["component structure created"]
  },
  "current_blocker": null,
  "tokens_used": 4200,
  "timestamp_started": "2025-11-04T14:30:00Z"
}
```

**Compression Trigger:**
- When tokens > 6,400 (80% of 8K)
- Summarize work progress
- Archive to L1
- Reset L0 for next phase

## L1: Short-Term Memory (Session State)

**Purpose:** Maintain session context across multiple tasks without full history

**Tmax (Input Limit):** 32,000 tokens
**Tretained (Output Limit):** 4,000 tokens (auto-archived to L2 when exceeded)

**Contains:**
- Last 5-10 completed tasks (summaries, not full details)
- Active agents and their assignments
- Modified files in session
- Key decisions made
- Pending dependencies
- Current session state

**Lifecycle:**
1. Session starts → L1 initialized empty
2. Tasks complete → Summaries added to L1
3. Coordinator needs context → Reads L1 for department status
4. Session ends → L1 archived to L2 for long-term storage
5. Token count exceeds 80% → Begin selective summarization

**Example L1 Content:**

```json
{
  "session_id": "sess-2025-11-04-001",
  "session_start": "2025-11-04T10:00:00Z",
  "session_duration_minutes": 120,

  "mission": {
    "id": "mission-auth-001",
    "title": "Implement User Authentication",
    "status": "in_progress",
    "started": "2025-11-04T10:00:00Z"
  },

  "completed_tasks": [
    {
      "task_id": "T001",
      "title": "API endpoint design",
      "assigned_to": "@api-architect",
      "status": "completed",
      "summary": "Designed OAuth2 endpoints (/auth/login, /auth/logout, /auth/refresh)",
      "output": "api/auth.routes.ts created",
      "duration_minutes": 45
    },
    {
      "task_id": "T002",
      "title": "Database schema design",
      "assigned_to": "@database-optimizer",
      "status": "completed",
      "summary": "Created users and sessions tables with indexes",
      "output": "migration_001_create_auth_tables.sql",
      "duration_minutes": 30
    }
  ],

  "active_tasks": [
    {
      "task_id": "T003",
      "title": "Implement React login form",
      "assigned_to": "@react-expert",
      "status": "in_progress",
      "started": "2025-11-04T11:15:00Z",
      "estimated_completion": "2025-11-04T12:00:00Z"
    }
  ],

  "blocked_tasks": [],

  "modified_files": [
    "api/auth.routes.ts",
    "api/auth.controller.ts",
    "api/auth.middleware.ts",
    "database/migrations/001_auth_tables.sql",
    "frontend/LoginForm.tsx"
  ],

  "key_decisions": [
    "OAuth2 with PKCE flow for security",
    "JWT tokens with 1-hour expiry",
    "Refresh tokens stored in secure HTTP-only cookies"
  ],

  "dependencies": [
    {
      "blocking_task": "T003",
      "blocked_on": "T001",
      "status": "resolved"
    }
  ],

  "metrics": {
    "tokens_consumed": 24000,
    "tasks_completed": 2,
    "tasks_in_progress": 1,
    "estimated_total_cost": "$0.45"
  },

  "next_steps": [
    "Complete React login component",
    "Implement security coordinator review",
    "Add integration tests"
  ]
}
```

## Compression Workflow

### When L0 Exceeds 80% (6,400 tokens):

1. **Identify compressible content:**
   - Completed work → Summarize to 100-200 tokens
   - Old conversation → Archive
   - Intermediate results → Keep final only

2. **Compress:**
   ```
   Before (L0): "User requested login form. Started with component structure.
   Created hooks for validation. Tested imports. Added error handling..."

   After (summary): "React login form component created with validation hooks
   and error handling (LoginForm.tsx, 150 LOC, tests passing)"
   ```

3. **Archive to L1:**
   - Add summary to `completed_tasks` in L1
   - Mark as "archived from L0"
   - Timestamp for reference

4. **Reset L0:**
   - Clear working memory
   - New task starts with clean slate
   - Coordinator can read L1 if context needed

### When L1 Exceeds 80% (25,600 tokens):

1. **Session is long-running** - Selective summarization:
   - Keep last 3-5 completed tasks in detail
   - Older tasks: Compress to 50-100 tokens (decision + output only)
   - Archive oldest to L2 (long-term storage)

2. **Preserve critical info:**
   - Key decisions
   - Current task status
   - Modified files list
   - Pending dependencies

3. **Escalate if needed:**
   - If L1 still exceeds 100% → Escalate to @context-manager
   - Long-running session may need strategic review
   - User may need progress update

## Integration Points

### Coordinator Usage:

Coordinator reads L1 for department status:

```
@frontend-coordinator needs task status?
  → Read L1.active_tasks for department work
  → See L1.completed_tasks for recent progress
  → Check L1.modified_files for artifacts
  → Minimal token cost (L1 already summarized)
```

### Specialist Escalation:

Specialist needs session context?

```
@react-expert needs to know previous decisions?
  → Read L1.key_decisions
  → Check L1.completed_tasks[related]
  → Get L1.modified_files for dependencies
  → NO need to re-read full conversation history
```

### Context Manager Usage:

For long-running sessions (>4 hours):

```
@context-manager monitors L0/L1 usage
  → L0 approaching limit? → Trigger compression
  → L1 approaching limit? → Plan L2 archival
  → Session very long? → Provide optimization suggestions
```

## Budget Thresholds

**L0 Budget:**
- Warning (80%): 6,400 tokens
- Hard limit (100%): 8,000 tokens
- Action: Compression + archive to L1

**L1 Budget:**
- Warning (80%): 25,600 tokens
- Hard limit (100%): 32,000 tokens
- Action: Selective archive to L2

**Combined L0+L1 Budget:**
- Maximum active context: 40,000 tokens
- Ensures no spillover issues
- Triggers @context-manager oversight if exceeded

## Metrics Tracking

Monitor in `.claude/metrics/system.json`:

```json
{
  "memory_usage": {
    "l0_tokens_used": 4200,
    "l0_capacity": 8000,
    "l0_utilization_percent": 52.5,
    "l1_tokens_used": 16800,
    "l1_capacity": 32000,
    "l1_utilization_percent": 52.5,
    "l0_compressions_this_session": 2,
    "l1_compressions_this_session": 0,
    "avg_compression_ratio": 4.2
  }
}
```

## Implementation Checklist (Phase 2)

- [ ] Create `.claude/state/l0-working-memory.json` template
- [ ] Create `.claude/state/l1-session-memory.json` template
- [ ] Update all coordinator prompts with L0/L1 awareness
- [ ] Update @context-manager with compression logic
- [ ] Add L0/L1 metrics tracking
- [ ] Test compression on long-running tasks
- [ ] Document edge cases (errors during compression, etc.)
- [ ] Create monitoring alerts for budget thresholds

## Testing L0/L1 System

**Test Case 1: Simple Task (L0 only)**
- Start task
- Complete task
- Verify: L0 < 80%, minimal L1 update

**Test Case 2: Medium Task (L0 compression)**
- Start multi-step task
- Work progresses (L0 filling up)
- At 80%: Trigger compression
- Verify: L0 reset, summary added to L1
- Continue work with fresh L0

**Test Case 3: Long Session (L0 + L1)**
- Run 10+ tasks in session
- Monitor L0 compressions (expect 5-10)
- Monitor L1 growth (expect gradual)
- At 2-3 hours: Verify L1 compression
- End session: Archive to L2

**Test Case 4: Context Filtering**
- Coordinator reads L1 for status
- Verify: Gets relevant task summaries only
- Verify: Token cost minimal (summary vs full history)
- Verify: Can see all needed context

## Expected Outcomes (Phase 2)

✅ Working memory stays lean (<8K tokens)
✅ Session state accessible without full history
✅ Compression reduces tokens by 60-80%
✅ Context filtering saves 40% overhead
✅ No loss of critical information
✅ Ready for Phase 3 (L2 long-term memory)

---

**Status:** Phase 2 Foundation
**Next:** Phase 3 will add L2 (Long-term Memory) for persistent storage
