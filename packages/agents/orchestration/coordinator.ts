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
  private readonly LOCK_TTL = 300; // 5 minutes

  constructor() {}

  /**
   * Initialize the coordinator with a project context
   */
  async initialize(context: ProjectContext) {
    this.context = context;
    console.log(`[Coordinator] Initialized for project: ${context.name}`);
    // Hydrate state from Redis if needed
  }

  // ============ CONFLICT DETECTION ============

  /**
   * Try to acquire a lock for a file
   * Returns true if lock acquired, false if already locked by another
   */
  async acquireFileLock(
    projectId: string,
    filePath: string,
    agentId: string,
  ): Promise<boolean> {
    const key = `lock:${projectId}:${filePath}`;
    // NX: Set only if not exists, EX: Expire in seconds
    const result = await this.redis.set(
      key,
      agentId,
      'EX',
      this.LOCK_TTL,
      'NX',
    );

    if (result === 'OK') {
      console.log(`[Coordinator] Lock acquired for ${filePath} by ${agentId}`);
      return true;
    }

    const holder = await this.redis.get(key);
    if (holder === agentId) {
      // Refresh lock
      await this.redis.expire(key, this.LOCK_TTL);
      return true;
    }

    console.warn(
      `[Coordinator] Lock failed for ${filePath}. Held by ${holder}`,
    );
    return false;
  }

  /**
   * Release a file lock
   */
  async releaseFileLock(
    projectId: string,
    filePath: string,
    agentId: string,
  ): Promise<boolean> {
    const key = `lock:${projectId}:${filePath}`;
    const holder = await this.redis.get(key);

    if (holder === agentId) {
      await this.redis.del(key);
      console.log(`[Coordinator] Lock released for ${filePath} by ${agentId}`);
      return true;
    }

    return false;
  }

  /**
   * Check if a file operation would conflict
   */
  async checkConflict(
    projectId: string,
    filePath: string,
    agentId: string,
  ): Promise<boolean> {
    const key = `lock:${projectId}:${filePath}`;
    const holder = await this.redis.get(key);
    return holder !== null && holder !== agentId;
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
  /**
   * Get the current status of an agent
   */
  async getAgentStatus(agentType: AgentType): Promise<string> {
    // In a real system, we might query Redis for heartbeats
    // For now, we assume they are available if workers are running
    return 'active';
  }

  // ============ PROGRESS TRACKING ============

  /**
   * Update the progress of a task
   * Stores progress in Redis and triggers events (e.g. WebSocket)
   */
  async updateTaskProgress(taskId: string, progress: number, message: string) {
    // Store in Redis
    const key = `progress:${taskId}`;
    await this.redis.hset(key, {
      progress: progress.toString(),
      message,
      updatedAt: new Date().toISOString(),
    });

    // Set expiry for progress key (e.g. 24 hours)
    await this.redis.expire(key, 86400);

    console.log(
      `[Coordinator] Progress ${Math.round(progress)}% for ${taskId}: ${message}`,
    );

    // TODO: Broadcast via WebSocket
  }

  /**
   * Log an activity to the project's activity stream
   */
  async logActivity(projectId: string, agentId: string, activity: string) {
    const streamKey = `activity:${projectId}`;
    const entry = JSON.stringify({
      agentId,
      activity,
      timestamp: new Date().toISOString(),
    });

    // Push to list
    await this.redis.lpush(streamKey, entry);
    // Trim to last 100 activities
    await this.redis.ltrim(streamKey, 0, 99);

    console.log(`[Coordinator] Activity: [${agentId}] ${activity}`);
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
