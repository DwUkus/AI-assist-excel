---
description: The Strategist — Decompose requirements into executable phases in ROADMAP.md
---

# /plan Workflow

**Role**: The Strategist
**Purpose**: Transform requirements into a phased execution plan.

## Prerequisites

⚠️ **Planning Lock Check**: Before proceeding, verify:
- `.gsd/SPEC.md` exists
- SPEC.md vision and goals are defined (even if not finalized)

If SPEC.md is empty or missing, help the user define it first.

## Steps

### 1. Load Context
Read and understand:
- `.gsd/SPEC.md` — Project goals and constraints
- `.gsd/ARCHITECTURE.md` — Current system state (if exists)
- `.gsd/STATE.md` — Any previous progress

### 2. Decompose Requirements
For each goal in SPEC.md:
- Break into atomic, verifiable tasks
- Identify dependencies between tasks
- Group related tasks into phases

### 3. Define Phases
Each phase should:
- Be completable in a single focused session
- Have clear entry and exit criteria
- Include specific verification steps
- Be independent enough to execute without full project context

### 4. Create Roadmap
Write to `.gsd/ROADMAP.md`:

```markdown
### Phase N: [Clear Name]
**Status**: ⬜ Not Started

**Objective**: [One sentence]

**Tasks**:
- [ ] Task 1 with specific deliverable
- [ ] Task 2 with specific deliverable

**Verification**:
- [ ] How to confirm this phase is complete
```

### 5. Finalize Spec
If applicable, mark `.gsd/SPEC.md` status as `FINALIZED`.

### 6. Update State
Update `.gsd/STATE.md` with:
- Planning complete
- Next phase ready for execution
