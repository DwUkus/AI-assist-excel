---
name: excel-addin-builder
description: Build Excel add-ins with Office.js and OpenRouter LLM integration. Covers manifest configuration, taskpane development, custom functions, and AI-powered features.
---

# Excel Add-in Builder

Expert skill for building modern Excel add-ins with AI/LLM integration via OpenRouter.

## Use When

- Building Excel add-ins (Office Add-ins)
- Integrating LLMs (via OpenRouter) into Excel workflows
- Creating custom functions with AI capabilities
- Migrating VBA macros to modern add-ins
- Setting up manifest.xml configuration

---

## Technology Stack

### Office Add-ins Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Excel Application                     │
├─────────────────────────────────────────────────────────┤
│  Manifest (XML)  │  Taskpane (HTML/JS)  │ Custom Funcs  │
├─────────────────────────────────────────────────────────┤
│                     Office.js API                        │
├─────────────────────────────────────────────────────────┤
│                    OpenRouter API                        │
└─────────────────────────────────────────────────────────┘
```

### Required Technologies

| Component | Technology         | Purpose                 |
| --------- | ------------------ | ----------------------- |
| Runtime   | Node.js 18+        | Dev server, build tools |
| Framework | React / Vanilla JS | Taskpane UI             |
| API       | Office.js          | Excel integration       |
| LLM       | OpenRouter API     | AI capabilities         |
| Build     | Webpack / Vite     | Bundling                |

---

## Quick Start

### 1. Create New Add-in Project

```bash
# Using Yeoman generator (official)
npx -y yo office --projectType taskpane --name "MyAddin" --host excel --ts true

# Or minimal setup with Vite
npm create vite@latest excel-addin -- --template vanilla-ts
```

### 2. Project Structure

```
excel-addin/
├── manifest.xml          # Add-in configuration
├── src/
│   ├── taskpane/
│   │   ├── taskpane.html
│   │   ├── taskpane.ts
│   │   └── taskpane.css
│   ├── functions/
│   │   ├── functions.ts  # Custom functions
│   │   └── functions.json
│   └── services/
│       └── openrouter.ts # LLM integration
├── package.json
└── webpack.config.js
```

---

## Manifest Configuration

### manifest.xml Template

```xml
<?xml version="1.0" encoding="UTF-8"?>
<OfficeApp xmlns="http://schemas.microsoft.com/office/appforoffice/1.1"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:type="TaskPaneApp">

  <Id>YOUR-GUID-HERE</Id>
  <Version>1.0.0</Version>
  <ProviderName>Your Company</ProviderName>
  <DefaultLocale>en-US</DefaultLocale>
  <DisplayName DefaultValue="AI Excel Assistant"/>
  <Description DefaultValue="Excel add-in with OpenRouter LLM integration"/>

  <Hosts>
    <Host Name="Workbook"/>
  </Hosts>

  <DefaultSettings>
    <SourceLocation DefaultValue="https://localhost:3000/taskpane.html"/>
  </DefaultSettings>

  <Permissions>ReadWriteDocument</Permissions>

  <!-- For Custom Functions -->
  <ExtensionPoint xsi:type="CustomFunctions">
    <Script>
      <SourceLocation DefaultValue="https://localhost:3000/functions.js"/>
    </Script>
    <Page>
      <SourceLocation DefaultValue="https://localhost:3000/functions.html"/>
    </Page>
    <Metadata>
      <SourceLocation DefaultValue="https://localhost:3000/functions.json"/>
    </Metadata>
    <Namespace DefaultValue="AI"/>
  </ExtensionPoint>

</OfficeApp>
```

---

## Office.js Patterns

### Initialize Add-in

```typescript
Office.onReady((info) => {
  if (info.host === Office.HostType.Excel) {
    // Initialize UI
    document.getElementById("run")?.addEventListener("click", run);
  }
});
```

### Read/Write Cell Data

```typescript
async function getSelectedRange(): Promise<string[][]> {
  return Excel.run(async (context) => {
    const range = context.workbook.getSelectedRange();
    range.load("values");
    await context.sync();
    return range.values;
  });
}

