
export interface LLMMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface CompletionResponse {
    content?: string;
    error?: string;
}

export class OpenRouterService {
    private static readonly API_URL = "https://openrouter.ai/api/v1/chat/completions";

    static async complete(
        messages: LLMMessage[],
        model: string,
        apiKey: string
    ): Promise<CompletionResponse> {
        if (!apiKey) {
            return { error: "API Key is missing" };
        }

        try {
            const response = await fetch(this.API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "HTTP-Referer": "https://localhost:3000", // Required by OpenRouter
                    "X-Title": "AI Excel Assistant", // Optional
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                return { error: `API Error ${response.status}: ${errorText}` };
            }

            const data = await response.json();
            
            if (data.choices && data.choices.length > 0) {
                return { content: data.choices[0].message.content };
            } else {
                return { error: "No response from model" };
            }

        } catch (e) {
            return { error: `Network error: ${e.message}` };
        }
    }
}
