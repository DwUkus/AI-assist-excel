/*
 * ContextBuilder.ts
 * Extracts context from Excel for the LLM
 */

/* global Excel */

export interface ExcelContext {
    sheetName: string;
    address: string;
    values: any[][];
    error?: string;
}

export class ContextBuilder {
    static async getContext(): Promise<ExcelContext> {
        try {
            return await Excel.run(async (context) => {
                const sheet = context.workbook.worksheets.getActiveWorksheet();
                const range = context.workbook.getSelectedRange();

                sheet.load("name");
                range.load("address");
                range.load("values");
                // Limit size? For now, we trust the selection isn't huge. 
                // In production, we should crop to e.g. 50x20.

                await context.sync();

                // Simple size check to avoid token explosion
                let values = range.values;
                const MAX_ROWS = 50;
                const MAX_COLS = 20;

                if (values.length > MAX_ROWS || values[0].length > MAX_COLS) {
                    values = values.slice(0, MAX_ROWS).map(row => row.slice(0, MAX_COLS));
                }

                return {
                    sheetName: sheet.name,
                    address: range.address,
                    values: values
                };
            });
        } catch (error) {
            console.error("Context build failed", error);
            return {
                sheetName: "Error",
                address: "",
                values: [],
                error: (error as Error).message
            };
        }
    }
}
