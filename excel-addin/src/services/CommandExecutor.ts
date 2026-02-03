/*
 * CommandExecutor.ts
 * Executes filtered commands in Excel
 */

/* global Excel, Office */

import { Command } from "./CommandParser";

export interface ExecutionResult {
    success: boolean;
    executed: number;
    errors: string[];
}

export class CommandExecutor {
    static async execute(commands: Command[]): Promise<ExecutionResult> {
        let executedCount = 0;
        const errors: string[] = [];

        if (commands.length === 0) return { success: true, executed: 0, errors: [] };

        try {
            await Excel.run(async (context) => {
                const sheet = context.workbook.worksheets.getActiveWorksheet();
                
                for (const cmd of commands) {
                    try {
                        switch (cmd.type) {
                            case "SET_VALUE":
                                // SET_VALUE|Address|Value
                                if (cmd.args.length >= 2) {
                                    const range = sheet.getRange(cmd.args[0]);
                                    range.values = [[cmd.args[1]]];
                                    executedCount++;
                                }
                                break;
                            
                            case "SET_FORMULA":
                                // SET_FORMULA|Address|Formula
                                if (cmd.args.length >= 2) {
                                    const range = sheet.getRange(cmd.args[0]);
                                    range.formulas = [[cmd.args[1]]];
                                    executedCount++;
                                }
                                break;
                                
                            case "FORMAT_BOLD":
                                // FORMAT_BOLD|Address|true/false
                                if (cmd.args.length >= 2) {
                                    const range = sheet.getRange(cmd.args[0]);
                                    const isBold = cmd.args[1].toLowerCase() === "true";
                                    range.format.font.bold = isBold;
                                    executedCount++;
                                }
                                break;
                            
                            case "FORMAT_COLOR":
                                // FORMAT_COLOR|Address|Color
                                if (cmd.args.length >= 2) {
                                    const range = sheet.getRange(cmd.args[0]);
                                    range.format.fill.color = cmd.args[1];
                                    executedCount++;
                                }
                                break;

                            case "CREATE_SHEET":
                                // CREATE_SHEET|Name
                                if (cmd.args.length >= 1) {
                                    context.workbook.worksheets.add(cmd.args[0]);
                                    executedCount++;
                                }
                                break;

                            default:
                                errors.push(`Unknown command: ${cmd.type}`);
                        }
                    } catch (e) {
                        errors.push(`Error executing ${cmd.type}: ${(e as Error).message}`);
                    }
                }
                
                await context.sync();
            });
        } catch (globalError) {
             return { 
                 success: false, 
                 executed: executedCount, 
                 errors: [...errors, `Global Context Error: ${(globalError as Error).message}`] 
             };
        }

        return {
            success: errors.length === 0,
            executed: executedCount,
            errors: errors
        };
    }
}
