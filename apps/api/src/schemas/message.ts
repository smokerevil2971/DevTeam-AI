import { z } from 'zod';

// Sender type enum matching Prisma schema
export const SenderType = z.enum(['user', 'agent', 'system']);

// Message type enum
export const MessageType = z.enum(['text', 'code', 'api_contract', 'file', 'task']);

// Project ID param schema
export const ProjectIdParamSchema = z.object({
  id: z.string().uuid(),
});

// Message ID param schema
export const MessageIdParamSchema = z.object({
  id: z.string().uuid(),
  msgId: z.string().uuid(),
});

// Create message schema
export const CreateMessageSchema = z.object({
  content: z.string().min(1).max(50000),
  messageType: MessageType.default('text'),
  threadId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
  attachmentIds: z.array(z.string().uuid()).optional(),
});

// List messages query schema (cursor-based pagination)
export const ListMessagesQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  threadId: z.string().uuid().optional(),
  senderType: SenderType.optional(),
  senderId: z.string().optional(),
  before: z.string().datetime().optional(),
  after: z.string().datetime().optional(),
});

// Add reaction schema
export const AddReactionSchema = z.object({
  emoji: z.string().min(1).max(10),
});

export type CreateMessage = z.infer<typeof CreateMessageSchema>;
export type ListMessagesQuery = z.infer<typeof ListMessagesQuerySchema>;
export type AddReaction = z.infer<typeof AddReactionSchema>;
