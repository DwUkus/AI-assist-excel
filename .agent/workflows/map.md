---
description: The Architect — Analyze codebase and update ARCHITECTURE.md and STACK.md
---

# /map Workflow

**Role**: The Architect
**Purpose**: Scan the existing codebase and document its structure.

## Steps

### 1. Analyze Project Structure
Examine the project root and identify:
- Source directories and their purposes
- Entry points (main files, index files)
- Configuration files
- Test directories

### 2. Identify Dependencies
Parse package manifests (package.json, requirements.txt, etc.) and document:
- Runtime dependencies
- Development dependencies
- Version constraints

### 3. Map Component Relationships
Identify:
- Major components/modules
- Data flow between components
- External integrations (APIs, databases, services)

### 4. Identify Technical Debt
Note any:
- TODOs or FIXMEs in the code
- Outdated dependencies
- Inconsistent patterns
- Missing tests

### 5. Update Documentation
Write findings to:

**`.gsd/ARCHITECTURE.md`**:
- System overview diagram (ASCII or mermaid)
- Component descriptions
- Data flow documentation
- Integration points
- Technical debt items

**`.gsd/STACK.md`**:
- Runtime technologies with versions
- Production dependencies
- Development dependencies
- Infrastructure services
- Configuration variables

### 6. Update State
After completion, update `.gsd/STATE.md` with:
- What was analyzed
- Key findings
- Recommended next steps