async function writeToRange(data: string[][], address: string): Promise<void> {
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const range = sheet.getRange(address);
    range.values = data;
    await context.sync();
  });
}
```

### Batch Operations (Performance)

```typescript
async function batchUpdate(updates: Map<string, any>): Promise<void> {
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();

    // Queue all operations
    for (const [address, value] of updates) {
      sheet.getRange(address).values = [[value]];
    }

    // Single sync for all operations
    await context.sync();
  });
}
```

---

## OpenRouter Integration

### OpenRouter Service

```typescript
// src/services/openrouter.ts

interface OpenRouterConfig {
  apiKey: string;
  model: string;
  siteUrl?: string;
  siteName?: string;
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatResponse {
  id: string;
  choices: Array<{
    message: { content: string };
  }>;
}

export class OpenRouterService {
  private readonly baseUrl = "https://openrouter.ai/api/v1";
  private config: OpenRouterConfig;

  constructor(config: OpenRouterConfig) {
    this.config = config;
  }

  async chat(
    messages: Message[],
    options?: {
      temperature?: number;
      maxTokens?: number;
    },
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": this.config.siteUrl || "",
        "X-Title": this.config.siteName || "Excel Add-in",
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    return data.choices[0]?.message?.content ?? "";
  }

  async analyzeExcelData(data: string[][], prompt: string): Promise<string> {
    const dataStr = data.map((row) => row.join("\t")).join("\n");

    return this.chat([
      {
        role: "system",
        content:
          "You are an Excel data analyst. Analyze the provided spreadsheet data and respond concisely.",
      },
      {
        role: "user",
        content: `Data:\n${dataStr}\n\nTask: ${prompt}`,
      },
    ]);
  }

