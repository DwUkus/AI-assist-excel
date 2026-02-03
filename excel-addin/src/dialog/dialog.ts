/*
 * AI Assistant Dialog Logic
 */

/* global document, Office, console */

import { OpenRouterService, LLMMessage } from "../services/OpenRouterService";
import { CommandParser } from "../services/CommandParser";

Office.onReady((info) => {
    if (info.host === Office.HostType.Excel) {
        console.log("Dialog initialized");
        setupUI();
    }
});

function setupUI() {
    const input = document.getElementById("user-input") as HTMLTextAreaElement;
    const sendBtn = document.getElementById("send-btn");
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

    // --- Context Bridge ---
    let pendingContextResolve: ((value: any) => void) | null = null;

    Office.context.ui.addHandlerAsync(Office.EventType.DialogParentMessageReceived, (arg: any) => {
        console.log("Message from parent:", arg.message);
        try {
            const msg = JSON.parse(arg.message);
            if (msg.type === "CONTEXT" && pendingContextResolve) {
                pendingContextResolve(msg.data);
                pendingContextResolve = null;
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

    // --- Command Execution Bridge ---
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


    // Chat History State
    let chatHistory: LLMMessage[] = [];

    // Send Message Logic
    async function sendMessage() {
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
        let systemPrompt = `You are a helpful Excel assistant.
You have access to the user's Excel state (Context).

RULES:
1. If the user asks to edit Excel, output ONLY commands in this format (one per line):
SET_VALUE|Address|Value
SET_FORMULA|Address|Formula
FORMAT_BOLD|Address|true/false
FORMAT_COLOR|Address|ColorCode
CREATE_SHEET|Name
RENAME_SHEET|NewName (for active) OR RENAME_SHEET|OldName|NewName
DELETE_SHEET|Name
DELETE_ROWS|Range (e.g. 5:5 for row 5, 2:10 for rows 2-10)
DELETE_COLUMNS|Range (e.g. B:B for col B, A:C for cols A-C)
CREATE_CHART|Type(ColumnClustered/Line/Pie)|Range|Title
DELETE_CHART|Title (use only if user specifies which one)
DELETE_ALL_CHARTS (use only if user says "all" or doesn't specify which one)
SORT|Range|ColumnIndex(0-based)|Ascending(true/false)

2. If the user says "this", "it", "selection", or implies the current range, USE the 'Selection' address from the Context below.
3. Use DELETE_ROWS|5:5 instead of DELETE_ROWS|A5 to delete the entire row.
4. If you output commands, do NOT output conversational text unless absolutely necessary.
5. If you need clarification, do NOT output commands.

Example:
User: "Color this red" (Context Selection: B2)
Output: FORMAT_COLOR|B2|red`;

        if (contextData && contextData.sheetName) {
            systemPrompt += `\n\nCURRENT EXCEL CONTEXT:\nSheet: ${contextData.sheetName}\nSelection: ${contextData.address}\nValues:\n${JSON.stringify(contextData.values)}`;
        }

        // Construct Message Chain
        // Always start with System Prompt
        const messages: LLMMessage[] = [{ role: "system", content: systemPrompt }];
        
        // Append History (last 10 messages)
        if (chatHistory.length > 10) {
            chatHistory = chatHistory.slice(chatHistory.length - 10);
        }
        messages.push(...chatHistory);
        
        // Append Current User Message
        const currentUserMsg: LLMMessage = { role: "user", content: text };
        messages.push(currentUserMsg);

        const model = modelSelect.value;

        try {
            // 3. Call LLM
            const response = await OpenRouterService.complete(messages, model, apiKey);
            removeMessage(thinkingId);

            if (response.error) {
                appendMessage(`Error: ${response.error}`, "ai");
                return;
            }
            
            // Add user message to history NOW (only on success)
            chatHistory.push(currentUserMsg);

            // 4. Parse Commands
            const rawContent = response.content || "";
            // Add AI response to history
            chatHistory.push({ role: "assistant", content: rawContent });

            const parsed = CommandParser.parse(rawContent);

            // Display "Clean" text (chat response)
            if (parsed.text) {
                appendMessage(parsed.text, "ai");
            } else if (parsed.commands.length === 0) {
                 appendMessage("I did that.", "ai");
            }

            // 5. Execute Commands
            if (parsed.commands.length > 0) {
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
    });
}

function appendMessage(text: string, sender: "user" | "ai", isTemporary: boolean = false): string {
    const container = document.getElementById("chat-history");
    const msgDiv = document.createElement("div");
    const id = `msg-${Date.now()}-${Math.random()}`;
    msgDiv.id = id;
    msgDiv.className = `message message-${sender}`;
    
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = sender === "ai" ? "🤖" : "👤";
    
    const content = document.createElement("div");
    content.className = "message-content";
    content.innerText = text; // innerText to prevent XSS but allow basic newlines
    
    msgDiv.appendChild(avatar);
    msgDiv.appendChild(content);
    
    container?.appendChild(msgDiv);
    container!.scrollTop = container!.scrollHeight;

    return id;
}

function removeMessage(id: string) {
    const el = document.getElementById(id);
    if (el) el.remove();
}
