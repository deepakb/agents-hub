import { describe, it, expect, vi, beforeEach } from "vitest";
import { Agent } from "../agent";
import { Logger } from "@agent-forge/logger";
import { AgentError } from "@agent-forge/error-handler";

describe("Agent", () => {
  let mockLogger: Logger;
  let agent: Agent;

  beforeEach(() => {
    mockLogger = {
      log: vi.fn(),
      logTaskProgress: vi.fn(),
      logAgentActivity: vi.fn(),
    } as unknown as Logger;

    agent = new Agent(
      "test-agent",
      "Test Agent",
      { maxConcurrentTasks: 2 },
      mockLogger,
    );
  });

  it("should initialize correctly", () => {
    expect(agent.id).toBe("test-agent");
    expect(agent.name).toBe("Test Agent");
  });

  it("should initialize agent state", async () => {
    await agent.init();
    expect(mockLogger.logAgentActivity).toHaveBeenCalledWith(
      "test-agent",
      "initialized",
    );
  });

  it("should handle task assignment", async () => {
    await agent.init();
    await agent.startTask("task-1", { data: "test" });

    expect(mockLogger.logAgentActivity).toHaveBeenCalledWith(
      "test-agent",
      "started task",
      {
        taskId: "task-1",
        data: { data: "test" },
      },
    );
  });

  it("should enforce max concurrent tasks limit", async () => {
    await agent.init();
    await agent.startTask("task-1", { data: "test1" });
    await agent.startTask("task-2", { data: "test2" });

    await expect(agent.startTask("task-3", { data: "test3" })).rejects.toThrow(
      AgentError,
    );
  });

  it("should complete tasks successfully", async () => {
    await agent.init();
    await agent.startTask("task-1", { data: "test" });

    const result = { status: "success" };
    await agent.completeTask("task-1", result);

    expect(mockLogger.logAgentActivity).toHaveBeenCalledWith(
      "test-agent",
      "completed task",
      {
        taskId: "task-1",
        result,
      },
    );
  });

  it("should handle task failure", async () => {
    await agent.init();
    await agent.startTask("task-1", { data: "test" });

    const error = new Error("Task failed");
    await expect(agent.failTask("task-1", error)).rejects.toThrow(AgentError);

    expect(mockLogger.logAgentActivity).toHaveBeenCalledWith(
      "test-agent",
      "task failed",
      {
        taskId: "task-1",
        error,
      },
    );
  });
});
