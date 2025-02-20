const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const http = require('http');

const connect_db = require('./config/database');
const user_routes = require('./routes/user_routes');
const socket_service = require('./services/socket_service');
const social_routes = require('./routes/social_routes');
const challenge_routes = require('./routes/challenge_routes');

const app = express();

// Connect to Database
connect_db();

// Middleware
app.use(helmet()); // Adds security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Configure allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Optional: Rate limiting middleware
const rate_limit = require('express-rate-limit');
const limiter = rate_limit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Basic route for health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Database status route
app.get('/database_status', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const User = require('./models/User');
    
    // Check connection state
    const state = mongoose.connection.readyState;
    const state_messages = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };

    // Get all users (có thể giới hạn số lượng để tránh quá tải)
    const users = await User.find({}, '-password').limit(10);
    const user_count = await User.countDocuments();

    res.status(200).json({
      status: 'ok',
      database: {
        state: state_messages[state],
        state_code: state,
        user_count: user_count,
        recent_users: users
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Routes
app.use('/api/users', user_routes);
app.use('/api/social', social_routes);
app.use('/api', challenge_routes);

// Initialize socket
const server = http.createServer(app);
const io = socket_service.init(server);

// 404 Not Found middleware
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);

  // Determine error status and message
  const status = err.status || 500;
  const message = err.message || 'Something broke!';
  
  res.status(status).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.stack })
  });
});

// Function to find available port
const find_available_port = (start_port) => {
  return new Promise((resolve, reject) => {
    const server = require('http').createServer();
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(find_available_port(start_port + 1));
      } else {
        reject(err);
      }
    });

    server.listen(start_port, () => {
      server.close(() => {
        resolve(start_port);
      });
    });
  });
};

// Start server with port finding
const start_server = async () => {
  try {
    const port = await find_available_port(process.env.PORT || 3000);
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('Routes:');
      const routes = [
        '/api/users - User routes',
        '/api/social - Social routes',
        '/api - Challenge routes'
      ];
      routes.forEach(route => console.log(route));
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

start_server();

module.exports = app;