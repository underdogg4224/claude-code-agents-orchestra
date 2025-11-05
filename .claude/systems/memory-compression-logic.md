# Memory Compression Logic Implementation

**Phase 3, Task 2:** Implement L0/L1 compression and auto-archival

---

## Compression Overview

The memory system monitors two tiers:
- **L0 (Working Memory):** 8K token limit
- **L1 (Session Memory):** 32K token limit

When a tier exceeds 80% capacity, automatic compression triggers.

---

## L0 Compression Logic

### Trigger Condition
```
IF L0.tokens_used > 6,400 (80% of 8K):
  TRIGGER: Compress L0 to L1
```

### Compression Process

**Step 1: Identify Compressible Content**
```
Analyze L0 content:
- Current task context (keep full)
- Completed steps (summarize)
- Recent conversation (summarize last 3 items)
- Artifacts (reference only, not full content)
```

**Step 2: Summarization**

```json
{
  "action": "Compress L0 to L1",
  "timestamp": "[ISO timestamp]",

  "before": {
    "tokens": 7200,
    "utilization_percent": 90,
    "status": "over_threshold"
  },

  "compression_targets": [
    {
      "field": "recent_conversation",
      "original_tokens": 2000,
      "compressed_tokens": 400,
      "compression_ratio": 5,
      "method": "extract_key_points"
    },
    {
      "field": "completed_steps",
      "original_tokens": 1500,
      "compressed_tokens": 200,
      "compression_ratio": 7.5,
      "method": "summarize_progress"
    }
  ],

  "preserved": [
    "current_context (keep full - needed for current work)",
    "progress (keep full - tracking status)",
    "artifacts (keep references)"
  ],

  "after": {
    "tokens": 3200,
    "utilization_percent": 40,
    "status": "reset_complete"
  }
}
```

**Step 3: Archive to L1**

The summarized L0 becomes a task summary in L1:

```json
{
  "task_id": "T003",
  "title": "Implement React login form",
  "assigned_to": "@react-expert",
  "status": "in_progress",
  "l0_summary": {
    "created_from": "L0 compression",
    "compressed_at": "[ISO timestamp]",
    "compression_ratio": 6.2,
    "summary": "Component structure created with hooks. Working on validation logic. 75% complete. Next: add error handling.",
    "current_artifacts": ["src/components/LoginForm.tsx"],
    "tokens_used_in_l0": 7200,
    "tokens_after_compression": 3200
  }
}
```

**Step 4: Reset L0**

```json
{
  "memory_tier": "L0",
  "session_id": "[same session]",
  "task_id": "[continue current task]",
  "status": "reset_after_compression",
  "reset_at": "[ISO timestamp]",
  "tokens_used": 0,
  "tokens_available": 8000,
  "utilization_percent": 0,
  "note": "Ready for next phase of current task"
}
```

---

## L1 Compression Logic

### Trigger Condition
```
IF L1.tokens_used > 25,600 (80% of 32K):
  TRIGGER: Selective compression in L1
```

### Compression Strategy

Unlike L0 (full reset), L1 uses **selective summarization**:

**Preserve (in full):**
- Last 3-5 completed tasks (most recent)
- Current active tasks
- Coordinator assignments
- Key decisions
- Open questions

**Compress (summarize):**
- Older completed tasks (keep only summary)
- Detailed conversations (keep only highlights)
- Token usage history (aggregate)

**Archive to L2 (Future phase):**
- Oldest completed tasks (when compression still needed)
- Historical context
- Long-form notes

### Compression Process

```json
{
  "action": "Selective compression in L1",
  "timestamp": "[ISO timestamp]",

  "analysis": {
    "total_tasks": 12,
    "completed_tasks": 8,
    "active_tasks": 3,
    "blocked_tasks": 0
  },

  "compression_strategy": {
    "keep_full": [
      {
        "task_id": "T011",
        "title": "Recent task (keep full)",
        "tokens": 800
      },
      {
        "task_id": "T010",
        "title": "Recent task (keep full)",
        "tokens": 750
      }
    ],

    "compress": [
      {
        "task_id": "T001",
        "title": "API design",
        "original_tokens": 2000,
        "compressed_tokens": 200,
        "compression_ratio": 10,
        "summary": "OAuth2 endpoints designed, approved"
      },
      {
        "task_id": "T002",
        "title": "Database schema",
        "original_tokens": 1800,
        "compressed_tokens": 180,
        "compression_ratio": 10,
        "summary": "Auth tables created, migration tested"
      }
    ],

    "total_reduction": "3800 tokens → 380 tokens (10x compression)",
    "new_l1_size": "25600 tokens (original) - 3420 tokens (saved) = 22180 tokens"
  },

  "result": {
    "before": {
      "tokens": 25600,
      "utilization_percent": 80
    },
    "after": {
      "tokens": 22180,
      "utilization_percent": 69
    },
    "status": "compression_complete"
  }
}
```

### Compressed Task Format

