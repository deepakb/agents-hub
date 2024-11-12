import { z } from 'zod';

export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tools: z.array(z.string()),
});

export type Agent = z.infer<typeof AgentSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  type: z.enum(['sync', 'async', 'batch']),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  agentId: z.string(),
  data: z.record(z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Task = z.infer<typeof TaskSchema>;