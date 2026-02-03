---
phase: 2
plan: 3
wave: 3
depends_on: ["2.1", "2.2"]
files_modified:
  - excel-addin/src/taskpane/taskpane.ts
  - excel-addin/src/dialog/dialog.ts
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Кнопка в Taskpane открывает диалог"
    - "Диалог инициализируется корректно"
  artifacts:
    - "Office.ui.displayDialogAsync call implemented"
---

# Plan 2.3: Wire Dialog API

<objective>
Реализовать открытие диалога из Taskpane и базовую инициализацию скриптов диалога.

Purpose: Связать кнопку "Открыть" с реальным окном.
Output: Работающая кнопка открытия диалога.
</objective>

<context>
Load for context:
- excel-addin/src/taskpane/taskpane.ts
- excel-addin/src/dialog/dialog.ts
</context>

<tasks>

<task type="auto">
  <name>Implement displayDialogAsync</name>
  <files>excel-addin/src/taskpane/taskpane.ts</files>
  <action>
    Update `openAssistantDialog` function:
    1. Construct absolute URL for `dialog.html` (using `window.location.host` checks for dev/prod).
    2. Call `Office.context.ui.displayDialogAsync`.
    3. Handle callback (success/fail).
    4. Save dialog handle to variable for future message parent/child communication (Phase 4).
    
    Configuration:
    - height: 60
    - width: 40
    - displayInIframe: false (separate window)
    
    Code:
    ```typescript
    let dialog: Office.Dialog;
    // ... inside function
    Office.context.ui.displayDialogAsync(url, { height: 60, width: 40 }, (asyncResult) => {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
            console.error(asyncResult.error.message);
        } else {
            dialog = asyncResult.value;
            dialog.addEventHandler(Office.EventType.DialogMessageReceived, processMessage);
        }
    });
    ```
    
    AVOID: Hardcoding localhost ONLY — try to derive from current location if possible, or fallback to manifest defaults.
  </action>
  <verify>
    Select-String -Path "excel-addin/src/taskpane/taskpane.ts" -Pattern "displayDialogAsync" -Quiet
  </verify>
  <done>
    - Taskpane opens the dialog window
  </done>
</task>

<task type="auto">
  <name>Initialize Dialog Logic</name>
  <files>excel-addin/src/dialog/dialog.ts</files>
  <action>
    Populate `dialog.ts`:
    - `Office.onReady`
    - Bind UI events (Send button click, Enter key in textarea)
    - Add basic logging: `function log(text) { ... }` that appends to chat for debugging (temporary).
    
    AVOID: Full logic (OpenRouter/Excel ops) — focuses only on UI responsiveness for now.
  </action>
  <verify>
    Select-String -Path "excel-addin/src/dialog/dialog.ts" -Pattern "document.getElementById" -Quiet
  </verify>
  <done>
    - Dialog script handles basic events
  </done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Taskpane TS calls displayDialogAsync
- [ ] Dialog TS listens for events
</verification>

<success_criteria>

- [ ] Clicking "Open" in taskpane launches the new chat window
      </success_criteria>
