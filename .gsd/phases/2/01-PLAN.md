---
phase: 2
plan: 1
wave: 1
depends_on: []
files_modified:
  - excel-addin/webpack.config.js
  - excel-addin/src/dialog/dialog.html
  - excel-addin/src/dialog/dialog.ts
  - excel-addin/src/dialog/dialog.css
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Webpack собирает dialog.html и dialog.js"
    - "Dialog файлы доступны по localhost:3000/dialog.html"
  artifacts:
    - "excel-addin/src/dialog/ directory exists"
    - "webpack entry 'dialog' exists"
---

# Plan 2.1: Scaffold Dialog Files & Webpack

<objective>
Создать структуру файлов для диалогового окна и настроить webpack для их сборки.

Purpose: Подготовить фундамент для UI диалога.
Output: Настроенные файлы диалога и обновленный конфиг сборки.
</objective>

<context>
Load for context:
- excel-addin/webpack.config.js
</context>

<tasks>

<task type="auto">
  <name>Create dialog file structure</name>
  <files>
    excel-addin/src/dialog/dialog.html
    excel-addin/src/dialog/dialog.ts
    excel-addin/src/dialog/dialog.css
  </files>
  <action>
    Create directory `excel-addin/src/dialog/` and boilerplate files:
    
    1. `dialog.html`: Basic HTML5 structure with reference to dialog.css and script (via webpack inject).
       - Title: "AI Ассистент"
       - Body: `<div id="app">Loading...</div>`
    
    2. `dialog.ts`: Entry point with Office.onReady.
       - Log "Dialog loaded"
    
    3. `dialog.css`: Empty file for now.
    
    AVOID: Complex UI logic here - just basic structure.
  </action>
  <verify>
    Test-Path "excel-addin/src/dialog/dialog.html"
  </verify>
  <done>
    - Directory and files created
  </done>
</task>

<task type="auto">
  <name>Register dialog in Webpack</name>
  <files>excel-addin/webpack.config.js</files>
  <action>
    Update webpack.config.js to include new entry point and HtmlWebpackPlugin:
    
    1. Add entry:
       ```javascript
       entry: {
         // ... existing
         dialog: ["./src/dialog/dialog.ts", "./src/dialog/dialog.html"],
       }
       ```
    
    2. Add plugin:
       ```javascript
       new HtmlWebpackPlugin({
         filename: "dialog.html",
         template: "./src/dialog/dialog.html",
         chunks: ["polyfill", "dialog"],
       }),
       ```
    
    AVOID: Overwriting existing entries.
  </action>
  <verify>
    Select-String -Path "excel-addin/webpack.config.js" -Pattern "dialog.html" -Quiet
  </verify>
  <done>
    - Webpack config has dialog entry
    - Webpack config has HtmlWebpackPlugin for dialog
  </done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] webpack.config.js updated correctly
- [ ] src/dialog/ files exist
- [ ] npm run build passes (optional, but good check)
</verification>

<success_criteria>

- [ ] Webpack build includes dialog.html and dialog.js
- [ ] Files structure ready for UI implementation
      </success_criteria>
