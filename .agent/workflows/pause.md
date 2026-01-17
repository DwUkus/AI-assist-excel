---
description: Context hygiene — dump state for clean session handoff
---

# /pause Workflow

**Purpose**: Safely pause work with complete state preservation.

## When to Use
- Ending a work session
- Context getting heavy (many failed attempts)
- Switching to a different task
- Before taking a break

## Steps

### 1. Capture Current State
Update `.gsd/STATE.md` with:

```markdown
## Current Position
- **Phase**: [current phase number and name]
- **Task**: [specific task in progress, if any]
- **Status**: Paused

## Last Session Summary
[What was accomplished]

## In-Progress Work
[Any uncommitted changes or partial work]

## Blockers
[What was preventing progress, if anything]

## Context Dump
[Important context that would be lost]:
- Key decisions made
- Approaches tried
- Hypotheses about issues
- Files that were being modified

## Next Steps
1. [Specific first action for next session]
2. [Second priority]
3. [Third priority]
```

### 2. Add Journal Entry
Create entry in `.gsd/JOURNAL.md`:

```markdown
## Session: [date/time]

### Objective
[What this session was trying to accomplish]

### Accomplished
- [List of completed items]

### Paused Because
[Reason for pausing]

### Handoff Notes
[Critical info for resuming]
```

### 3. Confirm Handoff
Display:
```
✅ STATE SAVED

Session paused. To resume:
  /resume

Context has been preserved in:
  → .gsd/STATE.md
  → .gsd/JOURNAL.md
```
