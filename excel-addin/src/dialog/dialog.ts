/*
 * AI Assistant Dialog Logic
 */

/* global document, Office, console, marked */

import "./dialog.css";
import { OpenRouterService, LLMMessage } from "../services/OpenRouterService";
import { CommandParser } from "../services/CommandParser";

Office.onReady((info) => {
    if (info.host === Office.HostType.Excel) {
        console.log("Dialog initialized");
        // Ensure DOM is ready
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", initApp);
        } else {
            initApp();
        }
    }
});

function initApp() {
    setupUI();
    loadSessions();
}

// Session Management
interface ChatSession {
    id: string;
    title: string;
    messages: LLMMessage[];
    lastModified: number;
}

let sessions: Record<string, ChatSession> = {};
let currentSessionId: string | null = null;

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function saveSessions() {
    localStorage.setItem("chat_sessions", JSON.stringify(sessions));
    localStorage.setItem("current_session_id", currentSessionId || "");
}

function loadSessions() {
    const storedSessions = localStorage.getItem("chat_sessions");
    const storedCurrentId = localStorage.getItem("current_session_id");

    if (storedSessions) {
        try {
            sessions = JSON.parse(storedSessions);
        } catch (e) {
            console.error("Failed to parse sessions", e);
            sessions = {};
        }
    }

    if (storedCurrentId && sessions[storedCurrentId]) {
        currentSessionId = storedCurrentId;
    } else {
        // Create default if empty
        createNewSession();
    }
    
    renderCurrentSession();
    renderChatList();
}

function createNewSession() {
    const id = generateId();
    sessions[id] = {
        id,
        title: "New Chat",
        messages: [{ role: "assistant", content: "Привет! Я готов помочь вам с Excel." }],
        lastModified: Date.now()
    };
    currentSessionId = id;
    saveSessions();
    renderCurrentSession();
    renderChatList();
}

function deleteSession(id: string) {
    if (sessions[id]) {
        delete sessions[id];
        if (currentSessionId === id) {
            // Switch to most recent or create new
            const remaining = Object.values(sessions).sort((a, b) => b.lastModified - a.lastModified);
            if (remaining.length > 0) {
                currentSessionId = remaining[0].id;
            } else {
                createNewSession();
                return; // createNewSession handles render
            }
        }
        saveSessions();
        renderCurrentSession();
        renderChatList();
    }
}

function switchSession(id: string) {
    if (sessions[id]) {
        currentSessionId = id;
        saveSessions();
        renderCurrentSession();
        renderChatList();
    }
}

function renderCurrentSession() {
    const container = document.getElementById("chat-history");
    if (!container || !currentSessionId || !sessions[currentSessionId]) return;

    container.innerHTML = ""; // Clear current view
    
    const messages = sessions[currentSessionId].messages;
    messages.forEach(msg => {
        appendMessage(msg.content, msg.role as any);
    });
}

// Global state for deletion
let sessionToDelete: string | null = null;

function renderChatList() {
    const listEl = document.getElementById("chat-list");
    if (!listEl) return;
    
    listEl.innerHTML = "";
    
    const sortedSessions = Object.values(sessions).sort((a, b) => b.lastModified - a.lastModified);
    
    sortedSessions.forEach(session => {
        const item = document.createElement("div");
        item.className = `chat-item ${session.id === currentSessionId ? "active" : ""}`;
        item.onclick = () => switchSession(session.id);
        
        const title = document.createElement("span");
        title.className = "chat-item-title";
        title.textContent = session.title;
        
        // Menu button (3 dots)
        const menuBtn = document.createElement("button");
        menuBtn.type = "button"; // Explicit type
        menuBtn.className = "chat-item-menu-btn";
        menuBtn.innerHTML = "⋮";
        
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            console.log("Delete menu clicked for session:", session.id);
            
            // Show custom modal
            sessionToDelete = session.id;
            const deleteModal = document.getElementById("delete-modal");
            if (deleteModal) {
                deleteModal.classList.remove("hidden");
                // Force display flex just in case
                deleteModal.style.display = "flex";
            } else {
                console.error("Delete modal not found in DOM");
            }
        });

        item.appendChild(title);
        item.appendChild(menuBtn);
        listEl.appendChild(item);
    });
}

