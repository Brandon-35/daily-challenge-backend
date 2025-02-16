const mongoose = require('mongoose');
const connect_db = require('./config/database');

const User = require('./models/User');
const Challenge = require('./models/Challenge');
const Log = require('./models/Log');
const Achievement = require('./models/Achievement');

async function seed_database() {
  try {
    // Connect to database
    await connect_db();

    // Clear existing data (be careful with this in production!)
    await User.delete_many({});
    await Challenge.delete_many({});
    await Log.delete_many({});
    await Achievement.delete_many({});

    // Create a sample user
    const user = await User.create({
      username: 'demo_user',
      email: 'demo@example.com',
      password: 'password123',
      profile: {
        name: 'Demo User',
        bio: 'Testing the Challenge Tracker app'
      }
    });

    // Create a sample challenge
    const challenge = await Challenge.create({
      title: 'Daily Coding Practice',
      description: 'Spend at least 1 hour coding every day',
      category: 'Learning',
      user: user._id,
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      difficulty: 'medium'
    });

    // Create a sample log
    const log = await Log.create({
      user: user._id,
      challenge: challenge._id,
      description: 'Completed 1 hour of JavaScript learning',
      duration: 60,
      progress_increment: 10,
      mood: 'good'
    });

    // Create a sample achievement
    const achievement = await Achievement.create({
      title: 'First Challenge Started',
      description: 'Congratulations on starting your first challenge!',
      category: 'Milestone',
      user: user._id,
      related_challenge: challenge._id
    });

    console.log('Database seeded successfully!');
    console.log('User:', user);
    console.log('Challenge:', challenge);
    console.log('Log:', log);
    console.log('Achievement:', achievement);

    // Close the connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

// Run the seeding script
seed_database();