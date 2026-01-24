import { create } from 'zustand';

export type AgentType =
  | 'project_manager'
  | 'frontend_dev'
  | 'backend_dev'
  | 'designer'
  | 'qa_engineer'
  | 'devops'
  | 'architect'
  | 'security';

export type AgentStatus = 'active' | 'idle' | 'working' | 'error' | 'offline';

export interface Agent {
  type: AgentType;
  status: AgentStatus;
  currentTask?: string;
  progress?: number;
  lastActivity?: Date;
  metrics?: {
    tasksCompleted: number;
    messagesCount: number;
    avgResponseTime: number;
  };
}

interface AgentState {
  // Agent statuses
  agents: Map<AgentType, Agent>;

  // Currently active/working agents
  activeAgents: AgentType[];

  // Selected agent for chat
  selectedAgent: AgentType | null;

  // Actions
  setAgentStatus: (type: AgentType, status: AgentStatus) => void;
  setAgentTask: (
    type: AgentType,
    task: string | undefined,
    progress?: number,
  ) => void;
  updateAgent: (type: AgentType, updates: Partial<Agent>) => void;
  selectAgent: (type: AgentType | null) => void;

  // Bulk updates (from WebSocket)
  syncAgents: (agents: Agent[]) => void;

  // Getters
  getAgent: (type: AgentType) => Agent | undefined;
  getWorkingAgents: () => Agent[];
}

// Initialize default agents
const defaultAgents = new Map<AgentType, Agent>([
  ['project_manager', { type: 'project_manager', status: 'active' }],
  ['frontend_dev', { type: 'frontend_dev', status: 'active' }],
  ['backend_dev', { type: 'backend_dev', status: 'active' }],
  ['designer', { type: 'designer', status: 'idle' }],
  ['qa_engineer', { type: 'qa_engineer', status: 'idle' }],
  ['devops', { type: 'devops', status: 'idle' }],
  ['architect', { type: 'architect', status: 'offline' }],
  ['security', { type: 'security', status: 'offline' }],
]);

export const useAgentStore = create<AgentState>()((set, get) => ({
  agents: defaultAgents,
  activeAgents: ['project_manager', 'frontend_dev', 'backend_dev'],
  selectedAgent: null,

  setAgentStatus: (type, status) =>
    set((state) => {
      const newAgents = new Map(state.agents);
      const agent = newAgents.get(type);
      if (agent) {
        newAgents.set(type, { ...agent, status, lastActivity: new Date() });
      }

      // Update active agents list
      const activeAgents = Array.from(newAgents.values())
        .filter((a) => a.status === 'active' || a.status === 'working')
        .map((a) => a.type);

      return { agents: newAgents, activeAgents };
    }),

  setAgentTask: (type, task, progress) =>
    set((state) => {
      const newAgents = new Map(state.agents);
      const agent = newAgents.get(type);
      if (agent) {
        newAgents.set(type, {
          ...agent,
          currentTask: task,
          progress,
          status: task ? 'working' : 'active',
          lastActivity: new Date(),
        });
      }
      return { agents: newAgents };
    }),

  updateAgent: (type, updates) =>
    set((state) => {
      const newAgents = new Map(state.agents);
      const agent = newAgents.get(type);
      if (agent) {
        newAgents.set(type, { ...agent, ...updates });
      }
      return { agents: newAgents };
    }),

  selectAgent: (selectedAgent) => set({ selectedAgent }),

  syncAgents: (agents) =>
    set(() => {
      const newAgents = new Map<AgentType, Agent>();
      agents.forEach((agent) => {
        newAgents.set(agent.type, agent);
      });

      const activeAgents = agents
        .filter((a) => a.status === 'active' || a.status === 'working')
        .map((a) => a.type);

      return { agents: newAgents, activeAgents };
    }),

  getAgent: (type) => get().agents.get(type),

  getWorkingAgents: () =>
    Array.from(get().agents.values()).filter((a) => a.status === 'working'),
}));
