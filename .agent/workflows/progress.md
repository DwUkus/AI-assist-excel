---
description: Show current position in roadmap and next steps
---

# /progress Workflow

**Purpose**: Quick status check — where are we and what's next?

## Steps

### 1. Read Current State
Load:
- `.gsd/STATE.md` — Current position
- `.gsd/ROADMAP.md` — Phase statuses

### 2. Generate Report
Display in this format:

```
📍 CURRENT POSITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: [from SPEC.md title]
Milestone: [from ROADMAP.md]

PHASE STATUS
┌─────────────────────────────────┐
│ ✅ Phase 1: [Name]              │
│ ✅ Phase 2: [Name]              │
│ 🔄 Phase 3: [Name] ← YOU ARE HERE
│ ⬜ Phase 4: [Name]              │
│ ⬜ Phase 5: [Name]              │
└─────────────────────────────────┘

CURRENT TASK
[What's being worked on from STATE.md]

BLOCKERS
[Any blockers from STATE.md, or "None"]

NEXT UP
→ [Next task or phase to tackle]
```

### 3. Suggest Action
Based on status, recommend:
- If in-progress phase: `/execute N` to continue
- If phase complete but not verified: `/verify N`
- If verification failed: Show fix tasks
- If all phases done: `/complete-milestone` or celebrate!
