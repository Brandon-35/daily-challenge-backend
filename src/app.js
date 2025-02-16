// src/app.js
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()

const connect_db = require('./config/database')

const app = express()

// Connect to Database
connect_db()

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Basic route for health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'server is running'
  })
})

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    status: 'error',
    message: 'something broke!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

module.exports = app