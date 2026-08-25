export function initSocketHandler(io) {
  const onlineUsers = new Map(); // socketId -> { userId, role, roomName }

  io.on('connection', (socket) => {
    console.log(`[Socket.IO Server] New client connected: ${socket.id}`);

    // Join room event with auth check
    socket.on('joinRoom', (payload) => {
      const { roomName, userId, role } = payload || {};
      if (!roomName) return;

      // Restrict admin-dashboard room to admin role
      if (roomName === 'admin-dashboard' && role !== 'admin') {
        console.warn(`[Socket.IO Server] Unauthorized join attempt to admin-dashboard by user ${userId} (${role})`);
        return socket.emit('error', { message: 'Unauthorized room access' });
      }

      socket.join(roomName);
      onlineUsers.set(socket.id, { userId, role, roomName });

      console.log(`[Socket.IO Server] User ${userId} (${role}) joined room: ${roomName}`);

      // Broadcast user online event to admin-dashboard
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

    // Handle incoming chat messages over room
    socket.on('sendMessage', (data) => {
      const { roomName, message } = data || {};
      if (roomName) {
        io.to(roomName).emit('receiveMessage', data);
        io.to('admin-dashboard').emit('adminNotification', {
          title: '🚨 Emergency Chat Activity',
          message: `New message in ${roomName}: ${message?.text?.substring(0, 50)}...`,
          type: 'urgent',
          timestamp: new Date().toLocaleTimeString()
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
    getOnlineCount: () => onlineUsers.size
  };
}
