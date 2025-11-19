// Simple Socket.IO server for real-time chat
// Chạy: node server/socket-server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Cho phép mọi origin (chỉ để development)
    methods: ['GET', 'POST']
  },
  maxHttpBufferSize: 1e7 // 10MB - tăng buffer size cho ảnh base64
});

// Store online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins
  socket.on('user-join', (userData) => {
    onlineUsers.set(socket.id, userData);
    console.log('User joined:', userData);
    
    // Broadcast online status
    io.emit('user-online', {
      userId: userData.userId,
      userName: userData.userName,
      onlineCount: onlineUsers.size
    });
  });

  // User sends message
  socket.on('send-message', (message) => {
    console.log('Message:', message);
    
    // Broadcast to all clients
    io.emit('new-message', message);
  });

  // User is typing
  socket.on('typing', (userData) => {
    socket.broadcast.emit('user-typing', userData);
  });

  // User stops typing
  socket.on('stop-typing', (userData) => {
    socket.broadcast.emit('user-stop-typing', userData);
  });

  // User disconnects
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      console.log('User disconnected:', user);
      onlineUsers.delete(socket.id);
      
      // Broadcast offline status
      io.emit('user-offline', {
        userId: user.userId,
        onlineCount: onlineUsers.size
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on port ${PORT}`);
  console.log(`🌐 Connect to: http://localhost:${PORT}`);
});
