/**
 * Full System Integration Test
 *
 * Simulates a complete workflow using multiple agents.
 *
 * To run: npx tsx packages/agents/test-system.ts
 */

import { ProjectManagerAgent } from '../agents/project-manager';
import { FrontendDeveloperAgent } from '../agents/frontend-dev';
import { BackendDeveloperAgent } from '../agents/backend-dev';
import { QAEngineerAgent } from '../agents/qa-engineer';
import {
  AgentTask,
  TaskStatus,
  TaskPriority,
  ProjectContext,
  AgentType,
} from '../types';

// Mock LLM Client for testing without API keys
class MockLLMClient {
  async complete(request: any) {
    return {
      content: JSON.stringify({
        mock: 'response',
        questions: [],
        tasks: [
          {
            title: 'Mock Task 1',
            description: 'Mock Description',
            assignedAgent: 'backend_dev',
            priority: 'medium',
            estimatedMinutes: 60,
            dependencies: [],
          },
        ],
        summary: 'Mock Summary',
        fixedCode: '// Fixed code',
        explanation: 'Fixed it',
      }),
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };
  }
}

async function testSystemIntegration() {
  console.log('🤖 Starting System Integration Test...\n');

  // Check for API keys
  const hasApiKey =
    process.env.GEMINI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY;
  let mockClient;

  if (!hasApiKey) {
    console.log('⚠️  No API key found in environment variables.');
    console.log('   Running in MOCK mode with MockLLMClient...\n');
    mockClient = new MockLLMClient() as any;
  }

  // 1. Initialize Context
  console.log('1️⃣  Initializing Project Context');
  const context: ProjectContext = {
    id: 'test-project-1',
    name: 'Task Manager MVP',
    description: 'A simple task manager',
    techStack: ['React', 'Node.js', 'PostgreSQL'],
    files: [],
    tasks: [],
    recentMessages: [],
    agentStates: [],
  };
  console.log(`   Project: ${context.name}`);

  // 2. Project Manager: Parse Requirements & Create Tasks
  console.log('\n2️⃣  Project Manager Agent: Planning');
  const pm = new ProjectManagerAgent(mockClient);
  await pm.initialize(context);

  const requirements = `
    Build a simple task management API.
    - Users can create, read, update, and delete tasks.
    - Tasks have a title, description, and status.
    - Need a secure API endpoint for tasks.
    - Need a React component to display the task list.
  `;

  let tasks: AgentTask[] = [];
  if (hasApiKey) {
    console.log('   Analyzing requirements with LLM...');
    try {
      const breakdown = await pm.createTaskBreakdown(requirements);
      console.log(`   Generated ${breakdown.length} tasks:`);
      breakdown.forEach((t) =>
        console.log(`   - [${t.assignedAgent}] ${t.title}`),
      );

      // Convert to AgentTask format
      tasks = breakdown.map(
        (t, i) =>
          ({
            id: `task-${i}`,
            projectId: context.id,
            title: t.title,
            description: t.description,
            assignedAgent: t.assignedAgent,
            status: TaskStatus.PENDING,
            priority: t.priority,
            dependencies: t.dependencies || [],
            createdAt: new Date(),
            updated: new Date(),
          }) as AgentTask,
      );
    } catch (e) {
      console.error('   Error calling LLM:', e);
      tasks = [];
    }
  } else {
    // Mock tasks explicitly for the flow
    console.log('   (Using hardcoded tasks for mock flow)');
    tasks = [
      {
        id: 'task-1',
        projectId: context.id,
        title: 'Create Task API Endpoint',
        description: 'Implement POST /api/tasks endpoint',
        assignedAgent: AgentType.BACKEND_DEV,
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        dependencies: [],
        createdAt: new Date(),
      },
      {
        id: 'task-2',
        projectId: context.id,
        title: 'Create Task List Component',
        description: 'Implement TaskList React component',
        assignedAgent: AgentType.FRONTEND_DEV,
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        dependencies: [],
        createdAt: new Date(),
      },
    ] as AgentTask[];
  }

  // 3. Backend Developer: Implement API
  console.log('\n3️⃣  Backend Developer Agent: Implementation');
  const be = new BackendDeveloperAgent(mockClient);
  await be.initialize(context);

  const backendTask = tasks.find(
    (t) => t.assignedAgent === AgentType.BACKEND_DEV,
  );
  if (backendTask) {
    console.log(`   Working on: ${backendTask.title}`);

    if (hasApiKey) {
      const endpoint = await be.generateEndpoint({
        path: '/api/tasks',
        method: 'POST',
        description: 'Create a new task',
        requestBody: {
          name: 'CreateTaskDto',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'description', type: 'string', optional: true },
          ],
        },
        responseBody: {
          name: 'Task',
          fields: [
            { name: 'id', type: 'string' },
            { name: 'title', type: 'string' },
            { name: 'status', type: 'string' },
          ],
        },
        authentication: 'required',
      });
      console.log(`   Generated ${endpoint.filename}`);
      console.log('   Code preview:');
      console.log(
        endpoint.content.split('\n').slice(0, 5).join('\n') + '\n   ...',
      );
    } else {
      console.log('   (Skipped LLM generation in mock mode)');
    }
  }

  // 4. Frontend Developer: Implement Component
  console.log('\n4️⃣  Frontend Developer Agent: Implementation');
  const fe = new FrontendDeveloperAgent(mockClient);
  await fe.initialize(context);

  const frontendTask = tasks.find(
    (t) => t.assignedAgent === AgentType.FRONTEND_DEV,
  );
  if (frontendTask) {
    console.log(`   Working on: ${frontendTask.title}`);

    if (hasApiKey) {
      const component = await fe.generateComponent({
        name: 'TaskList',
        description: 'Displays a list of tasks with completion status',
        props: [
          { name: 'tasks', type: 'Task[]', required: true },
          { name: 'onToggle', type: '(id: string) => void', required: true },
        ],
        styling: 'tailwind',
      });
      console.log(`   Generated ${component.filename}`);
      console.log('   Code preview:');
      console.log(
        component.content.split('\n').slice(0, 5).join('\n') + '\n   ...',
      );
    } else {
      console.log('   (Skipped LLM generation in mock mode)');
    }
  }

  // 5. QA Engineer: Generate Tests
  console.log('\n5️⃣  QA Engineer Agent: Testing');
  const qa = new QAEngineerAgent(mockClient);
  await qa.initialize(context);

  console.log('\n✅ System Integration Test Complete!');
}

testSystemIntegration().catch(console.error);
