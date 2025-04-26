const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 5000;

// Validate required environment variables
if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI in environment variables');
    process.exit(1);
}

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

// Routes
app.use('/feedback', feedbackRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({ status: 'up', db: dbStatus });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit if DB connection fails
    });

// MongoDB connection events
mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected!');
});


// Graceful shutdown
function gracefulShutdown(signal) {
    return () => {
        console.log(`${signal} received. Shutting down gracefully...`);
        server.close(() => {
            mongoose.connection.close(false, () => {
                console.log('Server and MongoDB connection closed.');
                process.exit(0);
            });
        });
    };
}

process.on('SIGTERM', gracefulShutdown('SIGTERM'));
process.on('SIGINT', gracefulShutdown('SIGINT'));

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});