/*
 * ContextBuilder.ts
 * Extracts context from Excel for the LLM
 */

/* global Excel */

export interface ExcelContext {
    sheetName: string;
    address: string; // Selection address
    values: any[][];  // Selection values
    usedRange?: {
        address: string;
        values: any[][];
    };
    error?: string;
}

export class ContextBuilder {
    static async getContext(): Promise<ExcelContext> {
        try {
            return await Excel.run(async (context) => {
                const sheet = context.workbook.worksheets.getActiveWorksheet();
                const range = context.workbook.getSelectedRange();
                const usedRange = sheet.getUsedRange(true); // true = values only

                sheet.load("name");
                range.load("address, values");
                usedRange.load("address, values");

                await context.sync();

                // Process Selection
                let selValues = range.values;
                if (selValues.length > 50 || selValues[0].length > 20) {
                    selValues = selValues.slice(0, 50).map(row => row.slice(0, 20));
                }

                // Process UsedRange (Brief overview)
                let urValues = usedRange.values;
                if (urValues.length > 100 || urValues[0].length > 20) {
                    urValues = urValues.slice(0, 100).map(row => row.slice(0, 20));
                }

                return {
                    sheetName: sheet.name,
                    address: range.address,
                    values: selValues,
                    usedRange: {
                        address: usedRange.address,
                        values: urValues
                    }
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