  async generateFormula(
    description: string,
    context?: string,
  ): Promise<string> {
    const result = await this.chat([
      {
        role: "system",
        content:
          "You are an Excel formula expert. Generate ONLY the formula, no explanation. Use Russian locale separators (;) if needed.",
      },
      {
        role: "user",
        content: context
          ? `Context: ${context}\n\nGenerate formula: ${description}`
          : `Generate formula: ${description}`,
      },
    ]);

    // Clean up response
    return result.replace(/^=?/, "=").trim();
  }
}
```

### Usage in Taskpane

```typescript
// src/taskpane/taskpane.ts

import { OpenRouterService } from "../services/openrouter";

const ai = new OpenRouterService({
  apiKey: "sk-or-v1-...", // Store securely!
  model: "anthropic/claude-3.5-sonnet",
});

async function analyzeSelection(): Promise<void> {
  try {
    const data = await getSelectedRange();
    const analysis = await ai.analyzeExcelData(data, "Summarize this data");

    document.getElementById("result")!.textContent = analysis;
  } catch (error) {
    console.error("Analysis failed:", error);
  }
}

async function insertAIFormula(): Promise<void> {
  const description = (document.getElementById("prompt") as HTMLInputElement)
    .value;

  try {
    const formula = await ai.generateFormula(description);

    await Excel.run(async (context) => {
      const range = context.workbook.getSelectedRange();
      range.formulas = [[formula]];
      await context.sync();
    });
  } catch (error) {
    console.error("Formula generation failed:", error);
  }
}
```

---

## Custom Functions with AI

### functions.json

```json
{
  "functions": [
    {
      "name": "AI.ANALYZE",
      "description": "Analyze data using AI",
      "parameters": [
        {
          "name": "data",
          "description": "Range to analyze",
          "type": "any",
          "dimensionality": "matrix"
        },
        {
          "name": "prompt",
          "description": "Analysis instruction",
          "type": "string"
        }
      ],
      "result": {
        "type": "string",
        "dimensionality": "scalar"
      },
      "options": {
        "requiresParameterAddresses": true,
        "stream": false
      }
    },
    {
      "name": "AI.FORMULA",
      "description": "Generate Excel formula from description",
      "parameters": [
        {
          "name": "description",
          "description": "What the formula should do",
          "type": "string"
        }
      ],
      "result": {
        "type": "string"
      }
    }
  ]
}
```

### functions.ts

```typescript
// Custom function registration

/**
 * Analyzes data range using AI
 * @customfunction AI.ANALYZE
 */
async function aiAnalyze(data: any[][], prompt: string): Promise<string> {
  const service = getOpenRouterService();
  return service.analyzeExcelData(data, prompt);
}

/**
 * Generates formula from natural language
 * @customfunction AI.FORMULA
 */
async function aiFormula(description: string): Promise<string> {
  const service = getOpenRouterService();
  return service.generateFormula(description);
}

// Register functions
CustomFunctions.associate("AI.ANALYZE", aiAnalyze);
CustomFunctions.associate("AI.FORMULA", aiFormula);
```

---

## Available OpenRouter Models

| Model                         | Best For               | Context |
| ----------------------------- | ---------------------- | ------- |
| `anthropic/claude-3.5-sonnet` | Complex analysis, code | 200K    |
| `anthropic/claude-3-haiku`    | Fast, cheap tasks      | 200K    |
| `openai/gpt-4o`               | General purpose        | 128K    |
| `openai/gpt-4o-mini`          | Cost-effective         | 128K    |
| `google/gemini-pro-1.5`       | Long context           | 1M      |
| `meta-llama/llama-3-70b`      | Open source            | 8K      |

---

## Security Best Practices

### API Key Storage

> [!CAUTION]
> Never hardcode API keys in client-side code!

**Options:**

1. **Backend Proxy** (Recommended)

   ```typescript
   // Route requests through your server
   const response = await fetch("/api/openrouter", {
     method: "POST",
     body: JSON.stringify({ prompt, data }),
   });
   ```

2. **Environment Variables** (Dev only)

   ```typescript
   const apiKey = process.env.OPENROUTER_API_KEY;
   ```

3. **User-Provided Key**
   ```typescript
   // Store in Office.context.roamingSettings
   Office.context.roamingSettings.set("apiKey", userKey);
   Office.context.roamingSettings.saveAsync();
   ```

---

## Development Workflow

### Start Dev Server

```bash
npm run dev-server
```

### Sideload Add-in

```bash
# Windows
npm run start:desktop

# Web (Office Online)
npm run start:web
```

### Debug

- **Desktop**: F12 Developer Tools
- **Web**: Browser DevTools
- Use `console.log()` for Office.js debugging

---

## VBA to Add-in Migration

| VBA Feature            | Office.js Equivalent                                       |
| ---------------------- | ---------------------------------------------------------- |
| `Range("A1").Value`    | `range.values`                                             |
| `Selection`            | `context.workbook.getSelectedRange()`                      |
| `Worksheets("Sheet1")` | `worksheets.getItem("Sheet1")`                             |
| `MsgBox`               | `document.getElementById(...).textContent` or modal dialog |
| `Application.Run`      | Custom Functions or Taskpane buttons                       |
| `UserForm`             | HTML Taskpane                                              |

---

## Common Patterns

### Error Handling

```typescript
async function safeExcelOperation<T>(
  operation: (context: Excel.RequestContext) => Promise<T>,
): Promise<T | null> {
  try {
    return await Excel.run(operation);
  } catch (error) {
    if (error instanceof OfficeExtension.Error) {
      console.error(`Office.js error: ${error.code} - ${error.message}`);
    }
    throw error;
  }
}
```

### Progress Indicator

```typescript
async function longRunningTask(): Promise<void> {
  const statusEl = document.getElementById("status")!;

  try {
    statusEl.textContent = "Analyzing data...";
    const data = await getSelectedRange();

    statusEl.textContent = "Calling AI...";
    const result = await ai.analyzeExcelData(data, "Summarize");

    statusEl.textContent = "Writing results...";
    await writeResult(result);

    statusEl.textContent = "Done!";
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
  }
}
```

---

## Triggers

- excel add-in, office add-in, office.js
- openrouter excel, llm excel, ai excel
- taskpane, custom functions
- manifest.xml, sideload
- vba migration, vba to javascript
