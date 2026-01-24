import { useEffect, useRef, useCallback, useState } from 'react';
import { useAgentStore } from '@/stores';

type WebSocketMessage = {
  type: string;
  payload: unknown;
};

interface UseWebSocketOptions {
  url?: string;
  projectId?: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket({
  url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  projectId,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  reconnect = true,
  reconnectInterval = 5000,
}: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const { setAgentStatus, setAgentTask, syncAgents } = useAgentStore();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = projectId ? `${url}?projectId=${projectId}` : url;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      onConnect?.();
      console.log('[WebSocket] Connected');
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);
        onMessage?.(message);

        // Handle built-in message types
        handleBuiltInMessage(message);
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      onDisconnect?.();
      console.log('[WebSocket] Disconnected');

      // Attempt to reconnect
      if (reconnect) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[WebSocket] Attempting to reconnect...');
          connect();
        }, reconnectInterval);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      onError?.(error);
    };

    wsRef.current = ws;
  }, [
    url,
    projectId,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnect,
    reconnectInterval,
  ]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  const send = useCallback((type: string, payload: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('[WebSocket] Cannot send message - not connected');
    }
  }, []);

  // Handle built-in message types
  const handleBuiltInMessage = useCallback(
    (message: WebSocketMessage) => {
      switch (message.type) {
        case 'agent:status':
          const { agentType, status } = message.payload as {
            agentType: string;
            status: string;
          };
          setAgentStatus(agentType as any, status as any);
          break;

        case 'agent:task':
          const {
            agentType: type,
            task,
            progress,
          } = message.payload as {
            agentType: string;
            task?: string;
            progress?: number;
          };
          setAgentTask(type as any, task, progress);
          break;

        case 'agents:sync':
          syncAgents(message.payload as any[]);
          break;

        default:
          // Custom message - let the consumer handle it
          break;
      }
    },
    [setAgentStatus, setAgentTask, syncAgents],
  );

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    send,
    connect,
    disconnect,
  };
}

// Simpler hook for just subscribing to agent updates
export function useAgentUpdates(projectId?: string) {
  const { isConnected, lastMessage } = useWebSocket({
    projectId,
  });

  return { isConnected, lastMessage };
}
