/**
 * Test Context Manager
 *
 * Verifies that the ContextManager correctly builds and optimizes context.
 *
 * Run: pnpm exec tsx test-scripts/test-context.ts
 */

import { contextManager } from '../core/context-manager';
import {
  AgentTask,
  ProjectContext,
  TaskStatus,
  TaskPriority,
  AgentType,
} from '../types';

async function testContext() {
  console.log('🧠 Starting Context Manager Test...');

  // 1. Setup Mock Context
  const mockContext: ProjectContext = {
    id: 'test-project-ctx',
    name: 'Context Test Project',
    description: 'Testing context builder',
    techStack: ['TypeScript', 'Node.js'],
    files: [
      {
        path: '/src/main.ts',
        name: 'main.ts',
        extension: 'ts',
        content:
          'console.log("Hello World"); // This is a relevant file for the task',
        language: 'typescript',
      },
      {
        path: '/src/irrelevant.ts',
        name: 'irrelevant.ts',
        extension: 'ts',
        content: 'console.log("Ignore me");',
        language: 'typescript',
      },
    ],
    tasks: [],
    recentMessages: [
      {
        id: 'msg-1',
        projectId: 'test-project-ctx',
        senderType: 'user',
        content: 'Please update the main file.',
        messageType: 'text',
        createdAt: new Date(),
      } as any,
    ],
    agentStates: [],
  };

  const mockTask: AgentTask = {
    id: 'task-ctx-1',
    projectId: 'test-project-ctx',
    title: 'Update Main File',
    description: 'Add logging to main.ts',
    assignedAgent: AgentType.BACKEND_DEV,
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dependencies: [],
    createdAt: new Date(),
  };

  // 2. Build Context
  console.log('2️⃣  Building Context...');
  const context = await contextManager.buildContext(mockTask, mockContext, {
    maxTokens: 1000,
    includeFiles: true,
  });

  console.log('\n--- Generated Context ---');
  console.log(context);
  console.log('-------------------------\n');

  // 3. Verify Content
  if (context.includes('main.ts') && context.includes('Hello World')) {
    console.log('✅ Relevant file included');
  } else {
    console.error('❌ Relevant file MISSING');
  }

  if (context.includes('Project Configuration')) {
    console.log('✅ Tech stack included');
  } else {
    console.error('❌ Tech stack MISSING');
  }

  // 4. Test Knowledge Base
  console.log('\n4️⃣  Testing Knowledge Base...');
  contextManager.addKnowledge('api_contract', {
    version: 'v1',
    format: 'json',
  });
  const kb = contextManager.getKnowledge('api_contract');
  if (kb && kb.version === 'v1') {
    console.log('✅ Knowledge stored and retrieved');
  } else {
    console.error('❌ Knowledge base failed');
  }

  console.log('\n✅ Context Manager Test Complete');
}

testContext().catch(console.error);
