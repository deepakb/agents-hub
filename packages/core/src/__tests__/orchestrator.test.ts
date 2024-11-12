import { describe, it, expect, beforeEach } from 'vitest';
import { Orchestrator } from '../orchestrator';
import { Agent, Task } from '../types';

describe('Orchestrator', () => {
  let orchestrator: Orchestrator;

  beforeEach(() => {
    orchestrator = new Orchestrator();
  });

  it('should register an agent', () => {
    const agent: Agent = {
      id: 'agent-1',
      name: 'Test Agent',
      tools: []
    };
    orchestrator.registerAgent(agent);
    expect(orchestrator['agents'].get('agent-1')).toEqual(agent);
  });

  it('should assign task to agent', async () => {
    const agent: Agent = {
      id: 'agent-1',
      name: 'Test Agent',
      tools: []
    };
    orchestrator.registerAgent(agent);

    const task: Task = {
      id: 'task-1',
      type: 'sync',
      status: 'pending',
      agentId: 'agent-1',
      data: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await orchestrator.assignTask(task);
    const updatedTask = orchestrator['tasks'].get('task-1');
    expect(updatedTask?.status).toBe('running');
  });

  it('should throw error when assigning task to non-existent agent', async () => {
    const task: Task = {
      id: 'task-1',
      type: 'sync',
      status: 'pending',
      agentId: 'non-existent',
      data: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await expect(orchestrator.assignTask(task)).rejects.toThrow('Agent non-existent not found');
  });
});
