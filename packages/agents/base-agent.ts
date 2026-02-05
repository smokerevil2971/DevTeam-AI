/**
 * Base Agent - Abstract base class for all AI agents
 */

import {
  AgentType,
  AgentStatus,
  AgentState,
  AgentConfig,
  AgentMessage,
  AgentTask,
  ProjectContext,
  MessageType,
  TaskStatus,
  LLMRequest,
  LLMResponse,
  AGENT_METADATA,
} from './types';
import { contextManager } from './core/context-manager';
import { coordinator } from './orchestration/coordinator';

export interface AgentEventHandlers {
  onStatusChange?: (status: AgentStatus) => void;
  onProgress?: (progress: number, message: string) => void;
  onMessage?: (message: AgentMessage) => void;
  onTaskUpdate?: (task: AgentTask) => void;
  onError?: (error: Error) => void;
}

export abstract class BaseAgent {
  protected type: AgentType;
  protected config: AgentConfig;
  protected state: AgentState;
  protected context: ProjectContext | null = null;
  protected eventHandlers: AgentEventHandlers = {};

  // Abstract LLM method - to be provided by concrete implementation
  protected abstract callLLM(request: LLMRequest): Promise<LLMResponse>;

  constructor(type: AgentType, config: Partial<AgentConfig> = {}) {
    this.type = type;

    const metadata = AGENT_METADATA[type];

    this.config = {
      type,
      model: config.model || 'gemini-2.0-flash',
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens || 4096,
      systemPrompt: config.systemPrompt || this.getDefaultSystemPrompt(),
      capabilities: metadata.capabilities,
    };

    this.state = {
      type,
      status: AgentStatus.IDLE,
      lastActivity: new Date(),
    };
  }

  // ============ PUBLIC API ============

  /**
   * Initialize agent with project context
   */
  public async initialize(context: ProjectContext): Promise<void> {
    this.context = context;
    this.setStatus(AgentStatus.ACTIVE);

    // Restore state if exists
    const existingState = context.agentStates.find((s) => s.type === this.type);
    if (existingState) {
      this.state = { ...this.state, ...existingState };
    }
  }

