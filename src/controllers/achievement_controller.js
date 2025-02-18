const Achievement = require('../models/Achievement');
const User = require('../models/User');

const achievement_controller = {
    // Create new achievement
    async create_achievement(req, res) {
        try {
            const achievement = new Achievement(req.body);
            await achievement.save();

            res.status(201).json({
                status: 'success',
                message: 'Achievement created successfully',
                data: { achievement }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Get all achievements
    async get_all_achievements(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const category = req.query.category;
            const rarity = req.query.rarity;

            let query = { is_active: true };
            if (category) query.category = category;
            if (rarity) query.rarity = rarity;

            const total = await Achievement.countDocuments(query);
            const achievements = await Achievement.find(query)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ points: -1 });

            res.json({
                status: 'success',
                data: {
                    achievements,
                    pagination: {
                        current_page: page,
                        total_pages: Math.ceil(total / limit),
                        total_items: total,
                        per_page: limit
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Get single achievement
    async get_achievement(req, res) {
        try {
            const achievement = await Achievement.findById(req.params.id);
            
            if (!achievement) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Achievement not found'
                });
            }

            res.json({
                status: 'success',
                data: { achievement }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Get user's achievements
    async get_user_achievements(req, res) {
        try {
            const user = await User.findById(req.user.user_id)
                .populate('achievements');

            // Calculate progress for incomplete achievements
            const all_achievements = await Achievement.find({ is_active: true });
            
            const achievements_progress = all_achievements.map(achievement => {
                const user_achievement = user.achievements.find(
                    ua => ua._id.toString() === achievement._id.toString()
                );

                let progress = 0;
                switch (achievement.criteria.type) {
                    case 'challenges_completed':
                        progress = (user.statistics.challenges_completed / achievement.criteria.threshold) * 100;
                        break;
                    case 'points_earned':
                        progress = (user.statistics.total_points / achievement.criteria.threshold) * 100;
                        break;
                    case 'streak_days':
                        progress = (user.statistics.longest_streak / achievement.criteria.threshold) * 100;
                        break;
                    // Add more criteria types as needed
                }

                return {
                    achievement,
                    unlocked: !!user_achievement,
                    progress: Math.min(progress, 100)
                };
            });

            res.json({
                status: 'success',
                data: {
                    achievements_progress,
                    stats: {
                        total_achievements: user.achievements.length,
                        total_points: user.achievements.reduce((sum, ach) => sum + ach.points, 0)
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Update achievement
    async update_achievement(req, res) {
        try {
            const achievement = await Achievement.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!achievement) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Achievement not found'
                });
            }

            res.json({
                status: 'success',
                message: 'Achievement updated successfully',
                data: { achievement }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Delete achievement
    async delete_achievement(req, res) {
        try {
            const achievement = await Achievement.findByIdAndDelete(req.params.id);
            
            if (!achievement) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Achievement not found'
                });
            }

            res.json({
                status: 'success',
                message: 'Achievement deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
};

module.exports = achievement_controller; 