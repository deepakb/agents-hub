import { z } from "zod";

export const AgentConfigSchema = z.object({
  maxConcurrentTasks: z.number().default(5),
  capabilities: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).optional(),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

export interface AgentState {
  status: "idle" | "busy" | "error" | "stopped" | "paused";
  currentTasks: Set<string>;
  lastActivity: Date;
}

export interface TaskContext {
  taskId: string;
  data: Record<string, unknown>;
  startTime: Date;
  status: "running" | "completed" | "failed";
  result?: unknown;
  error?: Error;
}
