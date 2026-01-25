/**
 * Worker Definitions
 */

import { Worker, Job } from 'bullmq';
import { QueueName } from './queues';
import { getRedisClient } from './redis';
import { handleTask } from './handlers/task-handler';

// Worker configuration
const WORKER_OPTIONS = {
  // Use a dedicated connection for workers (blocking client)
  connection: getRedisClient('subscriber'),
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000,
  },
};

export class WorkerManager {
  private workers: Map<QueueName, Worker> = new Map();

  /**
   * Start all workers
   */
  startAll() {
    this.startTaskWorker();
    this.startMessageWorker();
    this.startNotificationWorker();
    console.log('👷 Workers started');
  }

  /**
   * Start Agent Task Worker
   * Processes tasks assigned to agents like 'frontend_dev', 'backend_dev', etc.
   */
  private startTaskWorker() {
    const worker = new Worker(
      QueueName.AGENT_TASKS,
      async (job: Job) => {
        console.log(`[TaskWorker] Processing job ${job.id}: ${job.name}`);
        return handleTask(job);
      },
      WORKER_OPTIONS,
    );

    this.setupWorkerListeners(worker, 'TaskWorker');
    this.workers.set(QueueName.AGENT_TASKS, worker);
  }

  /**
   * Start Agent Message Worker
   * Handles inter-agent communication
   */
  private startMessageWorker() {
    const worker = new Worker(
      QueueName.AGENT_MESSAGES,
      async (job: Job) => {
        console.log(`[MessageWorker] Processing message ${job.id}`);
        // TODO: Implement message handler
        return { processed: true };
      },
      WORKER_OPTIONS,
    );

    this.setupWorkerListeners(worker, 'MessageWorker');
    this.workers.set(QueueName.AGENT_MESSAGES, worker);
  }

  /**
   * Start Notification Worker
   * Handles user notifications
   */
  private startNotificationWorker() {
    const worker = new Worker(
      QueueName.NOTIFICATIONS,
      async (job: Job) => {
        console.log(`[NotificationWorker] Sending notification ${job.id}`);
        // TODO: Implement notification handler (WebSockets)
        return { sent: true };
      },
      WORKER_OPTIONS,
    );

    this.setupWorkerListeners(worker, 'NotificationWorker');
    this.workers.set(QueueName.NOTIFICATIONS, worker);
  }

  /**
   * Setup common worker listeners
   */
  private setupWorkerListeners(worker: Worker, name: string) {
    worker.on('completed', (job) => {
      console.log(`[${name}] Job ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
      console.error(`[${name}] Job ${job?.id} failed: ${err.message}`);
    });

    worker.on('error', (err) => {
      console.error(`[${name}] Worker error: ${err.message}`);
    });
  }

  /**
   * Stop all workers
   */
  async stopAll() {
    await Promise.all(Array.from(this.workers.values()).map((w) => w.close()));
    this.workers.clear();
    console.log('👷 Workers stopped');
  }
}

export const workerManager = new WorkerManager();
