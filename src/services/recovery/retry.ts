// FitSync Retry Service
// Implements client-side automatic retries with Exponential Backoff and Jitter

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 500,
  maxDelayMs: 3000
};

export const RetryService = {
  /**
   * Run asynchronous task with exponential backoff retries
   */
  async runWithRetry<T>(
    taskFn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    let delay = finalConfig.initialDelayMs;

    for (let attempt = 1; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        return await taskFn();
      } catch (err) {
        if (attempt === finalConfig.maxRetries) {
          throw err;
        }

        // Add randomized jitter calculation
        const jitter = Math.random() * 100;
        const delayWithJitter = Math.min(delay * 2 + jitter, finalConfig.maxDelayMs);
        
        console.warn(`[Retry Engine] Attempt ${attempt} failed. Retrying in ${Math.round(delayWithJitter)}ms...`);
        await new Promise((res) => setTimeout(res, delayWithJitter));
        delay = delayWithJitter;
      }
    }

    throw new Error('Retry limit reached');
  }
};
export default RetryService;
