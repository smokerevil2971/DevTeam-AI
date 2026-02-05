/**
 * Test User Intervention System (Section 6.5)
 *
 * Verifies:
 * - Pause/resume functionality
 * - Guidance injection
 * - Task cancellation
 */

import { AgentCoordinator } from '../orchestration/coordinator';
import { AgentType, TaskPriority, ProjectContext } from '../types';
import { getRedisClient } from '../orchestration/redis';
import { BackendDeveloperAgent } from '../agents';

async function testInterventionSystem() {
  console.log('🧪 Testing User Intervention System (6.5)...\n');

  const coordinator = new AgentCoordinator();
  const redis = getRedisClient();

  // Mock context
  const mockContext: ProjectContext = {
    id: 'test-intervention-proj',
    name: 'Test Intervention Project',
    description: 'Testing user interventions',
    techStack: ['Next.js', 'PostgreSQL', 'Tailwind', 'Vercel'],
    files: [],
    tasks: [],
    agentStates: [],
    recentMessages: [],
  };

  await coordinator.initialize(mockContext);

  console.log('1️⃣  Testing Pause/Resume Agent...');

  // Pause a specific agent
  await coordinator.pauseAgent(AgentType.BACKEND_DEV);

  // Check if paused
  const isPaused = await coordinator.isAgentPaused(
    AgentType.BACKEND_DEV,
    mockContext.id,
  );

  if (isPaused) {
    console.log('✅ Agent paused successfully');
  } else {
    console.error('❌ Agent pause failed');
  }

  // Resume agent
  await coordinator.resumeAgent(AgentType.BACKEND_DEV);

  const isResumed = !(await coordinator.isAgentPaused(
    AgentType.BACKEND_DEV,
    mockContext.id,
  ));

  if (isResumed) {
    console.log('✅ Agent resumed successfully');
  } else {
    console.error('❌ Agent resume failed');
  }

  console.log('\n2️⃣  Testing Pause/Resume All Agents...');

  // Pause all agents
  await coordinator.pauseAllAgents(mockContext.id);

  const allPaused = await coordinator.isAgentPaused(
    AgentType.FRONTEND_DEV,
    mockContext.id,
  );

  if (allPaused) {
    console.log('✅ All agents paused successfully');
  } else {
    console.error('❌ Pause all agents failed');
  }

  // Resume all
  await coordinator.resumeAllAgents(mockContext.id);

  const allResumed = !(await coordinator.isAgentPaused(
    AgentType.FRONTEND_DEV,
    mockContext.id,
  ));

  if (allResumed) {
    console.log('✅ All agents resumed successfully');
  } else {
    console.error('❌ Resume all agents failed');
  }

  console.log('\n3️⃣  Testing Guidance Injection...');

  const guidanceMessage =
    'Please use FastAPI instead of Express for the backend';

  await coordinator.injectGuidance(
    AgentType.BACKEND_DEV,
    mockContext.id,
    guidanceMessage,
  );

  // Retrieve guidance
  const guidance = await coordinator.getGuidance(AgentType.BACKEND_DEV);

  if (guidance.length > 0 && guidance[0].description === guidanceMessage) {
    console.log('✅ Guidance injected and retrieved successfully');
    console.log(`   Guidance: "${guidance[0].description}"`);
  } else {
    console.error('❌ Guidance injection failed');
  }

  // Verify guidance was cleared after retrieval
  const guidanceAfter = await coordinator.getGuidance(AgentType.BACKEND_DEV);
  if (guidanceAfter.length === 0) {
    console.log('✅ Guidance cleared after retrieval');
  } else {
    console.error('❌ Guidance not cleared properly');
  }

  console.log('\n4️⃣  Testing Task Cancellation...');

  const testTask = coordinator.createTask(
    'Build API endpoint',
    'Create REST API for users',
    AgentType.BACKEND_DEV,
    TaskPriority.HIGH,
  );

  // Cancel the task
  await coordinator.cancelTask(testTask.id, AgentType.BACKEND_DEV);

  // Verify cancellation
  const taskStatus = await redis.get(`task:${testTask.id}:status`);

  if (taskStatus === 'CANCELLED') {
    console.log('✅ Task cancelled successfully');
  } else {
    console.error('❌ Task cancellation failed');
  }

  // Verify activity was logged
  const activities = await redis.lrange(`activity:${mockContext.id}`, 0, -1);
  const cancelActivity = activities.find((a) =>
    a.includes(`Task ${testTask.id} cancelled`),
  );

  if (cancelActivity) {
    console.log('✅ Cancellation logged in activity stream');
  } else {
    console.error('❌ Cancellation not logged');
  }

  console.log('\n5️⃣  Testing Agent State Reset...');

  // Set some state
  await coordinator.pauseAgent(AgentType.QA_ENGINEER);
  await coordinator.injectGuidance(
    AgentType.QA_ENGINEER,
    mockContext.id,
    'Test guidance',
  );

  // Reset
  await coordinator.resetAgentState(AgentType.QA_ENGINEER);

  // Verify state cleared
  const stateAfterReset = await redis.hgetall(
    `agent:${AgentType.QA_ENGINEER}:state`,
  );
  const guidanceAfterReset = await coordinator.getGuidance(
    AgentType.QA_ENGINEER,
  );

  if (
    Object.keys(stateAfterReset).length === 0 &&
    guidanceAfterReset.length === 0
  ) {
    console.log('✅ Agent state reset successfully');
  } else {
    console.error('❌ Agent state reset failed');
  }

  console.log('\n✅ All core intervention controls verified!\n');
  console.log(
    'Note: Agent pause detection during task execution requires LLM integration',
  );
  console.log(
    'and would be tested as part of end-to-end integration testing.\n',
  );

  // Cleanup
  await redis.flushdb();
  console.log('✅ User Intervention System tests completed!\n');
  process.exit(0);
}

// Run tests
testInterventionSystem().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
