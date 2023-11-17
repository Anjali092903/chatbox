const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/chatapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create MongoDB schema and model (adjust schema based on your needs)
const chatSchema = new mongoose.Schema({
  user: String,
  message: String,
});

const Chat = mongoose.model('Chat', chatSchema);

// Serve static files (React build, HTML, CSS, etc.)
app.use(express.static('public'));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected');

  // Load previous messages from MongoDB
  Chat.find().exec((err, messages) => {
    if (err) throw err;
    socket.emit('load messages', messages);
  });

  // Listen for new messages
  socket.on('chat message', (data) => {
    const { user, message } = data;

    // Save message to MongoDB
    const newMessage = new Chat({ user, message });
    newMessage.save((err) => {
      if (err) throw err;
    });

    // Broadcast message to all connected clients
    io.emit('chat message', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

