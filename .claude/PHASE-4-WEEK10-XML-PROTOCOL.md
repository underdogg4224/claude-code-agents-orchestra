# Phase 4 Week 10: XML Communication Protocol Design

**Objective:** Design and implement structured XML messaging protocol for inter-agent communication with full audit trails and typed message validation.

**Timeline:** Week 10 (Estimated 40 hours)
**Status:** In Progress

---

## 1. XML Communication Protocol Overview

### Purpose
Enable structured, typed, and auditable communication between agents with:
- Full request/response tracing
- Schema validation
- Agent authentication/authorization
- Message routing and prioritization
- Error recovery and retry logic
- Audit trail generation

### Key Benefits
- **Type Safety:** Schema-validated messages prevent malformed data
- **Auditability:** Complete message history with timestamps and signing
- **Interoperability:** Language-agnostic XML standard
- **Debugging:** Structured logging enables easy troubleshooting
- **Security:** Digital signatures and encryption support

---

## 2. XML Schema Design (xsd)

### Root Message Element

```xml
<agent-message version="1.0" xmlns="http://agent-orchestra.local/protocol/1.0">
  <header>
    <!-- Message metadata -->
  </header>
  <body>
    <!-- Message payload -->
  </body>
  <signature>
    <!-- Digital signature for authentication -->
  </signature>
</agent-message>
```

### Header Element Structure

```xml
<header>
  <message-id>uuid-v4</message-id>
  <timestamp>ISO-8601</timestamp>
  <sender>
    <agent-name>string</agent-name>
    <agent-role>coordinator|specialist|orchestrator</agent-role>
    <tier>opus|sonnet|haiku</tier>
  </sender>
  <recipient>
    <agent-name>string</agent-name>
    <agent-role>coordinator|specialist|orchestrator</agent-role>
  </recipient>
  <correlation-id>uuid-v4</correlation-id>
  <conversation-chain>
    <message-ref index="0">previous-message-id</message-ref>
    <message-ref index="1">grandparent-message-id</message-ref>
  </conversation-chain>
  <priority>critical|high|normal|low</priority>
  <expiration>ISO-8601</expiration>
  <retry-policy>
    <max-attempts>3</max-attempts>
    <backoff-strategy>exponential|linear</backoff-strategy>
    <timeout-seconds>30</timeout-seconds>
  </retry-policy>
</header>
```

### Body Element - Task Delegation

```xml
<body type="task-delegation">
  <task>
    <task-id>unique-identifier</task-id>
    <task-type>feature-development|bug-fix|refactoring|testing|review</task-type>
    <title>string</title>
    <description>string</description>
    <objectives>
      <objective priority="1">requirement 1</objective>
      <objective priority="2">requirement 2</objective>
    </objectives>
    <acceptance-criteria>
      <criterion measurable="true">criteria 1</criterion>
      <criterion measurable="true">criteria 2</criterion>
    </acceptance-criteria>
    <estimated-effort-hours>number</estimated-effort-hours>
    <dependencies>
      <dependency type="blocks-on">task-id-2</dependency>
      <dependency type="depends-on">task-id-3</dependency>
    </dependencies>
    <context>
      <file-reference path="src/module.ts">brief description</file-reference>
      <api-contract endpoint="/api/users">GET /api/users</api-contract>
      <constraint type="performance">response time &lt; 200ms</constraint>
    </context>
    <expected-outputs>
      <output type="code-files">
        <file-path>path/to/file1.ts</file-path>
        <file-path>path/to/file2.ts</file-path>
      </output>
      <output type="test-files">
        <file-path>path/to/file1.test.ts</file-path>
      </output>
      <output type="documentation">
        <file-path>docs/feature.md</file-path>
      </output>
    </expected-outputs>
    <success-criteria>
      <metric name="test-coverage">&gt;=80%</metric>
      <metric name="type-errors">0</metric>
      <metric name="lint-errors">0</metric>
    </success-criteria>
  </task>
  <assignment>
    <assigned-to>specialist-agent-name</assigned-to>
    <assigned-by>coordinator-agent-name</assigned-by>
    <assigned-timestamp>ISO-8601</assigned-timestamp>
  </assignment>
</body>
```

### Body Element - Status Update

