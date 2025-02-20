const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');
const Challenge = require('../src/models/Challenge');
const Log = require('../src/models/Log');
const Achievement = require('../src/models/Achievement');
const Badge = require('../src/models/Badge');

async function seed_challenges(admin) {
    const challenges = await Challenge.insertMany([
        {
            title: "Introduction to Algorithms",
            description: "Learn basic algorithmic concepts",
            category: "algorithms",
            difficulty: "beginner",
            points: 100,
            created_by: admin._id,
            user: admin._id,
            start_date: new Date(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        {
            title: "Data Structures Basics",
            description: "Master fundamental data structures",
            category: "data_structures",
            difficulty: "beginner",
            points: 150,
            created_by: admin._id,
            user: admin._id,
            start_date: new Date(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        {
            title: "Web Development Fundamentals",
            description: "Learn web development basics",
            category: "web_development",
            difficulty: "beginner",
            points: 120,
            created_by: admin._id,
            user: admin._id,
            start_date: new Date(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    ]);

    console.log('\n📝 Seeded Challenges:');
    console.table(challenges.map(challenge => ({
        title: challenge.title,
        category: challenge.category,
        difficulty: challenge.difficulty,
        points: challenge.points
    })));

    return challenges;
}

async function create_admin_user() {
    const salt = await bcrypt.genSalt(10);
    const admin = await User.create({
        username: 'admin_user',
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin@123', salt),
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        capabilities: User.ROLE_CAPABILITIES.admin,
        is_active: true
    });

    return admin;
}

async function seed_database() {
    try {
        // Check database connection
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database');

        // Clear ALL existing data
        await User.deleteMany({});
        await Challenge.deleteMany({});
        await Achievement.deleteMany({});
        await Badge.deleteMany({});
        await Log.deleteMany({});
        console.log('🧹 Cleared existing data');

        // Seed admin user first
        const admin = await create_admin_user();
        console.log('👤 Created admin user');

        // Seed challenges using admin
        const challenges = await seed_challenges(admin);
        console.log('📝 Seeded challenges');

        // Use the predefined capabilities and role mappings from User model
        const { CAPABILITIES, ROLE_CAPABILITIES } = User;
        
        // Create sample users with different roles
        const users = await User.insertMany([
          {
            username: 'moderator_user',
            email: 'moderator@example.com',
            password: await bcrypt.hash('Mod@123', 10),
            first_name: 'Moderator',
            last_name: 'User',
            role: 'moderator',
            capabilities: ROLE_CAPABILITIES.moderator,
            is_active: true
          },
          {
            username: 'editor_user',
            email: 'editor@example.com',
            password: await bcrypt.hash('Editor@123', 10),
            first_name: 'Editor',
            last_name: 'User',
            role: 'editor',
            capabilities: ROLE_CAPABILITIES.editor,
            is_active: true
          },
          {
            username: 'john_doe',
            email: 'john@example.com',
            password: await bcrypt.hash('User@123', 10),
            first_name: 'John',
            last_name: 'Doe',
            role: 'user',
            capabilities: ROLE_CAPABILITIES.user,
            is_active: true
          },
          {
            username: 'jane_smith',
            email: 'jane@example.com',
            password: await bcrypt.hash('User@123', 10),
            first_name: 'Jane',
            last_name: 'Smith',
            role: 'user',
            capabilities: ROLE_CAPABILITIES.user,
            is_active: true
          },
          {
            username: 'inactive_user',
            email: 'inactive@example.com',
            password: await bcrypt.hash('User@123', 10),
            first_name: 'Inactive',
            last_name: 'User',
            role: 'user',
            capabilities: ROLE_CAPABILITIES.user,
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

        // Update statistics to include challenges
        const stats = {
          total_users: await User.countDocuments(),
          active_users: await User.countDocuments({ is_active: true }),
          admins: await User.countDocuments({ role: 'admin' }),
          moderators: await User.countDocuments({ role: 'moderator' }),
          editors: await User.countDocuments({ role: 'editor' }),
          regular_users: await User.countDocuments({ role: 'user' }),
          total_challenges: await Challenge.countDocuments(),
          easy_challenges: await Challenge.countDocuments({ difficulty: 'easy' }),
          medium_challenges: await Challenge.countDocuments({ difficulty: 'medium' }),
          hard_challenges: await Challenge.countDocuments({ difficulty: 'hard' })
        };
        console.table(stats);

        // After creating challenges
        console.log('🧹 Creating sample logs...');

        const logs = await Log.insertMany([
            {
                user: admin._id,
                challenge: challenges[0]._id,
                action: 'complete',
                details: {
                    time_spent: 30,
                    progress: 100,
                    notes: 'Completed successfully',
                    mood: 'great'
                },
                status: 'success',
                metrics: {
                    execution_time: 500,
                    memory_usage: 1024,
                    code_quality_score: 95
                }
            },
            {
                user: admin._id,
                challenge: challenges[1]._id,
                action: 'start',
                details: {
                    time_spent: 15,
                    progress: 30,
                    notes: 'Good start',
                    mood: 'good'
                },
                status: 'in_progress',
                metrics: {
                    execution_time: 300,
                    memory_usage: 512,
                    code_quality_score: 85
                }
            }
            // Add more sample logs as needed
        ]);

        console.log('\n📊 Seeded Logs:');
        console.table(logs.map(log => ({
            user: log.user,
            challenge: log.challenge,
            action: log.action,
            status: log.status,
            progress: log.details.progress
        })));

        // Create sample achievements with unique titles
        console.log('🏆 Creating sample achievements...');

        const achievements = await Achievement.insertMany([
            {
                title: 'First Challenge Complete',
                description: 'Complete your first challenge',
                category: 'challenge',
                icon: '/icons/first-steps.png',
                points: 10,
                criteria: {
                    type: 'challenges_completed',
                    threshold: 1
                },
                rarity: 'common'
            },
            {
                title: 'Challenge Warrior',
                description: 'Complete 10 challenges',
                category: 'challenge',
                icon: '/icons/code-warrior.png',
                points: 50,
                criteria: {
                    type: 'challenges_completed',
                    threshold: 10
                },
                rarity: 'uncommon'
            },
            {
                title: 'Points Champion',
                description: 'Earn 1000 points',
                category: 'points',
                icon: '/icons/point-master.png',
                points: 100,
                criteria: {
                    type: 'points_earned',
                    threshold: 1000
                },
                rarity: 'rare'
            },
            {
                title: 'Streak Champion',
                description: 'Maintain a 7-day streak',
                category: 'streak',
                icon: '/icons/streak-master.png',
                points: 75,
                criteria: {
                    type: 'streak_days',
                    threshold: 7
                },
                rarity: 'epic'
            }
        ]);

        console.log('\n📊 Seeded Achievements:');
        console.table(achievements.map(achievement => ({
            title: achievement.title,
            category: achievement.category,
            points: achievement.points,
            rarity: achievement.rarity
        })));

        // Add after achievements seeding
        console.log('🎖️ Creating sample badges...');

        const badges = await Badge.insertMany([
            {
                name: 'Algorithm Master',
                description: 'Complete all algorithm challenges',
                icon: '/icons/algorithm-master.png',
                category: 'skill',
                tier: 'gold',
                requirements: {
                    achievement_ids: [achievements[0]._id, achievements[1]._id],
                    challenges_required: 5
                },
                bonus_points: 100
            },
            {
                name: 'Streak Champion',
                description: 'Maintain a perfect streak for 30 days',
                icon: '/icons/streak-champion.png',
                category: 'achievement',
                tier: 'platinum',
                requirements: {
                    points_required: 1000,
                    challenges_required: 30
                },
                bonus_points: 200
            },
            {
                name: 'Community Hero',
                description: 'Help others and contribute to the community',
                icon: '/icons/community-hero.png',
                category: 'community',
                tier: 'diamond',
                requirements: {
                    points_required: 5000,
                    achievement_ids: [achievements[2]._id]
                },
                bonus_points: 500
            }
        ]);

        console.log('\n📊 Seeded Badges:');
        console.table(badges.map(badge => ({
            name: badge.name,
            category: badge.category,
            tier: badge.tier,
            bonus_points: badge.bonus_points
        })));

        // Create daily/weekly challenges
        const today = new Date();
        const next_week = new Date(today);
        next_week.setDate(today.getDate() + 7);

        const daily_weekly_challenges = await Challenge.insertMany([
            {
                title: "Today's Algorithm Challenge",
                description: "Solve this daily coding puzzle",
                difficulty: 'intermediate',
                points: 50,
                category: 'algorithms',
                created_by: admin._id,
                user: admin._id,
                challenge_type: 'daily',
                start_date: today,
                end_date: new Date(new Date().setHours(23, 59, 59)),
                schedule: {
                    start_date: today,
                    end_date: new Date(new Date().setHours(23, 59, 59)),
                    repeat_pattern: 'daily'
                },
                bonus_rewards: {
                    points: 20,
                    streak_multiplier: 1.2
                }
            },
            {
                title: "Weekly Data Structure Challenge",
                description: "Master advanced data structures",
                difficulty: 'advanced',
                points: 100,
                category: 'data_structures',
                created_by: admin._id,
                user: admin._id,
                challenge_type: 'weekly',
                start_date: today,
                end_date: next_week,
                schedule: {
                    start_date: today,
                    end_date: next_week,
                    repeat_pattern: 'weekly'
                },
                bonus_rewards: {
                    points: 50,
                    streak_multiplier: 1.5,
                    special_badge: badges[0]._id
                }
            }
        ]);
        console.log('\n📅 Seeded Daily/Weekly Challenges:');
        console.table(daily_weekly_challenges.map(challenge => ({
            title: challenge.title,
            type: challenge.challenge_type,
            difficulty: challenge.difficulty,
            points: challenge.points,
            bonus: challenge.bonus_rewards ? challenge.bonus_rewards.points : 0, // Added check for bonus_rewards
            ends: challenge.end_date
        })));

        await mongoose.disconnect();
        console.log('\n✅ Database seeded successfully!');
    } catch (error) {
        console.error('🚨 Seeding error:', error.message);
        process.exit(1);
    }
}

// Run the seeding function
seed_database(); 