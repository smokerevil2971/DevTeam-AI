import { FastifyInstance } from 'fastify';
import { db } from '@devteam/database';
import {
  ProjectIdParamSchema,
  FilePathParamSchema,
  UpsertFileSchema,
  MoveFileSchema,
  ListFilesQuerySchema,
} from '../schemas/file';
import path from 'path';

// Helper to build tree structure from flat file list
function buildFileTree(files: any[]) {
  const root: any = { name: '/', path: '/', type: 'directory', children: [] };
  const pathMap = new Map<string, any>();
  pathMap.set('/', root);

  // Sort files by path for proper ordering
  files.sort((a, b) => a.path.localeCompare(b.path));

  for (const file of files) {
    const parts = file.path.split('/').filter(Boolean);
    let currentPath = '';

    // Create directory nodes as needed
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const parentPath = currentPath || '/';
      currentPath = currentPath + '/' + part;

      if (!pathMap.has(currentPath)) {
        const dirNode = {
          name: part,
          path: currentPath,
          type: 'directory',
          children: [],
        };
        pathMap.set(currentPath, dirNode);

        const parent = pathMap.get(parentPath);
        if (parent) parent.children.push(dirNode);
      }
    }

    // Add the file node
    const fileName = parts[parts.length - 1];
    const parentPath = parts.length > 1 ? '/' + parts.slice(0, -1).join('/') : '/';
    
    const fileNode = {
      id: file.id,
      name: fileName,
      path: file.path,
      type: 'file',
      extension: file.extension,
      size: file.size,
      mimeType: file.mimeType,
      updatedAt: file.updatedAt,
      deletedAt: file.deletedAt,
    };

    const parent = pathMap.get(parentPath);
    if (parent) parent.children.push(fileNode);
  }

  return root;
}

// Helper to extract file metadata from path
function getFileMetadata(filePath: string) {
  const name = path.basename(filePath);
  const extension = path.extname(filePath).slice(1) || '';
  return { name, extension };
}

// Helper to get MIME type from extension
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    'ts': 'text/typescript',
    'tsx': 'text/typescript-jsx',
    'js': 'text/javascript',
    'jsx': 'text/javascript-jsx',
    'json': 'application/json',
    'html': 'text/html',
    'css': 'text/css',
    'md': 'text/markdown',
    'txt': 'text/plain',
    'py': 'text/x-python',
    'go': 'text/x-go',
    'rs': 'text/x-rust',
    'sql': 'text/x-sql',
    'yaml': 'text/yaml',
    'yml': 'text/yaml',
    'xml': 'text/xml',
    'svg': 'image/svg+xml',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
  };
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

