import { Tool, ToolSchema } from "./types";
import { ToolError } from "@agent-forge/error-handler";

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  registerTool(tool: Tool): void {
    const validatedTool = ToolSchema.parse(tool);
    this.tools.set(validatedTool.id, validatedTool);
  }

  getTool(toolId: string): Tool {
    const tool = this.tools.get(toolId);
    if (!tool) {
      throw new ToolError(`Tool ${toolId} not found`, toolId);
    }
    return tool;
  }

  async executeTool(
    toolId: string,
    params: Record<string, unknown>,
  ): Promise<unknown> {
    const tool = this.getTool(toolId);
    return await tool.execute(params);
  }

  listTools(): Tool[] {
    return Array.from(this.tools.values());
  }
}
