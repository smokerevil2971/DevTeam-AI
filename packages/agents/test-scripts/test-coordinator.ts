/**
 * Test Coordinator Script
 *
 * Verifies the AgentCoordinator's ability to assign tasks and route messages.
 *
 * Run: pnpm exec tsx test-scripts/test-coordinator.ts
 */

import { coordinator } from '../orchestration/coordinator';
import { workerManager } from '../orchestration/workers';
import { queueManager } from '../orchestration/queues';
import { AgentType, TaskStatus, TaskPriority, ProjectContext } from '../types';

async function testCoordinator() {
  console.log('🧪 Starting Agent Coordinator Test...');

  // 1. Start Workers (to process the tasks we assign)
  console.log('1️⃣  Starting Workers...');
  workerManager.startAll();

  // 2. Initialize Coordinator
  console.log('2️⃣  Initializing Coordinator...');
  const mockContext: ProjectContext = {
    id: 'test-coord-project',
    name: 'Coordinator Test Project',
    description: 'Testing coordinator',
    techStack: [],
    files: [],
    tasks: [],
    recentMessages: [],
    agentStates: [],
  };
  await coordinator.initialize(mockContext);

  // 3. Assign a Task via Coordinator
  console.log('3️⃣  Assigning Task...');
  const task = coordinator.createTask(
    'Coordinator Test Task',
    'Verify coordinator assignment',
    AgentType.QA_ENGINEER,
    TaskPriority.HIGH,
  );

  const jobId = await coordinator.assignTask(task);
  console.log(`   Task assigned. Job ID: ${jobId}`);

  // 4. Wait for processing
  console.log('4️⃣  Waiting for worker to pick up task...');
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // 5. Cleanup
  console.log('5️⃣  Cleaning up...');
  await workerManager.stopAll();
  await queueManager.closeAll();

  console.log('✅ Coordinator Test Complete');
  process.exit(0);
}

testCoordinator().catch(console.error);
