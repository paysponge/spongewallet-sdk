/**
 * Tool definitions for use with the Anthropic SDK
 *
 * These definitions follow the Anthropic tool schema format
 */
export interface ToolDefinition {
    name: string;
    description: string;
    input_schema: {
        type: "object";
        properties: Record<string, unknown>;
        required?: string[];
    };
}
export declare const TOOL_DEFINITIONS: ToolDefinition[];
//# sourceMappingURL=definitions.d.ts.map