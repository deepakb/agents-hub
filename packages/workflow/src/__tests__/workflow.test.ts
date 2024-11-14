import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkflowEngine } from '../workflow';
import { ToolRegistry } from '@agent-forge/tools';
import { RetryManager } from '@agent-forge/error-handler';
import { Logger } from '@agent-forge/logger';

describe('WorkflowEngine', () => {
  const mockToolRegistry = {
    executeTool: vi.fn()
  } as unknown as ToolRegistry;

  const mockRetryManager = {
    retry: vi.fn()
  } as unknown as RetryManager;

  const mockLogger = {
    log: vi.fn()
  } as unknown as Logger;

  let workflowEngine: WorkflowEngine;

  beforeEach(() => {
    workflowEngine = new WorkflowEngine(mockToolRegistry, mockRetryManager, mockLogger);
    vi.clearAllMocks();
  });

  it('should execute workflow steps in order', async () => {
    const workflow = {
      steps: [
        {
          id: 'step1',
          toolId: 'tool1',
          params: {}
        },
        {
          id: 'step2',
          toolId: 'tool2',
          params: {},
          dependsOn: ['step1']
        }
      ]
    };

    mockToolRegistry.executeTool.mockResolvedValueOnce('result1');
    mockToolRegistry.executeTool.mockResolvedValueOnce('result2');

    const results = await workflowEngine.executeWorkflow(workflow);
    expect(results).toEqual({
      step1: 'result1',
      step2: 'result2'
    });
  });

  it('should handle step failures and fallbacks', async () => {
    const workflow = {
      steps: [
        {
          id: 'step1',
          toolId: 'tool1',
          params: {},
          onError: {
            fallback: 'fallbackStep'
          }
        },
        {
          id: 'fallbackStep',
          toolId: 'tool2',
          params: {}
        }
      ]
    };

    mockToolRegistry.executeTool
      .mockRejectedValueOnce(new Error('Step failed'))
      .mockResolvedValueOnce('fallback result');

    const results = await workflowEngine.executeWorkflow(workflow);
    expect(results.step1).toBe('fallback result');
    expect(mockLogger.log).toHaveBeenCalledWith('error', 'Step step1 failed', expect.any(Object));
  });
});
