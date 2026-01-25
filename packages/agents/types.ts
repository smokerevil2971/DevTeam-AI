/**
 * Agent Types - Core type definitions for the AI Agent System
 */

// ============ AGENT TYPE ENUM ============

export enum AgentType {
  PROJECT_MANAGER = 'project_manager',
  ARCHITECT = 'architect',
  FRONTEND_DEV = 'frontend_dev',
  BACKEND_DEV = 'backend_dev',
  DESIGNER = 'designer',
  QA_ENGINEER = 'qa_engineer',
  DEVOPS = 'devops',
  SECURITY = 'security',
}

// ============ AGENT STATUS ============

export enum AgentStatus {
  IDLE = 'idle',
  ACTIVE = 'active',
  WORKING = 'working',
  WAITING = 'waiting',
  ERROR = 'error',
  OFFLINE = 'offline',
}

// ============ AGENT CAPABILITIES ============

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  category: 'code' | 'design' | 'test' | 'deploy' | 'communicate' | 'analyze';
}

export const AGENT_CAPABILITIES: Record<AgentType, AgentCapability[]> = {
  [AgentType.PROJECT_MANAGER]: [
    {
      id: 'pm-plan',
      name: 'Project Planning',
      description: 'Break down requirements into tasks',
      category: 'analyze',
    },
    {
      id: 'pm-coordinate',
      name: 'Team Coordination',
      description: 'Coordinate work between agents',
      category: 'communicate',
    },
    {
      id: 'pm-track',
      name: 'Progress Tracking',
      description: 'Monitor and report on project progress',
      category: 'analyze',
    },
    {
      id: 'pm-communicate',
      name: 'User Communication',
      description: 'Communicate with users and gather requirements',
      category: 'communicate',
    },
  ],
  [AgentType.ARCHITECT]: [
    {
      id: 'arch-design',
      name: 'System Design',
      description: 'Design system architecture and data models',
      category: 'analyze',
    },
    {
      id: 'arch-api',
      name: 'API Design',
      description: 'Design API contracts and schemas',
      category: 'analyze',
    },
    {
      id: 'arch-review',
      name: 'Architecture Review',
      description: 'Review and optimize architecture decisions',
      category: 'analyze',
    },
    {
      id: 'arch-docs',
      name: 'Technical Documentation',
      description: 'Create architecture documentation',
      category: 'communicate',
    },
  ],
  [AgentType.FRONTEND_DEV]: [
    {
      id: 'fe-component',
      name: 'Component Development',
      description: 'Build React/TypeScript components',
      category: 'code',
    },
    {
      id: 'fe-page',
      name: 'Page Development',
      description: 'Build complete pages and layouts',
      category: 'code',
    },
    {
      id: 'fe-style',
      name: 'Styling',
      description: 'Implement CSS/Tailwind styling',
      category: 'code',
    },
    {
      id: 'fe-state',
      name: 'State Management',
      description: 'Implement client-side state management',
      category: 'code',
    },
    {
      id: 'fe-api',
      name: 'API Integration',
      description: 'Integrate with backend APIs',
      category: 'code',
    },
  ],
  [AgentType.BACKEND_DEV]: [
    {
      id: 'be-api',
      name: 'API Development',
      description: 'Build REST/GraphQL APIs',
      category: 'code',
    },
    {
      id: 'be-db',
      name: 'Database Operations',
      description: 'Create queries and database operations',
      category: 'code',
    },
    {
      id: 'be-auth',
      name: 'Authentication',
      description: 'Implement auth and security features',
      category: 'code',
    },
    {
      id: 'be-logic',
      name: 'Business Logic',
      description: 'Implement business logic and services',
      category: 'code',
    },
    {
      id: 'be-integration',
      name: 'Third-party Integration',
      description: 'Integrate external services',
      category: 'code',
    },
  ],
  [AgentType.DESIGNER]: [
    {
      id: 'ui-design',
      name: 'UI Design',
      description: 'Create UI designs and mockups',
      category: 'design',
    },
    {
      id: 'ui-tokens',
      name: 'Design Tokens',
      description: 'Create design tokens and system',
      category: 'design',
    },
    {
      id: 'ui-ux',
      name: 'UX Review',
      description: 'Review and improve user experience',
      category: 'analyze',
    },
    {
      id: 'ui-a11y',
      name: 'Accessibility',
      description: 'Ensure accessibility compliance',
      category: 'analyze',
    },
  ],
  [AgentType.QA_ENGINEER]: [
    {
      id: 'qa-unit',
      name: 'Unit Testing',
      description: 'Write unit tests',
      category: 'test',
    },
    {
      id: 'qa-integration',
      name: 'Integration Testing',
      description: 'Write integration tests',
      category: 'test',
    },
    {
      id: 'qa-e2e',
      name: 'E2E Testing',
      description: 'Write end-to-end tests',
      category: 'test',
    },
    {
      id: 'qa-review',
      name: 'Code Review',
      description: 'Review code for quality and bugs',
      category: 'analyze',
    },
    {
      id: 'qa-perf',
      name: 'Performance Testing',
      description: 'Test and analyze performance',
      category: 'test',
    },
  ],
  [AgentType.DEVOPS]: [
    {
      id: 'ops-ci',
      name: 'CI/CD Setup',
      description: 'Create CI/CD pipelines',
      category: 'deploy',
    },
    {
      id: 'ops-docker',
      name: 'Containerization',
      description: 'Create Docker configurations',
      category: 'deploy',
    },
    {
      id: 'ops-iac',
      name: 'Infrastructure as Code',
      description: 'Create infrastructure configurations',
      category: 'deploy',
    },
    {
      id: 'ops-monitor',
      name: 'Monitoring',
      description: 'Set up monitoring and alerting',
      category: 'deploy',
    },
  ],
  [AgentType.SECURITY]: [
    {
      id: 'sec-audit',
      name: 'Security Audit',
      description: 'Audit code for security vulnerabilities',
      category: 'analyze',
    },
    {
      id: 'sec-auth',
      name: 'Auth Security',
      description: 'Review authentication implementation',
      category: 'analyze',
    },
    {
      id: 'sec-scan',
      name: 'Vulnerability Scanning',
      description: 'Scan for known vulnerabilities',
      category: 'analyze',
    },
    {
      id: 'sec-fix',
      name: 'Security Fixes',
      description: 'Implement security fixes',
      category: 'code',
    },
  ],
};

