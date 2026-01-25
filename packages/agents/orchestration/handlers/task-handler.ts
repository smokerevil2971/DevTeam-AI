/**
 * Task Handler
 * Processes jobs from the 'agent-tasks' queue
 */

import { Job } from 'bullmq';
import {
  AgentType,
  AgentTask,
  ProjectContext,
  AGENT_METADATA,
} from '../../types';
import { ProjectManagerAgent } from '../../agents/project-manager';
import { FrontendDeveloperAgent } from '../../agents/frontend-dev';
import { BackendDeveloperAgent } from '../../agents/backend-dev';
import { QAEngineerAgent } from '../../agents/qa-engineer';
import { createClientFromEnv } from '../../llm';

interface TaskJobData {
  taskId: string;
  projectId: string; // ID of the project
  task: AgentTask; // Full task object
  context: ProjectContext; // (Simplified) Context or reference to load it
}

export async function handleTask(job: Job<TaskJobData>) {
  const { task, context } = job.data;

  // 1. Resolve Agent
  const agentType = task.assignedAgent;
  console.log(`   Task assigned to: ${agentType}`);

  // 2. Instantiate Agent
  // NOTE: Ideally we'd load these dynamically or from a factory, but explicitly importing for now
  // to avoid circular dependencies and ensure type safety.
  // Also passing a real or mock LLM Client based on env is tricky in a worker context.
  // We'll create a new client from env for each job.

  let agent;
  const llmClient = createClientFromEnv(); // Will fail if no keys, intended for production

  switch (agentType) {
    case AgentType.PROJECT_MANAGER:
      agent = new ProjectManagerAgent(llmClient);
      break;
    case AgentType.FRONTEND_DEV:
      agent = new FrontendDeveloperAgent(llmClient);
      break;
    case AgentType.BACKEND_DEV:
      agent = new BackendDeveloperAgent(llmClient);
      break;
    case AgentType.QA_ENGINEER:
      agent = new QAEngineerAgent(llmClient);
      break;
    default:
      throw new Error(`Unknown or unimplemented agent type: ${agentType}`);
  }

  // 3. Initialize Agent
  await agent.initialize(context);

  // 4. Update Status (Optional: emit event via WebSocket)
  // await agent.updateTaskStatus(task.id, 'in_progress');

  // 5. Execute Task (Simulation)
  // Real implementation would look at the task description and call specific methods.
  // For MVP, we'll log capabilities using the metadata const
  console.log(`   Agent ${agentType} starting work on: "${task.title}"`);
  const metadata = AGENT_METADATA[agentType];
  const capabilities = metadata ? metadata.capabilities : [];
  console.log(
    `   Agent Capabilities: ${capabilities.map((c) => c.name).join(', ')}`,
  );

  // Simulate work duration
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    status: 'success',
    taskId: task.id,
    agent: agentType,
    result: 'Task processed successfully (Simulation)',
  };
}
