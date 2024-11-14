import { z } from "zod";

export const ToolSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  execute: z
    .function()
    .args(z.record(z.unknown()))
    .returns(z.promise(z.unknown())),
  schema: z.object({
    input: z.record(z.unknown()),
    output: z.record(z.unknown()),
  }),
});

export type Tool = z.infer<typeof ToolSchema>;
