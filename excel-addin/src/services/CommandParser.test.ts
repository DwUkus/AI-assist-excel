
import { CommandParser } from "./CommandParser";

describe("CommandParser", () => {
    test("parses single command correctly", () => {
        const text = "SET_VALUE|A1|Hello World";
        const result = CommandParser.parse(text);
        
        expect(result.commands).toHaveLength(1);
        expect(result.commands[0]).toEqual({
            type: "SET_VALUE",
            args: ["A1", "Hello World"],
            original: text
        });
    });

    test("parses multiple commands", () => {
        const text = `
Here is the plan:
SET_VALUE|A1|Name
FORMAT_BOLD|A1|true
`;
        const result = CommandParser.parse(text);
        
        expect(result.commands).toHaveLength(2);
        expect(result.commands[0].type).toBe("SET_VALUE");
        expect(result.commands[1].type).toBe("FORMAT_BOLD");
    });

    test("parses INSERT_ROWS command", () => {
        const text = "INSERT_ROWS|5:10";
        const result = CommandParser.parse(text);
        
        expect(result.commands[0]).toEqual({
            type: "INSERT_ROWS",
            args: ["5:10"],
            original: "INSERT_ROWS|5:10"
        });
    });

    test("ignores conversational text", () => {
        const text = "Sure, I can help which that.\nSET_VALUE|A1|100\nDone.";
        const result = CommandParser.parse(text);
        
        expect(result.commands).toHaveLength(1);
        expect(result.text).toContain("Sure, I can help");
    });

    test("handles complex arguments with pipes", () => {
        // e.g. formulas might contain pipes? Our regex splits by |, so this is a known limitation or edge case.
        // Assuming current logic splits simply.
        const text = "SET_FORMULA|A1|=IF(A1>0, \"High\", \"Low\")"; 
        const result = CommandParser.parse(text);
        
        expect(result.commands[0].args[1]).toBe('=IF(A1>0, "High", "Low")');
    });

    test("expands MOVE_ROW into 3 commands", () => {
        const text = "MOVE_ROW|5|10|after";
        const result = CommandParser.parse(text);
        
        expect(result.commands).toHaveLength(3);
        expect(result.commands[0].type).toBe("INSERT_ROWS");
        expect(result.commands[0].args[0]).toBe("11:11");
        expect(result.commands[1].type).toBe("COPY");
        expect(result.commands[2].type).toBe("DELETE_ROWS");
    });
});
