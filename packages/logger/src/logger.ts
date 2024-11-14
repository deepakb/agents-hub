import pino from "pino";
import { LoggerConfig, LogLevel } from "./types";

export class Logger {
  private logger: pino.Logger;
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
    this.logger = pino({
      level: config.level,
      redact: config.redactKeys,
      transport: {
        target: "pino-pretty",
      },
    });
  }

  log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (level === "task-progress" || level === "agent-activity") {
      this.logger.info({ ...data, eventType: level }, message);
      return;
    }

    this.logger[
      level as "fatal" | "error" | "warn" | "info" | "debug" | "trace"
    ](data, message);
  }

  logTaskProgress(taskId: string, progress: number, status: string): void {
    this.log("task-progress", `Task ${taskId} progress: ${progress}%`, {
      taskId,
      progress,
      status,
    });
  }

  logAgentActivity(
    agentId: string,
    action: string,
    details?: Record<string, unknown>,
  ): void {
    this.log("agent-activity", `Agent ${agentId} ${action}`, {
      agentId,
      action,
      ...details,
    });
  }
}
