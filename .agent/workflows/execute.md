---
description: The Engineer — Execute a specific phase with focused context
---

# /execute Workflow

**Role**: The Engineer
**Purpose**: Implement a single phase from the roadmap with laser focus.

## Usage
```
/execute [phase_number]
```

Example: `/execute 1` executes Phase 1

## Prerequisites

⚠️ **Planning Lock Enforcement**:
1. Verify `.gsd/SPEC.md` contains `Status: FINALIZED`
2. Verify `.gsd/ROADMAP.md` has the requested phase defined

**If either check fails**: STOP and inform user to run `/plan` first.

## Steps

### 1. Load Minimal Context (Need-to-Know)
Read ONLY:
- The specific phase from `.gsd/ROADMAP.md`
- Relevant sections of `.gsd/ARCHITECTURE.md` (only affected components)
- `.gsd/STATE.md` for any blockers or context

**DO NOT** load:
- Other phases
- Unrelated components
- Full project history

### 2. Mark Phase In Progress
Update `.gsd/ROADMAP.md`:
```markdown
**Status**: 🔄 In Progress
```

### 3. Execute Tasks
For each task in the phase:

1. **Implement** the task
2. **Test** it works (run commands, check output)
3. **Commit** with atomic message:
   ```
   feat(phase-N): [task description]
   ```
4. **Update** `.gsd/STATE.md` with progress

### 4. Verify Phase Completion
Run the verification steps defined in the phase:
- Execute test commands
- Check expected outputs
- Take screenshots if UI changes

### 5. Mark Complete
If all verification passes:
- Update phase status to `✅ Complete`
- Update `.gsd/STATE.md` with completion summary
- Add entry to `.gsd/JOURNAL.md`

### 6. Context Hygiene Check
If you encountered issues:
- More than 3 debugging attempts? → Recommend `/pause`
- Unexpected complexity? → Document in `.gsd/DECISIONS.md`
