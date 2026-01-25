/**
 * Test Conflict Detection
 *
 * Verifies file locking mechanisms in the Coordinator.
 *
 * Run: pnpm exec tsx test-scripts/test-conflict.ts
 */

import { coordinator } from '../orchestration/coordinator';
import { ProjectContext } from '../types';
import { getRedisClient, closeRedisConnections } from '../orchestration/redis';

async function testConflict() {
  console.log('🔒 Starting Conflict Detection Test...');

  // 1. Initialize
  const mockContext: ProjectContext = {
    id: 'test-conflict-proj',
    name: 'Conflict Test',
    description: 'Testing locks',
    techStack: [],
    files: [],
    tasks: [],
    recentMessages: [],
    agentStates: [],
  };
  await coordinator.initialize(mockContext);

  const file = '/src/components/Button.tsx';
  const agentA = 'frontend-dev-1';
  const agentB = 'frontend-dev-2';

  // 2. Agent A acquires lock
  console.log(`2️⃣  ${agentA} acquiring lock...`);
  const lockA = await coordinator.acquireFileLock(mockContext.id, file, agentA);
  console.log(`   Lock A success: ${lockA}`); // Should be true

  // 3. Agent B tries to acquire lock (Should fail)
  console.log(`3️⃣  ${agentB} acquiring lock (should fail)...`);
  const lockB = await coordinator.acquireFileLock(mockContext.id, file, agentB);
  console.log(`   Lock B success: ${lockB}`); // Should be false

  // 4. Check Conflict
  const conflict = await coordinator.checkConflict(
    mockContext.id,
    file,
    agentB,
  );
  console.log(`   Agent B sees conflict: ${conflict}`); // Should be true

  // 5. Agent A releases lock
  console.log(`5️⃣  ${agentA} releasing lock...`);
  await coordinator.releaseFileLock(mockContext.id, file, agentA);

  // 6. Agent B acquires lock (Should success)
  console.log(`6️⃣  ${agentB} acquiring lock...`);
  const lockB2 = await coordinator.acquireFileLock(
    mockContext.id,
    file,
    agentB,
  );
  console.log(`   Lock B retry success: ${lockB2}`); // Should be true

  // Cleanup
  console.log('🧹 Cleanup...');
  await coordinator.releaseFileLock(mockContext.id, file, agentB);
  await closeRedisConnections();

  console.log('✅ Conflict Test Complete');
  process.exit(0);
}

testConflict().catch(console.error);
