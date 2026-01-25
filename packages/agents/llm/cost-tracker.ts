/**
 * Cost tracking for LLM API usage
 */

// ============ PRICING DATA ============

// Prices per 1M tokens (update as needed)
export const MODEL_PRICING: Record<string, { input: number; output: number }> =
  {
    // Gemini
    'gemini-2.0-flash': { input: 0.075, output: 0.3 },
    'gemini-1.5-flash': { input: 0.075, output: 0.3 },
    'gemini-1.5-pro': { input: 1.25, output: 5.0 },

    // OpenAI
    'gpt-4-turbo-preview': { input: 10.0, output: 30.0 },
    'gpt-4o': { input: 2.5, output: 10.0 },
    'gpt-4o-mini': { input: 0.15, output: 0.6 },
    'gpt-3.5-turbo': { input: 0.5, output: 1.5 },

    // Claude
    'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
    'claude-3-opus-20240229': { input: 15.0, output: 75.0 },
    'claude-3-sonnet-20240229': { input: 3.0, output: 15.0 },
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  };

// ============ COST TRACKER ============

export interface UsageRecord {
  timestamp: Date;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  projectId?: string;
  agentType?: string;
}

export interface UsageSummary {
  totalCost: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  requestCount: number;
  byModel: Record<
    string,
    {
      cost: number;
      tokens: number;
      requests: number;
    }
  >;
  byAgent: Record<
    string,
    {
      cost: number;
      tokens: number;
      requests: number;
    }
  >;
}

export class CostTracker {
  private records: UsageRecord[] = [];
  private budgetLimit?: number;
  private onBudgetWarning?: (current: number, limit: number) => void;

  constructor(options?: {
    budgetLimit?: number;
    onBudgetWarning?: (current: number, limit: number) => void;
  }) {
    this.budgetLimit = options?.budgetLimit;
    this.onBudgetWarning = options?.onBudgetWarning;
  }

  /**
   * Record a usage event
   */
  record(
    model: string,
    promptTokens: number,
    completionTokens: number,
    options?: { projectId?: string; agentType?: string },
  ): UsageRecord {
    const cost = this.calculateCost(model, promptTokens, completionTokens);

    const record: UsageRecord = {
      timestamp: new Date(),
      model,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      cost,
      projectId: options?.projectId,
      agentType: options?.agentType,
    };

    this.records.push(record);

    // Check budget
    if (this.budgetLimit) {
      const totalCost = this.getTotalCost();
      if (totalCost >= this.budgetLimit * 0.8) {
        this.onBudgetWarning?.(totalCost, this.budgetLimit);
      }
    }

    return record;
  }

  /**
   * Calculate cost for tokens
   */
  calculateCost(
    model: string,
    promptTokens: number,
    completionTokens: number,
  ): number {
    const pricing = MODEL_PRICING[model] || { input: 1.0, output: 2.0 }; // Default pricing

    const inputCost = (promptTokens / 1_000_000) * pricing.input;
    const outputCost = (completionTokens / 1_000_000) * pricing.output;

    return inputCost + outputCost;
  }

  /**
   * Get total cost
   */
  getTotalCost(): number {
    return this.records.reduce((sum, r) => sum + r.cost, 0);
  }

  /**
   * Get usage summary
   */
  getSummary(filter?: { projectId?: string; since?: Date }): UsageSummary {
    let filtered = this.records;

    if (filter?.projectId) {
      filtered = filtered.filter((r) => r.projectId === filter.projectId);
    }
    if (filter?.since) {
      filtered = filtered.filter((r) => r.timestamp >= filter.since!);
    }

    const byModel: Record<
      string,
      { cost: number; tokens: number; requests: number }
    > = {};
    const byAgent: Record<
      string,
      { cost: number; tokens: number; requests: number }
    > = {};

    for (const record of filtered) {
      // By model
      if (!byModel[record.model]) {
        byModel[record.model] = { cost: 0, tokens: 0, requests: 0 };
      }
      byModel[record.model].cost += record.cost;
      byModel[record.model].tokens += record.totalTokens;
      byModel[record.model].requests++;

      // By agent
      if (record.agentType) {
        if (!byAgent[record.agentType]) {
          byAgent[record.agentType] = { cost: 0, tokens: 0, requests: 0 };
        }
        byAgent[record.agentType].cost += record.cost;
        byAgent[record.agentType].tokens += record.totalTokens;
        byAgent[record.agentType].requests++;
      }
    }

    return {
      totalCost: filtered.reduce((sum, r) => sum + r.cost, 0),
      totalTokens: filtered.reduce((sum, r) => sum + r.totalTokens, 0),
      promptTokens: filtered.reduce((sum, r) => sum + r.promptTokens, 0),
      completionTokens: filtered.reduce(
        (sum, r) => sum + r.completionTokens,
        0,
      ),
      requestCount: filtered.length,
      byModel,
      byAgent,
    };
  }

  /**
   * Get records for a time period
   */
  getRecords(since?: Date, until?: Date): UsageRecord[] {
    let filtered = this.records;

    if (since) {
      filtered = filtered.filter((r) => r.timestamp >= since);
    }
    if (until) {
      filtered = filtered.filter((r) => r.timestamp <= until);
    }

    return filtered;
  }

  /**
   * Clear old records
   */
  clearOldRecords(olderThan: Date): number {
    const initialCount = this.records.length;
    this.records = this.records.filter((r) => r.timestamp >= olderThan);
    return initialCount - this.records.length;
  }

  /**
   * Export records as JSON
   */
  export(): string {
    return JSON.stringify(this.records, null, 2);
  }

  /**
   * Import records from JSON
   */
  import(json: string): void {
    const records = JSON.parse(json);
    this.records.push(
      ...records.map((r: any) => ({
        ...r,
        timestamp: new Date(r.timestamp),
      })),
    );
  }
}

// ============ TOKEN UTILITIES ============

/**
 * Estimate tokens for a string (approximate)
 */
export function estimateTokens(text: string): number {
  // GPT-style tokenization approximation
  // Average ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}

/**
 * Estimate tokens for messages
 */
export function estimateMessageTokens(
  messages: Array<{ role: string; content: string }>,
): number {
  let tokens = 0;

  for (const message of messages) {
    // Add tokens for role and formatting
    tokens += 4; // <|role|>, whitespace, etc.
    tokens += estimateTokens(message.content);
  }

  // Add overhead for message structure
  tokens += 3; // priming tokens

  return tokens;
}
