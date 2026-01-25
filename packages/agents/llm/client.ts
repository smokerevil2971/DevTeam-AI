/**
 * Unified LLM Client - Combines all LLM utilities into a single client
 */

import {
  LLMProviderInterface,
  LLMProviderConfig,
  createProvider,
  ProviderType,
} from './provider';
import { withRetry, RetryOptions } from './retry';
import { RateLimiter, createRateLimiter } from './rate-limiter';
import { CostTracker, estimateTokens } from './cost-tracker';
import { LLMRequest, LLMResponse } from '../types';

// ============ CLIENT CONFIG ============

export interface LLMClientConfig {
  provider: ProviderType;
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;

  // Rate limiting
  enableRateLimiting?: boolean;

  // Retry options
  enableRetry?: boolean;
  retryOptions?: RetryOptions;

  // Cost tracking
  enableCostTracking?: boolean;
  budgetLimit?: number;

  // Callbacks
  onError?: (error: Error) => void;
  onBudgetWarning?: (current: number, limit: number) => void;
}

// ============ LLM CLIENT ============

export class LLMClient {
  private provider: LLMProviderInterface;
  private rateLimiter?: RateLimiter;
  private costTracker?: CostTracker;
  private config: LLMClientConfig;
  private retryOptions: RetryOptions;

  constructor(config: LLMClientConfig) {
    this.config = config;

    // Create provider
    this.provider = createProvider(config.provider, {
      apiKey: config.apiKey,
      model: config.model,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
    });

    // Set up rate limiting
    if (config.enableRateLimiting !== false) {
      this.rateLimiter = createRateLimiter(config.provider);
    }

    // Set up cost tracking
    if (config.enableCostTracking !== false) {
      this.costTracker = new CostTracker({
        budgetLimit: config.budgetLimit,
        onBudgetWarning: config.onBudgetWarning,
      });
    }

    // Set up retry options
    this.retryOptions = {
      maxRetries: 3,
      initialDelayMs: 1000,
      ...config.retryOptions,
      onRetry: (error, attempt, delay) => {
        console.log(
          `[LLM] Retry attempt ${attempt} after ${delay}ms: ${error.message}`,
        );
        config.retryOptions?.onRetry?.(error, attempt, delay);
      },
    };
  }

  /**
   * Send a completion request
   */
  async complete(
    request: LLMRequest,
    options?: {
      projectId?: string;
      agentType?: string;
    },
  ): Promise<LLMResponse> {
    const execute = async () => {
      const response = await this.provider.complete(request);

      // Track cost
      if (this.costTracker) {
        this.costTracker.record(
          this.config.model || this.provider.config.model,
          response.usage.promptTokens,
          response.usage.completionTokens,
          options,
        );
      }

      return response;
    };

    // Apply rate limiting if enabled
    if (this.rateLimiter) {
      const estimatedTokens = this.estimateRequestTokens(request);

      return this.rateLimiter.execute(async () => {
        // Apply retry if enabled
        if (this.config.enableRetry !== false) {
          return withRetry(execute, this.retryOptions);
        }
        return execute();
      }, estimatedTokens);
    }

    // No rate limiting
    if (this.config.enableRetry !== false) {
      return withRetry(execute, this.retryOptions);
    }
    return execute();
  }

  /**
   * Send a streaming completion request
   */
  async *stream(
    request: LLMRequest,
  ): AsyncGenerator<string, LLMResponse, unknown> {
    const estimatedTokens = this.estimateRequestTokens(request);

    // Wait for rate limit if enabled
    if (this.rateLimiter) {
      await this.rateLimiter.waitForAvailability(estimatedTokens);
    }

    let fullContent = '';
    let promptTokens = estimatedTokens;

    try {
      for await (const chunk of this.provider.stream(request)) {
        fullContent += chunk;
        yield chunk;
      }
    } catch (error) {
      this.config.onError?.(error as Error);
      throw error;
    }

    const completionTokens = estimateTokens(fullContent);

    // Track cost
    if (this.costTracker) {
      this.costTracker.record(
        this.config.model || this.provider.config.model,
        promptTokens,
        completionTokens,
      );
    }

    return {
      content: fullContent,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
      finishReason: 'stop',
    };
  }

  /**
   * Simple completion helper
   */
  async chat(
    systemPrompt: string,
    userMessage: string,
    options?: {
      maxTokens?: number;
      temperature?: number;
      projectId?: string;
      agentType?: string;
    },
  ): Promise<string> {
    const response = await this.complete(
      {
        systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
        maxTokens: options?.maxTokens,
        temperature: options?.temperature,
      },
      {
        projectId: options?.projectId,
        agentType: options?.agentType,
      },
    );

    return response.content;
  }

  /**
   * Get cost tracking summary
   */
  getCostSummary() {
    return this.costTracker?.getSummary();
  }

  /**
   * Get rate limit status
   */
  getRateLimitStatus() {
    return this.rateLimiter?.getStatus();
  }

  /**
   * Check if provider is available
   */
  async isAvailable(): Promise<boolean> {
    return this.provider.isAvailable();
  }

  /**
   * Estimate tokens for a request
   */
  private estimateRequestTokens(request: LLMRequest): number {
    let tokens = 0;

    if (request.systemPrompt) {
      tokens += estimateTokens(request.systemPrompt);
    }

    for (const msg of request.messages) {
      tokens += estimateTokens(msg.content) + 4; // +4 for role/formatting
    }

    return tokens;
  }
}

// ============ FACTORY FUNCTION ============

/**
 * Create an LLM client with common defaults
 */
export function createLLMClient(
  provider: ProviderType,
  apiKey: string,
  options?: Partial<LLMClientConfig>,
): LLMClient {
  return new LLMClient({
    provider,
    apiKey,
    enableRateLimiting: true,
    enableRetry: true,
    enableCostTracking: true,
    ...options,
  });
}

/**
 * Create a client from environment variables
 */
export function createClientFromEnv(): LLMClient {
  // Check for available API keys
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const claudeKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

  if (geminiKey) {
    return createLLMClient('gemini', geminiKey, {
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    });
  }

  if (claudeKey) {
    return createLLMClient('claude', claudeKey, {
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
    });
  }

  if (openaiKey) {
    return createLLMClient('openai', openaiKey, {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    });
  }

  throw new Error(
    'No LLM API key found. Set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY',
  );
}
