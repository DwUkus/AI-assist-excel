---
phase: 2
plan: 2
wave: 2
depends_on: ["2.1"]
files_modified:
  - excel-addin/src/dialog/dialog.html
  - excel-addin/src/dialog/dialog.css
  - excel-addin/src/dialog/dialog.ts
autonomous: true
user_setup: []

must_haves:
  truths:
    - "UI диалога соответствует мокапам (чат, ввод, кнопки)"
    - "Стили обеспечивают адаптивность и внешний вид"
  artifacts:
    - "Chat interface implementation in dialog.html/css"
---

# Plan 2.2: Implement Chat Interface UI

<objective>
Верстать UI чата согласно требованиям SPEC.md и скриншотам.

Purpose: Создать визуальную часть ассистента.
Output: Готовый HTML/CSS интерфейс чата (без логики отправки).
</objective>

<context>
Load for context:
- .gsd/SPEC.md (UI requirements)
- excel-addin/src/dialog/dialog.html
</context>

<tasks>

<task type="auto">
  <name>Implement Chat HTML Structure</name>
  <files>excel-addin/src/dialog/dialog.html</files>
  <action>
    Update dialog.html with chat structure:
    
    Structure:
    - Container (flex column, full height)
    - Header (optional, maybe covered by dialog frame, strictly content)
    - Chat History Area (scrollable, `flex-grow: 1`)
      - Message bubbles (User: right, AI: left)
      - Code blocks support (pre/code tags)
    - Input Area (fixed at bottom)
      - Textarea (auto-resize or fixed)
      - Settings panel toggle (dropdown for models)
      - "Include Data" checkbox
      - Action Buttons: Send, Clear, Settings, Close
    
    Use semantic HTML and unique IDs.
    
    AVOID: External UI libraries (Fabric/Fluent) if they complicate local dev too much, stick to vanilla CSS/HTML for speed and control as requested in styling rules. But since we use Fabric in taskpane, we can use Fabric classes if easy. Let's use custom CSS for "Premium Design" requirement.
  </action>
  <verify>
    Select-String -Path "excel-addin/src/dialog/dialog.html" -Pattern "chat-history" -Quiet
  </verify>
  <done>
    - HTML structure complete with all controls
  </done>
</task>

<task type="auto">
  <name>Style Chat Interface</name>
  <files>excel-addin/src/dialog/dialog.css</files>
  <action>
    Create comprehensive CSS:
    - Reset & typography (Segoe UI/Inter)
    - Chat bubbles styling (distinct colors for User/AI)
    - Flexbox layout for sticky footer
    - Modern inputs and buttons (hover states, transitions)
    - "Premium" feel: subtle shadows, rounded corners
    
    Classes:
    - `.message-user`: align right, blue/primary bg
    - `.message-ai`: align left, gray/light bg
    - `.code-block`: monospace font, dark background
    - `.commands-list`: specific styling for command debugging
    
    AVOID: Plain look. Make it look decent.
  </action>
  <verify>
    Get-Content "excel-addin/src/dialog/dialog.css" | Select-Object -First 5
  </verify>
  <done>
    - CSS file populated with styles
  </done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] HTML contains all required elements (input, model select, history)
- [ ] CSS defines styles for messages and layout
</verification>

<success_criteria>

- [ ] UI visual structure complete
- [ ] Ready for JS logic wiring
      </success_criteria>
