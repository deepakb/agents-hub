import { RetryConfig, RetryResult } from "./types";

export class RetryManager {
  constructor(private config: RetryConfig) {}

  async retry<T>(
    operation: () => Promise<T>,
    context: { taskId: string; attempt: number },
  ): Promise<RetryResult<T>> {
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < this.config.maxAttempts) {
      try {
        const result = await operation();
        return { success: true, result, attempt };
      } catch (error) {
        lastError = error as Error;
        attempt++;

        if (attempt < this.config.maxAttempts) {
          const delay = this.calculateBackoff(attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    return {
      success: false,
      error: lastError!,
      attempt,
    };
  }

  private calculateBackoff(attempt: number): number {
    return Math.min(
      this.config.baseDelay * Math.pow(2, attempt - 1),
      this.config.maxDelay,
    );
  }
}
