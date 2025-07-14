const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve the static HTML, CSS, and JS files
app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for a new user joining
  socket.on('new user', (username) => {
    socket.username = username;
    // Broadcast to all clients that a user has connected
    io.emit('user connected', `${username} has joined the chat`);
  });

  // Listen for chat messages
  socket.on('chat message', (msg) => {
    // Broadcast the message to all clients
    io.emit('chat message', { user: socket.username, msg: msg });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    if (socket.username) {
      // Broadcast to all clients that a user has left
      io.emit('user disconnected', `${socket.username} has left the chat`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
