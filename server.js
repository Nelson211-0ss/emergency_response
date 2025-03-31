require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const emergencyRoutes = require('./routes/emergency');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const fs = require('fs');
const uploadDir = path.join(__dirname, 'public', 'uploads', 'emergency-media');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5502','http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database sync
sequelize.sync()
    .then(() => console.log('Database connected'))
    .catch(err => console.error('Database connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emergencies', emergencyRoutes);

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Create HTTP server instance
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New client connected');

    // Handle client messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            switch (data.type) {
                case 'REQUEST_EMERGENCIES':
                    // Just broadcast the request to trigger a regular HTTP fetch
                    broadcast({ type: 'REFRESH_NEEDED' });
                    break;
                case 'UPDATE_STATUS':
                    // Notify clients to refresh their data
                    broadcast({ type: 'REFRESH_NEEDED' });
                    break;
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
            ws.send(JSON.stringify({ type: 'ERROR', message: error.message }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Broadcast to all connected clients
function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Replace app.listen with server.listen
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
