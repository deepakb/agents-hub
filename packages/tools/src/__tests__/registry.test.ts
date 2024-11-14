import { describe, it, expect, beforeEach } from 'vitest';
import { ToolRegistry } from '../registry';
import { ToolError } from '@agent-forge/error-handler';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  it('should register and retrieve a tool', () => {
    const tool = {
      id: 'test-tool',
      name: 'Test Tool',
      description: 'A test tool',
      execute: async (params: Record<string, unknown>) => params,
      schema: {
        input: {},
        output: {}
      }
    };

    registry.registerTool(tool);
    const retrievedTool = registry.getTool('test-tool');
    expect(retrievedTool).toEqual(tool);
  });

  it('should throw error when getting non-existent tool', () => {
    expect(() => registry.getTool('non-existent')).toThrow(ToolError);
  });

  it('should execute tool with parameters', async () => {
    const tool = {
      id: 'test-tool',
      name: 'Test Tool',
      description: 'A test tool',
      execute: async (params: Record<string, unknown>) => params,
      schema: {
        input: {},
        output: {}
      }
    };

    registry.registerTool(tool);
    const result = await registry.executeTool('test-tool', { test: 'value' });
    expect(result).toEqual({ test: 'value' });
  });

  it('should list all registered tools', () => {
    const tool1 = {
      id: 'tool1',
      name: 'Tool 1',
      description: 'Tool 1',
      execute: async () => ({}),
      schema: {
        input: {},
        output: {}
      }
    };

    const tool2 = {
      id: 'tool2',
      name: 'Tool 2',
      description: 'Tool 2',
      execute: async () => ({}),
      schema: {
        input: {},
        output: {}
      }
    };

    registry.registerTool(tool1);
    registry.registerTool(tool2);

    const tools = registry.listTools();
    expect(tools).toHaveLength(2);
    expect(tools).toContainEqual(tool1);
    expect(tools).toContainEqual(tool2);
  });
});
