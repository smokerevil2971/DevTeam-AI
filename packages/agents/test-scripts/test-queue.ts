/**
 * Test Queue script
 *
 * Verifies that jobs can be added to the queue and processed by workers.
 * Requires a running Redis instance.
 *
 * Run: npx tsx packages/agents/test-queue.ts
 */

import { taskQueue, queueManager } from '../orchestration/queues';
import { workerManager } from '../orchestration/workers';
import { AgentType, TaskStatus, TaskPriority, ProjectContext } from '../types';

async function testQueueSystem() {
  console.log('🧪 Starting Queue System Test...');

  // 1. Start Workers
  console.log('1️⃣  Starting Workers...');
  workerManager.startAll();

  // 2. Add a Job
  console.log('2️⃣  Adding a mock task to the queue...');

  const mockContext: ProjectContext = {
    id: 'test-project-1',
    name: 'Queue Test Project',
    description: 'Testing queues',
    techStack: [],
    files: [],
    tasks: [],
    recentMessages: [],
    agentStates: [],
  };

  const mockTask = {
    id: 'job-123',
    projectId: 'test-project-1',
    title: 'Test Queue Integration',
    description: 'Verify that workers process this task',
    assignedAgent: AgentType.BACKEND_DEV,
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dependencies: [],
    createdAt: new Date(),
  };

  const job = await taskQueue.add('process-task', {
    taskId: mockTask.id,
    projectId: mockContext.id,
    task: mockTask,
    context: mockContext,
  });

  console.log(`   Job added with ID: ${job.id}`);

  // 3. Wait for processing
  console.log('3️⃣  Waiting for result...');
  // We'll wait a bit to let the worker output logs
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // 4. Clean up
  console.log('4️⃣  Cleaning up...');
  await workerManager.stopAll();
  await queueManager.closeAll();

  console.log('✅ Queue Test Complete (Check logs above for "Job completed")');
  process.exit(0);
}

testQueueSystem().catch(console.error);
