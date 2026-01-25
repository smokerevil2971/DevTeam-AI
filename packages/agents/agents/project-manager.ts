/**
 * Project Manager Agent - Coordinates the team, breaks down requirements, and tracks progress
 */

import {
  AgentType,
  AgentTask,
  AgentMessage,
  ProjectContext,
  MessageType,
  TaskStatus,
  TaskPriority,
  LLMRequest,
  LLMResponse,
} from '../types';
import { BaseAgent } from '../base-agent';
import { LLMClient, createClientFromEnv } from '../llm';
import { getAgentPrompt } from '../prompts';

// ============ PM-SPECIFIC TYPES ============

export interface TaskBreakdown {
  title: string;
  description: string;
  assignedAgent: AgentType;
  priority: TaskPriority;
  estimatedMinutes: number;
  dependencies: string[];
}

export interface ProjectSummary {
  name: string;
  overview: string;
  goals: string[];
  techStack: string[];
  keyFeatures: string[];
  estimatedComplexity: 'low' | 'medium' | 'high';
}

export interface ClarifyingQuestion {
  question: string;
  context: string;
  importance: 'required' | 'optional';
}

export interface StatusUpdate {
  summary: string;
  completedTasks: string[];
  inProgressTasks: string[];
  blockers: string[];
  nextSteps: string[];
  completionPercentage: number;
}

// ============ PM AGENT PROMPTS ============

const PM_TASK_BREAKDOWN_PROMPT = `You are analyzing a project requirement to create a task breakdown.

Given the user's requirements, create a detailed task list that can be assigned to specialized agents.

Available agents and their specialties:
- frontend_dev: React, TypeScript, UI components, pages, state management
- backend_dev: Node.js APIs, database operations, authentication, business logic
- designer: UI/UX design, design systems, accessibility
- architect: System design, API contracts, data modeling
- qa_engineer: Testing, code review, quality assurance
- devops: CI/CD, deployment, infrastructure
- security: Security audits, vulnerability fixes

For each task, provide:
1. Title (concise, action-oriented)
2. Description (detailed requirements)
3. Assigned agent (one of the above)
4. Priority (low, medium, high, critical)
5. Estimated time in minutes
6. Dependencies (list of task titles this depends on)

Respond in JSON format:
{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "assignedAgent": "frontend_dev|backend_dev|designer|architect|qa_engineer|devops|security",
      "priority": "low|medium|high|critical",
      "estimatedMinutes": number,
      "dependencies": ["task title 1", "task title 2"]
    }
  ]
}`;

const PM_CLARIFYING_QUESTIONS_PROMPT = `You are analyzing a project requirement to identify gaps and ambiguities.

Review the requirements and generate clarifying questions that would help better understand the project.

For each question:
1. The question itself
2. Context explaining why this is important
3. Whether it's required or optional

Respond in JSON format:
{
  "questions": [
    {
      "question": "string",
      "context": "string",
      "importance": "required|optional"
    }
  ]
}`;

const PM_PROJECT_SUMMARY_PROMPT = `You are creating a project summary from the given requirements.

Analyze the requirements and create a structured summary.

Respond in JSON format:
{
  "name": "Project name",
  "overview": "Brief project overview",
  "goals": ["Goal 1", "Goal 2"],
  "techStack": ["React", "Node.js", etc.],
  "keyFeatures": ["Feature 1", "Feature 2"],
  "estimatedComplexity": "low|medium|high"
}`;

const PM_STATUS_UPDATE_PROMPT = `You are generating a status update for a project.

Given the current task statuses, create a concise status update.

Respond in JSON format:
{
  "summary": "Brief status summary",
  "completedTasks": ["Task 1", "Task 2"],
  "inProgressTasks": ["Task 3"],
  "blockers": ["Blocker description"],
  "nextSteps": ["Next step 1", "Next step 2"],
  "completionPercentage": 0-100
}`;

// ============ PROJECT MANAGER AGENT ============

export class ProjectManagerAgent extends BaseAgent {
  private llmClient: LLMClient;

