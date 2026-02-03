---
phase: 1
plan: 1
wave: 1
depends_on: []
files_modified:
  - excel-addin/manifest.xml
  - excel-addin/package.json
  - excel-addin/webpack.config.js
  - excel-addin/src/taskpane/taskpane.html
  - excel-addin/src/taskpane/taskpane.ts
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Проект Office Add-in создан и имеет корректную структуру"
    - "manifest.xml настроен для Excel с правильными разрешениями"
  artifacts:
    - "excel-addin/manifest.xml exists"
    - "excel-addin/package.json exists"
    - "excel-addin/webpack.config.js exists"
---

# Plan 1.1: Initialize Office Add-in Project

<objective>
Создать базовый проект Office Add-in через Yeoman generator с настройкой для Excel.

Purpose: Получить рабочий scaffold проекта с manifest.xml, webpack и базовой taskpane.
Output: Директория excel-addin/ с полной структурой проекта.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- .agent/skills/excel-addin-builder/SKILL.md
</context>

<tasks>

<task type="auto">
  <name>Generate Office Add-in scaffold</name>
  <files>excel-addin/*</files>
  <action>
    Run Yeoman generator to create Office Add-in project:
    
    ```powershell
    cd d:\YandexDisk\Projects\VBA
    npx -y yo office --projectType taskpane --name "AIExcelAssistant" --host excel --ts true --output excel-addin
    ```
    
    Expected structure:
    - excel-addin/manifest.xml
    - excel-addin/src/taskpane/
    - excel-addin/webpack.config.js
    - excel-addin/package.json
    
    AVOID: Using `--js` flag because we need TypeScript for type safety.
    AVOID: Running `npm install` manually — generator does this automatically.
  </action>
  <verify>
    Test-Path "excel-addin/manifest.xml" -and Test-Path "excel-addin/package.json"
  </verify>
  <done>
    - excel-addin/ directory created with all scaffold files
    - manifest.xml present with Excel host configuration
    - package.json with office-addin dependencies
  </done>
</task>

<task type="auto">
  <name>Configure manifest for Russian locale and Dialog support</name>
  <files>excel-addin/manifest.xml</files>
  <action>
    Update manifest.xml:
    1. Set DefaultLocale to "ru-RU"
    2. Update DisplayName to "AI Ассистент для Excel"
    3. Update Description to "Выполнение операций Excel через текстовые команды с помощью AI"
    4. Ensure Permissions is "ReadWriteDocument"
    5. Add DialogAPI requirement (for displayDialogAsync)
    
    Add Requirements section if not present:
    ```xml
    <Requirements>
      <Sets>
        <Set Name="ExcelApi" MinVersion="1.1"/>
        <Set Name="DialogApi" MinVersion="1.1"/>
      </Sets>
    </Requirements>
    ```
    
    AVOID: Removing existing ExtensionPoints — keep ribbon button configuration.
  </action>
  <verify>
    Select-String -Path "excel-addin/manifest.xml" -Pattern "ru-RU" -Quiet
    Select-String -Path "excel-addin/manifest.xml" -Pattern "DialogApi" -Quiet
  </verify>
  <done>
    - manifest.xml has ru-RU locale
    - manifest.xml has DialogApi requirement
    - DisplayName is in Russian
  </done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] excel-addin/ directory exists with scaffold
- [ ] manifest.xml configured for Russian locale
- [ ] DialogApi requirement present
- [ ] npm dependencies listed in package.json
</verification>

<success_criteria>

- [ ] Yeoman generator completed without errors
- [ ] manifest.xml has correct configuration
- [ ] Project structure matches expected layout
      </success_criteria>
