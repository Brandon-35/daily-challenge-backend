const mongoose = require('mongoose');
require('dotenv').config();

const connect_db = async () => {
  try {
    // MongoDB connection options
    const options = {
      serverSelectionTimeoutMS: 5000,   // Timeout kết nối
      socketTimeoutMS: 45000,           // Timeout socket
      family: 4                         // Sử dụng IPv4
    };

    // Attempt connection
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    // Logging kết nối
    console.log('==================================');
    console.log('🚀 MongoDB Connection Established');
    console.log(`• Host: ${conn.connection.host}`);
    console.log(`• Database: ${conn.connection.db.databaseName}`);
    console.log(`• Connection State: Connected`);
    console.log('==================================');

    // Handle errors after initial connection
    mongoose.connection.on('error', err => {
      console.error('❌ MongoDB Connection Error:', err);
    });

    // Handle disconnection events
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB Disconnected');
    });

    // Handle reconnection
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB Reconnected');
    });

    // Handle connection monitoring
    mongoose.connection.on('connecting', () => {
      console.log('🔄 Attempting to connect to MongoDB...');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🔌 MongoDB Connection Closed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error Closing MongoDB Connection:', error);
        process.exit(1);
      }
    });

    // Register models
    const models = [
      'User',
      'Challenge', 
      'Log', 
      'Achievement'
    ];

    models.forEach(model => {
      try {
        require(`../models/${model}`);
        console.log(`✓ Registered Model: ${model}`);
      } catch (error) {
        console.error(`❌ Failed to Register Model: ${model}`, error);
      }
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error);
    
    // Detailed error logging
    if (error.name === 'MongoError') {
      console.log('Possible Causes:');
      console.log('- Database server not running');
      console.log('- Incorrect connection string');
      console.log('- Network issues');
    }

    // Exit strategy
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

module.exports = connect_db;