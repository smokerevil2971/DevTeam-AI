/**
 * Test Progress Tracking
 *
 * Verifies that agents report progress and the Coordinator stores it in Redis.
 *
 * Run: pnpm exec tsx test-scripts/test-progress.ts
 */

import { coordinator } from '../orchestration/coordinator';
import {
  ProjectContext,
  AgentTask,
  TaskStatus,
  TaskPriority,
  AgentType,
  AgentStatus,
} from '../types';
import { BackendDeveloperAgent } from '../agents/backend-dev';
import { workerManager } from '../orchestration/workers';
import { queueManager } from '../orchestration/queues';
import { getRedisClient, closeRedisConnections } from '../orchestration/redis';

// Mock LLM Client
class MockLLMClient {
  async complete(request: any) {
    return {
      content: 'OK',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };
  }
}

async function testProgress() {
  console.log('📈 Starting Progress Tracking Test...');

  // 1. Initialize
  const mockContext: ProjectContext = {
    id: 'test-progress-proj',
    name: 'Progress Test',
    description: 'Testing progress',
    techStack: [],
    files: [],
    tasks: [],
    recentMessages: [],
    agentStates: [],
  };
  await coordinator.initialize(mockContext);

  // 2. Setup Agent
  console.log('2️⃣  Initializing Agent...');
  const agent = new BackendDeveloperAgent(new MockLLMClient() as any);
  await agent.initialize(mockContext);

  // 3. Create Task
  const task: AgentTask = {
    id: 'task-prog-1',
    projectId: mockContext.id,
    title: 'Progress Test Task',
    description: 'Do work',
    assignedAgent: AgentType.BACKEND_DEV,
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dependencies: [],
    createdAt: new Date(),
  };

  // 4. Run Task (Simulate) and Check Redis updates using "spy" logic
  // Since agent.handleTask doesn't return intermediate progress, we'll spy on Redis
  // or checks side effects after a small delay if the agent was running in background.
  // But here we are calling handleTask directly which is async.
  // We'll trust the agent's internal calls, so we will "mock" the processTask
  // to force specific progress updates if we want to test exact values,
  // OR we just rely on the default behavior which emits 0, 10, 30, 80, 100.

  console.log('3️⃣  Running Agent Task (Simulated)...');
  const redis = getRedisClient();

  // Monitor progress updates
  const checkProgress = async () => {
    const data = await redis.hgetall(`progress:${task.id}`);
    if (data && data.progress) {
      console.log(`   Redis Progress Spy: ${data.progress}% - ${data.message}`);
    }
  };

  // Start progress checker interval
  const interval = setInterval(checkProgress, 100);

  // Run the task
  await agent.handleTask(task);

  clearInterval(interval);

  // 5. Verify Final State
  console.log('4️⃣  Verifying Final State...');
  const finalData = await redis.hgetall(`progress:${task.id}`);
  console.log('   Final Redis State:', finalData);

  if (finalData.progress === '100') {
    console.log('✅ Progress reached 100%');
  } else {
    console.error('❌ Progress did not reach 100%');
  }

  // 6. Test Activity Log
  console.log('5️⃣  Testing Activity Log...');
  await coordinator.logActivity(
    mockContext.id,
    'backend_dev',
    'Test Activity Log',
  );
  const logs = await redis.lrange(`activity:${mockContext.id}`, 0, -1);
  console.log(`   Activity Logs (${logs.length}):`);
  logs.forEach((l) => console.log(`   - ${l}`));

  if (logs.length > 0 && logs[0].includes('Test Activity Log')) {
    console.log('✅ Activity logged successfully');
  } else {
    console.error('❌ Activity logging failed');
  }

  // 7. Test Extended Metrics
  console.log('6️⃣  Testing Extended Metrics (6.4 Extended)...');

  // Metrics
  await coordinator.trackMetric(mockContext.id, 'tokens_used', 150);
  await coordinator.trackMetric(mockContext.id, 'tokens_used', 50);
  const metrics = await redis.hgetall(`metrics:${mockContext.id}`);
  console.log('   Metrics:', metrics);
  if (metrics.tokens_used === '200') {
    console.log('✅ Metrics tracked successfully');
  } else {
    console.error('❌ Metrics tracking failed');
  }

  // File Changes
  await coordinator.logFileChange(
    mockContext.id,
    '/src/api.ts',
    'create',
    'backend_dev',
  );
  const fileChanges = await redis.lrange(
    `file-changes:${mockContext.id}`,
    0,
    -1,
  );
  if (fileChanges.length > 0 && fileChanges[0].includes('/src/api.ts')) {
    console.log('✅ File change logged successfully');
  } else {
    console.error('❌ File change logging failed');
  }

  // Decisions
  await coordinator.recordDecision(
    mockContext.id,
    'Use Redis',
    'For speed',
    'architect',
  );
  const decisions = await redis.lrange(`decisions:${mockContext.id}`, 0, -1);
  if (decisions.length > 0 && decisions[0].includes('Use Redis')) {
    console.log('✅ Decision recorded successfully');
  } else {
    console.error('❌ Decision recording failed');
  }

  // Cleanup
  await closeRedisConnections();
  await queueManager.closeAll(); // Just in case

  console.log('✅ Progress Test Complete');
  process.exit(0);
}

testProgress().catch(console.error);
