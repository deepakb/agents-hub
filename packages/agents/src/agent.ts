import { Logger } from '@nodejs-orchestration/logger';
import { AgentError } from '@nodejs-orchestration/error-handler';
import { AgentConfig, AgentState, TaskContext } from './types';
import { AgentLifecycle } from './lifecycle';

export class Agent {
  private state: AgentState;
  private lifecycle: AgentLifecycle;
  private taskContexts: Map<string, TaskContext>;

  constructor(
    public readonly id: string,
    public readonly name: string,
    private config: AgentConfig,
    private logger: Logger
  ) {
    this.state = {
      status: 'idle',
      currentTasks: new Set(),
      lastActivity: new Date(),
    };
    this.lifecycle = new AgentLifecycle(this.id, this.state, this.logger);
    this.taskContexts = new Map();
  }

  async init(): Promise<void> {
    try {
      await this.lifecycle.start();
      this.logger.logAgentActivity(this.id, 'initialized');
    } catch (error) {
      this.state.status = 'error';
      throw new AgentError(`Failed to initialize agent ${this.id}`, this.id);
    }
  }

  async startTask(taskId: string, data: Record<string, unknown>): Promise<void> {
    if (this.state.currentTasks.size >= this.config.maxConcurrentTasks) {
      throw new AgentError(`Agent ${this.id} is at maximum capacity`, this.id);
    }

    if (this.state.status !== 'idle') {
      throw new AgentError(
        `Agent ${this.id} is not available (status: ${this.state.status})`,
        this.id
      );
    }

    const taskContext: TaskContext = {
      taskId,
      data,
      startTime: new Date(),
      status: 'running',
    };

    this.taskContexts.set(taskId, taskContext);
    this.state.currentTasks.add(taskId);
    this.state.status = 'busy';
    this.state.lastActivity = new Date();

    this.logger.logAgentActivity(this.id, 'started task', {
      taskId,
      data,
    });
  }

  async completeTask(taskId: string, result: unknown): Promise<void> {
    const taskContext = this.taskContexts.get(taskId);
    if (!taskContext) {
      throw new AgentError(`Task ${taskId} not found for agent ${this.id}`, this.id);
    }

    taskContext.status = 'completed';
    taskContext.result = result;
    this.state.currentTasks.delete(taskId);
    this.state.lastActivity = new Date();

    if (this.state.currentTasks.size === 0) {
      this.state.status = 'idle';
    }

    this.logger.logAgentActivity(this.id, 'completed task', {
      taskId,
      result,
    });
  }

  async failTask(taskId: string, error: Error): Promise<void> {
    const taskContext = this.taskContexts.get(taskId);
    if (!taskContext) {
      throw new AgentError(`Task ${taskId} not found for agent ${this.id}`, this.id);
    }

    taskContext.status = 'failed';
    taskContext.error = error;
    this.state.currentTasks.delete(taskId);
    this.state.lastActivity = new Date();

    if (this.state.currentTasks.size === 0) {
      this.state.status = 'idle';
    }

    this.logger.logAgentActivity(this.id, 'task failed', {
      taskId,
      error,
    });

    throw new AgentError(`Task ${taskId} failed: ${error.message}`, this.id);
  }

  async pause(): Promise<void> {
    await this.lifecycle.pause();
  }

  async resume(): Promise<void> {
    await this.lifecycle.resume();
  }

  async stop(): Promise<void> {
    await this.lifecycle.stop();
  }

  async healthCheck(): Promise<boolean> {
    return await this.lifecycle.healthCheck();
  }

  getTaskContext(taskId: string): TaskContext | undefined {
    return this.taskContexts.get(taskId);
  }

  getState(): AgentState {
    return { ...this.state };
  }
}