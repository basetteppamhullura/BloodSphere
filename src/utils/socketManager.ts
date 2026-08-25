import { EmergencyChatMessage, UserRole } from '../types';
import { io, Socket } from 'socket.io-client';

export type SocketEventHandler = (data: any) => void;
export type ConnectionStatus = 'LIVE' | 'DISCONNECTED' | 'RECONNECTING';
export type StatusChangeHandler = (status: ConnectionStatus) => void;

class EmergencySocketManager {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<SocketEventHandler>> = new Map();
  private statusListeners: Set<StatusChangeHandler> = new Set();
  private connectionStatus: ConnectionStatus = 'LIVE';
  private serverUrl: string = 'http://localhost:5000';
  private broadcastChannel: BroadcastChannel | null = null;
  private currentRoom: string | null = null;
  private currentUser: { userId: string; role: UserRole } | null = null;

  constructor() {
    // 1. Initialize BroadcastChannel for multi-tab browser synchronization
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('bloodsphere_realtime_socket');
        this.broadcastChannel.onmessage = (event) => {
          const { type, data } = event.data || {};
          if (type) {
            this.emitLocal(type, data);
          }
        };
      } catch (err) {
        console.warn('[SocketManager] BroadcastChannel not supported:', err);
      }
    }

    // 2. Initialize real Socket.IO client connection
    this.connectRealSocket();
  }

  private connectRealSocket() {
    try {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        autoConnect: true
      });

      this.socket.on('connect', () => {
        console.log('[Socket.IO Client] Connected to server:', this.socket?.id);
        this.setStatus('LIVE');

        // Auto re-join room if previously joined
        if (this.currentRoom && this.currentUser) {
          this.socket?.emit('joinRoom', {
            roomName: this.currentRoom,
            userId: this.currentUser.userId,
            role: this.currentUser.role
          });
        }

        // Notify snapshot resync on reconnect
        this.emitLocal('resyncData', { timestamp: new Date().toISOString() });
      });

      this.socket.on('disconnect', (reason) => {
        console.warn('[Socket.IO Client] Disconnected:', reason);
        this.setStatus('DISCONNECTED');
      });

      this.socket.on('connect_error', (err) => {
        console.warn('[Socket.IO Client] Connection error:', err.message);
        if (this.connectionStatus !== 'RECONNECTING') {
          this.setStatus('RECONNECTING');
        }
      });

      // Forward all incoming socket events to registered local listeners
      this.socket.onAny((event, data) => {
        this.emitLocal(event, data);
      });

    } catch (err) {
      console.warn('[Socket.IO Client] Could not initialize socket.io-client:', err);
      this.setStatus('LIVE');
    }
  }

  private setStatus(status: ConnectionStatus) {
    this.connectionStatus = status;
    this.statusListeners.forEach(handler => handler(status));
    this.emitLocal('connectionStatusChange', { status });
  }

  public onStatusChange(handler: StatusChangeHandler) {
    this.statusListeners.add(handler);
    handler(this.connectionStatus);
    return () => this.statusListeners.delete(handler);
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  public getIsConnected(): boolean {
    return this.connectionStatus === 'LIVE';
  }

  // Connect to Socket.IO room
  public joinRoom(roomOrRequestId: string, userId: string, role: UserRole) {
    const roomName = roomOrRequestId.startsWith('admin') || roomOrRequestId.startsWith('emergency-request')
      ? roomOrRequestId
      : `emergency-request-${roomOrRequestId}`;

    this.currentRoom = roomName;
    this.currentUser = { userId, role };

    // Real Socket.IO server emit
    if (this.socket && this.socket.connected) {
      this.socket.emit('joinRoom', { roomName, userId, role });
    }

    // Local & Multi-tab Broadcast
    this.broadcast('userOnline', {
      roomName,
      requestId: roomOrRequestId,
      userId,
      role,
      status: 'ONLINE',
      timestamp: new Date().toISOString()
    });

    console.log(`[Socket.IO] Joined room: ${roomName} as ${role} (${userId})`);
  }

  // Leave Socket.IO room
  public leaveRoom(roomOrRequestId: string, userId: string) {
    const roomName = roomOrRequestId.startsWith('admin') || roomOrRequestId.startsWith('emergency-request')
      ? roomOrRequestId
      : `emergency-request-${roomOrRequestId}`;

    if (this.socket && this.socket.connected) {
      this.socket.emit('leaveRoom', { roomName, userId });
    }

    this.broadcast('userOffline', {
      roomName,
      requestId: roomOrRequestId,
      userId,
      status: 'OFFLINE',
      timestamp: new Date().toISOString()
    });

    if (this.currentRoom === roomName) {
      this.currentRoom = null;
    }
    console.log(`[Socket.IO] Left room: ${roomName}`);
  }

  // Send message event over room
  public emitMessage(requestId: string, message: EmergencyChatMessage) {
    const roomName = `emergency-request-${requestId}`;
    const payload = { roomName, requestId, message };

    if (this.socket && this.socket.connected) {
      this.socket.emit('sendMessage', payload);
    }
    this.broadcast('receiveMessage', payload);
  }

  // Send typing indicator
  public emitTyping(requestId: string, userId: string, isTyping: boolean) {
    const roomName = `emergency-request-${requestId}`;
    const payload = { roomName, requestId, userId, isTyping };

    if (this.socket && this.socket.connected) {
      this.socket.emit('typing', payload);
    }
    this.broadcast('typing', payload);
  }

  // Close chat event
  public emitCloseChat(requestId: string, closedByUserId: string) {
    const roomName = `emergency-request-${requestId}`;
    const payload = { roomName, requestId, closedByUserId, timestamp: new Date().toISOString() };

    if (this.socket && this.socket.connected) {
      this.socket.emit('closeChat', payload);
    }
    this.broadcast('chatClosed', payload);
  }

  // Broadcast helper
  private broadcast(event: string, data: any) {
    this.emitLocal(event, data);

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: event, data });
      } catch (err) {
        console.error('[Socket.IO BroadcastChannel error]', err);
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
      this.listeners.get(event)!.forEach(handler => {
        try {
          handler(data);
        } catch (err) {
          console.error(`[SocketManager] Error executing handler for ${event}:`, err);
        }
      });
    }
  }
}

export const socketManager = new EmergencySocketManager();