function setupUI() {
    const input = document.getElementById("user-input") as HTMLTextAreaElement;
    const sendBtn = document.getElementById("send-btn");
    
    // Delete Modal Logic
    const deleteModal = document.getElementById("delete-modal");
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
    const cancelDeleteBtn = document.getElementById("cancel-delete-btn");

    confirmDeleteBtn?.addEventListener("click", () => {
        if (sessionToDelete) {
            deleteSession(sessionToDelete);
            sessionToDelete = null;
        }
        deleteModal?.classList.add("hidden");
    });

    cancelDeleteBtn?.addEventListener("click", () => {
        sessionToDelete = null;
        deleteModal?.classList.add("hidden");
    });
    
    // Sidebar Logic
    const sidebar = document.getElementById("sidebar");
    const closeSidebarBtn = document.getElementById("sidebar-toggle-close");
    const openSidebarBtn = document.getElementById("sidebar-toggle-open");

    function updateSidebarState(collapsed: boolean) {
        if (collapsed) {
            sidebar?.classList.add("collapsed");
            openSidebarBtn?.classList.remove("hidden");
        } else {
            sidebar?.classList.remove("collapsed");
            openSidebarBtn?.classList.add("hidden");
        }
    }

    closeSidebarBtn?.addEventListener("click", () => updateSidebarState(true));
    openSidebarBtn?.addEventListener("click", () => updateSidebarState(false));

    const newChatBtn = document.getElementById("new-chat-btn");
    newChatBtn?.addEventListener("click", () => {
        createNewSession();
        // Auto-open sidebar on mobile? Optional.
        if (window.innerWidth < 600) updateSidebarState(true); 
    });

    // Textarea Auto-resize
    input.addEventListener("input", () => {
        input.style.height = "auto";
        input.style.height = Math.min(input.scrollHeight, 150) + "px"; // Cap at ~6-7 lines
    });

    // Settings Button (moved to footer)
    const settingsBtn = document.getElementById("settings-btn");
    const modal = document.getElementById("settings-modal");
    const saveSettings = document.getElementById("save-settings-btn");
    const modelSelect = document.getElementById("model-select") as HTMLSelectElement;
    const modelListContainer = document.getElementById("model-list");
    const addModelBtn = document.getElementById("add-model-btn");

    interface Model {
        id: string;
        name: string;
    }

    const defaultModels: Model[] = [
        { id: "stepfun/step-3.5-flash:free", name: "StepFun 3.5 Flash (Free)" },
        { id: "google/gemini-2.0-flash-thinking-exp:free", name: "Gemini 2.0 Flash Thinking (Free)" },
        { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash Exp (Free)" },
        { id: "google/gemini-2.0-pro-exp-02-05:free", name: "Gemini 2.0 Pro Exp (Free)" },
        { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1 (Free)" },
        { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (Free)" }
    ];

    let models: Model[] = [];

    // --- Model Management Logic ---

    function loadModels() {
        const stored = localStorage.getItem("openrouter_models");
        if (stored) {
            try {
                models = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse models", e);
                models = [...defaultModels];
            }
        } else {
            models = [...defaultModels];
        }
        renderModelSelect();
        renderModelList();
    }

    function saveModels() {
        localStorage.setItem("openrouter_models", JSON.stringify(models));
        renderModelSelect();
        renderModelList();
    }

    function renderModelSelect() {
        const currentVal = modelSelect.value;
        modelSelect.innerHTML = "";
        models.forEach(m => {
            const opt = document.createElement("option");
            opt.value = m.id;
            opt.textContent = m.name;
            modelSelect.appendChild(opt);
        });
        if (currentVal && models.some(m => m.id === currentVal)) {
            modelSelect.value = currentVal;
        } else if (models.length > 0) {
            modelSelect.value = models[0].id; // Default to first
        }
    }

    function renderModelList() {
        if (!modelListContainer) return;
        modelListContainer.innerHTML = "";
        
        models.forEach((m, index) => {
            const item = document.createElement("div");
            item.className = "model-item";
            item.innerHTML = `
                <div class="model-info">
                    <span class="model-name">${m.name}</span>
                    <span class="model-id">${m.id}</span>
                </div>
                <button class="delete-model-btn" data-index="${index}" title="Delete">🗑️</button>
            `;
            modelListContainer.appendChild(item);
        });
    }

    // Event Delegation for Delete
    modelListContainer?.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        const btn = target.closest(".delete-model-btn");
        if (btn) {
            const idx = parseInt(btn.getAttribute("data-index") || "-1");
            if (idx > -1) {
                // Use a custom confirm or just proceed? Standard confirm OK.
                // Wrap in try-catch just in case of environment issues
                try {
                    models.splice(idx, 1);
                    saveModels();
                } catch (err) {
                    console.error("Delete failed", err);
                }
            }
        }
    });

    // Initialize Models
    loadModels();

    // Add Model Listener
    addModelBtn?.addEventListener("click", () => {
        const idInput = document.getElementById("new-model-id") as HTMLInputElement;
        const nameInput = document.getElementById("new-model-name") as HTMLInputElement;
        
        const id = idInput.value.trim();
        const name = nameInput.value.trim();

        if (!id || !name) {
            alert("Please enter both Model ID and Display Name");
            return;
        }

        models.push({ id, name });
        saveModels();
        
        idInput.value = "";
        nameInput.value = "";
    });

    // Load saved key if available
    const savedKey = localStorage.getItem("openrouter_key");
    if (savedKey) {
        (document.getElementById("api-key-input") as HTMLInputElement).value = savedKey;
    }

    // Settings Modal
    settingsBtn?.addEventListener("click", () => {
        modal?.classList.remove("hidden");
        // Re-render list to ensure freshness
        renderModelList(); 
    });
    
    document.getElementById("close-settings-btn")?.addEventListener("click", () => modal?.classList.add("hidden"));
    
    saveSettings?.addEventListener("click", () => {
        const key = (document.getElementById("api-key-input") as HTMLInputElement).value.trim();
        if (key) {
            localStorage.setItem("openrouter_key", key);
            appendMessage("API Key saved!", "ai");
            // Don't auto-close, let user manage models too
        } 
        
        // Also save models just in case (though they save on add/delete)
        saveModels();
        modal?.classList.add("hidden");
    });

    // --- Context & Command Bridge ---
    let pendingContextResolve: ((value: any) => void) | null = null;
    let pendingExecResolve: ((value: any) => void) | null = null;

    Office.context.ui.addHandlerAsync(Office.EventType.DialogParentMessageReceived, (arg: any) => {
        console.log("Message from parent:", arg.message);
        try {
            const msg = JSON.parse(arg.message);
            if (msg.type === "CONTEXT" && pendingContextResolve) {
                pendingContextResolve(msg.data);
                pendingContextResolve = null;
            } else if (msg.type === "EXECUTION_RESULT" && pendingExecResolve) {
                pendingExecResolve(msg.data);
                pendingExecResolve = null;
            }
        } catch (e) {
            console.error("Failed to parse parent message", e);
        }
    });

    function getContextFromParent(): Promise<any> {
        return new Promise((resolve) => {
            pendingContextResolve = resolve;
            Office.context.ui.messageParent("GET_CONTEXT");
            // Timeout fallback?
            setTimeout(() => {
                if (pendingContextResolve) {
                    console.warn("Context request timed out");
                    pendingContextResolve({}); // Resolve empty to avoid hanging
                    pendingContextResolve = null;
                }
            }, 3000);
        });
    }

    function executeCommandsInParent(commands: any[]): Promise<any> {
        return new Promise((resolve) => {
            pendingExecResolve = resolve;
            const payload = JSON.stringify({ type: "EXECUTE", commands: commands });
            Office.context.ui.messageParent(payload);
            
            // Timeout?
             setTimeout(() => {
                if (pendingExecResolve) {
                    pendingExecResolve({ success: false, errors: ["Timeout"] });
                    pendingExecResolve = null;
                }
            }, 60000); // 60s timeout for Excel ops
        });
    }



    function validateCommands(commands: any[]): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        commands.forEach((cmd, idx) => {
            // Check parser errors
            if (cmd.type === "ERROR") {
                errors.push(`Command ${idx + 1}: ${cmd.args[0] || 'Parser error'} — ${cmd.original}`);
                return;
            }

            // Check args existence
            if (cmd.type === "DELETE_ROWS" || cmd.type === "INSERT_ROWS") {
                if (!cmd.args[0] || !/^\d+:\d+$/.test(cmd.args[0])) {
                    errors.push(`Command ${idx + 1} (${cmd.type}): Expected format N:N, got: ${cmd.args[0] || 'empty'}`);
                }
            }
            
            // Validate COPY
            if (cmd.type === "COPY" && cmd.args.length < 2) {
                errors.push(`Command ${idx + 1} (COPY): Requires source and target ranges`);
            }
            
            // Validate SET_VALUE/SET_FORMULA
            if ((cmd.type === "SET_VALUE" || cmd.type === "SET_FORMULA") && cmd.args.length < 2) {
                errors.push(`Command ${idx + 1} (${cmd.type}): Requires address and value`);
            }
            
            // Validate FORMAT commands
            if (cmd.type.startsWith("FORMAT_") && cmd.args.length < 2) {
                errors.push(`Command ${idx + 1} (${cmd.type}): Requires address and value`);
            }
            
            // Validate SORT
            if (cmd.type === "SORT" && cmd.args.length < 3) {
                errors.push(`Command ${idx + 1} (SORT): Requires range, column index, and order`);
            }
        });
        
        return { valid: errors.length === 0, errors };
    }

    // Send Message Logic
    async function sendMessage() {
        if (!currentSessionId || !sessions[currentSessionId]) {
            createNewSession();
        }
        
        const text = input.value.trim();
        if (!text) return;
        
        const apiKey = localStorage.getItem("openrouter_key");
        if (!apiKey) {
            modal?.classList.remove("hidden");
            appendMessage("Please set your OpenRouter API Key in settings first.", "ai");
            return;
        }

        const includeData = (document.getElementById("include-data") as HTMLInputElement).checked;

        appendMessage(text, "user");
        input.value = "";
        // Reset height
        input.style.height = "auto";
        
        // Show thinking state
        const thinkingId = appendMessage("Thinking...", "ai", true);

        // 1. Get Context
        let contextData = null;
        if (includeData) {
            try {
                contextData = await getContextFromParent();
            } catch (e) {
                console.error("Error fetching context", e);
            }
        }

        // 2. Prepare System Prompt with DSL Instructions
        const systemPrompt = `You are an Excel automation assistant. You translate user requests into executable commands.

═══════════════════════════════════════════════════════════════
EXAMPLES (Follow this reasoning pattern)
═══════════════════════════════════════════════════════════════

📝 Example 1: "Перенеси строку 5 под строку 10"
Thinking: Move row 5 to AFTER row 10. Source=5, Target=10, Position=after
MOVE_ROW|5|10|after

📝 Example 2: "Удали строку с Ивановым"
Context shows: Row 4 = ["Иванов", "Менеджер", 50000]
DELETE_ROWS|4:4

📝 Example 3: "Сделай ячейку B2 красной и жирной"
FORMAT_COLOR|B2|red
FORMAT_BOLD|B2|true

📝 Example 4: "Поменяй местами строки 3 и 7"
SWAP_ROWS|3|7

📝 Example 5: "Скопируй таблицу A1:D10 на новый лист"
CREATE_SHEET|Копия
COPY|Sheet1!A1:D10|Копия!A1

📝 Example 6: User asks "Что здесь написано?"
(This is a QUESTION, not an action request)
→ Reply with text, NO commands

═══════════════════════════════════════════════════════════════
INTENT CLASSIFICATION (Check FIRST before generating commands)
═══════════════════════════════════════════════════════════════

🔍 QUESTION INTENTS (Reply with text, NO commands):
- "Что это?", "Сколько?", "Какая формула?", "Объясни"
- "Помоги разобраться", "Что означает"

🔧 ACTION INTENTS (Output commands ONLY):
- "Сделай", "Удали", "Перенеси", "Скопируй", "Создай"
- "Покрась", "Отформатируй", "Сортируй"

❓ CLARIFICATION NEEDED:
- Ambiguous references: "эту строку" (which one?)
- Multiple matches: "Иванов" appears in rows 4 and 12
- Missing target: "Скопируй данные" (куда?)

═══════════════════════════════════════════════════════════════
COMMAND REFERENCE
═══════════════════════════════════════════════════════════════

▸ CELL OPERATIONS
  SET_VALUE|Address|Value
  SET_FORMULA|Address|Formula  
  FORMAT_BOLD|Address|true/false
  FORMAT_COLOR|Address|ColorCode
  FORMAT_FILL|Address|ColorCode
  CLEAR|Address
  SELECT|Address

▸ ROW OPERATIONS (use row notation like 5:5, NOT A5)
  DELETE_ROWS|RowRange        → DELETE_ROWS|5:5 or DELETE_ROWS|2:10
  INSERT_ROWS|RowRange        → INSERT_ROWS|5:5 (inserts BEFORE row 5)
  COPY_ROW|SourceRow|TargetRow → COPY_ROW|5|10 (copies row 5 to row 10)
  MOVE_ROW|SourceRowIndex|TargetRowIndex|Position → Position: before|after
  SWAP_ROWS|Row1|Row2   → Swaps row 1 and row 2

▸ COLUMN OPERATIONS  
  DELETE_COLUMNS|ColRange     → DELETE_COLUMNS|B:B or DELETE_COLUMNS|A:C
  INSERT_COLUMNS|ColRange     → INSERT_COLUMNS|B:B

▸ DATA OPERATIONS
  COPY|SourceRange|TargetRange
  SORT|Range|ColumnIndex(0-based)|Ascending(true/false)

▸ SHEET OPERATIONS
  CREATE_SHEET|Name
  DELETE_SHEET|Name
  RENAME_SHEET|NewName                    (active sheet)
  RENAME_SHEET|OldName|NewName            (specific sheet)
  ACTIVATE_SHEET|Name

▸ CHARTS
  CREATE_CHART|Type|DataRange|Title       (Types: ColumnClustered/Line/Pie/Bar)
  DELETE_CHART|Title
  DELETE_ALL_CHARTS

▸ SPECIAL
  UNDO    (ONLY for explicit: "отмени", "назад", "undo", "верни")

═══════════════════════════════════════════════════════════════
CRITICAL RULES FOR ROW MOVEMENT
═══════════════════════════════════════════════════════════════

⚠️ RULE 1: INDEX SHIFT AWARENESS
When you INSERT a row, all rows BELOW shift down by 1.
When you DELETE a row, all rows BELOW shift up by 1.
You MUST account for this in multi-step operations.
*NOTE: MOVE_ROW command handles this automatically. Prefer using it if possible.*

⚠️ RULE 2: MOVE ROW ALGORITHM (Manual Steps if not using MOVE_ROW)
- MOVING ROW DOWN (source < target): INSERT at Target+1, COPY, DELETE Source.
- MOVING ROW UP (source > target): INSERT at Target, COPY Source+1, DELETE Source+1.

⚠️ RULE 3: LANGUAGE INTERPRETATION (Russian)
- "под строкой X" / "после X" → AFTER row X (insert at X+1)
- "над строкой X" / "перед X" / "выше X" → BEFORE row X (insert at X)
- "на место X" → REPLACE position X

═══════════════════════════════════════════════════════════════
AMBIGUITY HANDLING
═══════════════════════════════════════════════════════════════

If a value appears in MULTIPLE rows:
❌ DO NOT execute
✅ ASK: "Нашёл 'Иванов' в строках 4 и 12. Какую строку обработать?"

If command is unclear:
❌ DO NOT guess
✅ ASK for clarification

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════

✅ Commands ONLY (one per line, no extra text)
✅ OR clarifying question ONLY (no commands mixed in)
❌ NEVER mix commands with explanatory text`;

        let fullPrompt = systemPrompt;

        if (contextData && contextData.sheetName) {
            fullPrompt += `\n\nCURRENT EXCEL CONTEXT:\nSheet: ${contextData.sheetName}\nSelection: ${contextData.address}\nValues (Selection):\n${JSON.stringify(contextData.values)}`;
            if (contextData.usedRange) {
                // Parse start row from address like "Sheet1!A2:D10" or "A2:D10"
                const rangeAddress = contextData.usedRange.address;
                const addressWithoutSheet = rangeAddress.includes('!') 
                    ? rangeAddress.split('!')[1] 
                    : rangeAddress;
                
                // Match "2" from "A2"
                const startRowMatch = addressWithoutSheet.match(/[A-Z]+(\d+)/i);
                const startRow = startRowMatch ? parseInt(startRowMatch[1]) : 1;

                const rowsWithNumbers = (contextData.usedRange.values as any[][]).map((row, idx) => 
                    `Row ${startRow + idx}: ${JSON.stringify(row)}` 
                ).join('\n');
                
                fullPrompt += `\n\nSheet Overview (Used Range: ${contextData.usedRange.address}):\n${rowsWithNumbers}`;
            }
        }

        // Construct Message Chain
        // Always start with System Prompt
        const messages: LLMMessage[] = [{ role: "system", content: fullPrompt }];
        
        // Append History from current session
        const sessionHistory = sessions[currentSessionId!].messages;
        
        // Limit context window if needed (last 20)
        let contextMessages = sessionHistory;
        if (sessionHistory.length > 20) {
            contextMessages = sessionHistory.slice(sessionHistory.length - 20);
        }
        messages.push(...contextMessages);
        
        // Append Current User Message
        const currentUserMsg: LLMMessage = { role: "user", content: text };
        messages.push(currentUserMsg);

        const model = modelSelect.value;
        const currentId = currentSessionId!; // Capture for async closure

        try {
            // 3. Call LLM
            const response = await OpenRouterService.complete(messages, model, apiKey);
            removeMessage(thinkingId);

            if (response.error) {
                appendMessage(`Error: ${response.error}`, "ai");
                return;
            }
            
            // Add user message to session history (only on success)
            sessions[currentId].messages.push(currentUserMsg);
            
            // Update Title if it's the first user message (and title is default)
            if (sessions[currentId].messages.length <= 2 && sessions[currentId].title === "New Chat") {
                 sessions[currentId].title = text.substring(0, 30) + (text.length > 30 ? "..." : "");
            }
            sessions[currentId].lastModified = Date.now();
            renderChatList(); // Update sidebar order

            // 4. Parse Commands
            const rawContent = response.content || "";
            
            // Add AI response to history
            const aiMsg: LLMMessage = { role: "assistant", content: rawContent };
            sessions[currentId].messages.push(aiMsg);
            saveSessions(); // Save state

            const parsed = CommandParser.parse(rawContent);

            // Display "Clean" text (chat response)
            if (parsed.text) {
                appendMessage(parsed.text, "ai");
            } 
            
            // Fallback if empty
            if (!parsed.text && parsed.commands.length === 0) {
                 appendMessage(rawContent || "(Empty response)", "ai");
            }

            // 5. Execute Commands
            if (parsed.commands.length > 0) {
                const validation = validateCommands(parsed.commands);
                if (!validation.valid) {
                    appendMessage(`⚠️ Validation Errors:\n${validation.errors.join("\n")}`, "ai");
                    return;
                }

                const execMsgId = appendMessage(`Executing ${parsed.commands.length} actions...`, "ai", true);
                
                const result = await executeCommandsInParent(parsed.commands);
                
                removeMessage(execMsgId);
                
                if (result.success) {
                    const cmdDisplay = parsed.commands.map(c => c.original).join("\n");
                    appendMessage(`✅ Executed:\n${cmdDisplay}`, "ai");
                } else {
                    appendMessage(`⚠️ Errors: ${result.errors.join(", ")}`, "ai");
                }
            }

        } catch (err) {
            removeMessage(thinkingId);
            appendMessage(`System Error: ${err}`, "ai");
        }
    }

    sendBtn?.addEventListener("click", sendMessage);
    
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
        // Shift+Enter is handled natively by textarea (new line)
    });
}

function appendMessage(text: string, sender: "user" | "ai", isTemporary: boolean = false): string {
    const container = document.getElementById("chat-history");
    const msgDiv = document.createElement("div");
    const id = `msg-${Date.now()}-${Math.random()}`;
    msgDiv.id = id;
    msgDiv.className = `message message-${sender}${isTemporary ? ' temporary' : ''}`;
    
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = sender === "ai" ? "🤖" : "👤";
    
    const content = document.createElement("div");
    content.className = "message-content";
    
    if (sender === "ai") {
        // Safer marked usage (no raw HTML)
        // @ts-ignore
        const renderer = new marked.Renderer();
        renderer.html = () => ''; 
        // @ts-ignore
        content.innerHTML = marked.parse(text, { renderer });
    } else {
        content.innerText = text;
    }
    
    msgDiv.appendChild(avatar);
    msgDiv.appendChild(content);
    
    if (container) {
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
    }

    return id;
}

function removeMessage(id: string) {
    const el = document.getElementById(id);
    if (el) el.remove();
}
