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
    io.emit('user connected', `${username} has joined the chat`);
  });

  // Listen for chat messages
  socket.on('chat message', (msg) => {
    io.emit('chat message', { user: socket.username, msg: msg });
  });

  // *** NEW: Listen for the Epinuke trigger from one client ***
  socket.on('epinuke trigger', (username) => {
    // Broadcast the "blast" event to ALL connected clients
    console.log(`${username} triggered the Epinuke`);
    io.emit('epinuke blast', username);
  });

  // Listen for a user disconnecting
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    if (socket.username) {
      io.emit('user disconnected', `${socket.username} has left the chat`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
