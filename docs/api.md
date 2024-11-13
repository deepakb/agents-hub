# API Reference

## Core Components

### Orchestrator

The main orchestration engine that manages agents and tasks.

```typescript
class Orchestrator {
  registerAgent(agent: Agent): void
  assignTask(task: Task): Promise<void>
}
```

#### Usage

```typescript
const orchestrator = new Orchestrator();
orchestrator.registerAgent(agent);
await orchestrator.assignTask(task);
```

### Agent

Represents an autonomous agent capable of executing tasks.

```typescript
interface Agent {
  id: string
  name: string
  description?: string
  tools: string[]
}
```

### Task

Represents a unit of work to be executed.

```typescript
interface Task {
  id: string
  type: 'sync' | 'async' | 'batch'
  status: 'pending' | 'running' | 'completed' | 'failed'
  agentId: string
  data: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}
```

## Tools Package

### ToolRegistry

Manages available tools and their execution.

```typescript
class ToolRegistry {
  registerTool(tool: Tool): void
  getTool(toolId: string): Tool
  executeTool(toolId: string, params: Record<string, unknown>): Promise<unknown>
  listTools(): Tool[]
}
```

### Tool Interface

```typescript
interface Tool {
  id: string
  name: string
  description: string
  execute: (params: Record<string, unknown>) => Promise<unknown>
  schema: {
    input: Record<string, unknown>
    output: Record<string, unknown>
  }
}
```

## Workflow Package

### WorkflowEngine

Executes workflows composed of multiple steps.

```typescript
class WorkflowEngine {
  executeWorkflow(
    workflow: Workflow,
    context?: Record<string, unknown>
  ): Promise<Record<string, unknown>>
}
```

### Workflow Definition

```typescript
interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
}

interface WorkflowStep {
  id: string
  name: string
  toolId: string
  params: Record<string, unknown>
  dependsOn?: string[]
  onError?: {
    retry?: boolean
    fallback?: string
  }
}
```