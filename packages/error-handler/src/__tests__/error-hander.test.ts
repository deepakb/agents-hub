import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AgentError, ModelError, ToolError, RetryManager } from '../index';

describe('Custom Errors', () => {
  it('should create AgentError with correct properties', () => {
    const error = new AgentError('Agent failed', 'agent-123');
    expect(error.message).toBe('Agent failed');
    expect(error.agentId).toBe('agent-123');
    expect(error.name).toBe('AgentError');
    expect(error instanceof Error).toBe(true);
  });

  it('should create ModelError with correct properties', () => {
    const error = new ModelError('Model failed', 'model-123');
    expect(error.message).toBe('Model failed');
    expect(error.modelId).toBe('model-123');
    expect(error.name).toBe('ModelError');
    expect(error instanceof Error).toBe(true);
  });

  it('should create ToolError with correct properties', () => {
    const error = new ToolError('Tool failed', 'tool-123');
    expect(error.message).toBe('Tool failed');
    expect(error.toolId).toBe('tool-123');
    expect(error.name).toBe('ToolError');
    expect(error instanceof Error).toBe(true);
  });
});

describe('RetryManager', () => {
  const config = {
    maxAttempts: 3,
    baseDelay: 100,
    maxDelay: 1000
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should successfully execute operation on first try', async () => {
    const retryManager = new RetryManager(config);
    const operation = vi.fn().mockResolvedValue('success');

    const result = await retryManager.retry(operation, { taskId: 'task-1', attempt: 1 });

    expect(result).toEqual({
      success: true,
      result: 'success',
      attempt: 0
    });
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry failed operation up to maxAttempts', async () => {
    const retryManager = new RetryManager(config);
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('Failed'))
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce('success');

    const result = await retryManager.retry(operation, { taskId: 'task-1', attempt: 1 });

    expect(result).toEqual({
      success: true,
      result: 'success',
      attempt: 2
    });
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should return failure after maxAttempts', async () => {
    const retryManager = new RetryManager(config);
    const error = new Error('Failed');
    const operation = vi.fn().mockRejectedValue(error);

    const result = await retryManager.retry(operation, { taskId: 'task-1', attempt: 1 });

    expect(result).toEqual({
      success: false,
      error,
      attempt: 3
    });
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should implement exponential backoff', async () => {
    const retryManager = new RetryManager(config);
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('Failed'))
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce('success');

    const retryPromise = retryManager.retry(operation, { taskId: 'task-1', attempt: 1 });
    
    // First attempt fails immediately
    await vi.runAllTimersAsync();
    // Should wait 100ms before second attempt
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 100);
    
    await vi.runAllTimersAsync();
    // Should wait 200ms before third attempt
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 200);

    const result = await retryPromise;
    expect(result.success).toBe(true);
  });

  it('should respect maxDelay configuration', async () => {
    const retryManager = new RetryManager({
      maxAttempts: 5,
      baseDelay: 500,
      maxDelay: 1000
    });

    const delay = retryManager['calculateBackoff'](4);
    expect(delay).toBe(1000); // Should be capped at maxDelay
  });
});