import { describe, it, expect, vi, beforeEach } from "vitest";
import { AgentLifecycle } from "../lifecycle";
import { Logger } from "@agent-forge/logger";
import { AgentError } from "@agent-forge/error-handler";
import { AgentState } from "../types";

describe("AgentLifecycle", () => {
  let mockLogger: Logger;
  let lifecycle: AgentLifecycle;
  let state: AgentState;

  beforeEach(() => {
    mockLogger = {
      log: vi.fn(),
      logTaskProgress: vi.fn(),
      logAgentActivity: vi.fn(),
    } as unknown as Logger;

    state = {
      status: "idle",
      currentTasks: new Set(),
      lastActivity: new Date(),
    };

    lifecycle = new AgentLifecycle("test-agent", state, mockLogger);
  });

  it("should start agent successfully", async () => {
    await lifecycle.start();
    expect(state.status).toBe("idle");
    expect(mockLogger.logAgentActivity).toHaveBeenCalledWith(
      "test-agent",
      "started",
    );
  });

  it("should stop agent when no tasks are running", async () => {
    await lifecycle.start();
    await lifecycle.stop();
    expect(state.status).toBe("stopped");
    expect(mockLogger.logAgentActivity).toHaveBeenCalledWith(
      "test-agent",
      "stopped",
    );
  });

  it("should not stop agent with active tasks", async () => {
    await lifecycle.start();
    state.currentTasks.add("task-1");

    await expect(lifecycle.stop()).rejects.toThrow(AgentError);
  });

  it("should pause agent", async () => {
    await lifecycle.start();
    await lifecycle.pause();
    expect(state.status).toBe("paused");
    expect(mockLogger.logAgentActivity).toHaveBeenCalledWith(
      "test-agent",
      "paused",
    );
  });

  it("should resume agent", async () => {
    await lifecycle.start();
    await lifecycle.pause();
    await lifecycle.resume();
    expect(state.status).toBe("idle");
    expect(mockLogger.logAgentActivity).toHaveBeenCalledWith(
      "test-agent",
      "resumed",
    );
  });

  it("should perform health check", async () => {
    await lifecycle.start();
    const isHealthy = await lifecycle.healthCheck();
    expect(isHealthy).toBe(true);
    expect(mockLogger.logAgentActivity).toHaveBeenCalledWith(
      "test-agent",
      "health check",
      {
        status: "idle",
        healthy: true,
      },
    );
  });

  it("should report unhealthy status", async () => {
    state.status = "error";
    const isHealthy = await lifecycle.healthCheck();
    expect(isHealthy).toBe(false);
    expect(mockLogger.logAgentActivity).toHaveBeenCalledWith(
      "test-agent",
      "health check",
      {
        status: "error",
        healthy: false,
      },
    );
  });
});
