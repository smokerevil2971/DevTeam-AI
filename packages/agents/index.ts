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

// Package version
export const AGENT_VERSION = '0.1.0';
