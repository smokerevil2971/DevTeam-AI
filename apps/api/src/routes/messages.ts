import { FastifyInstance } from 'fastify';
import { db } from '@devteam/database';
import {
  ProjectIdParamSchema,
  MessageIdParamSchema,
  CreateMessageSchema,
  ListMessagesQuerySchema,
  AddReactionSchema,
} from '../schemas/message';

export default async function messageRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  // ========================================
  // SEND MESSAGE
  // POST /api/v1/projects/:id/messages
  // ========================================
  fastify.post<{
    Params: { id: string };
    Body: unknown;
  }>('/', async (request, reply) => {
    const { id: projectId } = ProjectIdParamSchema.parse(request.params);
    const data = CreateMessageSchema.parse(request.body);
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

    // Create message
    const message = await db.message.create({
      data: {
        projectId,
        threadId: data.threadId,
        senderType: 'user',
        senderId: userId,
        messageType: data.messageType,
        content: data.content,
        metadata: data.metadata,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        reactions: true,
        attachments: true,
      },
    });

    // Create attachments if provided
    if (data.attachmentIds && data.attachmentIds.length > 0) {
      await db.messageAttachment.createMany({
        data: data.attachmentIds.map((fileId) => ({
          messageId: message.id,
          fileId,
        })),
      });
    }

    // TODO: Trigger agent notifications via WebSocket

    return reply.status(201).send(message);
  });

  // ========================================
  // GET MESSAGES (Cursor-based pagination)
  // GET /api/v1/projects/:id/messages
  // ========================================
  fastify.get<{
    Params: { id: string };
    Querystring: unknown;
  }>('/', async (request, reply) => {
    const { id: projectId } = ProjectIdParamSchema.parse(request.params);
    const query = ListMessagesQuerySchema.parse(request.query);
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
    if (query.threadId) where.threadId = query.threadId;
    if (query.senderType) where.senderType = query.senderType;
    if (query.senderId) where.senderId = query.senderId;

    // Date filters
    if (query.before || query.after) {
      where.createdAt = {};
      if (query.before) where.createdAt.lt = new Date(query.before);
      if (query.after) where.createdAt.gt = new Date(query.after);
    }

    // Cursor-based pagination
    const cursorObj = query.cursor ? { id: query.cursor } : undefined;

    const messages = await db.message.findMany({
      where,
      take: query.limit + 1, // Fetch one extra to check for next page
      skip: query.cursor ? 1 : 0, // Skip cursor if provided
      cursor: cursorObj,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, image: true } },
        reactions: true,
        attachments: true,
      },
    });

    // Check if there's a next page
    let nextCursor: string | null = null;
    if (messages.length > query.limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id || null;
    }

    return reply.send({
      data: messages,
      pagination: {
        nextCursor,
        hasMore: !!nextCursor,
      },
    });
  });

  // ========================================
  // GET THREADS
  // GET /api/v1/projects/:id/threads
  // ========================================
  fastify.get<{
    Params: { id: string };
  }>('/threads', async (request, reply) => {
    const { id: projectId } = ProjectIdParamSchema.parse(request.params);
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

    // Get unique thread IDs with their latest message and message count
    const threads = await db.message.groupBy({
      by: ['threadId'],
      where: {
        projectId,
        threadId: { not: null },
      },
      _count: { id: true },
      _max: { createdAt: true },
    });

    // Get the first message of each thread for preview
    const threadPreviews = await Promise.all(
      threads.map(async (thread) => {
        const firstMessage = await db.message.findFirst({
          where: { projectId, threadId: thread.threadId },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            content: true,
            senderType: true,
            senderId: true,
            createdAt: true,
            user: { select: { id: true, name: true, image: true } },
          },
        });

        const lastMessage = await db.message.findFirst({
          where: { projectId, threadId: thread.threadId },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        });

        return {
          threadId: thread.threadId,
          messageCount: thread._count.id,
          lastActivityAt: thread._max.createdAt,
          firstMessage,
          lastMessage,
        };
      })
    );

    // Sort by last activity
    threadPreviews.sort((a, b) => {
      const dateA = a.lastActivityAt?.getTime() || 0;
      const dateB = b.lastActivityAt?.getTime() || 0;
      return dateB - dateA;
    });

    return reply.send(threadPreviews);
  });

  // ========================================
  // ADD REACTION
  // POST /api/v1/projects/:id/messages/:msgId/reactions
  // ========================================
  fastify.post<{
    Params: { id: string; msgId: string };
    Body: unknown;
  }>('/:msgId/reactions', async (request, reply) => {
    const { id: projectId, msgId: messageId } = MessageIdParamSchema.parse(request.params);
    const { emoji } = AddReactionSchema.parse(request.body);
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

    // Verify message exists in project
    const message = await db.message.findFirst({
      where: { id: messageId, projectId },
    });

    if (!message) {
      return reply.notFound('Message not found');
    }

    // Check if user already reacted with this emoji
    const existingReaction = await db.messageReaction.findFirst({
      where: { messageId, userId, emoji },
    });

    if (existingReaction) {
      // Remove reaction (toggle behavior)
      await db.messageReaction.delete({
        where: { id: existingReaction.id },
      });
      return reply.send({ action: 'removed', emoji });
    }

    // Add new reaction
    const reaction = await db.messageReaction.create({
      data: {
        messageId,
        userId,
        emoji,
      },
    });

    return reply.status(201).send({ action: 'added', emoji, reaction });
  });

  // ========================================
  // DELETE REACTION
  // DELETE /api/v1/projects/:id/messages/:msgId/reactions/:emoji
  // ========================================
  fastify.delete<{
    Params: { id: string; msgId: string; emoji: string };
  }>('/:msgId/reactions/:emoji', async (request, reply) => {
    const { id: projectId, msgId: messageId, emoji } = request.params;
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

    // Find and delete the reaction
    const reaction = await db.messageReaction.findFirst({
      where: { messageId, userId, emoji: decodeURIComponent(emoji) },
    });

    if (!reaction) {
      return reply.notFound('Reaction not found');
    }

    await db.messageReaction.delete({
      where: { id: reaction.id },
    });

    return reply.status(204).send();
  });
}
