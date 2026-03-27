const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    // Real-time tracking event listeners will go here
    socket.on('updateLocation', (data) => {
        // Broadcast location to specific room (trip_id) or globally
        io.emit('locationUpdated', data);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Prevent server from crashing on unhandled errors (like DB connection failures)
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
});
