import { AgentState } from "./types";
import { Logger } from "@agent-forge/logger";
import { AgentError } from "@agent-forge/error-handler";

export class AgentLifecycle {
  constructor(
    private agentId: string,
    private state: AgentState,
    private logger: Logger,
  ) {}

  async start(): Promise<void> {
    try {
      this.state.status = "idle";
      this.state.lastActivity = new Date();
      this.logger.logAgentActivity(this.agentId, "started");
    } catch (error) {
      this.state.status = "error";
      throw new AgentError(
        `Failed to start agent ${this.agentId}`,
        this.agentId,
      );
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.state.currentTasks.size > 0) {
        throw new AgentError(
          `Cannot stop agent ${this.agentId} with active tasks`,
          this.agentId,
        );
      }
      this.state.status = "stopped";
      this.logger.logAgentActivity(this.agentId, "stopped");
    } catch (error) {
      throw new AgentError(
        `Failed to stop agent ${this.agentId}`,
        this.agentId,
      );
    }
  }

  async pause(): Promise<void> {
    try {
      this.state.status = "paused";
      this.logger.logAgentActivity(this.agentId, "paused");
    } catch (error) {
      throw new AgentError(
        `Failed to pause agent ${this.agentId}`,
        this.agentId,
      );
    }
  }

  async resume(): Promise<void> {
    try {
      this.state.status = "idle";
      this.logger.logAgentActivity(this.agentId, "resumed");
    } catch (error) {
      throw new AgentError(
        `Failed to resume agent ${this.agentId}`,
        this.agentId,
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const isHealthy = this.state.status !== "error";
      this.logger.logAgentActivity(this.agentId, "health check", {
        status: this.state.status,
        healthy: isHealthy,
      });
      return isHealthy;
    } catch (error) {
      this.logger.logAgentActivity(this.agentId, "health check failed", {
        error,
      });
      return false;
    }
  }
}