```xml
<body type="status-update">
  <task-id>task-identifier</task-id>
  <status>in-progress|blocked|completed|failed</status>
  <progress-percentage>0-100</progress-percentage>
  <current-activity>string describing what's being worked on</current-activity>
  <blockers>
    <blocker severity="critical">description</blocker>
    <blocker severity="warning">description</blocker>
  </blockers>
  <artifacts-created>
    <artifact type="code">
      <file-path>src/new-file.ts</file-path>
      <lines-of-code>250</lines-of-code>
      <checksum>sha256-hash</checksum>
    </artifact>
    <artifact type="test">
      <file-path>src/new-file.test.ts</file-path>
      <tests-added>15</tests-added>
    </artifact>
  </artifacts-created>
  <metrics>
    <metric name="test-coverage">82.5%</metric>
    <metric name="type-errors">0</metric>
    <metric name="performance-improvement">15%</metric>
  </metrics>
  <next-steps>
    <step order="1">description</step>
    <step order="2">description</step>
  </next-steps>
</body>
```

### Body Element - Task Completion

```xml
<body type="task-completion">
  <task-id>task-identifier</task-id>
  <status>success|partial-success|failed</status>
  <summary>Executive summary of work completed</summary>
  <completion-timestamp>ISO-8601</completion-timestamp>
  <total-hours-worked>number</total-hours-worked>
  <acceptance-criteria-met>
    <criterion>
      <name>criteria 1</name>
      <met>true</met>
      <evidence>description of proof</evidence>
    </criterion>
    <criterion>
      <name>criteria 2</name>
      <met>false</met>
      <reason>explanation</reason>
    </criterion>
  </acceptance-criteria-met>
  <deliverables>
    <deliverable type="code">
      <files>
        <file path="src/file1.ts" status="created|modified|deleted">commit-ref</file>
        <file path="src/file2.ts" status="created|modified|deleted">commit-ref</file>
      </files>
      <test-coverage>85%</test-coverage>
      <all-tests-passing>true</all-tests-passing>
    </deliverable>
    <deliverable type="documentation">
      <files>
        <file path="docs/api.md">created</file>
      </files>
    </deliverable>
  </deliverables>
  <quality-metrics>
    <metric name="code-review-approved">true</metric>
    <metric name="security-scan-passed">true</metric>
    <metric name="performance-test-passed">true</metric>
    <metric name="lint-issues">0</metric>
    <metric name="type-errors">0</metric>
  </quality-metrics>
  <recommendations>
    <recommendation type="follow-up">description of next work</recommendation>
    <recommendation type="technical-debt">description of tech debt</recommendation>
  </recommendations>
</body>
```

### Body Element - Error/Exception

```xml
<body type="error">
  <error-id>uuid-v4</error-id>
  <error-type>task-failed|timeout|blocked|validation-error</error-type>
  <severity>critical|warning|info</severity>
  <message>human-readable error message</message>
  <details>
    <stack-trace>formatted stack trace</stack-trace>
    <context-data>JSON context information</context-data>
  </details>
  <recovery-options>
    <option priority="1" type="retry">Retry task with modified parameters</option>
    <option priority="2" type="escalate">Escalate to coordinator for guidance</option>
    <option priority="3" type="alternate">Use alternative approach: description</option>
  </recovery-options>
  <recommended-action>escalate|retry|abandon</recommended-action>
</body>
```

### Body Element - Query/Request

```xml
<body type="query">
  <query-type>ask-for-help|request-review|request-analysis|get-status</query-type>
  <subject>description of what help is needed</subject>
  <context>
    <problem>problem description</problem>
    <attempted-solutions>
      <attempt order="1">what was tried</attempt>
      <attempt order="2">what was tried</attempt>
    </attempted-solutions>
    <file-reference path="src/problem-file.ts">relevant code snippet</file-reference>
    <error-message>full error message or logs</error-message>
  </context>
  <urgency>critical|high|normal|low</urgency>
  <required-by>ISO-8601</required-by>
</body>
```

### Signature Element

```xml
<signature>
  <algorithm>RSA-SHA256</algorithm>
  <signer>agent-name</signer>
  <timestamp>ISO-8601</timestamp>
  <public-key-id>key-id</public-key-id>
  <signature-value>base64-encoded-signature</signature-value>
</signature>
```

---

## 3. Message Types and Routing Rules

| Message Type | Sender | Recipient | Priority | Timeout | Retry |
|---|---|---|---|---|---|
| task-delegation | Coordinator | Specialist | high | 5m | 3x |
| status-update | Specialist | Coordinator | normal | 2m | 1x |
| task-completion | Specialist | Coordinator | high | 1m | 1x |
| error | Any | Escalation-path | critical | 30s | 2x |
| query | Specialist | Coordinator | normal | 3m | 2x |
| review-request | Specialist | Code-reviewer | high | 24h | 1x |
| escalation | Coordinator | Tech-lead | critical | 1m | 3x |

