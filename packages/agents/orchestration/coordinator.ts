/**
 * Agent Coordinator
 *
 * Central service for managing agent lifecycles, routing messages,
 * and orchestrating tasks via the queue system.
 */

import {
  AgentType,
  AgentTask,
  AgentMessage,
  ProjectContext,
  TaskPriority,
  TaskStatus,
} from '../types';
import { taskQueue, messageQueue } from './queues';
import { getRedisClient } from './redis';

export class AgentCoordinator {
  private redis = getRedisClient();
  private context: ProjectContext | null = null;

  constructor() {}

  /**
   * Initialize the coordinator with a project context
   */
  async initialize(context: ProjectContext) {
    this.context = context;
    console.log(`[Coordinator] Initialized for project: ${context.name}`);
    // Hydrate state from Redis if needed
  }

  /**
   * Assign a task to an agent
   * Enqueues the task in the 'agent-tasks' queue
   */
  async assignTask(task: AgentTask, context?: ProjectContext): Promise<string> {
    const ctx = context || this.context;
    if (!ctx) throw new Error('Coordinator not initialized with context');

    console.log(
      `[Coordinator] Assigning task "${task.title}" to ${task.assignedAgent}`,
    );

    const job = await taskQueue.add(
      'process-task',
      {
        taskId: task.id,
        projectId: ctx.id,
        task,
        context: ctx,
      },
      {
        priority: this.getPriorityScore(task.priority),
        jobId: task.id, // Deduplication by ID
      },
    );

    return job.id || '';
  }

  /**
   * Route a message between agents
   * Enqueues the message in the 'agent-messages' queue
   */
  async routeMessage(message: AgentMessage): Promise<string> {
    console.log(
      `[Coordinator] Routing message from ${message.senderAgent} to ${message.recipientAgent}`,
    );

    const job = await messageQueue.add('process-message', {
      messageId: message.id,
      projectId: message.projectId,
      message,
    });

    return job.id || '';
  }

  /**
   * Get the current status of an agent
   */
  async getAgentStatus(agentType: AgentType): Promise<string> {
    // In a real system, we might query Redis for heartbeats
    // For now, we assume they are available if workers are running
    return 'active';
  }

  /**
   * Convert TaskPriority enum to BullMQ priority score
   * Lower number = Higher priority in BullMQ
   */
  private getPriorityScore(priority: TaskPriority): number {
    switch (priority) {
      case TaskPriority.CRITICAL:
        return 1;
      case TaskPriority.HIGH:
        return 2;
      case TaskPriority.MEDIUM:
        return 3;
      case TaskPriority.LOW:
        return 4;
      default:
        return 3;
    }
  }

  /**
   * Create a new task object helper
   */
  createTask(
    title: string,
    description: string,
    agent: AgentType,
    priority: TaskPriority = TaskPriority.MEDIUM,
  ): AgentTask {
    return {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId: this.context?.id || '',
      title,
      description,
      assignedAgent: agent,
      status: TaskStatus.PENDING,
      priority,
      dependencies: [],
      createdAt: new Date(),
    };
  }
}

// Singleton instance
export const coordinator = new AgentCoordinator();
