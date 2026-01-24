import { FastifyPluginAsync } from 'fastify';
import { db } from '@devteam/database';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  ListProjectsQuerySchema,
  ProjectIdParamSchema,
} from '../schemas/project';

const projectRoutes: FastifyPluginAsync = async (fastify) => {
  // All project routes require authentication
  fastify.addHook('preHandler', fastify.authenticate);

  /**
   * POST /projects - Create a new project
   */
  fastify.post('/', async (request, reply) => {
    const data = CreateProjectSchema.parse(request.body);
    const userId = request.user!.id;

    const project = await db.project.create({
      data: {
        name: data.name,
        description: data.description,
        visibility: data.visibility,
        techStack: data.techStack,
        userId,
        status: 'draft',
      },
      include: {
        settings: true,
      },
    });

    // Initialize default project settings
    await db.projectSettings.create({
      data: {
        projectId: project.id,
        config: {
          codeStyle: 'prettier',
          testFramework: 'vitest',
        },
      },
    });

    // Create initial README file
    await db.file.create({
      data: {
        projectId: project.id,
        path: '/README.md',
        name: 'README.md',
        extension: 'md',
        content: `# ${project.name}\n\n${project.description || 'A new DevTeam AI project.'}\n`,
        mimeType: 'text/markdown',
        lastModifiedBy: userId,
      },
    });

    fastify.log.info({ projectId: project.id }, 'Project created');

    return reply.status(201).send(project);
  });

  /**
   * GET /projects - List user's projects
   */
  fastify.get('/', async (request, reply) => {
    const query = ListProjectsQuerySchema.parse(request.query);
    const userId = request.user!.id;

    const where: any = {
      userId,
      deletedAt: null,
    };

    if (query.status) {
      where.status = query.status;
    }

    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        orderBy: { [query.sort]: query.order },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          _count: {
            select: { tasks: true, messages: true, files: true },
          },
        },
      }),
      db.project.count({ where }),
    ]);

    return reply.send({
      data: projects,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  });

  /**
   * GET /projects/:id - Get project details
   */
  fastify.get('/:id', async (request, reply) => {
    const { id } = ProjectIdParamSchema.parse(request.params);
    const userId = request.user!.id;

    const project = await db.project.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: {
        settings: true,
        _count: {
          select: { tasks: true, messages: true, files: true, members: true },
        },
        tasks: {
          take: 5,
          orderBy: { updatedAt: 'desc' },
          select: { id: true, title: true, status: true, priority: true },
        },
        agentActivity: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: { id: true, agentType: true, activityType: true, description: true, createdAt: true },
        },
      },
    });

    if (!project) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    return reply.send(project);
  });

  /**
   * PUT /projects/:id - Update project
   */
  fastify.put('/:id', async (request, reply) => {
    const { id } = ProjectIdParamSchema.parse(request.params);
    const data = UpdateProjectSchema.parse(request.body);
    const userId = request.user!.id;

    // Check project exists and user owns it
    const existing = await db.project.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    const project = await db.project.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        visibility: data.visibility,
        techStack: data.techStack,
      },
    });

    fastify.log.info({ projectId: id }, 'Project updated');

    return reply.send(project);
  });

  /**
   * DELETE /projects/:id - Soft delete project
   */
  fastify.delete('/:id', async (request, reply) => {
    const { id } = ProjectIdParamSchema.parse(request.params);
    const userId = request.user!.id;

    // Check project exists and user owns it
    const existing = await db.project.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    // Soft delete
    await db.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    fastify.log.info({ projectId: id }, 'Project deleted (soft)');

    return reply.status(204).send();
  });

  /**
   * POST /projects/:id/archive - Archive project
   */
  fastify.post('/:id/archive', async (request, reply) => {
    const { id } = ProjectIdParamSchema.parse(request.params);
    const userId = request.user!.id;

    const existing = await db.project.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    const project = await db.project.update({
      where: { id },
      data: { status: 'archived' },
    });

    fastify.log.info({ projectId: id }, 'Project archived');

    return reply.send(project);
  });

  /**
   * POST /projects/:id/restore - Restore archived/deleted project
   */
  fastify.post('/:id/restore', async (request, reply) => {
    const { id } = ProjectIdParamSchema.parse(request.params);
    const userId = request.user!.id;

    // Find even soft-deleted projects
    const existing = await db.project.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    const project = await db.project.update({
      where: { id },
      data: {
        status: 'active',
        deletedAt: null,
      },
    });

    fastify.log.info({ projectId: id }, 'Project restored');

    return reply.send(project);
  });
};

export default projectRoutes;