  constructor(llmClient?: LLMClient) {
    super(AgentType.PROJECT_MANAGER, {
      systemPrompt: getAgentPrompt(AgentType.PROJECT_MANAGER),
    });

    this.llmClient = llmClient || createClientFromEnv();
  }

  /**
   * LLM call implementation
   */
  protected async callLLM(request: LLMRequest): Promise<LLMResponse> {
    return this.llmClient.complete(request, {
      projectId: this.context?.id,
      agentType: 'project_manager',
    });
  }

  // ============ PROJECT UNDERSTANDING ============

  /**
   * Parse user requirements and create a project summary
   */
  async parseRequirements(requirements: string): Promise<ProjectSummary> {
    this.updateProgress(10, 'Analyzing requirements...');

    const response = await this.callLLM({
      systemPrompt: PM_PROJECT_SUMMARY_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please analyze these requirements and create a project summary:\n\n${requirements}`,
        },
      ],
      temperature: 0.3,
    });

    this.updateProgress(100, 'Requirements analyzed');
    return this.parseJSON<ProjectSummary>(response.content);
  }

  /**
   * Generate clarifying questions for ambiguous requirements
   */
  async generateClarifyingQuestions(
    requirements: string,
  ): Promise<ClarifyingQuestion[]> {
    this.updateProgress(10, 'Identifying gaps in requirements...');

    const response = await this.callLLM({
      systemPrompt: PM_CLARIFYING_QUESTIONS_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Review these requirements and identify what clarifying questions should be asked:\n\n${requirements}`,
        },
      ],
      temperature: 0.5,
    });

    this.updateProgress(100, 'Questions generated');
    const result = this.parseJSON<{ questions: ClarifyingQuestion[] }>(
      response.content,
    );
    return result.questions;
  }

  // ============ TASK BREAKDOWN ============

  /**
   * Break down requirements into actionable tasks
   */
  async createTaskBreakdown(requirements: string): Promise<TaskBreakdown[]> {
    this.updateProgress(10, 'Breaking down requirements into tasks...');

    const response = await this.callLLM({
      systemPrompt: PM_TASK_BREAKDOWN_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Break down these requirements into tasks:\n\n${requirements}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 4096,
    });

    this.updateProgress(80, 'Validating task breakdown...');
    const result = this.parseJSON<{ tasks: TaskBreakdown[] }>(response.content);

    // Map string agent types to enum
    const tasks = result.tasks.map((task) => ({
      ...task,
      assignedAgent: this.mapAgentType(task.assignedAgent as string),
      priority: this.mapPriority(task.priority as string),
    }));

    this.updateProgress(100, 'Task breakdown complete');
    return tasks;
  }

  /**
   * Estimate complexity of a feature
   */
  async estimateComplexity(description: string): Promise<{
    complexity: 'low' | 'medium' | 'high';
    reasoning: string;
    estimatedHours: number;
  }> {
    const response = await this.callLLM({
      systemPrompt:
        'Estimate the complexity of the given feature. Respond in JSON with complexity, reasoning, and estimatedHours.',
      messages: [
        {
          role: 'user',
          content: `Estimate complexity for: ${description}`,
        },
      ],
      temperature: 0.3,
    });

    return this.parseJSON(response.content);
  }

  // ============ TASK ASSIGNMENT ============

  /**
   * Assign tasks to appropriate agents based on capabilities
   */
  async assignTasks(
    tasks: TaskBreakdown[],
    agentAvailability?: Record<AgentType, boolean>,
  ): Promise<TaskBreakdown[]> {
    this.updateProgress(10, 'Optimizing task assignments...');

    // Filter unavailable agents and reassign if needed
    const assignedTasks = tasks.map((task) => {
      if (agentAvailability && !agentAvailability[task.assignedAgent]) {
        // Find alternative agent
        const alternative = this.findAlternativeAgent(task, agentAvailability);
        return { ...task, assignedAgent: alternative };
      }
      return task;
    });

    // Balance workload
    const workloadByAgent = new Map<AgentType, number>();
    for (const task of assignedTasks) {
      const current = workloadByAgent.get(task.assignedAgent) || 0;
      workloadByAgent.set(task.assignedAgent, current + task.estimatedMinutes);
    }

    this.updateProgress(100, 'Task assignments optimized');
    return assignedTasks;
  }

  /**
   * Find alternative agent when primary is unavailable
   */
  private findAlternativeAgent(
    task: TaskBreakdown,
    availability: Record<AgentType, boolean>,
  ): AgentType {
    // Define fallback mappings
    const fallbacks: Record<AgentType, AgentType[]> = {
      [AgentType.FRONTEND_DEV]: [AgentType.BACKEND_DEV, AgentType.ARCHITECT],
      [AgentType.BACKEND_DEV]: [AgentType.FRONTEND_DEV, AgentType.ARCHITECT],
      [AgentType.DESIGNER]: [AgentType.FRONTEND_DEV],
      [AgentType.ARCHITECT]: [AgentType.BACKEND_DEV, AgentType.FRONTEND_DEV],
      [AgentType.QA_ENGINEER]: [AgentType.FRONTEND_DEV, AgentType.BACKEND_DEV],
      [AgentType.DEVOPS]: [AgentType.BACKEND_DEV],
      [AgentType.SECURITY]: [AgentType.BACKEND_DEV, AgentType.QA_ENGINEER],
      [AgentType.PROJECT_MANAGER]: [],
    };

    const alternatives = fallbacks[task.assignedAgent] || [];
    for (const alt of alternatives) {
      if (availability[alt]) {
        return alt;
      }
    }

    // Default to project manager if no one else available
    return AgentType.PROJECT_MANAGER;
  }

  // ============ PROGRESS TRACKING ============

  /**
   * Generate a status update based on current project state
   */
  async generateStatusUpdate(): Promise<StatusUpdate> {
    if (!this.context) {
      throw new Error('No project context available');
    }

    this.updateProgress(10, 'Analyzing project status...');

    const tasks = this.context.tasks;
    const completed = tasks.filter((t) => t.status === TaskStatus.COMPLETED);
    const inProgress = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS);
    const blocked = tasks.filter((t) => t.status === TaskStatus.BLOCKED);

    const taskSummary = `
Tasks Overview:
- Total: ${tasks.length}
- Completed: ${completed.length}
- In Progress: ${inProgress.length}
- Blocked: ${blocked.length}

Completed Tasks:
${completed.map((t) => `- ${t.title}`).join('\n')}

In Progress:
${inProgress.map((t) => `- ${t.title}`).join('\n')}

Blocked:
${blocked.map((t) => `- ${t.title}`).join('\n')}
`;

    const response = await this.callLLM({
      systemPrompt: PM_STATUS_UPDATE_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate a status update for this project state:\n\n${taskSummary}`,
        },
      ],
      temperature: 0.3,
    });

    this.updateProgress(100, 'Status update generated');
    return this.parseJSON<StatusUpdate>(response.content);
  }

  /**
   * Calculate overall project completion percentage
   */
  calculateCompletion(): number {
    if (!this.context || this.context.tasks.length === 0) {
      return 0;
    }

    const total = this.context.tasks.length;
    const completed = this.context.tasks.filter(
      (t) => t.status === TaskStatus.COMPLETED,
    ).length;

    return Math.round((completed / total) * 100);
  }

  /**
   * Identify blockers in the project
   */
  identifyBlockers(): AgentTask[] {
    if (!this.context) return [];
    return this.context.tasks.filter((t) => t.status === TaskStatus.BLOCKED);
  }

  // ============ COORDINATION ============

  /**
   * Route a message to the appropriate agent
   */
  async routeMessage(message: AgentMessage): Promise<AgentType | null> {
    // Analyze message content to determine the best recipient
    const response = await this.callLLM({
      systemPrompt: `Determine which agent should handle this message. 
Available agents: frontend_dev, backend_dev, designer, architect, qa_engineer, devops, security, project_manager.
Respond with just the agent type.`,
      messages: [
        {
          role: 'user',
          content: message.content,
        },
      ],
      temperature: 0.1,
      maxTokens: 50,
    });

    const agentType = response.content.trim().toLowerCase();
    return this.mapAgentType(agentType);
  }

  /**
   * Detect conflicts between agent activities
   */
  async detectConflicts(): Promise<string[]> {
    if (!this.context) return [];

    const conflicts: string[] = [];

    // Check for tasks on the same file
    const fileMapping = new Map<string, AgentTask[]>();
    for (const task of this.context.tasks.filter(
      (t) => t.status === TaskStatus.IN_PROGRESS,
    )) {
      // Check if task description mentions file paths
      const files = this.extractFilePaths(task.description);
      for (const file of files) {
        const existing = fileMapping.get(file) || [];
        existing.push(task);
        fileMapping.set(file, existing);
      }
    }

    // Report conflicts
    for (const [file, tasks] of fileMapping) {
      if (tasks.length > 1) {
        conflicts.push(
          `Multiple agents working on ${file}: ${tasks.map((t) => t.assignedAgent).join(', ')}`,
        );
      }
    }

    return conflicts;
  }

  /**
   * Extract file paths from text
   */
  private extractFilePaths(text: string): string[] {
    const patterns = [
      /[./]?[\w-]+\/[\w-/.]+\.(ts|tsx|js|jsx|css|json|md)/g,
      /`([^`]+\.(ts|tsx|js|jsx|css|json|md))`/g,
    ];

    const files: string[] = [];
    for (const pattern of patterns) {
      const matches = text.match(pattern) || [];
      files.push(...matches.map((m) => m.replace(/`/g, '')));
    }

    return [...new Set(files)];
  }

  // ============ USER COMMUNICATION ============

  /**
   * Generate a user-friendly status update message
   */
  async generateUserMessage(
    type: 'status' | 'question' | 'issue',
  ): Promise<string> {
    const statusUpdate = await this.generateStatusUpdate();

    switch (type) {
      case 'status':
        return `📊 **Project Status Update**

${statusUpdate.summary}

**Progress:** ${statusUpdate.completionPercentage}% complete

**Completed:**
${statusUpdate.completedTasks.map((t) => `✅ ${t}`).join('\n')}

**In Progress:**
${statusUpdate.inProgressTasks.map((t) => `🔄 ${t}`).join('\n')}

${statusUpdate.blockers.length > 0 ? `**Blockers:**\n${statusUpdate.blockers.map((b) => `⚠️ ${b}`).join('\n')}` : ''}

**Next Steps:**
${statusUpdate.nextSteps.map((s) => `→ ${s}`).join('\n')}`;

      case 'question':
        return `❓ I need some clarification to proceed with the project.`;

      case 'issue':
        return `⚠️ **Issue Detected**\n\n${statusUpdate.blockers.join('\n')}`;

      default:
        return statusUpdate.summary;
    }
  }

  // ============ HELPERS ============

  /**
   * Parse JSON from LLM response, handling markdown code blocks
   */
  private parseJSON<T>(content: string): T {
    // Remove markdown code blocks if present
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }

    return JSON.parse(cleaned.trim());
  }

  /**
   * Map string to AgentType enum
   */
  private mapAgentType(type: string): AgentType {
    const mapping: Record<string, AgentType> = {
      frontend_dev: AgentType.FRONTEND_DEV,
      backend_dev: AgentType.BACKEND_DEV,
      designer: AgentType.DESIGNER,
      architect: AgentType.ARCHITECT,
      qa_engineer: AgentType.QA_ENGINEER,
      devops: AgentType.DEVOPS,
      security: AgentType.SECURITY,
      project_manager: AgentType.PROJECT_MANAGER,
    };
    return mapping[type.toLowerCase()] || AgentType.PROJECT_MANAGER;
  }

  /**
   * Map string to TaskPriority enum
   */
  private mapPriority(priority: string): TaskPriority {
    const mapping: Record<string, TaskPriority> = {
      low: TaskPriority.LOW,
      medium: TaskPriority.MEDIUM,
      high: TaskPriority.HIGH,
      critical: TaskPriority.CRITICAL,
    };
    return mapping[priority.toLowerCase()] || TaskPriority.MEDIUM;
  }
}
