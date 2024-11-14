export class ContextManager {
  private contexts: Map<string, Record<string, unknown>>;

  constructor() {
    this.contexts = new Map();
  }

  createContext(taskId: string): void {
    this.contexts.set(taskId, {});
  }

  getContext(taskId: string): Record<string, unknown> {
    const context = this.contexts.get(taskId);
    if (!context) {
      throw new Error(`Context not found for task ${taskId}`);
    }
    return context;
  }

  updateContext(taskId: string, data: Record<string, unknown>): void {
    const context = this.getContext(taskId);
    this.contexts.set(taskId, { ...context, ...data });
  }

  deleteContext(taskId: string): void {
    this.contexts.delete(taskId);
  }
}
