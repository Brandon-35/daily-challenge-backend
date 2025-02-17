const mongoose = require('mongoose');
require('dotenv').config();

async function check_database() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 Collections in database:', collections.length);
    console.table(collections.map(col => ({
      name: col.name,
      type: col.type
    })));

    // Display sample data from each collection
    for (const collection of collections) {
      const collection_data = await mongoose.connection.db
        .collection(collection.name)
        .find({})
        .limit(5)
        .toArray();

      console.log(`\n📊 Sample data from ${collection.name}:`);
      if (collection_data.length > 0) {
        const formatted_data = collection_data.map(doc => {
          // Hide sensitive data like passwords
          if (doc.password) doc.password = '********';
          return {
            id: doc._id,
            ...Object.fromEntries(
              Object.entries(doc)
                .filter(([key]) => key !== '_id' && key !== '__v')
            )
          };
        });
        console.table(formatted_data);
      } else {
        console.log('No data found');
      }
    }

    // Show document count for each collection
    console.log('\n📈 Collection Statistics:');
    const stats = {};
    for (const collection of collections) {
      const count = await mongoose.connection.db
        .collection(collection.name)
        .countDocuments();
      stats[collection.name] = count;
    }
    console.table(stats);

    await mongoose.disconnect();
    console.log('\n❌ Disconnected from database');
  } catch (error) {
    console.error('🚨 Error:', error.message);
    process.exit(1);
  }
}

check_database(); 