import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigManager } from '../config';
import { Logger } from '@agent-forge/logger';

describe('ConfigManager', () => {
  const mockLogger = {
    log: vi.fn(),
    logConfigChange: vi.fn(),
  } as unknown as Logger;

  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = new ConfigManager(mockLogger);
    vi.clearAllMocks();
  });

  it('should load default configuration', () => {
    const config = configManager.getConfig();
    expect(config).toEqual({
      environment: 'development',
      logLevel: 'info',
      maxRetries: 3,
      timeout: 5000,
    });
  });

  it('should update configuration', () => {
    configManager.updateConfig({
      logLevel: 'debug',
      maxRetries: 5,
    });

    const config = configManager.getConfig();
    expect(config.logLevel).toBe('debug');
    expect(config.maxRetries).toBe(5);
    expect(mockLogger.logConfigChange).toHaveBeenCalledWith({
      logLevel: 'debug',
      maxRetries: 5,
    });
  });

  it('should validate configuration updates', () => {
    expect(() =>
      configManager.updateConfig({
        logLevel: 'invalid-level',
      })
    ).toThrow();
  });

  it('should merge environment variables', () => {
    process.env.NODE_ENV = 'production';
    process.env.LOG_LEVEL = 'error';
    
    configManager.loadFromEnv();
    const config = configManager.getConfig();
    
    expect(config.environment).toBe('production');
    expect(config.logLevel).toBe('error');
  });

  it('should reset configuration to defaults', () => {
    configManager.updateConfig({
      logLevel: 'debug',
      maxRetries: 5,
    });

    configManager.resetConfig();
    const config = configManager.getConfig();

    expect(config).toEqual({
      environment: 'development',
      logLevel: 'info',
      maxRetries: 3,
      timeout: 5000,
    });
  });

  it('should validate configuration schema', () => {
    expect(() =>
      configManager.updateConfig({
        timeout: 'invalid-timeout',
      } as any)
    ).toThrow();
  });

  it('should handle partial configuration updates', () => {
    const originalConfig = configManager.getConfig();
    configManager.updateConfig({
      logLevel: 'debug',
    });

    const updatedConfig = configManager.getConfig();
    expect(updatedConfig.logLevel).toBe('debug');
    expect(updatedConfig.maxRetries).toBe(originalConfig.maxRetries);
    expect(updatedConfig.timeout).toBe(originalConfig.timeout);
  });
});