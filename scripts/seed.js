const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../src/models/User');

async function seed_database() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Clear existing data
    await User.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create sample users with different roles
    const users = await User.insertMany([
      {
        username: 'admin_user',
        email: 'admin@example.com',
        password: 'Admin@123',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        is_active: true
      },
      {
        username: 'moderator_user',
        email: 'moderator@example.com',
        password: 'Mod@123',
        first_name: 'Moderator',
        last_name: 'User',
        role: 'moderator',
        is_active: true
      },
      {
        username: 'editor_user',
        email: 'editor@example.com',
        password: 'Editor@123',
        first_name: 'Editor',
        last_name: 'User',
        role: 'editor',
        is_active: true
      },
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'User@123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
        is_active: true
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'User@123',
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'user',
        is_active: true
      },
      {
        username: 'inactive_user',
        email: 'inactive@example.com',
        password: 'User@123',
        first_name: 'Inactive',
        last_name: 'User',
        role: 'user',
        is_active: false
      }
    ]);

    console.log('\n📊 Seeded Users:');
    console.table(users.map(user => ({
      username: user.username,
      email: user.email,
      role: user.role,
      capabilities: user.capabilities,
      is_active: user.is_active
    })));

    console.log('\n📈 Seeding Statistics:');
    const stats = {
      total_users: await User.countDocuments(),
      active_users: await User.countDocuments({ is_active: true }),
      admins: await User.countDocuments({ role: 'admin' }),
      moderators: await User.countDocuments({ role: 'moderator' }),
      editors: await User.countDocuments({ role: 'editor' }),
      regular_users: await User.countDocuments({ role: 'user' })
    };
    console.table(stats);

    await mongoose.disconnect();
    console.log('\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('🚨 Seeding error:', error.message);
    process.exit(1);
  }
}

// Run the seeding function
seed_database(); 