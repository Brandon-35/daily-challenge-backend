const mongoose = require('mongoose');
require('dotenv').config();

const connect_db = async () => {
  try {
    // MongoDB connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    };

    // Attempt connection
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    // Log successful connection
    console.log(`MongoDB connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.db.databaseName}`);

    // Handle errors after initial connection
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
      // Optional: Implement reconnection logic or alert system
    });

    // Handle disconnection events
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      // Optional: Attempt to reconnect
    });

    // Handle reconnection
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });

    // Optional: Register models (if needed)
    require('../models/User');
    require('../models/Challenge');
    require('../models/Log');
    require('../models/Achievement');

    return conn;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    
    // Implement retry mechanism or exit
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

module.exports = connect_db;