```json
{
  "task_id": "T001",
  "title": "Design authentication API contracts",
  "assigned_to": "@api-architect",
  "status": "completed",
  "compressed": true,
  "compression_timestamp": "[ISO timestamp]",

  "original_completion_summary": {
    "duration_minutes": 45,
    "quality": "approved_first_review",
    "artifacts": ["api/auth.routes.ts", "api/auth.types.ts"]
  },

  "compressed_summary": "OAuth2 endpoints designed (/auth/login, logout, refresh) with JWT tokens. Design approved by team.",

  "compressed_tokens": 200,
  "original_tokens": 2000,
  "compression_ratio": 10
}
```

---

## Monitoring & Thresholds

### Real-Time Monitoring

```python
def monitor_memory_usage():
    while session_active:
        l0_usage = get_l0_tokens()
        l1_usage = get_l1_tokens()

        # L0 Warning (70% threshold)
        if l0_usage > 5600:  # 70% of 8K
            log_warning(f"L0 approaching limit: {l0_usage}/8000")

        # L0 Critical (80% threshold)
        if l0_usage > 6400:  # 80% of 8K
            trigger_l0_compression()

        # L1 Warning (70% threshold)
        if l1_usage > 22400:  # 70% of 32K
            log_warning(f"L1 approaching limit: {l1_usage}/32000")

        # L1 Critical (80% threshold)
        if l1_usage > 25600:  # 80% of 32K
            trigger_l1_compression()

        # L1 Hard limit (100%)
        if l1_usage > 32000:
            log_error("L1 exceeded hard limit!")
            force_l1_compression()
            notify_context_manager()
```

### Metrics Tracking

```json
{
  "memory_compression_metrics": {
    "l0_compressions_count": 5,
    "l0_total_reduction_tokens": 28000,
    "l0_avg_compression_ratio": 6.2,

    "l1_compressions_count": 1,
    "l1_total_reduction_tokens": 3420,
    "l1_avg_compression_ratio": 10,

    "session_compression_efficiency": {
      "tokens_saved": 31420,
      "time_spent_compressing": "45 seconds",
      "quality_preserved": "100%"
    }
  }
}
```

---

## Compression Quality Checks

**Before archiving, verify:**

✅ Critical information preserved
✅ No data loss in compression
✅ Summarized content accurate
✅ Artifacts referenced correctly
✅ Decision trail maintained
✅ Coordinator context preserved

**Post-compression validation:**

```python
def validate_compression():
    # Can coordinator access necessary context?
    assert coordinator_can_read_relevant_decisions()

    # Are artifact references valid?
    assert all_artifact_references_exist()

    # Is task history understandable?
    assert task_summary_comprehensible()

    # Did we lose any critical info?
    assert no_critical_data_lost()

    return all_checks_passed
```

---

## Escalation to Context Manager

If L1 compression alone insufficient:

```
IF L1_usage > 32000 (hard limit):
  ESCALATE to @context-manager

  Context manager options:
  1. Archive old completed tasks to L2 (long-term storage)
  2. Split session into multiple smaller sessions
  3. Request user input on session continuation
  4. Implement L2 archival immediately
```

---

## Integration with Agent Workflow

### For Specialists

```
Specialist working on task:
1. L0 tracks current work
2. When L0 exceeds 80%:
   - Specialist notified: "Approaching context limit"
   - Continue working (compression automatic)
3. Compression happens in background
4. L0 reset, continue with fresh context
5. Coordinator can read summary from L1 if needed
```

### For Coordinators

```
Coordinator managing department:
1. Monitor L1 for department status
2. When L1 exceeds 80%:
   - Trigger selective compression
   - Preserve recent tasks
   - Summarize older tasks
3. Continue coordination with reduced context size
```

### For Context Manager

```
Context manager monitoring system:
1. Track overall L0/L1 usage
2. Identify compression patterns
3. Recommend optimizations
4. Prepare for L2 archival (Phase 4)
5. Alert if usage abnormal
```

---

## Performance Impact

**Without Compression:**
- Context grows unbounded
- Tokens = O(n) where n = number of tasks
- Eventually hits hard limits

**With L0/L1 Compression:**
- L0 stays lean (max 8K) via auto-reset
- L1 stays manageable (max 32K) via selective compression
- Tokens = O(1) effectively constant
- Can handle 100+ task sessions without bloat

**Example:**
```
10-task session without compression:
  Total tokens: 40K (exceeds L1 limit)

10-task session with L0/L1 compression:
  L0 resets 5 times (saves 25K tokens)
  L1 selective compress (saves 5K tokens)
  Total tokens: 10K (well within limits)

Savings: 30K tokens (75% reduction) ✅
```

---

## Implementation Checklist (Week 5-6)

- [ ] L0 template created (.claude/state/template-l0-working-memory.json)
- [ ] L1 template created (.claude/state/template-l1-session-memory.json)
- [ ] Compression logic documented
- [ ] Monitoring script written
- [ ] Quality validation checks created
- [ ] Integration points documented
- [ ] Test compression on pilot mission
- [ ] Monitor metrics during Phase 3
- [ ] Fine-tune thresholds based on real data
- [ ] Ready for L2 archival design (Phase 4)

---

**Status:** Ready for Phase 3 implementation
**Next:** Integrate with context-manager and coordinator prompts
