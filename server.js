const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let rooms = {}; // To store room information

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle create room request
    socket.on('createRoom', ({ room }) => {
        socket.join(room);
        rooms[room] = { player1: socket.id, player2: null };
        io.to(socket.id).emit('roomCreated', { room });
        console.log(`Room ${room} created by ${socket.id}`);
    });

    // Handle join room request
    socket.on('joinRoom', ({ room }) => {
        if (rooms[room] && !rooms[room].player2) {
            socket.join(room);
            rooms[room].player2 = socket.id;
            io.to(socket.id).emit('roomJoined', { room });
            io.to(rooms[room].player1).emit('player2Joined');
            console.log(`${socket.id} joined room ${room}`);
        } else {
            io.to(socket.id).emit('joinFailed'); // Emit joinFailed event
        }
    });

    // Other event handlers and logic

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        // Clean up room data if necessary
        for (const room in rooms) {
            if (rooms[room].player1 === socket.id || rooms[room].player2 === socket.id) {
                delete rooms[room];
                break;
            }
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
