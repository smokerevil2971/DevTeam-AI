import { z } from 'zod';

// Project status enum matching Prisma schema
export const ProjectStatusEnum = z.enum(['draft', 'active', 'paused', 'completed', 'archived']);
export const VisibilityEnum = z.enum(['private', 'team', 'public']);

// Create project
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  visibility: VisibilityEnum.optional().default('private'),
  techStack: z.record(z.array(z.string())).optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

// Update project
export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: ProjectStatusEnum.optional(),
  visibility: VisibilityEnum.optional(),
  techStack: z.record(z.array(z.string())).optional(),
});

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

// List projects query params
export const ListProjectsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: ProjectStatusEnum.optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'name']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type ListProjectsQuery = z.infer<typeof ListProjectsQuerySchema>;

// Project ID param
export const ProjectIdParamSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
});

export type ProjectIdParam = z.infer<typeof ProjectIdParamSchema>;
