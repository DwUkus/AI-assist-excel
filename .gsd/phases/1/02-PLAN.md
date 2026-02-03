---
phase: 1
plan: 2
wave: 2
depends_on: ["1.1"]
files_modified:
  - excel-addin/webpack.config.js
  - excel-addin/src/taskpane/taskpane.html
  - excel-addin/src/taskpane/taskpane.ts
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Dev server запускается без ошибок"
    - "Базовая taskpane открывается в Excel"
  artifacts:
    - "webpack-dev-server работает на localhost:3000"
---

# Plan 1.2: Configure Development Environment

<objective>
Настроить webpack для development и подготовить базовый UI taskpane.

Purpose: Получить рабочее окружение разработки с hot reload.
Output: Рабочий dev-server и минимальная taskpane.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- excel-addin/manifest.xml
- excel-addin/webpack.config.js
</context>

<tasks>

<task type="auto">
  <name>Update webpack configuration</name>
  <files>excel-addin/webpack.config.js</files>
  <action>
    Verify webpack.config.js has correct settings:
    1. devServer configured with https (required for Office Add-ins)
    2. Port 3000 (matching manifest.xml SourceLocation)
    3. Hot module replacement enabled
    
    If devServer section is missing or incomplete, add:
    ```javascript
    devServer: {
      port: 3000,
      https: true,
      hot: true,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    }
    ```
    
    AVOID: Changing port to anything other than 3000 — manifest.xml expects this port.
  </action>
  <verify>
    Select-String -Path "excel-addin/webpack.config.js" -Pattern "port.*3000" -Quiet
  </verify>
  <done>
    - webpack.config.js has devServer with port 3000
    - HTTPS enabled for Office Add-in compatibility
  </done>
</task>

<task type="auto">
  <name>Create minimal Russian taskpane UI</name>
  <files>
    excel-addin/src/taskpane/taskpane.html
    excel-addin/src/taskpane/taskpane.ts
  </files>
  <action>
    Update taskpane.html with Russian UI:
    - Title: "AI Ассистент для Excel"
    - Button: "Открыть AI Ассистент"
    - Status text: "Готово"
    
    Update taskpane.ts:
    - Log "Office Add-in loaded" on Office.onReady
    - Button click handler logs "Button clicked" (placeholder for dialog open)
    
    This is placeholder UI — Phase 2 will implement actual dialog.
    
    AVOID: Implementing dialog logic yet — this phase is just scaffold verification.
  </action>
  <verify>
    Select-String -Path "excel-addin/src/taskpane/taskpane.html" -Pattern "AI Ассистент" -Quiet
  </verify>
  <done>
    - taskpane.html shows Russian text
    - taskpane.ts has Office.onReady handler
    - Button has click handler (placeholder)
  </done>
</task>

<task type="checkpoint:human-verify">
  <name>Verify sideload in Excel</name>
  <files>N/A</files>
  <action>
    Start dev server and sideload add-in:
    
    1. Run in terminal:
       ```powershell
       cd excel-addin
       npm run dev-server
       ```
    
    2. In another terminal:
       ```powershell
       cd excel-addin
       npm run start:desktop
       ```
       (This sideloads the add-in into Excel)
    
    3. In Excel:
       - Check that "AI Ассистент" button appears on ribbon
       - Click button to open taskpane
       - Verify Russian text displays correctly
    
    CHECKPOINT: User verifies add-in loads in Excel.
  </action>
  <verify>User confirms add-in visible in Excel ribbon</verify>
  <done>
    - Add-in appears in Excel ribbon
    - Taskpane opens with Russian text
    - No console errors in DevTools (F12)
  </done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] npm run dev-server starts without errors
- [ ] Add-in sideloads into Excel
- [ ] Taskpane displays Russian UI
- [ ] No JavaScript errors in console
</verification>

<success_criteria>

- [ ] Dev server running on https://localhost:3000
- [ ] Add-in visible in Excel ribbon
- [ ] Taskpane opens and shows Russian text
      </success_criteria>
