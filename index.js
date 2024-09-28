const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { v4: uuidv4 } = require('uuid'); // Import uuid library
const io = new Server(server);

const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A1', '#33FFF5'];
let userColors = {};
let messages = [];

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// API endpoint to get all messages
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

// API endpoint to send a message
app.post('/api/messages', (req, res) => {
  const { name, message } = req.body;
  const userColor = userColors[req.body.socketId] || '#000000';
  const chatMessage = { id: uuidv4(), name, message, color: userColor }; // Add id to message
  messages.push(chatMessage);
  io.emit('chat message', chatMessage);
  res.status(201).json(chatMessage);
});

io.on('connection', (socket) => {
  console.log('a user connected');
  
  // Assign a color to the user
  let userColor = colors.pop();
  userColors[socket.id] = userColor;

  socket.on('disconnect', () => {
    console.log('user disconnected');
    // Return the color back to the pool
    colors.push(userColors[socket.id]);
    delete userColors[socket.id];
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data); // clientsBroadcast typing event to all other 
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});