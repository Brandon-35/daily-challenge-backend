// src/config/database.js
const mongoose = require('mongoose')

const connect_db = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log(`MongoDB connected: ${conn.connection.host}`)

    // Handle errors after initial connection
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err)
    })

    // Handle disconnection events
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected')
    })

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      console.log('MongoDB connection closed through app termination')
      process.exit(0)
    })

  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

module.exports = connect_db