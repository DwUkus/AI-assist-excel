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

                            case "DELETE_ROWS":
                                // DELETE_ROWS|Address (e.g. 2:5)
                                if (cmd.args.length >= 1) {
                                    const range = sheet.getRange(cmd.args[0]);
                                    range.delete(Excel.DeleteShiftDirection.up);
                                    executedCount++;
                                }
                                break;

                            case "DELETE_COLUMNS":
                                // DELETE_COLUMNS|Address (e.g. A:B)
                                if (cmd.args.length >= 1) {
                                    const range = sheet.getRange(cmd.args[0]);
                                    range.delete(Excel.DeleteShiftDirection.left);
                                    executedCount++;
                                }
                                break;

                            case "CREATE_CHART":
                                // CREATE_CHART|Type|Range|Title
                                // Types: ColumnClustered, Line, Pie, etc.
                                if (cmd.args.length >= 2) {
                                    const type = cmd.args[0] as Excel.ChartType; 
                                    const range = sheet.getRange(cmd.args[1]);
                                    const chart = sheet.charts.add(type, range, "Auto");
                                    if (cmd.args[2]) {
                                        chart.title.text = cmd.args[2];
                                    }
                                    executedCount++;
                                }
                                break;
                            
                            case "SORT":
                                // SORT|Range|KeyIndex|Ascending(true/false)
                                if (cmd.args.length >= 2) {
                                    const range = sheet.getRange(cmd.args[0]);
                                    const keyIndex = parseInt(cmd.args[1]) || 0; // relative column index (0-based)
                                    const ascending = cmd.args[2] !== "false"; // default true
                                    
                                    const sortFields = [{
                                        key: keyIndex,
                                        ascending: ascending
                                    }];
                                    
                                    range.sort.apply(sortFields, false); // MatchCase=false
                                    executedCount++;
                                }
                                break;

                            case "RENAME_SHEET":
                                // RENAME_SHEET|NewName (active) OR RENAME_SHEET|OldName|NewName
                                if (cmd.args.length === 1) {
                                    sheet.name = cmd.args[0];
                                    executedCount++;
                                } else if (cmd.args.length === 2) {
                                    const targetSheet = context.workbook.worksheets.getItem(cmd.args[0]);
                                    targetSheet.name = cmd.args[1];
                                    executedCount++;
                                }
                                break;

                            case "DELETE_SHEET":
                                // DELETE_SHEET|Name
                                if (cmd.args.length >= 1) {
                                    const targetSheet = context.workbook.worksheets.getItem(cmd.args[0]);
                                    targetSheet.delete();
                                    executedCount++;
                                }
                                break;

                            case "DELETE_CHART":
                                // DELETE_CHART|Chart Title or Name
                                if (cmd.args.length >= 1) {
                                    const charts = sheet.charts;
                                    charts.load("items/title/text, items/name");
                                    await context.sync();
                                    
                                    const searchTerm = cmd.args[0].toLowerCase();
                                    // Try exact name or fuzzy title match
                                    const target = charts.items.find(c => 
                                        c.name.toLowerCase() === searchTerm || 
                                        (c.title && c.title.text && c.title.text.toLowerCase().includes(searchTerm))
                                    );

                                    if (target) {
                                        target.delete();
                                        executedCount++;
                                    } else {
                                        // Fallback to trying to get by name directly if search failed
                                        try {
                                            const item = charts.getItem(cmd.args[0]);
                                            item.delete();
                                            executedCount++;
                                        } catch (e) {
                                            errors.push(`Chart not found: ${cmd.args[0]}`);
                                        }
                                    }
                                }
                                break;

                            case "DELETE_ALL_CHARTS":
                                // DELETE_ALL_CHARTS
                                // Note: deleting in loop requires care. We'll load items first.
                                const charts = sheet.charts;
                                charts.load("items");
                                await context.sync();
                                for (let i = charts.items.length - 1; i >= 0; i--) {
                                    charts.items[i].delete();
                                }
                                executedCount++;
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
