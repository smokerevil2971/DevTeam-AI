/**
 * Rate limiter for LLM API calls
 */

interface RateLimitConfig {
  requestsPerMinute: number;
  tokensPerMinute?: number;
  requestsPerDay?: number;
}

interface QueuedRequest<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  tokens?: number;
}

export class RateLimiter {
  private config: RateLimitConfig;
  private requestTimestamps: number[] = [];
  private tokenTimestamps: Array<{ time: number; tokens: number }> = [];
  private dailyCount = 0;
  private dailyResetTime: number;
  private queue: QueuedRequest<any>[] = [];
  private processing = false;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.dailyResetTime = this.getNextMidnight();
  }

  /**
   * Execute a function with rate limiting
   */
  async execute<T>(fn: () => Promise<T>, estimatedTokens?: number): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject, tokens: estimatedTokens });
      this.processQueue();
    });
  }

  /**
   * Check current rate limit status
   */
  getStatus(): {
    requestsRemaining: number;
    tokensRemaining: number | null;
    dailyRemaining: number | null;
    resetInMs: number;
  } {
    this.cleanupOldTimestamps();

    const now = Date.now();
    const requestsUsed = this.requestTimestamps.length;
    const tokensUsed = this.tokenTimestamps.reduce(
      (sum, t) => sum + t.tokens,
      0,
    );

    return {
      requestsRemaining: Math.max(
        0,
        this.config.requestsPerMinute - requestsUsed,
      ),
      tokensRemaining: this.config.tokensPerMinute
        ? Math.max(0, this.config.tokensPerMinute - tokensUsed)
        : null,
      dailyRemaining: this.config.requestsPerDay
        ? Math.max(0, this.config.requestsPerDay - this.dailyCount)
        : null,
      resetInMs: 60000 - (now - (this.requestTimestamps[0] || now)),
    };
  }

  /**
   * Wait until rate limit allows a request
   */
  async waitForAvailability(tokens?: number): Promise<void> {
    while (!this.canMakeRequest(tokens)) {
      await this.sleep(100);
      this.cleanupOldTimestamps();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue[0];

      // Wait for rate limit availability
      await this.waitForAvailability(request.tokens);

      // Record the request
      const now = Date.now();
      this.requestTimestamps.push(now);

      if (request.tokens) {
        this.tokenTimestamps.push({ time: now, tokens: request.tokens });
      }

      this.dailyCount++;
      this.checkDailyReset();

      // Execute the request
      try {
        const result = await request.fn();
        request.resolve(result);
      } catch (error) {
        request.reject(error as Error);
      }

      this.queue.shift();
    }

    this.processing = false;
  }

  private canMakeRequest(tokens?: number): boolean {
    this.cleanupOldTimestamps();

    // Check requests per minute
    if (this.requestTimestamps.length >= this.config.requestsPerMinute) {
      return false;
    }

    // Check tokens per minute
    if (this.config.tokensPerMinute && tokens) {
      const tokensUsed = this.tokenTimestamps.reduce(
        (sum, t) => sum + t.tokens,
        0,
      );
      if (tokensUsed + tokens > this.config.tokensPerMinute) {
        return false;
      }
    }

    // Check daily limit
    if (this.config.requestsPerDay) {
      this.checkDailyReset();
      if (this.dailyCount >= this.config.requestsPerDay) {
        return false;
      }
    }

    return true;
  }

  private cleanupOldTimestamps(): void {
    const oneMinuteAgo = Date.now() - 60000;

    this.requestTimestamps = this.requestTimestamps.filter(
      (t) => t > oneMinuteAgo,
    );
    this.tokenTimestamps = this.tokenTimestamps.filter(
      (t) => t.time > oneMinuteAgo,
    );
  }

  private checkDailyReset(): void {
    const now = Date.now();
    if (now >= this.dailyResetTime) {
      this.dailyCount = 0;
      this.dailyResetTime = this.getNextMidnight();
    }
  }

  private getNextMidnight(): number {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============ PROVIDER RATE LIMITS ============

export const PROVIDER_RATE_LIMITS: Record<string, RateLimitConfig> = {
  gemini: {
    requestsPerMinute: 60,
    tokensPerMinute: 60000,
    requestsPerDay: 1500,
  },
  openai: {
    requestsPerMinute: 60,
    tokensPerMinute: 90000,
  },
  claude: {
    requestsPerMinute: 60,
    tokensPerMinute: 100000,
  },
};

/**
 * Create a rate limiter for a specific provider
 */
export function createRateLimiter(provider: string): RateLimiter {
  const config = PROVIDER_RATE_LIMITS[provider] || { requestsPerMinute: 30 };
  return new RateLimiter(config);
}
