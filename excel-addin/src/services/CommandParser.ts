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
    // Commands that require no arguments
    private static NO_ARG_COMMANDS = ["UNDO", "DELETE_ALL_CHARTS"];

    static parse(input: string): ParseResult {
        // 1. Remove markdown code blocks but keep content
        let cleanInput = input.replace(/```[\w]*\n?([\s\S]*?)```/g, '$1');
        
        const commands: Command[] = [];
        let cleanText = cleanInput;

        const lines = cleanInput.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            // Check for no-arg commands first (case-insensitive)
            const upperTrimmed = trimmed.toUpperCase();
            if (this.NO_ARG_COMMANDS.includes(upperTrimmed)) {
                commands.push({ type: upperTrimmed, args: [], original: trimmed });
                cleanText = cleanText.split(trimmed).join(""); 
                continue;
            }

            // Normalize spaces around pipes
            const normalized = trimmed.replace(/\s*\|\s*/g, '|');

            // Check for piped commands: COMMAND|arg1|arg2... (case-insensitive type)
            const match = normalized.match(/^([A-Za-z][A-Za-z_0-9]+)\|(.*)$/);
            if (match) {
                const type = match[1].toUpperCase();
                const argsStr = match[2];
                const args = argsStr.split('|').map(a => a.trim());
                const original = trimmed;

                const expanded = this.expandCommand(type, args, original);
                commands.push(...expanded);
                
                cleanText = cleanText.split(original).join(""); 
            }
        }

        cleanText = cleanText.replace(/\n\s*\n/g, "\n").trim();
        return { text: cleanText, commands };
    }

    private static expandCommand(type: string, args: string[], original: string): Command[] {
        switch (type) {
            case "MOVE_ROW":
                if (args.length >= 2) {
                    return this.expandMoveRow(args, original);
                }
                return [{ type: "ERROR", args: ["MOVE_ROW requires source and target rows"], original }];
                
            case "COPY_ROW":
                if (args.length >= 2) {
                    return [{
                        type: "COPY",
                        args: [`${args[0]}:${args[0]}`, `${args[1]}:${args[1]}`],
                        original
                    }];
                }
                return [{ type: "ERROR", args: ["COPY_ROW requires source and target rows"], original }];
                
            case "SWAP_ROWS":
                if (args.length >= 2) {
                    return this.expandSwapRows(args, original);
                }
                return [{ type: "ERROR", args: ["SWAP_ROWS requires two row numbers"], original }];
        }
        
        // Default: return as-is
        return [{ type, args, original }];
    }

    private static expandMoveRow(args: string[], original: string): Command[] {
        const sourceRow = parseInt(args[0]);
        const targetRow = parseInt(args[1]);
        
        if (isNaN(sourceRow) || isNaN(targetRow)) {
            console.error("Invalid MOVE_ROW arguments:", args);
            return [{ type: "ERROR", args: ["Invalid row numbers"], original }];
        }
        
        const position = (args[2] || "after").toLowerCase();
        const insertAt = position === "after" ? targetRow + 1 : targetRow;
        const expanded: Command[] = [];
        
        if (sourceRow < insertAt) {
            // Moving down
            expanded.push({ 
                type: "INSERT_ROWS", 
                args: [`${insertAt}:${insertAt}`], 
                original: `[MOVE↓] Insert at ${insertAt}` 
            });
            expanded.push({ 
                type: "COPY", 
                args: [`${sourceRow}:${sourceRow}`, `${insertAt}:${insertAt}`], 
                original: `[MOVE↓] Copy ${sourceRow}→${insertAt}` 
            });
            expanded.push({ 
                type: "DELETE_ROWS", 
                args: [`${sourceRow}:${sourceRow}`], 
                original: `[MOVE↓] Delete ${sourceRow}` 
            });
        } else {
            // Moving up
            const shiftedSource = sourceRow + 1;
            expanded.push({ 
                type: "INSERT_ROWS", 
                args: [`${insertAt}:${insertAt}`], 
                original: `[MOVE↑] Insert at ${insertAt}` 
            });
            expanded.push({ 
                type: "COPY", 
                args: [`${shiftedSource}:${shiftedSource}`, `${insertAt}:${insertAt}`], 
                original: `[MOVE↑] Copy ${shiftedSource}→${insertAt}` 
            });
            expanded.push({ 
                type: "DELETE_ROWS", 
                args: [`${shiftedSource}:${shiftedSource}`], 
                original: `[MOVE↑] Delete ${shiftedSource}` 
            });
        }
        
        return expanded;
    }

    private static expandSwapRows(args: string[], original: string): Command[] {
        const row1 = parseInt(args[0]);
        const row2 = parseInt(args[1]);
        
        if (isNaN(row1) || isNaN(row2)) {
            return [{ type: "ERROR", args: ["Invalid row numbers"], original }];
        }
        
        const tempRow = Math.max(row1, row2) + 1;
        
        return [
            { type: "INSERT_ROWS", args: [`${tempRow}:${tempRow}`], original: `[SWAP] Create temp row` },
            { type: "COPY", args: [`${row1}:${row1}`, `${tempRow}:${tempRow}`], original: `[SWAP] Save row ${row1}` },
            { type: "COPY", args: [`${row2}:${row2}`, `${row1}:${row1}`], original: `[SWAP] ${row2}→${row1}` },
            { type: "COPY", args: [`${tempRow}:${tempRow}`, `${row2}:${row2}`], original: `[SWAP] temp→${row2}` },
            { type: "DELETE_ROWS", args: [`${tempRow}:${tempRow}`], original: `[SWAP] Delete temp` }
        ];
    }
}
