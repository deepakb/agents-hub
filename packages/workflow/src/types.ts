import { z } from 'zod';

export const WorkflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  toolId: z.string(),
  params: z.record(z.unknown()),
  dependsOn: z.array(z.string()).optional(),
  onError: z.object({
    retry: z.boolean().optional(),
    fallback: z.string().optional(),
  }).optional(),
});

export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  steps: z.array(WorkflowStepSchema),
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;