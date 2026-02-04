/*
 * AI Ассистент для Excel
 * Taskpane entry point
 */

/* global document, Office */

import { ContextBuilder } from "../services/ContextBuilder";
import { CommandExecutor } from "../services/CommandExecutor";

Office.onReady((info) => {
  if (info.host === Office.HostType.Excel) {
    console.log("Office Add-in loaded successfully");

    // Hide sideload message, show app body
    const sideloadMsg = document.getElementById("sideload-msg");
    const appBody = document.getElementById("app-body");

    if (sideloadMsg) sideloadMsg.style.display = "none";
    if (appBody) appBody.style.display = "flex";

    // Setup button handler
    const openButton = document.getElementById("open-assistant");
    if (openButton) {
      openButton.onclick = openAssistantDialog;
    }
  }
});

/**
 * Opens the AI Assistant dialog
 */
async function openAssistantDialog(): Promise<void> {
  const statusMessage = document.getElementById("status-message");
  
  try {
    if (statusMessage) statusMessage.textContent = "Открытие...";
    
    // Construct the URL. Use relative path to support GitHub Pages subfolder.
    const url = new URL("dialog.html", window.location.href).toString();
    
    Office.context.ui.displayDialogAsync(
      url,
      { height: 60, width: 45, displayInIframe: false },
      (asyncResult) => {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
          console.error("Dialog failed:", asyncResult.error.message);
          if (statusMessage) statusMessage.textContent = "Ошибка: " + asyncResult.error.message;
        } else {
          const dialog = asyncResult.value;
          // We will use this later for message passing
          console.log("Dialog opened successfully");
          if (statusMessage) statusMessage.textContent = "Готово. Диалог открыт.";
          


          dialog.addEventHandler(Office.EventType.DialogMessageReceived, async (arg: any) => {
             console.log("Message from dialog:", arg.message);
             
             let msg: any = {};
             
             // Try Parsing JSON
             try {
                 msg = JSON.parse(arg.message);
             } catch (e) {
                 // Not JSON, treat as string command
                 msg = { type: arg.message };
             }

             try {
                 if (msg.type === "EXECUTE") {
                     const result = await CommandExecutor.execute(msg.commands);
                     const response = JSON.stringify({ type: "EXECUTION_RESULT", data: result });
                     // @ts-ignore
                     dialog.messageChild(response);
                 }
                 else if (msg.type === "GET_CONTEXT") {
                     const context = await ContextBuilder.getContext();
                     const response = JSON.stringify({ type: "CONTEXT", data: context });
                     // @ts-ignore
                     dialog.messageChild(response);
                 }
             } catch (e) {
                 console.error("Failed to handle dialog message", e);
             }
          });
          
          dialog.addEventHandler(Office.EventType.DialogEventReceived, (arg) => {
             console.log("Dialog event:", arg);
          });
        }
      }
    );
    
  } catch (error) {
    console.error("Error opening dialog:", error);
    if (statusMessage) {
      statusMessage.textContent = "Ошибка: " + (error as Error).message;
    }
  }
}