export default async function fileRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  // ========================================
  // LIST FILES (Tree Structure)
  // GET /api/v1/projects/:id/files
  // ========================================
  fastify.get<{
    Params: { id: string };
    Querystring: unknown;
  }>('/', async (request, reply) => {
    const { id: projectId } = ProjectIdParamSchema.parse(request.params);
    const query = ListFilesQuerySchema.parse(request.query);
    const userId = request.user!.id;

    // Verify project access
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!project) {
      return reply.notFound('Project not found');
    }

    // Get files (metadata only, no content)
    const where: any = { projectId };
    if (!query.includeDeleted) {
      where.deletedAt = null;
    }

    const files = await db.file.findMany({
      where,
      select: {
        id: true,
        path: true,
        name: true,
        extension: true,
        size: true,
        mimeType: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    // Build and return tree structure
    const tree = buildFileTree(files);
    return reply.send(tree);
  });

  // ========================================
  // GET FILE CONTENT
  // GET /api/v1/projects/:id/files/*
  // ========================================
  fastify.get<{
    Params: { id: string; '*': string };
  }>('/*', async (request, reply) => {
    const params = FilePathParamSchema.parse(request.params);
    const projectId = params.id;
    const filePath = '/' + params['*'];
    const userId = request.user!.id;

    // Verify project access
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!project) {
      return reply.notFound('Project not found');
    }

    // Get file with content
    const file = await db.file.findFirst({
      where: {
        projectId,
        path: filePath,
        deletedAt: null,
      },
    });

    if (!file) {
      return reply.notFound('File not found');
    }

    // Return file with content
    return reply.send({
      id: file.id,
      path: file.path,
      name: file.name,
      extension: file.extension,
      content: file.content,
      size: file.size,
      mimeType: file.mimeType,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    });
  });

  // ========================================
  // GET FILE HISTORY
  // GET /api/v1/projects/:id/files/history?path=/path/to/file
  // ========================================
  fastify.get<{
    Params: { id: string };
    Querystring: { path?: string };
  }>('/history', async (request, reply) => {
    const { id: projectId } = ProjectIdParamSchema.parse(request.params);
    const filePath = request.query.path || '';
    const userId = request.user!.id;

    if (!filePath) {
      return reply.badRequest('File path is required');
    }

    const normalizedPath = filePath.startsWith('/') ? filePath : '/' + filePath;

    // Verify project access
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!project) {
      return reply.notFound('Project not found');
    }

    // Get file with versions
    const file = await db.file.findFirst({
      where: { projectId, path: normalizedPath },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    if (!file) {
      return reply.notFound('File not found');
    }

    return reply.send({
      fileId: file.id,
      path: file.path,
      versions: file.versions,
    });
  });

  // ========================================
  // CREATE/UPDATE FILE
  // PUT /api/v1/projects/:id/files/*
  // ========================================
  fastify.put<{
    Params: { id: string; '*': string };
    Body: unknown;
  }>('/*', async (request, reply) => {
    const params = FilePathParamSchema.parse(request.params);
    const projectId = params.id;
    const filePath = '/' + params['*'];
    const data = UpsertFileSchema.parse(request.body);
    const userId = request.user!.id;

    // Verify project access
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!project) {
      return reply.notFound('Project not found');
    }

    const { name, extension } = getFileMetadata(filePath);
    const mimeType = getMimeType(extension);
    const size = Buffer.byteLength(data.content, 'utf8');

    // Check if file exists
    const existingFile = await db.file.findFirst({
      where: { projectId, path: filePath },
    });

    if (existingFile) {
      // Create version before updating (if content differs)
      if (existingFile.content !== data.content && existingFile.content) {
        await db.fileVersion.create({
          data: {
            fileId: existingFile.id,
            content: existingFile.content,
          },
        });
      }

      // Restore if soft-deleted
      const file = await db.file.update({
        where: { id: existingFile.id },
        data: {
          content: data.content,
          size,
          mimeType,
          lastModifiedBy: userId,
          deletedAt: null, // Restore if was deleted
        },
      });

      return reply.send(file);
    }

    // Create new file
    const file = await db.file.create({
      data: {
        projectId,
        path: filePath,
        name,
        extension,
        content: data.content,
        size,
        mimeType,
        lastModifiedBy: userId,
      },
    });

    return reply.status(201).send(file);
  });

  // ========================================
  // DELETE FILE (Soft Delete)
  // DELETE /api/v1/projects/:id/files/*
  // ========================================
  fastify.delete<{
    Params: { id: string; '*': string };
  }>('/*', async (request, reply) => {
    const params = FilePathParamSchema.parse(request.params);
    const projectId = params.id;
    const filePath = '/' + params['*'];
    const userId = request.user!.id;

    // Verify project access
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!project) {
      return reply.notFound('Project not found');
    }

    // Find file
    const file = await db.file.findFirst({
      where: { projectId, path: filePath, deletedAt: null },
    });

    if (!file) {
      return reply.notFound('File not found');
    }

    // Soft delete
    await db.file.update({
      where: { id: file.id },
      data: { deletedAt: new Date() },
    });

    return reply.status(204).send();
  });

  // ========================================
  // MOVE/RENAME FILE
  // POST /api/v1/projects/:id/files/move
  // ========================================
  fastify.post<{
    Params: { id: string };
    Body: unknown;
  }>('/move', async (request, reply) => {
    const { id: projectId } = ProjectIdParamSchema.parse(request.params);
    const { sourcePath, destinationPath } = MoveFileSchema.parse(request.body);
    const userId = request.user!.id;

    // Verify project access
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!project) {
      return reply.notFound('Project not found');
    }

    // Normalize paths
    const normalizedSource = sourcePath.startsWith('/') ? sourcePath : '/' + sourcePath;
    const normalizedDest = destinationPath.startsWith('/') ? destinationPath : '/' + destinationPath;

    // Find source file
    const sourceFile = await db.file.findFirst({
      where: { projectId, path: normalizedSource, deletedAt: null },
    });

    if (!sourceFile) {
      return reply.notFound('Source file not found');
    }

    // Check if destination already exists
    const existingDest = await db.file.findFirst({
      where: { projectId, path: normalizedDest, deletedAt: null },
    });

    if (existingDest) {
      return reply.conflict('Destination file already exists');
    }

    // Update file path
    const { name, extension } = getFileMetadata(normalizedDest);
    const mimeType = getMimeType(extension);

    const file = await db.file.update({
      where: { id: sourceFile.id },
      data: {
        path: normalizedDest,
        name,
        extension,
        mimeType,
        lastModifiedBy: userId,
      },
    });

    return reply.send(file);
  });
}