---

## 4. Conversation Chain and Traceability

Messages maintain conversation history through `conversation-chain` element:

```
User Request
  ↓
Claude (Main Agent) sends task-delegation to Tech-lead
  ↓ correlation-id: UUID-A, message-id: MSG-1
Tech-lead returns blueprint with message-id: MSG-2
  ↓
Claude sends task-delegation to Specialist (references MSG-2)
  ↓ correlation-id: UUID-A, message-id: MSG-3, parent: MSG-2
Specialist sends status-update
  ↓ correlation-id: UUID-A, message-id: MSG-4, parent: MSG-3
Specialist sends task-completion
  ↓ correlation-id: UUID-A, message-id: MSG-5, parent: MSG-4
Claude reports results to User
```

Full audit trail preserved with all message relationships.

---

## 5. Validation Rules

### Schema Validation
- All messages must conform to XSD schema
- Required elements: header, body, sender, recipient, message-id, timestamp
- Body type must match schema definition
- All UUIDs must be valid v4 format

### Content Validation
- Agent names must match registered agents
- Task IDs must be unique
- Correlation IDs must match conversation context
- Timestamps must be valid ISO-8601
- Priority levels: critical, high, normal, low

### Security Validation
- Signature must be valid and verifiable
- Sender agent must be authorized
- Message must not be expired (before expiration timestamp)
- Retry limits must not be exceeded

---

## 6. Implementation Tasks

### Week 10 Deliverables

- [ ] **Task 1:** Finalize XML schema (XSD) file
  - Create `protocols/agent-message-v1.0.xsd`
  - Document all element definitions
  - Include validation rules

- [ ] **Task 2:** Create XML message templates
  - `templates/task-delegation.xml`
  - `templates/status-update.xml`
  - `templates/task-completion.xml`
  - `templates/error.xml`
  - `templates/query.xml`

- [ ] **Task 3:** Build XML message validator
  - Validate against XSD schema
  - Custom validation rules (agent names, IDs, etc.)
  - Return validation errors with context

- [ ] **Task 4:** Implement message routing logic
  - Route messages by type and priority
  - Handle retry logic and timeouts
  - Log all message transactions

- [ ] **Task 5:** Integrate with agent prompts
  - Update tech-lead-orchestrator to emit XML
  - Update specialist agents to emit status/completion XML
  - Update coordinator agents to parse and route XML

- [ ] **Task 6:** Create audit trail system
  - Log all messages to audit database
  - Enable message search and replay
  - Generate audit reports

---

## 7. Cost Impact

**XML Protocol Implementation:**
- Schema validation: +10-15% latency per message
- Message signing: +5-10% latency
- Audit logging: +20-30% storage, +5% latency

**Mitigations:**
- Async audit logging (fire-and-forget)
- Batch message signing
- Compression for large payloads

---

## 8. Success Criteria

**Week 10 Completion:**
- [ ] XML schema fully documented and validated
- [ ] All 7 message templates created and tested
- [ ] Message validator working for all message types
- [ ] Routing logic handles 500+ messages/hour with <100ms latency
- [ ] Audit trail captures 100% of agent communications
- [ ] Specialists emit XML for task completion
- [ ] Coordinators parse and route XML messages
- [ ] Full test coverage (>80%) of XML protocol

**Performance Targets:**
- Message validation: <50ms
- Message routing: <10ms
- Signature verification: <100ms
- Total overhead per message: <200ms

---

## 9. Next Steps (Week 11)

1. Comprehensive system testing (50+ test cases)
2. Performance benchmarking
3. Integration testing with all agents
4. Load testing (1000+ concurrent messages)
5. Security audit (signature validation, encryption)

---

## 10. Risk Assessment

| Risk | Impact | Mitigation |
|---|---|---|
| Performance overhead too high | Delays agent communication | Optimize schema, async logging |
| Signature verification failures | Broken audit trail | Implement robust key management |
| XML parsing errors | Message loss | Comprehensive error handling + retry |
| Large message payloads | Storage/bandwidth issues | Implement compression and chunking |

---

**Status:** Design Phase Complete - Ready for Implementation
**Estimated Completion:** Friday EOD Week 10
**Review Date:** Monday Week 11
