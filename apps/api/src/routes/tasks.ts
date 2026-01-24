import { FastifyInstance } from 'fastify';
import { db } from '@devteam/database';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  ListTasksQuerySchema,
  TaskIdParamSchema,
  ProjectIdParamSchema,
  AddCommentSchema,
  ReorderTasksSchema,
} from '../schemas/task';

export default async function taskRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  // ========================================
  // CREATE TASK
  // POST /api/v1/projects/:id/tasks
  // ========================================
  fastify.post<{
    Params: { id: string };
    Body: unknown;
  }>('/', async (request, reply) => {
    const { id: projectId } = ProjectIdParamSchema.parse(request.params);
    const data = CreateTaskSchema.parse(request.body);
    const userId = request.user!.id;

    // Verify project exists and user has access
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

    // Calculate order position (add to end)
    const lastTask = await db.task.findFirst({
      where: { projectId, parentId: data.parentId || null },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const order = (lastTask?.order ?? -1) + 1;

    // Create task
    const task = await db.task.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        parentId: data.parentId,
        assignedAgent: data.assignedAgent,
        assignedUserId: data.assignedUserId,
        estimatedMinutes: data.estimatedMinutes,
        order,
      },
      include: {
        subTasks: true,
        comments: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    });

    return reply.status(201).send(task);
  });

  // ========================================
  // LIST TASKS
  // GET /api/v1/projects/:id/tasks
  // ========================================
  fastify.get<{
    Params: { id: string };
    Querystring: unknown;
  }>('/', async (request, reply) => {
    const { id: projectId } = ProjectIdParamSchema.parse(request.params);
    const query = ListTasksQuerySchema.parse(request.query);
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

    // Build where clause
    const where: any = { projectId };
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.assignedAgent) where.assignedAgent = query.assignedAgent;
    if (query.parentId) {
      where.parentId = query.parentId;
    } else if (!query.includeSubtasks) {
      where.parentId = null; // Only top-level tasks
    }

    // Build orderBy
    const orderBy: any = {};
    if (query.sortBy === 'priority') {
      // Custom priority ordering
      orderBy.priority = query.sortOrder;
    } else {
      orderBy[query.sortBy] = query.sortOrder;
    }

    // Pagination
    const skip = (query.page - 1) * query.limit;

    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
        include: {
          subTasks: query.includeSubtasks ? {
            include: {
              subTasks: true,
            },
          } : { select: { id: true } },
          assignedUser: { select: { id: true, name: true, image: true } },
          _count: { select: { comments: true } },
        },
      }),
      db.task.count({ where }),
    ]);

    return reply.send({
      data: tasks,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  });

  // ========================================
  // GET TASK DETAILS
  // GET /api/v1/projects/:id/tasks/:taskId
  // ========================================
  fastify.get<{
    Params: { id: string; taskId: string };
  }>('/:taskId', async (request, reply) => {
    const { id: projectId, taskId } = TaskIdParamSchema.parse(request.params);
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

    const task = await db.task.findFirst({
      where: { id: taskId, projectId },
      include: {
        subTasks: {
          include: {
            assignedUser: { select: { id: true, name: true, image: true } },
          },
          orderBy: { order: 'asc' },
        },
        parent: { select: { id: true, title: true } },
        assignedUser: { select: { id: true, name: true, email: true, image: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        agentActivity: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        dependencies: {
          include: { dependsOn: { select: { id: true, title: true, status: true } } },
        },
        dependents: {
          include: { task: { select: { id: true, title: true, status: true } } },
        },
      },
    });

    if (!task) {
      return reply.notFound('Task not found');
    }

    return reply.send(task);
  });

  // ========================================
  // UPDATE TASK
  // PUT /api/v1/projects/:id/tasks/:taskId
  // ========================================
  fastify.put<{
    Params: { id: string; taskId: string };
    Body: unknown;
  }>('/:taskId', async (request, reply) => {
    const { id: projectId, taskId } = TaskIdParamSchema.parse(request.params);
    const data = UpdateTaskSchema.parse(request.body);
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

    // Find existing task
    const existingTask = await db.task.findFirst({
      where: { id: taskId, projectId },
    });

    if (!existingTask) {
      return reply.notFound('Task not found');
    }

    // Handle status transitions
    const updateData: any = { ...data };
    
    // Set completedAt when task is completed
    if (data.status === 'completed' && existingTask.status !== 'completed') {
      updateData.completedAt = new Date();
    } else if (data.status && data.status !== 'completed' && existingTask.status === 'completed') {
      updateData.completedAt = null;
    }

    // Update task
    const task = await db.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        subTasks: true,
        assignedUser: { select: { id: true, name: true, image: true } },
        comments: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return reply.send(task);
  });

  // ========================================
  // DELETE TASK
  // DELETE /api/v1/projects/:id/tasks/:taskId
  // ========================================
  fastify.delete<{
    Params: { id: string; taskId: string };
  }>('/:taskId', async (request, reply) => {
    const { id: projectId, taskId } = TaskIdParamSchema.parse(request.params);
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

    // Find task
    const task = await db.task.findFirst({
      where: { id: taskId, projectId },
    });

    if (!task) {
      return reply.notFound('Task not found');
    }

    // Delete task (cascades to subtasks, comments, dependencies)
    await db.task.delete({
      where: { id: taskId },
    });

    return reply.status(204).send();
  });

  // ========================================
  // ADD COMMENT
  // POST /api/v1/projects/:id/tasks/:taskId/comments
  // ========================================
  fastify.post<{
    Params: { id: string; taskId: string };
    Body: unknown;
  }>('/:taskId/comments', async (request, reply) => {
    const { id: projectId, taskId } = TaskIdParamSchema.parse(request.params);
    const data = AddCommentSchema.parse(request.body);
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

    // Verify task exists
    const task = await db.task.findFirst({
      where: { id: taskId, projectId },
    });

    if (!task) {
      return reply.notFound('Task not found');
    }

    // Create comment
    const comment = await db.taskComment.create({
      data: {
        taskId,
        userId,
        content: data.content,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return reply.status(201).send(comment);
  });

  // ========================================
  // REORDER TASKS
  // PUT /api/v1/projects/:id/tasks/reorder
  // ========================================
  fastify.put<{
    Params: { id: string };
    Body: unknown;
  }>('/reorder', async (request, reply) => {
    const { id: projectId } = ProjectIdParamSchema.parse(request.params);
    const { taskIds } = ReorderTasksSchema.parse(request.body);
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

    // Verify all tasks belong to project
    const tasks = await db.task.findMany({
      where: {
        id: { in: taskIds },
        projectId,
      },
      select: { id: true },
    });

    if (tasks.length !== taskIds.length) {
      return reply.badRequest('Some tasks not found in project');
    }

    // Update order for each task
    await db.$transaction(
      taskIds.map((taskId, index) =>
        db.task.update({
          where: { id: taskId },
          data: { order: index },
        })
      )
    );

    return reply.send({ success: true, message: 'Tasks reordered successfully' });
  });
}
