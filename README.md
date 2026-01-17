# GSD for Antigravity

> **Get Shit Done** — A spec-driven, context-engineered development methodology adapted for Google Antigravity.

## Quick Start

1. **Define your project** — Fill out `.gsd/SPEC.md` with vision and goals
2. **Plan phases** — Run `/plan` to decompose into executable phases
3. **Execute** — Run `/execute 1` to implement Phase 1
4. **Verify** — Run `/verify 1` to confirm it works
5. **Repeat** — Continue through all phases

## Commands

| Command | Role | Purpose |
|---------|------|---------|
| `/map` | The Architect | Analyze codebase → ARCHITECTURE.md, STACK.md |
| `/plan` | The Strategist | Requirements → ROADMAP.md phases |
| `/execute [N]` | The Engineer | Implement phase N with focused context |
| `/verify [N]` | The Auditor | Validate phase N with empirical proof |
| `/progress` | Navigator | Show current position and next steps |
| `/pause` | — | Save state for session handoff |
| `/resume` | — | Restore from last session |

## Core Rules (GEMINI.md)

1. **Planning Lock** 🔒 — No code until SPEC.md is finalized
2. **State Persistence** 💾 — Update STATE.md after every task
3. **Context Hygiene** 🧹 — 3 failures → state dump → fresh session
4. **Empirical Validation** ✅ — Proof required, no "it should work"

## File Structure

```
.gsd/
├── SPEC.md          # Project vision & goals (finalize before coding)
├── ROADMAP.md       # Phased execution plan
├── STATE.md         # Living memory across sessions
├── ARCHITECTURE.md  # System design (updated by /map)
├── STACK.md         # Technology inventory (updated by /map)
├── DECISIONS.md     # Architecture decision records
└── JOURNAL.md       # Session chronicle

.gemini/
└── GEMINI.md        # Global rules enforcement

.agent/
├── workflows/       # Slash command definitions
│   ├── map.md
│   ├── plan.md
│   ├── execute.md
│   ├── verify.md
│   ├── progress.md
│   ├── pause.md
│   └── resume.md
└── skills/          # Agent capabilities
    ├── context-health-monitor/
    │   └── SKILL.md
    └── empirical-validation/
        └── SKILL.md
```

## Philosophy

- **Plan before building** — No enterprise theater, but specs matter
- **Fresh context > polluted context** — State dumps prevent hallucinations
- **Proof over trust** — Screenshots and command outputs, not "looks right"

---

*Adapted from [glittercowboy/get-shit-done](https://github.com/glittercowboy/get-shit-done)*
