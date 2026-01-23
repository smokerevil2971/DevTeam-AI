import { z } from 'zod';

// Task status enum matching Prisma schema
export const TaskStatus = z.enum([
  'pending',
  'in_progress',
  'review',
  'blocked',
  'completed',
  'cancelled',
]);

// Task priority enum matching Prisma schema
export const TaskPriority = z.enum([
  'low',
  'medium',
  'high',
  'critical',
]);

// Agent type enum matching Prisma schema
export const AgentType = z.enum([
  'pm',
  'frontend',
  'backend',
  'database',
  'security',
  'testing',
  'devops',
  'ml',
]);

// Create task schema
export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: TaskPriority.default('medium'),
  status: TaskStatus.default('pending'),
  parentId: z.string().uuid().optional(),
  assignedAgent: AgentType.optional(),
  assignedUserId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  estimatedMinutes: z.number().int().positive().optional(),
});

// Update task schema
export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  priority: TaskPriority.optional(),
  status: TaskStatus.optional(),
  parentId: z.string().uuid().nullable().optional(),
  assignedAgent: AgentType.nullable().optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
  actualMinutes: z.number().int().positive().optional(),
  order: z.number().int().optional(),
});

// List tasks query schema
export const ListTasksQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: TaskStatus.optional(),
  priority: TaskPriority.optional(),
  assignedAgent: AgentType.optional(),
  parentId: z.string().uuid().optional(),
  includeSubtasks: z.coerce.boolean().default(false),
  sortBy: z.enum(['order', 'priority', 'createdAt', 'updatedAt', 'dueDate']).default('order'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Task ID param schema
export const TaskIdParamSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
});

// Project ID param schema (for task routes)
export const ProjectIdParamSchema = z.object({
  id: z.string().uuid(),
});

// Add comment schema
export const AddCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

// Reorder tasks schema
export const ReorderTasksSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1),
});

export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type ListTasksQuery = z.infer<typeof ListTasksQuerySchema>;
export type TaskIdParam = z.infer<typeof TaskIdParamSchema>;
export type AddComment = z.infer<typeof AddCommentSchema>;
export type ReorderTasks = z.infer<typeof ReorderTasksSchema>;
