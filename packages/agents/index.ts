/**
 * @devteam/agents - AI Agent Framework
 *
 * This package provides the core framework for the multi-agent AI system.
 */

// Types
export {
  AgentType,
  AgentStatus,
  AgentCapability,
  AgentMetadata,
  AgentState,
  AgentMessage,
  AgentTask,
  AgentConfig,
  ProjectContext,
  ProjectFile,
  MessageType,
  TaskStatus,
  TaskPriority,
  LLMProvider,
  LLMRequest,
  LLMMessage,
  LLMResponse,
  AGENT_CAPABILITIES,
  AGENT_METADATA,
} from './types';

// Base Agent
export { BaseAgent, AgentEventHandlers } from './base-agent';

// Registry
export {
  AgentRegistry,
  AgentInstance,
  RegistryEventHandlers,
  getAgentRegistry,
  resetAgentRegistry,
} from './registry';

// Prompts
export { AGENT_PROMPTS, getAgentPrompt, getContextualPrompt } from './prompts';

// LLM
export {
  // Providers
  LLMProviderInterface,
  LLMProviderConfig,
  BaseLLMProvider,
  GeminiProvider,
  OpenAIProvider,
  ClaudeProvider,
  ProviderType,
  createProvider,
  // Retry
  RetryOptions,
  withRetry,
  retryable,
  // Rate Limiter
  RateLimiter,
  PROVIDER_RATE_LIMITS,
  createRateLimiter,
  // Cost Tracker
  CostTracker,
  UsageRecord,
  UsageSummary,
  MODEL_PRICING,
  estimateTokens,
  estimateMessageTokens,
  // Client
  LLMClient,
  LLMClientConfig,
  createLLMClient,
  createClientFromEnv,
} from './llm';

// Agents
export {
  ProjectManagerAgent,
  TaskBreakdown,
  ProjectSummary,
  ClarifyingQuestion,
  StatusUpdate,
} from './agents';

// Package version
export const AGENT_VERSION = '0.1.0';
