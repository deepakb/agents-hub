import { describe, it, expect, vi } from 'vitest';
import { Agent } from '../agent';
import { Logger } from '@nodejs-orchestration/logger';

describe('Agent', () => {
  const mockLogger = {
    log: vi.fn(),
    logTaskProgress: vi.fn(),
    logAgentActivity: vi.fn(),
  } as unknown as Logger;

  it('should initialize correctly', () => {
    const agent = new Agent('test-agent', 'Test Agent', {}, mockLogger);
    expect(agent.id).toBe('test-agent');
    expect(agent.name).toBe('Test Agent');
  });

  it('should handle lifecycle events', async () => {
    const agent = new Agent('test-agent', 'Test Agent', {}, mockLogger);
    
    await agent.init();
    expect(mockLogger.logAgentActivity).toHaveBeenCalledWith('test-agent', 'initialized');

    await agent.startTask('task-1', { data: 'test' });
    expect(mockLogger.logAgentActivity).toHaveBeenCalledWith('test-agent', 'started task', {
      taskId: 'task-1',
      data: { data: 'test' },