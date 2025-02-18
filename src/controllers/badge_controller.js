const Badge = require('../models/Badge');
const User = require('../models/User');
const Achievement = require('../models/Achievement');

const badge_controller = {
    async create_badge(req, res) {
        try {
            const badge = new Badge(req.body);
            await badge.save();

            res.status(201).json({
                status: 'success',
                message: 'Badge created successfully',
                data: { badge }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    async get_all_badges(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const category = req.query.category;
            const tier = req.query.tier;

            let query = { is_active: true };
            if (category) query.category = category;
            if (tier) query.tier = tier;

            const total = await Badge.countDocuments(query);
            const badges = await Badge.find(query)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ tier: 1, bonus_points: -1 });

            res.json({
                status: 'success',
                data: {
                    badges,
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

    async get_user_badges(req, res) {
        try {
            const user = await User.findById(req.user.user_id)
                .populate('badges')
                .populate('achievements');

            // Calculate progress for each badge
            const all_badges = await Badge.find({ is_active: true });
            
            const badges_progress = await Promise.all(all_badges.map(async badge => {
                const has_badge = user.badges.some(ub => ub._id.toString() === badge._id.toString());
                
                let progress = 0;
                let requirements_met = {
                    achievements: false,
                    points: false,
                    challenges: false
                };

                // Check achievement requirements
                if (badge.requirements.achievement_ids.length > 0) {
                    const completed_required = badge.requirements.achievement_ids
                        .filter(aid => user.achievements
                            .some(ua => ua._id.toString() === aid.toString())
                        ).length;
                    
                    progress += (completed_required / badge.requirements.achievement_ids.length) * 100;
                    requirements_met.achievements = completed_required === badge.requirements.achievement_ids.length;
                }

                // Check points requirement
                if (badge.requirements.points_required > 0) {
                    const points_progress = (user.statistics.total_points / badge.requirements.points_required) * 100;
                    progress += points_progress;
                    requirements_met.points = user.statistics.total_points >= badge.requirements.points_required;
                }

                // Check challenges requirement
                if (badge.requirements.challenges_required > 0) {
                    const challenges_progress = (user.statistics.challenges_completed / badge.requirements.challenges_required) * 100;
                    progress += challenges_progress;
                    requirements_met.challenges = user.statistics.challenges_completed >= badge.requirements.challenges_required;
                }

                // Calculate overall progress
                progress = progress / Object.keys(requirements_met).filter(key => requirements_met[key] !== null).length;

                return {
                    badge,
                    unlocked: has_badge,
                    progress: Math.min(progress, 100),
                    requirements_met
                };
            }));

            res.json({
                status: 'success',
                data: {
                    badges_progress,
                    stats: {
                        total_badges: user.badges.length,
                        total_bonus_points: user.badges.reduce((sum, badge) => sum + badge.bonus_points, 0)
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

    // ... other CRUD operations similar to achievement_controller
};

module.exports = badge_controller; 