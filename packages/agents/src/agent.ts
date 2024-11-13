import { Logger } from '@nodejs-orchestration/logger';
import { AgentError } from '@nodejs-orchestration/error-handler';
import { AgentConfig, AgentState, TaskContext } from './types';

export class Agent {
  private state: AgentState;
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
    this.taskContexts = new Map();
  }

  async init(): Promise<void> {
    try {
      this.logger.logAgentActivity(this.id, 'initialized');
      this.state.status = 'idle';
    } catch (error) {
      this.state.status = 'error';
      throw new AgentError(`Failed to initialize agent ${this.id}`, this.id);
    }
  }

  async startTask(taskId: string, data: Record<string, unknown>): Promise<void> {
    if (this.state.currentTasks.size >= this.config.maxConcurrentTasks) {
      throw new AgentError(`Agent ${this.id} is at maximum capacity`, this.id);
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
    this.state.currentTasks.delete(taskId);
    this.state.lastActivity = new Date();

    if (this.state.currentTasks.size === 0) {
      this.state.status = 'idle';
    }

    this.logger.logAgentActivity(this.id, 'completed task', {
      taskId,