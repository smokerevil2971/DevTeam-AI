/**
 * Agent Registry - Manages all agent instances
 */

import {
  AgentType,
  AgentStatus,
  AgentState,
  ProjectContext,
  AGENT_METADATA,
  AgentConfig,
} from './types';
import { BaseAgent, AgentEventHandlers } from './base-agent';

export interface AgentInstance {
  type: AgentType;
  agent: BaseAgent;
  status: AgentStatus;
  createdAt: Date;
}

export interface RegistryEventHandlers {
  onAgentStatusChange?: (type: AgentType, status: AgentStatus) => void;
  onAgentMessage?: (type: AgentType, message: any) => void;
  onAgentError?: (type: AgentType, error: Error) => void;
}

export class AgentRegistry {
  private agents: Map<AgentType, AgentInstance> = new Map();
  private eventHandlers: RegistryEventHandlers = {};
  private projectContext: ProjectContext | null = null;

  /**
   * Register an agent with the registry
   */
  public register(agent: BaseAgent, type: AgentType): void {
    if (this.agents.has(type)) {
      console.warn(`Agent ${type} is already registered. Replacing...`);
    }

    // Set up event handlers for the agent
    agent.setEventHandlers({
      onStatusChange: (status) => {
        this.updateAgentStatus(type, status);
        this.eventHandlers.onAgentStatusChange?.(type, status);
      },
      onMessage: (message) => {
        this.eventHandlers.onAgentMessage?.(type, message);
      },
      onError: (error) => {
        this.eventHandlers.onAgentError?.(type, error);
      },
    });

    this.agents.set(type, {
      type,
      agent,
      status: AgentStatus.IDLE,
      createdAt: new Date(),
    });
  }

  /**
   * Unregister an agent
   */
  public unregister(type: AgentType): void {
    this.agents.delete(type);
  }

  /**
   * Get an agent by type
   */
  public get(type: AgentType): BaseAgent | undefined {
    return this.agents.get(type)?.agent;
  }

  /**
   * Get all registered agents
   */
  public getAll(): AgentInstance[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get all active agents
   */
  public getActive(): AgentInstance[] {
    return this.getAll().filter(
      (a) =>
        a.status === AgentStatus.ACTIVE || a.status === AgentStatus.WORKING,
    );
  }

  /**
   * Get all idle agents
   */
  public getIdle(): AgentInstance[] {
    return this.getAll().filter((a) => a.status === AgentStatus.IDLE);
  }

  /**
   * Get all agents by status
   */
  public getByStatus(status: AgentStatus): AgentInstance[] {
    return this.getAll().filter((a) => a.status === status);
  }

  /**
   * Check if an agent is registered
   */
  public has(type: AgentType): boolean {
    return this.agents.has(type);
  }

  /**
   * Get agent states for all registered agents
   */
  public getStates(): AgentState[] {
    return this.getAll().map((instance) => instance.agent.getState());
  }

  /**
   * Initialize all agents with project context
   */
  public async initializeAll(context: ProjectContext): Promise<void> {
    this.projectContext = context;

    const initPromises = this.getAll().map(async (instance) => {
      try {
        await instance.agent.initialize(context);
      } catch (error) {
        console.error(`Failed to initialize agent ${instance.type}:`, error);
        this.updateAgentStatus(instance.type, AgentStatus.ERROR);
      }
    });

    await Promise.all(initPromises);
  }

  /**
   * Update agent status
   */
  private updateAgentStatus(type: AgentType, status: AgentStatus): void {
    const instance = this.agents.get(type);
    if (instance) {
      instance.status = status;
    }
  }

  /**
   * Set registry event handlers
   */
  public setEventHandlers(handlers: RegistryEventHandlers): void {
    this.eventHandlers = handlers;
  }

  /**
   * Get agent metadata (static info, no instance required)
   */
  public static getMetadata(type: AgentType) {
    return AGENT_METADATA[type];
  }

  /**
   * Get all agent types
   */
  public static getAllTypes(): AgentType[] {
    return Object.values(AgentType);
  }

  /**
   * Get agent metadata for all types
   */
  public static getAllMetadata() {
    return AGENT_METADATA;
  }
}

// Singleton instance for global access
let globalRegistry: AgentRegistry | null = null;

/**
 * Get or create the global agent registry
 */
export function getAgentRegistry(): AgentRegistry {
  if (!globalRegistry) {
    globalRegistry = new AgentRegistry();
  }
  return globalRegistry;
}

/**
 * Reset the global registry (useful for testing)
 */
export function resetAgentRegistry(): void {
  globalRegistry = null;
}
