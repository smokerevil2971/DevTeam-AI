import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Project, Task } from '@/stores';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API helper function
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// ============ PROJECTS ============

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchAPI<Project[]>('/api/v1/projects'),
  });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchAPI<Project>(`/api/v1/projects/${projectId}`),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Project>) =>
      fetchAPI<Project>('/api/v1/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      fetchAPI<Project>(`/api/v1/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchAPI(`/api/v1/projects/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ============ TASKS ============

export function useTasks(projectId: string | undefined) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => fetchAPI<Task[]>(`/api/v1/projects/${projectId}/tasks`),
    enabled: !!projectId,
  });
}

export function useTask(
  projectId: string | undefined,
  taskId: string | undefined,
) {
  return useQuery({
    queryKey: ['task', projectId, taskId],
    queryFn: () =>
      fetchAPI<Task>(`/api/v1/projects/${projectId}/tasks/${taskId}`),
    enabled: !!projectId && !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: Partial<Task>;
    }) =>
      fetchAPI<Task>(`/api/v1/projects/${projectId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.projectId],
      });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
      data,
    }: {
      projectId: string;
      taskId: string;
      data: Partial<Task>;
    }) =>
      fetchAPI<Task>(`/api/v1/projects/${projectId}/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ['task', variables.projectId, variables.taskId],
      });
    },
  });
}

// ============ MESSAGES ============

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  agentType?: string;
  createdAt: Date;
}

export function useMessages(projectId: string | undefined) {
  return useQuery({
    queryKey: ['messages', projectId],
    queryFn: () =>
      fetchAPI<Message[]>(`/api/v1/projects/${projectId}/messages`),
    enabled: !!projectId,
    // Refresh messages more frequently
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      content,
      agentType,
    }: {
      projectId: string;
      content: string;
      agentType?: string;
    }) =>
      fetchAPI<Message>(`/api/v1/projects/${projectId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content, agentType }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['messages', variables.projectId],
      });
    },
  });
}

// ============ FILES ============

interface ProjectFile {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
}

export function useFiles(projectId: string | undefined) {
  return useQuery({
    queryKey: ['files', projectId],
    queryFn: () =>
      fetchAPI<ProjectFile[]>(`/api/v1/projects/${projectId}/files`),
    enabled: !!projectId,
  });
}

export function useFileContent(
  projectId: string | undefined,
  filePath: string | undefined,
) {
  return useQuery({
    queryKey: ['file-content', projectId, filePath],
    queryFn: () =>
      fetchAPI<{ content: string }>(
        `/api/v1/projects/${projectId}/files?path=${encodeURIComponent(filePath!)}`,
      ),
    enabled: !!projectId && !!filePath,
  });
}

export function useSaveFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      filePath,
      content,
    }: {
      projectId: string;
      filePath: string;
      content: string;
    }) =>
      fetchAPI(`/api/v1/projects/${projectId}/files`, {
        method: 'PUT',
        body: JSON.stringify({ path: filePath, content }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['file-content', variables.projectId, variables.filePath],
      });
    },
  });
}
