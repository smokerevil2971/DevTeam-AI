/**
 * Queue Definitions
 */

import { Queue } from 'bullmq';
import { REDIS_CONNECTION } from './redis';

// Queue Names
export enum QueueName {
  AGENT_TASKS = 'agent-tasks',
  AGENT_MESSAGES = 'agent-messages',
  NOTIFICATIONS = 'user-notifications',
}

// Global Queue Manager
class QueueManager {
  private queues: Map<QueueName, Queue> = new Map();

  /**
   * Get or create a queue
   */
  getQueue(name: QueueName): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: REDIS_CONNECTION,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: 200, // Keep last 200 failed jobs
        },
      });

      this.queues.set(name, queue);
    }

    return this.queues.get(name)!;
  }

  /**
   * Close all queues
   */
  async closeAll() {
    await Promise.all(Array.from(this.queues.values()).map((q) => q.close()));
    this.queues.clear();
  }
}

export const queueManager = new QueueManager();

// Helper accessors
export const taskQueue = queueManager.getQueue(QueueName.AGENT_TASKS);
export const messageQueue = queueManager.getQueue(QueueName.AGENT_MESSAGES);
export const notificationQueue = queueManager.getQueue(QueueName.NOTIFICATIONS);
