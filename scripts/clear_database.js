const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../src/models/User');
const Challenge = require('../src/models/Challenge');
const Log = require('../src/models/Log');
const Achievement = require('../src/models/Achievement');
const Badge = require('../src/models/Badge');

async function clear_database() {
    try {
        // Connect to the database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to the database');

        // Delete all data in the collections
        await User.deleteMany({});
        await Challenge.deleteMany({});
        await Achievement.deleteMany({});
        await Badge.deleteMany({});
        await Log.deleteMany({});
        console.log('🧹 Cleared all data');

        await mongoose.disconnect();
        console.log('❌ Disconnected from the database');
    } catch (error) {
        console.error('🚨 Error:', error.message);
        process.exit(1);
    }
}

// Run the clear database function
clear_database(); 