import { Agent } from '@agent-forge/agents';
import { Tool } from '@agent-forge/tools';
import { Logger } from '@agent-forge/logger';

export class SpecializedAgent extends Agent {
  private transferFunctions: Map<string, () => SpecializedAgent>;

  constructor(
    id: string,
    name: string,
    private instructions: string,
    private tools: Tool[],
    logger: Logger
  ) {
    super(id, name, {}, logger);
    this.transferFunctions = new Map();
  }

  addTransferFunction(targetAgentId: string, transferFn: () => SpecializedAgent): void {
    this.transferFunctions.set(targetAgentId, transferFn);
  }

  async transfer(targetAgentId: string): Promise<SpecializedAgent | null> {
    const transferFn = this.transferFunctions.get(targetAgentId);
    if (!transferFn) {
      return null;
    }
    return transferFn();
  }

  getInstructions(): string {
    return this.instructions;
  }

  getTools(): Tool[] {
    return this.tools;
  }
} 