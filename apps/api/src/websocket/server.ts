import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { db } from '@devteam/database';

// Event type definitions
export interface ServerToClientEvents {
  'agent:status': (data: { agentType: string; status: string; projectId: string }) => void;
  'agent:activity': (data: { agentType: string; activity: string; projectId: string; taskId?: string }) => void;
  'message:new': (data: { message: any; projectId: string }) => void;
  'file:change': (data: { fileId: string; path: string; action: 'create' | 'update' | 'delete'; projectId: string }) => void;
  'task:update': (data: { task: any; projectId: string }) => void;
  'project:update': (data: { project: any }) => void;
  'error': (data: { message: string; code?: string }) => void;
  'pong': () => void;
}

export interface ClientToServerEvents {
  'join:project': (projectId: string, callback: (success: boolean) => void) => void;
  'leave:project': (projectId: string) => void;
  'ping': () => void;
}

interface SocketData {
  userId: string;
  userName?: string;
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret';

// Store active connections
const activeConnections = new Map<string, Set<string>>(); // userId -> Set of socket IDs

export function createWebSocketServer(httpServer: HttpServer): Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData> {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Verify user exists
      const user = await db.user.findUnique({
        where: { id: decoded.sub || decoded.id },
        select: { id: true, name: true },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.userId = user.id;
      socket.data.userName = user.name || undefined;
      next();
    } catch (error) {
      console.error('[WebSocket] Auth error:', error);
      next(new Error('Invalid or expired token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`[WebSocket] User ${userId} connected (socket: ${socket.id})`);

    // Track connection
    if (!activeConnections.has(userId)) {
      activeConnections.set(userId, new Set());
    }
    activeConnections.get(userId)!.add(socket.id);

    // ========================================
    // JOIN PROJECT ROOM
    // ========================================
    socket.on('join:project', async (projectId, callback) => {
      try {
        // Verify user has access to project
        const project = await db.project.findFirst({
          where: {
            id: projectId,
            OR: [
              { userId },
              { members: { some: { userId } } },
            ],
          },
          select: { id: true },
        });

        if (!project) {
          callback(false);
          socket.emit('error', { message: 'Project not found or access denied', code: 'PROJECT_ACCESS_DENIED' });
          return;
        }

        const roomName = `project:${projectId}`;
        socket.join(roomName);
        console.log(`[WebSocket] User ${userId} joined room ${roomName}`);
        callback(true);
      } catch (error) {
        console.error('[WebSocket] Join project error:', error);
        callback(false);
      }
    });

    // ========================================
    // LEAVE PROJECT ROOM
    // ========================================
    socket.on('leave:project', (projectId) => {
      const roomName = `project:${projectId}`;
      socket.leave(roomName);
      console.log(`[WebSocket] User ${userId} left room ${roomName}`);
    });

    // ========================================
    // HEARTBEAT (ping/pong)
    // ========================================
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // ========================================
    // DISCONNECT
    // ========================================
    socket.on('disconnect', (reason) => {
      console.log(`[WebSocket] User ${userId} disconnected (reason: ${reason})`);
      
      // Remove from active connections
      const userSockets = activeConnections.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          activeConnections.delete(userId);
        }
      }
    });

    // ========================================
    // ERROR HANDLING
    // ========================================
    socket.on('error', (error) => {
      console.error(`[WebSocket] Socket error for user ${userId}:`, error);
    });
  });

  console.log('[WebSocket] Server initialized');
  return io;
}

// Helper functions to emit events from the API
export class WebSocketEmitter {
  private io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

  constructor(io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>) {
    this.io = io;
  }

  // Emit agent status update
  emitAgentStatus(projectId: string, agentType: string, status: string) {
    this.io.to(`project:${projectId}`).emit('agent:status', { agentType, status, projectId });
  }

  // Emit agent activity
  emitAgentActivity(projectId: string, agentType: string, activity: string, taskId?: string) {
    this.io.to(`project:${projectId}`).emit('agent:activity', { agentType, activity, projectId, taskId });
  }

  // Emit new message
  emitNewMessage(projectId: string, message: any) {
    this.io.to(`project:${projectId}`).emit('message:new', { message, projectId });
  }

  // Emit file change
  emitFileChange(projectId: string, fileId: string, path: string, action: 'create' | 'update' | 'delete') {
    this.io.to(`project:${projectId}`).emit('file:change', { fileId, path, action, projectId });
  }

  // Emit task update
  emitTaskUpdate(projectId: string, task: any) {
    this.io.to(`project:${projectId}`).emit('task:update', { task, projectId });
  }

  // Emit project update
  emitProjectUpdate(projectId: string, project: any) {
    this.io.to(`project:${projectId}`).emit('project:update', { project });
  }

  // Get active connection count for a user
  getActiveConnectionCount(userId: string): number {
    return activeConnections.get(userId)?.size || 0;
  }

  // Get total active connections
  getTotalConnections(): number {
    let total = 0;
    for (const sockets of Array.from(activeConnections.values())) {
      total += sockets.size;
    }
    return total;
  }
}

// Singleton emitter instance (set after server creation)
let emitterInstance: WebSocketEmitter | null = null;

export function setWebSocketEmitter(io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>) {
  emitterInstance = new WebSocketEmitter(io);
}

export function getWebSocketEmitter(): WebSocketEmitter | null {
  return emitterInstance;
}
