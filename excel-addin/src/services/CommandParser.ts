/*
 * CommandParser.ts
 * Parses DSL commands from LLM output
 */

export interface Command {
    type: string;
    args: string[];
    original: string;
}

export interface ParseResult {
    text: string;
    commands: Command[];
}

export class CommandParser {
    // Regex for: COMMAND|ARG1|ARG2...
    // Matches CAPITALS_AND_UNDERSCORE | pipe | any...
    private static CMD_REGEX = /^([A-Z][A-Z_]+)(\|.*)+$/gm;

    static parse(input: string): ParseResult {
        const commands: Command[] = [];
        let cleanText = input;

        // Find all matches
        const matches = input.matchAll(this.CMD_REGEX);
        for (const match of matches) {
            const original = match[0];
            const parts = original.split("|");
            const type = parts[0].trim();
            const args = parts.slice(1).map(a => a.trim());

            commands.push({ type, args, original });
            
            // Remove command from text
            cleanText = cleanText.replace(original, "");
        }

        // Clean up double newlines left behind
        cleanText = cleanText.replace(/\n\s*\n/g, "\n").trim();

        return { text: cleanText, commands };
    }
}