// ============ AGENT METADATA ============

export interface AgentMetadata {
  type: AgentType;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  capabilities: AgentCapability[];
}

export const AGENT_METADATA: Record<AgentType, AgentMetadata> = {
  [AgentType.PROJECT_MANAGER]: {
    type: AgentType.PROJECT_MANAGER,
    name: 'Project Manager',
    shortName: 'PM',
    description:
      'Coordinates the team, breaks down requirements, and tracks progress',
    icon: 'clipboard-list',
    color: '#3B82F6', // blue
    capabilities: AGENT_CAPABILITIES[AgentType.PROJECT_MANAGER],
  },
  [AgentType.ARCHITECT]: {
    type: AgentType.ARCHITECT,
    name: 'Software Architect',
    shortName: 'Arch',
    description: 'Designs system architecture, APIs, and data models',
    icon: 'network',
    color: '#8B5CF6', // violet
    capabilities: AGENT_CAPABILITIES[AgentType.ARCHITECT],
  },
  [AgentType.FRONTEND_DEV]: {
    type: AgentType.FRONTEND_DEV,
    name: 'Frontend Developer',
    shortName: 'FE Dev',
    description: 'Builds React components, pages, and UI interactions',
    icon: 'layout',
    color: '#EC4899', // pink
    capabilities: AGENT_CAPABILITIES[AgentType.FRONTEND_DEV],
  },
  [AgentType.BACKEND_DEV]: {
    type: AgentType.BACKEND_DEV,
    name: 'Backend Developer',
    shortName: 'BE Dev',
    description: 'Builds APIs, database logic, and server-side code',
    icon: 'server',
    color: '#10B981', // emerald
    capabilities: AGENT_CAPABILITIES[AgentType.BACKEND_DEV],
  },
  [AgentType.DESIGNER]: {
    type: AgentType.DESIGNER,
    name: 'UI/UX Designer',
    shortName: 'Design',
    description: 'Creates designs, design systems, and ensures great UX',
    icon: 'palette',
    color: '#F59E0B', // amber
    capabilities: AGENT_CAPABILITIES[AgentType.DESIGNER],
  },
  [AgentType.QA_ENGINEER]: {
    type: AgentType.QA_ENGINEER,
    name: 'QA Engineer',
    shortName: 'QA',
    description: 'Writes tests, reviews code, and ensures quality',
    icon: 'check-circle',
    color: '#06B6D4', // cyan
    capabilities: AGENT_CAPABILITIES[AgentType.QA_ENGINEER],
  },
  [AgentType.DEVOPS]: {
    type: AgentType.DEVOPS,
    name: 'DevOps Engineer',
    shortName: 'DevOps',
    description: 'Sets up CI/CD, infrastructure, and deployment',
    icon: 'cloud',
    color: '#EF4444', // red
    capabilities: AGENT_CAPABILITIES[AgentType.DEVOPS],
  },
  [AgentType.SECURITY]: {
    type: AgentType.SECURITY,
    name: 'Security Engineer',
    shortName: 'Sec',
    description:
      'Audits security, fixes vulnerabilities, and ensures compliance',
    icon: 'shield',
    color: '#6366F1', // indigo
    capabilities: AGENT_CAPABILITIES[AgentType.SECURITY],
  },
};

// ============ AGENT STATE ============

export interface AgentState {
  type: AgentType;
  status: AgentStatus;
  currentTaskId?: string;
  currentTask?: string;
  progress?: number;
  lastActivity?: Date;
  metadata?: Record<string, unknown>;
}

// ============ MESSAGE TYPES ============

export interface AgentMessage {
  id: string;
  projectId: string;
  threadId?: string;
  senderType: 'user' | 'agent' | 'system';
  senderAgent?: AgentType;
  recipientAgent?: AgentType;
  content: string;
  messageType: MessageType;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export enum MessageType {
  TEXT = 'text',
  CODE = 'code',
  API_CONTRACT = 'api_contract',
  TASK_ASSIGNMENT = 'task_assignment',
  TASK_UPDATE = 'task_update',
  REVIEW_REQUEST = 'review_request',
  REVIEW_RESPONSE = 'review_response',
  ERROR = 'error',
  SYSTEM = 'system',
}

// ============ TASK TYPES ============

export interface AgentTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedAgent: AgentType;
  status: TaskStatus;
  priority: TaskPriority;
  dependencies: string[];
  estimatedMinutes?: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// ============ PROJECT CONTEXT ============

export interface ProjectContext {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  files: ProjectFile[];
  tasks: AgentTask[];
  recentMessages: AgentMessage[];
  agentStates: AgentState[];
}

export interface ProjectFile {
  path: string;
  name: string;
  extension: string;
  content?: string;
  language?: string;
}

// ============ LLM TYPES ============

export interface LLMProvider {
  name: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface LLMRequest {
  systemPrompt: string;
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'error';
}

// ============ AGENT CONFIG ============

export interface AgentConfig {
  type: AgentType;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  capabilities: AgentCapability[];
}
