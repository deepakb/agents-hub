# Agent Forge

A powerful, modular system for orchestrating autonomous agents and workflows in Node.js applications.

## Features

- 🤖 **Agent Management**: Create and manage autonomous agents with defined capabilities
- 🔄 **Task Orchestration**: Coordinate complex task execution across multiple agents
- 🛠️ **Tool Registry**: Extensible tool system for agent capabilities
- 📋 **Workflow Engine**: Define and execute multi-step workflows with dependencies
- 🔁 **Retry Management**: Built-in error handling and retry mechanisms
- 📊 **Observability**: Comprehensive logging and monitoring

## Installation

```bash
npm install agent-forge
```

## Quick Start

```typescript
import { Orchestrator, Agent } from "@agent-forge/core";
import { ToolRegistry } from "@agent-forge/tools";
import { Logger } from "@agent-forge/logger";

// Initialize components
const logger = new Logger({ level: "info" });
const toolRegistry = new ToolRegistry();
const orchestrator = new Orchestrator();

// Create an agent
const agent = new Agent(
  "agent-1",
  "Processing Agent",
  {
    maxConcurrentTasks: 5,
  },
  logger,
);

// Register agent
orchestrator.registerAgent(agent);

// Assign a task
await orchestrator.assignTask({
  id: "task-1",
  type: "sync",
  status: "pending",
  agentId: "agent-1",
  data: {
    /* task data */
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

## Workflow Example

```typescript
import { WorkflowEngine } from "@agent-forge/workflow";

const workflow = {
  id: "data-processing",
  name: "Data Processing Pipeline",
  description: "Process and analyze data",
  steps: [
    {
      id: "fetch-data",
      name: "Fetch Data",
      toolId: "data-fetcher",
      params: { source: "api" },
    },
    {
      id: "analyze",
      name: "Analyze Data",
      toolId: "data-analyzer",
      params: {},
      dependsOn: ["fetch-data"],
    },
  ],
};

const engine = new WorkflowEngine(toolRegistry, retryManager, logger);
const results = await engine.executeWorkflow(workflow);
```

## Project Structure

```
packages/
├── core/           # Core orchestration functionality
├── agents/         # Agent management and lifecycle
├── tools/          # Tool registry and implementations
├── workflow/       # Workflow engine and templates
├── logger/         # Logging and monitoring
└── error-handler/  # Error handling and retry logic
```

## Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm run test

# Start development mode
npm run dev
```

## Documentation

- [API Reference](docs/api.md)
- [Architecture Overview](docs/architecture.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with TypeScript and Node.js
- Uses Turbo for monorepo management
- Implements industry best practices for orchestration systems
