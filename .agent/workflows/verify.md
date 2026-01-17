---
description: The Auditor — Validate work against spec with empirical evidence
---

# /verify Workflow

**Role**: The Auditor
**Purpose**: Confirm that implemented work meets spec requirements with proof.

## Usage
```
/verify [phase_number]
```

Example: `/verify 1` verifies Phase 1 is complete and correct.

## Core Principle

> **No "trust me, it works."**
> 
> Every verification must produce empirical evidence.

## Steps

### 1. Load Verification Context
Read:
- `.gsd/SPEC.md` — Original requirements
- `.gsd/ROADMAP.md` — Phase verification criteria
- `.gsd/STATE.md` — What was implemented

### 2. Identify Verification Criteria
Extract from the phase:
- Specific acceptance criteria
- Test commands to run
- Expected outputs or behaviors

### 3. Execute Verification

For each criterion, collect evidence:

| Type | Method | Evidence |
|------|--------|----------|
| **API/Backend** | Run curl, test command | Command output |
| **UI** | Use browser tool | Screenshot |
| **Build** | Run build command | Success output |
| **Tests** | Run test suite | Test results |

// turbo
```powershell
# Example: Run tests
npm test
```

### 4. Document Results
Create verification report in `.gsd/JOURNAL.md`:

```markdown
## Verification: Phase N

### Criteria Checked
- [x] Criterion 1 — PASS (evidence: ...)
- [ ] Criterion 2 — FAIL (reason: ...)

### Evidence
[Attach screenshots, command outputs]

### Verdict
PASS / FAIL
```

### 5. Handle Results

**If PASS**:
- Confirm phase status is `✅ Complete`
- Update `.gsd/STATE.md` with verified status
- Proceed to next phase

**If FAIL**:
- Document specific failures
- Create fix tasks in `.gsd/ROADMAP.md`
- Update `.gsd/STATE.md` with what needs fixing
- Do NOT mark phase complete
