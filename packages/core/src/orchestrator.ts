import { Agent, Task } from "./types";
import { ContextManager } from "./context";

export class Orchestrator {
  private agents: Map<string, Agent>;
  private tasks: Map<string, Task>;
  private contextManager: ContextManager;

  constructor() {
    this.agents = new Map();
    this.tasks = new Map();
    this.contextManager = new ContextManager();
  }

  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  async assignTask(task: Task): Promise<void> {
    this.tasks.set(task.id, task);
    const agent = this.agents.get(task.agentId);

    if (!agent) {
      throw new Error(`Agent ${task.agentId} not found`);
    }

    // Set up task context
    this.contextManager.createContext(task.id);

    try {
      // Update task status
      this.tasks.set(task.id, {
        ...task,
        status: "running",
        updatedAt: new Date(),
      });

      // Task execution logic will be implemented here
    } catch (error) {
      this.tasks.set(task.id, {
        ...task,
        status: "failed",
        updatedAt: new Date(),
      });
      throw error;
    }
  }
}
