---
description: Restore context from previous session
---

# /resume Workflow

**Purpose**: Start a new session with full context from where we left off.

## Steps

### 1. Load Saved State
Read `.gsd/STATE.md` and display:

```
🔄 RESUMING SESSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LAST POSITION
Phase: [phase number and name]
Task: [task in progress]
Status: [status when paused]

CONTEXT FROM LAST SESSION
[Context dump content]

BLOCKERS
[Any documented blockers]

NEXT STEPS (from last session)
1. [First priority]
2. [Second priority]
3. [Third priority]
```

### 2. Load Recent Journal
Show last entry from `.gsd/JOURNAL.md`:
- What was accomplished
- Handoff notes
- Any issues encountered

### 3. Verify No Conflicts
Check:
- Any uncommitted changes in git?
- Any file modifications since pause?

If conflicts found, warn user before proceeding.

### 4. Update State
Mark session as active in `.gsd/STATE.md`:
```markdown
**Status**: Active (resumed [date/time])
```

### 5. Suggest Action
Based on state, recommend:
```
READY TO CONTINUE

Suggested next action:
→ /execute [N] — Continue phase N
   or
→ /verify [N] — Verify completed phase
   or
→ /progress — See full roadmap status
```

### 6. Fresh Context Advantage
Remind:
```
💡 Fresh session = fresh perspective
   The previous context struggles are behind you.
   You have all the information needed to proceed cleanly.
```
