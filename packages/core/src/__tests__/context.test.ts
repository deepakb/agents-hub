import { describe, it, expect, beforeEach } from 'vitest';
import { ContextManager } from '../context';

describe('ContextManager', () => {
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new ContextManager();
  });

  it('should create and retrieve context', () => {
    contextManager.createContext('task-1');
    const context = contextManager.getContext('task-1');
    expect(context).toEqual({});
  });

  it('should update context', () => {
    contextManager.createContext('task-1');
    contextManager.updateContext('task-1', { key: 'value' });
    const context = contextManager.getContext('task-1');
    expect(context).toEqual({ key: 'value' });
  });

  it('should throw error for non-existent context', () => {
    expect(() => contextManager.getContext('non-existent')).toThrow();
  });

  it('should delete context', () => {
    contextManager.createContext('task-1');
    contextManager.deleteContext('task-1');
    expect(() => contextManager.getContext('task-1')).toThrow();
  });
});