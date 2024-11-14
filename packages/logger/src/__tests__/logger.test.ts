import { describe, it, expect, vi, beforeEach } from "vitest";
import { Logger } from "../logger";
import { LoggerConfig } from "../types";
import pino from "pino";

// Mock pino
vi.mock("pino", () => {
  return {
    default: vi.fn(() => ({
      fatal: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
    })),
  };
});

describe("Logger", () => {
  let logger: Logger;
  let mockPinoLogger: ReturnType<typeof pino>;

  const defaultConfig: LoggerConfig = {
    level: "info",
    destinations: [{ type: "console" }],
    redactKeys: ["password", "token"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    logger = new Logger(defaultConfig);
    mockPinoLogger = (logger as any).logger;
  });

  it("should initialize with correct configuration", () => {
    expect(pino).toHaveBeenCalledWith({
      level: defaultConfig.level,
      redact: defaultConfig.redactKeys,
      transport: {
        target: "pino-pretty",
      },
    });
  });

  it("should log standard levels correctly", () => {
    const testData = { key: "value" };
    const testMessage = "Test message";

    logger.log("error", testMessage, testData);
    expect(mockPinoLogger.error).toHaveBeenCalledWith(testData, testMessage);

    logger.log("info", testMessage, testData);
    expect(mockPinoLogger.info).toHaveBeenCalledWith(testData, testMessage);

    logger.log("debug", testMessage, testData);
    expect(mockPinoLogger.debug).toHaveBeenCalledWith(testData, testMessage);
  });

  it("should handle task progress logging", () => {
    const taskId = "task-123";
    const progress = 50;
    const status = "processing";

    logger.logTaskProgress(taskId, progress, status);
    expect(mockPinoLogger.info).toHaveBeenCalledWith(
      {
        taskId,
        progress,
        status,
        eventType: "task-progress",
      },
      `Task ${taskId} progress: ${progress}%`,
    );
  });

  it("should handle agent activity logging", () => {
    const agentId = "agent-123";
    const action = "started";
    const details = { taskId: "task-123" };

    logger.logAgentActivity(agentId, action, details);
    expect(mockPinoLogger.info).toHaveBeenCalledWith(
      {
        agentId,
        action,
        taskId: "task-123",
        eventType: "agent-activity",
      },
      `Agent ${agentId} ${action}`,
    );
  });

  it("should handle logging without data", () => {
    const testMessage = "Test message";

    logger.log("info", testMessage);
    expect(mockPinoLogger.info).toHaveBeenCalledWith(undefined, testMessage);
  });

  it("should respect redaction configuration", () => {
    const sensitiveData = {
      username: "test",
      password: "secret",
      token: "12345",
    };

    logger.log("info", "Sensitive data", sensitiveData);
    expect(pino).toHaveBeenCalledWith(
      expect.objectContaining({
        redact: ["password", "token"],
      }),
    );
  });

  it("should handle custom log levels correctly", () => {
    const customData = { key: "value" };

    logger.log("task-progress", "Custom event", customData);
    expect(mockPinoLogger.info).toHaveBeenCalledWith(
      { ...customData, eventType: "task-progress" },
      "Custom event",
    );

    logger.log("agent-activity", "Custom event", customData);
    expect(mockPinoLogger.info).toHaveBeenCalledWith(
      { ...customData, eventType: "agent-activity" },
      "Custom event",
    );
  });
});