  /**
   * Process an incoming message
   */
  public async handleMessage(
    message: AgentMessage,
  ): Promise<AgentMessage | null> {
    if (!this.context) {
      throw new Error('Agent not initialized with project context');
    }

    this.setStatus(AgentStatus.WORKING);
    this.updateProgress(0, 'Processing message...');

    try {
      const response = await this.processMessage(message);
      this.setStatus(AgentStatus.ACTIVE);
      return response;
    } catch (error) {
      this.setStatus(AgentStatus.ERROR);
      this.eventHandlers.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Process an assigned task
   */
  public async handleTask(task: AgentTask): Promise<void> {
    if (!this.context) {
      throw new Error('Agent not initialized with project context');
    }

    this.state.currentTaskId = task.id;
    this.state.currentTask = task.title;
    this.setStatus(AgentStatus.WORKING);
    this.updateProgress(0, `Starting: ${task.title}`);

    try {
      await this.processTask(task);
      this.state.currentTaskId = undefined;
      this.state.currentTask = undefined;
      this.setStatus(AgentStatus.ACTIVE);
    } catch (error) {
      this.setStatus(AgentStatus.ERROR);
      this.eventHandlers.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Get current agent state
   */
  public getState(): AgentState {
    return { ...this.state };
  }

  /**
   * Set event handlers
   */
  public setEventHandlers(handlers: AgentEventHandlers): void {
    this.eventHandlers = handlers;
  }

  /**
   * Pause the agent
   */
  public pause(): void {
    this.setStatus(AgentStatus.WAITING);
  }

  /**
   * Resume the agent
   */
  public resume(): void {
    this.setStatus(AgentStatus.ACTIVE);
  }

  // ============ PROTECTED METHODS ============

  /**
   * Process a message - to be implemented by subclasses
   */
  protected async processMessage(
    message: AgentMessage,
  ): Promise<AgentMessage | null> {
    // Build conversation history
    const conversationHistory = this.buildConversationHistory(message);

    // Call LLM
    const response = await this.callLLM({
      systemPrompt: this.config.systemPrompt,
      messages: conversationHistory,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
    });

    // Create response message
    return this.createResponse(message, response.content);
  }

  /**
   * Process a task - to be implemented by subclasses
   */
  /**
   * Process a task - to be implemented by subclasses
   */
  protected async processTask(task: AgentTask): Promise<void> {
    // Check for guidance before starting
    await this.checkGuidance();

    // Default implementation - subclasses should override
    this.updateProgress(10, 'Analyzing task requirements...');

    // Check if paused
    await this.checkPauseState();

    // Build task prompt
    const taskPrompt = await this.buildTaskPrompt(task);

    this.updateProgress(30, 'Generating solution...');

    // Check if paused before expensive LLM call
    await this.checkPauseState();

    // Check for task cancellation
    if (await this.isTaskCancelled(task.id)) {
      console.log(`[${this.type}] Task ${task.id} was cancelled`);
      return;
    }

    // Call LLM
    const response = await this.callLLM({
      systemPrompt: this.config.systemPrompt,
      messages: [{ role: 'user', content: taskPrompt }],
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
    });

    this.updateProgress(80, 'Processing response...');

    // Check if paused before applying changes
    await this.checkPauseState();

    // Parse and apply the response
    await this.applyTaskResult(task, response.content);

    this.updateProgress(100, 'Task completed');
  }

  /**
   * Check if the agent is paused and wait if needed
   */
  protected async checkPauseState(): Promise<void> {
    if (!this.context) return;

    while (await coordinator.isAgentPaused(this.type, this.context.id)) {
      console.log(`[${this.type}] Paused, waiting...`);
      this.setStatus(AgentStatus.WAITING);
      // Wait 2 seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Resume status if we were waiting
    if (this.state.status === AgentStatus.WAITING) {
      this.setStatus(AgentStatus.WORKING);
    }
  }

  /**
   * Check for and process guidance messages
   */
  protected async checkGuidance(): Promise<void> {
    const guidanceTasks = await coordinator.getGuidance(this.type);

    if (guidanceTasks.length > 0) {
      for (const guidance of guidanceTasks) {
        console.log(
          `[${this.type}] Processing user guidance: ${guidance.description}`,
        );

        // Update context or state based on guidance
        // This is a hook for subclasses to override if needed
        await this.handleGuidance(guidance);
      }
    }
  }

  /**
   * Handle guidance message - can be overridden by subclasses
   */
  protected async handleGuidance(guidance: AgentTask): Promise<void> {
    // Default implementation: log guidance
    console.log(`[${this.type}] Received guidance: ${guidance.description}`);
    // Subclasses can override to modify behavior based on guidance
  }

  /**
   * Check if a task has been cancelled
   */
  protected async isTaskCancelled(taskId: string): Promise<boolean> {
    const redis = coordinator['redis']; // Access via property
    const status = await redis.get(`task:${taskId}:status`);
    return status === 'CANCELLED';
  }

  /**
   * Build conversation history for LLM
   */
  protected buildConversationHistory(
    currentMessage: AgentMessage,
  ): Array<{ role: 'user' | 'assistant'; content: string }> {
    const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    if (this.context?.recentMessages) {
      for (const msg of this.context.recentMessages.slice(-10)) {
        if (msg.senderType === 'user') {
          history.push({ role: 'user', content: msg.content });
        } else if (msg.senderAgent === this.type) {
          history.push({ role: 'assistant', content: msg.content });
        }
      }
    }

    // Add current message
    history.push({ role: 'user', content: currentMessage.content });

    return history;
  }

  /**
   * Build task prompt
   */
  protected async buildTaskPrompt(task: AgentTask): Promise<string> {
    if (!this.context) {
      return `## Task: ${task.title}\n\n${task.description}`;
    }

    return contextManager.buildContext(task, this.context, {
      maxTokens: this.config.maxTokens,
      includeHistory: true,
      includeFiles: true,
    });
  }

  /**
   * Apply task result - to be overridden by subclasses
   */
  protected async applyTaskResult(
    task: AgentTask,
    result: string,
  ): Promise<void> {
    // Default: just log the result
    // Subclasses should implement actual file creation, code generation, etc.
    console.log(
      `[${this.type}] Task ${task.id} result:`,
      result.substring(0, 200),
    );
  }

  /**
   * Create response message
   */
  protected createResponse(
    originalMessage: AgentMessage,
    content: string,
  ): AgentMessage {
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId: originalMessage.projectId,
      threadId: originalMessage.threadId,
      senderType: 'agent',
      senderAgent: this.type,
      recipientAgent: originalMessage.senderAgent,
      content,
      messageType: this.detectMessageType(content),
      createdAt: new Date(),
    };
  }

  /**
   * Detect message type from content
   */
  protected detectMessageType(content: string): MessageType {
    if (content.includes('```')) {
      return MessageType.CODE;
    }
    if (content.toLowerCase().includes('review')) {
      return MessageType.REVIEW_REQUEST;
    }
    return MessageType.TEXT;
  }

  /**
   * Get default system prompt for this agent type
   */
  protected getDefaultSystemPrompt(): string {
    const metadata = AGENT_METADATA[this.type];
    return `You are ${metadata.name}, an AI agent specialized in ${metadata.description.toLowerCase()}.

Your capabilities include:
${metadata.capabilities.map((c) => `- ${c.name}: ${c.description}`).join('\n')}

Communication guidelines:
- Be clear and concise
- Provide actionable insights
- Ask clarifying questions when needed
- Collaborate effectively with other agents
- Focus on your area of expertise`;
  }

  /**
   * Set agent status
   */
  protected setStatus(status: AgentStatus): void {
    this.state.status = status;
    this.state.lastActivity = new Date();
    this.eventHandlers.onStatusChange?.(status);
  }

  /**
   * Update progress
   */
  protected updateProgress(progress: number, message: string): void {
    this.state.progress = progress;
    this.eventHandlers.onProgress?.(progress, message);

    // Report to coordinator
    if (this.state.currentTaskId) {
      coordinator
        .updateTaskProgress(this.state.currentTaskId, progress, message)
        .catch((err) =>
          console.error(
            `[BaseAgent] Failed to update progress: ${err.message}`,
          ),
        );
    }
  }

  /**
   * Send a message to another agent
   */
  protected sendMessage(
    content: string,
    recipient?: AgentType,
    type: MessageType = MessageType.TEXT,
  ): AgentMessage {
    const message: AgentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId: this.context?.id || '',
      senderType: 'agent',
      senderAgent: this.type,
      recipientAgent: recipient,
      content,
      messageType: type,
      createdAt: new Date(),
    };

    this.eventHandlers.onMessage?.(message);
    return message;
  }
}
