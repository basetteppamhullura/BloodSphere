import { EmergencyChatMessage, MessageType, UserRole } from '../types';

export type SocketEventHandler = (data: any) => void;

class EmergencySocketManager {
  private listeners: Map<string, Set<SocketEventHandler>> = new Map();
  private activeRoomId: string | null = null;
  private isConnected: boolean = true;
  private typingTimeout: any = null;

  constructor() {
    // Listen for window BroadcastChannel for multi-tab sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('bloodsphere_realtime_socket');
      channel.onmessage = (event) => {
        const { type, data } = event.data;
        this.emitLocal(type, data);
      };
    }
  }

  // Connect to Socket.IO room
  public joinRoom(requestId: string, userId: string, role: UserRole) {
    const roomName = `emergency-request-${requestId}`;
    this.activeRoomId = roomName;
    
    // Broadcast user online event
    this.broadcast('userOnline', {
      roomName,
      requestId,
      userId,
      role,
      status: 'ONLINE',
      timestamp: new Date().toISOString()
    });

    console.log(`[Socket.IO] Joined room: ${roomName} as ${role} (${userId})`);
  }

  // Leave Socket.IO room
  public leaveRoom(requestId: string, userId: string) {
    const roomName = `emergency-request-${requestId}`;
    this.broadcast('userOffline', {
      roomName,
      requestId,
      userId,
      status: 'OFFLINE',
      timestamp: new Date().toISOString()
    });

    this.activeRoomId = null;
    console.log(`[Socket.IO] Left room: ${roomName}`);
  }

  // Send message event over room
  public emitMessage(requestId: string, message: EmergencyChatMessage) {
    const roomName = `emergency-request-${requestId}`;
    this.broadcast('receiveMessage', {
      roomName,
      requestId,
      message
    });
  }

  // Send typing indicator
  public emitTyping(requestId: string, userId: string, isTyping: boolean) {
    const roomName = `emergency-request-${requestId}`;
    this.broadcast('typing', {
      roomName,
      requestId,
      userId,
      isTyping
    });
  }

  // Read message event
  public emitMessageRead(requestId: string, messageId: string, readByUserId: string) {
    const roomName = `emergency-request-${requestId}`;
    this.broadcast('messageRead', {
      roomName,
      requestId,
      messageId,
      readByUserId
    });
  }

  // Close chat event
  public emitCloseChat(requestId: string, closedByUserId: string) {
    const roomName = `emergency-request-${requestId}`;
    this.broadcast('chatClosed', {
      roomName,
      requestId,
      closedByUserId,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast helper
  private broadcast(event: string, data: any) {
    // 1. Local event dispatch
    this.emitLocal(event, data);

    // 2. BroadcastChannel multi-tab sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('bloodsphere_realtime_socket');
        channel.postMessage({ type: event, data });
      } catch (err) {
        console.error('[Socket.IO Broadcast error]', err);
      }
    }
  }

  // Local listener subscription
  public on(event: string, handler: SocketEventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  public off(event: string, handler: SocketEventHandler) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(handler);
    }
  }

  private emitLocal(event: string, data: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(handler => handler(data));
    }
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const socketManager = new EmergencySocketManager();
