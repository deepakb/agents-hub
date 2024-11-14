export class AgentError extends Error {
  constructor(
    message: string,
    public agentId: string,
  ) {
    super(message);
    this.name = "AgentError";
  }
}

export class ModelError extends Error {
  constructor(
    message: string,
    public modelId: string,
  ) {
    super(message);
    this.name = "ModelError";
  }
}

export class ToolError extends Error {
  constructor(
    message: string,
    public toolId: string,
  ) {
    super(message);
    this.name = "ToolError";
  }
}
