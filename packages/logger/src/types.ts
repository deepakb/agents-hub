type StandardLogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
type CustomLogLevel = 'task-progress' | 'agent-activity';
export type LogLevel = StandardLogLevel | CustomLogLevel;

export interface LoggerConfig {
  level: LogLevel;
  destinations: LogDestination[];
  redactKeys?: string[];
}

export interface LogDestination {
  type: 'console' | 'file' | 'external';
  options?: Record<string, unknown>;
}