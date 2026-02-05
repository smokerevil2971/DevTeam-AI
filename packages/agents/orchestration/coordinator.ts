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
   * Track a project metric
   */
  async trackMetric(projectId: string, category: string, value: number) {
    const key = `metrics:${projectId}`;
    // Increment the metric
    await this.redis.hincrby(key, category, value);
    console.log(`[Coordinator] Metric: ${category} +${value}`);
  }

  /**
   * Log a file change event
   */
  async logFileChange(
    projectId: string,
    filePath: string,
    changeType: 'create' | 'modify' | 'delete',
    agentId: string,
  ) {
    const streamKey = `file-changes:${projectId}`;
    const entry = JSON.stringify({
      filePath,
      changeType,
      agentId,
      timestamp: new Date().toISOString(),
    });

    await this.redis.lpush(streamKey, entry);
    // Keep history of last 1000 changes
    await this.redis.ltrim(streamKey, 0, 999);

    console.log(
      `[Coordinator] File Change: ${changeType} ${filePath} by ${agentId}`,
    );
  }

  /**
   * Record a key architectural decision
   */
  async recordDecision(
    projectId: string,
    decision: string,
    rationale: string,
    agentId: string,
  ) {
    const key = `decisions:${projectId}`;
    const entry = JSON.stringify({
      decision,
      rationale,
      agentId,
      timestamp: new Date().toISOString(),
    });

    await this.redis.lpush(key, entry);
    console.log(`[Coordinator] Decision Recorded: ${decision}`);
  }

  // ============ USER INTERVENTION ============

  /**
   * Pause a specific agent
   */
  async pauseAgent(agentId: string): Promise<void> {
    const key = `agent:${agentId}:state`;
    await this.redis.hset(key, 'status', 'PAUSED');
    await this.redis.hset(key, 'pausedAt', new Date().toISOString());
    console.log(`[Coordinator] Agent ${agentId} paused`);
  }

  /**
   * Resume a specific agent
   */
  async resumeAgent(agentId: string): Promise<void> {
    const key = `agent:${agentId}:state`;
    await this.redis.hset(key, 'status', 'RUNNING');
    await this.redis.hdel(key, 'pausedAt');
    console.log(`[Coordinator] Agent ${agentId} resumed`);
  }

  /**
   * Pause all agents in a project
   */
  async pauseAllAgents(projectId: string): Promise<void> {
    const key = `project:${projectId}:paused`;
    await this.redis.set(key, '1');
    console.log(`[Coordinator] All agents in project ${projectId} paused`);
  }

  /**
   * Resume all agents in a project
   */
  async resumeAllAgents(projectId: string): Promise<void> {
    const key = `project:${projectId}:paused`;
    await this.redis.del(key);
    console.log(`[Coordinator] All agents in project ${projectId} resumed`);
  }

  /**
   * Check if an agent is paused
   */
  async isAgentPaused(agentId: string, projectId: string): Promise<boolean> {
    // Check project-wide pause
    const projectPaused = await this.redis.get(`project:${projectId}:paused`);
    if (projectPaused === '1') return true;

    // Check individual agent pause
    const agentStatus = await this.redis.hget(
      `agent:${agentId}:state`,
      'status',
    );
    return agentStatus === 'PAUSED';
  }

  /**
   * Inject guidance message to a specific agent (high priority)
   */
  async injectGuidance(
    agentId: string,
    projectId: string,
    message: string,
  ): Promise<void> {
    const guidanceTask: AgentTask = {
      id: `guidance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      title: 'User Guidance',
      description: message,
      assignedAgent: agentId as AgentType,
      status: TaskStatus.PENDING,
      priority: TaskPriority.CRITICAL, // Highest priority
      dependencies: [],
      createdAt: new Date(),
    };

    // Store guidance in Redis for immediate retrieval
    const key = `agent:${agentId}:guidance`;
    await this.redis.lpush(key, JSON.stringify(guidanceTask));

    console.log(`[Coordinator] Guidance injected to ${agentId}: ${message}`);
  }

  /**
   * Get pending guidance messages for an agent
   */
  async getGuidance(agentId: string): Promise<AgentTask[]> {
    const key = `agent:${agentId}:guidance`;
    const messages = await this.redis.lrange(key, 0, -1);

    if (messages.length > 0) {
      // Clear the guidance after retrieving
      await this.redis.del(key);
      return messages.map((msg) => JSON.parse(msg));
    }

    return [];
  }

  /**
   * Cancel a running task
   */
  async cancelTask(taskId: string, agentId: string): Promise<void> {
    const key = `task:${taskId}:status`;
    await this.redis.set(key, 'CANCELLED');

    // Log the cancellation
    await this.logActivity(
      this.context?.id || '',
      agentId,
      `Task ${taskId} cancelled by user`,
    );

    console.log(`[Coordinator] Task ${taskId} cancelled`);
  }

  /**
   * Reset agent state (for cleanup/recovery)
   */
  async resetAgentState(agentId: string): Promise<void> {
    const stateKey = `agent:${agentId}:state`;
    const guidanceKey = `agent:${agentId}:guidance`;

    await this.redis.del(stateKey);
    await this.redis.del(guidanceKey);

    console.log(`[Coordinator] Agent ${agentId} state reset`);
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
