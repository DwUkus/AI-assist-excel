# GSD for Antigravity

> **Get Shit Done** — A spec-driven, context-engineered development methodology adapted for Google Antigravity.

[![Based on GSD](https://img.shields.io/badge/based%20on-GSD-blue)](https://github.com/glittercowboy/get-shit-done)

---

## Why This Exists

Vibecoding has a bad reputation. You describe what you want, AI generates code, and you get inconsistent garbage that falls apart at scale.

GSD fixes that. It's the **context engineering layer** that makes AI coding reliable. Describe your idea, let the system extract everything it needs to know, and let the AI get to work.

**No enterprise roleplay.** No sprint ceremonies, story points, stakeholder syncs, or Jira workflows. Just an incredibly effective system for building cool stuff consistently.

The complexity is in the system, not in your workflow.

---

## Who This Is For

People who want to describe what they want and have it built correctly — without pretending they're running a 50-person engineering org.

- Solo developers using AI coding assistants
- Small teams who want structure without overhead
- Anyone tired of AI generating inconsistent garbage

---

## 🚀 Getting Started

```powershell
# Clone the GSD template
git clone https://github.com/toonight/get-shit-done-for-antigravity.git gsd-template

# Copy to your project
cd your-project
Copy-Item -Recurse gsd-template\.agent .\
Copy-Item -Recurse gsd-template\.gemini .\
Copy-Item -Recurse gsd-template\.gsd .\

# Clean up
Remove-Item -Recurse -Force gsd-template
```

Then run `/new-project` and follow the prompts.

---

## How It Works

### 1. Initialize → Question → Spec
```
/new-project → Deep questioning → SPEC.md (finalized)
```

### 2. Plan → Research → Tasks
```
/plan 1 → Discovery → PLAN.md with XML tasks
```

### 3. Execute → Verify → Commit
```
/execute 1 → Wave execution → Atomic commits
/verify 1 → Must-haves check → Evidence captured
```

### 4. Repeat
```
/plan 2 → /execute 2 → /verify 2 → ...
/complete-milestone → Next milestone
```

---

## Why It Works

### Context Engineering

The AI is incredibly powerful *if* you give it the context it needs. Most people don't.

GSD handles it for you:

| File | What it does |
|------|--------------|
| `SPEC.md` | Project vision, always loaded |
| `ARCHITECTURE.md` | System understanding |
| `ROADMAP.md` | Where you're going, what's done |
| `STATE.md` | Decisions, blockers, position — memory across sessions |
| `PLAN.md` | Atomic tasks with XML structure, verification steps |
| `SUMMARY.md` | What happened, what changed |

Size limits based on where AI quality degrades. Stay under, get consistent excellence.

### XML Prompt Formatting

Every plan is structured XML optimized for AI execution:

```xml
<task type="auto">
  <name>Create login endpoint</name>
  <files>src/app/api/auth/login/route.ts</files>
  <action>
    Use jose for JWT (not jsonwebtoken - CommonJS issues).
    Validate credentials against users table.
    Return httpOnly cookie on success.
  </action>
  <verify>curl -X POST localhost:3000/api/auth/login returns 200 + Set-Cookie</verify>
  <done>Valid credentials return cookie, invalid return 401</done>
</task>
```

Precise instructions. No guessing. Verification built in.

### Wave-Based Execution

Plans are grouped into waves based on dependencies:

| Wave | Plans | Parallelization |
|------|-------|-----------------|
| 1 | Foundation tasks | Run together |
| 2 | Depends on Wave 1 | Wait, then run together |
| 3 | Depends on Wave 2 | Wait, then run together |

Each executor gets fresh context. Your main session stays fast.

### Atomic Git Commits

Each task gets its own commit immediately after completion:

```bash
abc123f feat(phase-1): create login endpoint
def456g feat(phase-1): add password validation
hij789k feat(phase-1): implement JWT cookie handling
```

**Benefits:** 
- Git bisect finds exact failing task
- Each task independently revertable
- Clear history for AI in future sessions

### Empirical Verification

No "trust me, it works." Every verification produces evidence:

| Change Type | Evidence Required |
|-------------|-------------------|
| API endpoint | curl output |
| UI change | Screenshot |
| Build | Command output |
| Tests | Test results |

---

## 🎮 Commands (21 Total)

### Core Workflow
| Command | Purpose |
|---------|---------|
| `/map` | Analyze codebase → ARCHITECTURE.md |
| `/plan [N]` | Create PLAN.md files for phase N |
| `/execute [N]` | Wave-based execution with atomic commits |
| `/verify [N]` | Must-haves validation with proof |
| `/debug [desc]` | Systematic debugging (3-strike rule) |

### Project Setup
| Command | Purpose |
|---------|---------|
| `/new-project` | Deep questioning → SPEC.md |
| `/new-milestone` | Create milestone with phases |
| `/complete-milestone` | Archive completed milestone |
| `/audit-milestone` | Review milestone quality |

### Phase Management
| Command | Purpose |
|---------|---------|
| `/add-phase` | Add phase to end of roadmap |
| `/insert-phase` | Insert phase (renumbers) |
| `/remove-phase` | Remove phase (safety checks) |
| `/discuss-phase` | Clarify scope before planning |
| `/research-phase` | Deep technical research |
| `/list-phase-assumptions` | Surface planning assumptions |
| `/plan-milestone-gaps` | Create gap closure plans |

### Navigation & State
| Command | Purpose |
|---------|---------|
| `/progress` | Show current position |
| `/pause` | Save state for session handoff |
| `/resume` | Restore from last session |
| `/add-todo` | Quick capture idea |
| `/check-todos` | List pending items |

---

## 🔒 Core Rules

| Rule | Why It Matters |
|------|----------------|
| 🔒 **Planning Lock** | No code until SPEC.md is FINALIZED — prevents building wrong thing |
| 💾 **State Persistence** | Update STATE.md after every task — memory across sessions |
| 🧹 **Context Hygiene** | 3 failures → state dump → fresh session — prevents circular debugging |
| ✅ **Empirical Validation** | Proof required — no "it should work" |

---

## 📁 File Structure

```
.agent/
├── workflows/        # 21 slash commands
└── skills/           # 8 agent specializations

.gemini/
└── GEMINI.md         # Rules enforcement

.gsd/
├── SPEC.md           # ← START HERE (finalize first)
├── ROADMAP.md        # Phases and progress
├── STATE.md          # Session memory
├── ARCHITECTURE.md   # System design (/map output)
├── STACK.md          # Tech inventory
├── DECISIONS.md      # Architecture Decision Records
├── JOURNAL.md        # Session log
├── TODO.md           # Quick capture
├── templates/        # Document templates
└── examples/         # Usage walkthroughs

GSD-STYLE.md          # Complete style guide
```

---

## 📚 Documentation

- [GSD-STYLE.md](GSD-STYLE.md) — Complete style and conventions guide
- [Examples](.gsd/examples/) — Usage walkthroughs and quick reference
- [Templates](.gsd/templates/) — Document templates for plans, verification, etc.

---

## 🧠 Philosophy

- **Plan before building** — SPEC.md matters more than you think
- **Fresh context > polluted context** — State dumps prevent hallucinations
- **Proof over trust** — Screenshots and command outputs, not "looks right"
- **Aggressive atomicity** — 2-3 tasks per plan, atomic commits
- **No enterprise theater** — Solo dev + AI workflow only

---

*Adapted from [glittercowboy/get-shit-done](https://github.com/glittercowboy/get-shit-done) for Google Antigravity*