// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Create an Express app and an HTTP server
const app = express();
const server = http.createServer(app);

// Initialize a socket.io instance using the server
const io = socketIo(server);

// Set the port for the server
const PORT = process.env.PORT || 3000;

// Serve static files (your game files) from the server
app.use(express.static(__dirname));

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle paddle movements from clients
    socket.on('movePaddle', (data) => {
        // Broadcast the paddle position to all connected clients except the sender
        socket.broadcast.emit('paddleMoved', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
