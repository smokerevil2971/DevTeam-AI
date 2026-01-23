import { z } from 'zod';

// Project ID param schema
export const ProjectIdParamSchema = z.object({
  id: z.string().uuid(),
});

// File path param schema (captures the rest of the path after /files/)
export const FilePathParamSchema = z.object({
  id: z.string().uuid(),
  '*': z.string().min(1), // Wildcard for file path
});

// Create/Update file schema
export const UpsertFileSchema = z.object({
  content: z.string(),
  createParentDirs: z.boolean().default(true),
});

// Move/Rename file schema
export const MoveFileSchema = z.object({
  sourcePath: z.string().min(1),
  destinationPath: z.string().min(1),
});

// List files query schema
export const ListFilesQuerySchema = z.object({
  includeDeleted: z.coerce.boolean().default(false),
});

export type UpsertFile = z.infer<typeof UpsertFileSchema>;
export type MoveFile = z.infer<typeof MoveFileSchema>;
export type ListFilesQuery = z.infer<typeof ListFilesQuerySchema>;
