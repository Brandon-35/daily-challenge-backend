const mongoose = require('mongoose');
require('dotenv').config();

async function test_database_connection() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    console.log('✅ Successfully connected to MongoDB');

    // List existing collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Existing Collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Close connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

test_database_connection();