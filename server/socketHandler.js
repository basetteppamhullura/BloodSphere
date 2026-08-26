export function initSocketHandler(io) {
  const onlineUsers = new Map(); // socketId -> { userId, role, roomName }

  io.on('connection', (socket) => {
    console.log(`[Socket.IO Server] Client connected: ${socket.id}`);

    // Join room event with role authorization check
    socket.on('joinRoom', (payload) => {
      const { roomName, userId, role } = payload || {};
      if (!roomName) return;

      // Restrict admin-dashboard room to authorized admin role
      if (roomName === 'admin-dashboard' && role !== 'admin') {
        console.warn(`[Socket.IO Server] Unauthorized join attempt to admin-dashboard by user ${userId} (${role})`);
        return socket.emit('error', { message: 'Unauthorized room access' });
      }

      socket.join(roomName);
      onlineUsers.set(socket.id, { userId, role, roomName });

      console.log(`[Socket.IO Server] User ${userId} (${role}) joined room: ${roomName}`);

      // Broadcast online status to admin-dashboard & room
      io.to('admin-dashboard').emit('userOnline', {
        socketId: socket.id,
        userId,
        role,
        roomName,
        status: 'ONLINE',
        onlineCount: onlineUsers.size,
        timestamp: new Date().toISOString()
      });
    });

    // Leave room event
    socket.on('leaveRoom', (payload) => {
      const { roomName, userId } = payload || {};
      if (roomName) {
        socket.leave(roomName);
        console.log(`[Socket.IO Server] User ${userId} left room: ${roomName}`);
      }
    });

    // Handle chat messages over emergency rooms
    socket.on('sendMessage', (data) => {
      const { roomName, message } = data || {};
      if (roomName) {
        io.to(roomName).emit('receiveMessage', data);
        io.to('admin-dashboard').emit('adminNotification', {
          id: `notif-${Date.now()}`,
          title: '🚨 Emergency Chat Activity',
          message: `Activity in ${roomName}: ${message?.message?.substring(0, 40) || 'New message'}`,
          type: 'urgent',
          time: 'Just now'
        });
      }
    });

    // Handle typing events
    socket.on('typing', (data) => {
      if (data?.roomName) {
        socket.to(data.roomName).emit('typing', data);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const user = onlineUsers.get(socket.id);
      if (user) {
        onlineUsers.delete(socket.id);
        io.to('admin-dashboard').emit('userOffline', {
          socketId: socket.id,
          userId: user.userId,
          role: user.role,
          status: 'OFFLINE',
          onlineCount: onlineUsers.size,
          timestamp: new Date().toISOString()
        });
      }
      console.log(`[Socket.IO Server] Client disconnected: ${socket.id}`);
    });
  });

  return {
    broadcastAdminEvent: (event, data) => {
      io.to('admin-dashboard').emit(event, data);
    },
    broadcastToRoom: (roomName, event, data) => {
      io.to(roomName).emit(event, data);
      io.to('admin-dashboard').emit(event, data);
    },
    broadcastAll: (event, data) => {
      io.emit(event, data);
    },
    getOnlineCount: () => onlineUsers.size
  };
}
