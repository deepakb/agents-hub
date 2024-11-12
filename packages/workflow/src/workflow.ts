import { Workflow, WorkflowStep } from './types';
import { ToolRegistry } from '@nodejs-orchestration/tools';
import { RetryManager } from '@nodejs-orchestration/error-handler';
import { Logger } from '@nodejs-orchestration/logger';

export class WorkflowEngine {
  constructor(
    private toolRegistry: ToolRegistry,
    private retryManager: RetryManager,
    private logger: Logger
  ) {}

  async executeWorkflow(workflow: Workflow, context: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};
    const completed = new Set<string>();

    const steps = this.sortStepsByDependency(workflow.steps);

    for (const step of steps) {
      try {
        const stepResult = await this.executeStep(step, context, results);
        results[step.id] = stepResult;
        completed.add(step.id);
      } catch (error) {
        this.logger.log('error', `Step ${step.id} failed`, { error });
        if (step.onError?.fallback) {
          const fallbackStep = workflow.steps.find(s => s.id === step.onError?.fallback);
          if (fallbackStep) {
            const fallbackResult = await this.executeStep(fallbackStep, context, results);
            results[step.id] = fallbackResult;
            completed.add(step.id);
          }
        } else {
          throw error;
        }
      }
    }

    return results;
  }

  private async executeStep(
    step: WorkflowStep,
    context: Record<string, unknown>,
    previousResults: Record<string, unknown>
  ): Promise<unknown> {
    const params = {
      ...step.params,
      context,
      previousResults,
    };

    if (step.onError?.retry) {
      return await this.retryManager.retry(
        () => this.toolRegistry.executeTool(step.toolId, params),
        { taskId: step.id, attempt: 1 }
      );
    }

    return await this.toolRegistry.executeTool(step.toolId, params);
  }

  private sortStepsByDependency(steps: WorkflowStep[]): WorkflowStep[] {
    const sorted: WorkflowStep[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (step: WorkflowStep) => {
      if (visiting.has(step.id)) {
        throw new Error(`Circular dependency detected at step ${step.id}`);
      }
      if (visited.has(step.id)) return;

      visiting.add(step.id);

      if (step.dependsOn) {
        for (const depId of step.dependsOn) {
          const depStep = steps.find(s => s.id === depId);
          if (depStep) {
            visit(depStep);
          }
        }
      }

      visiting.delete(step.id);
      visited.add(step.id);
      sorted.push(step);
    };

    for (const step of steps) {
      if (!visited.has(step.id)) {
        visit(step);
      }
    }

    return sorted;
  }
}