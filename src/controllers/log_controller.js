const Log = require('../models/Log');
const Challenge = require('../models/Challenge');

const log_controller = {
    // Create new log
    async create_log(req, res) {
        try {
            const { challenge_id, action, details, metrics } = req.body;

            const log = new Log({
                user: req.user.user_id,
                challenge: challenge_id,
                action,
                details,
                metrics
            });

            await log.save();

            // Update challenge progress if needed
            if (action === 'complete') {
                await Challenge.findByIdAndUpdate(challenge_id, {
                    $inc: { 'progress': details.progress }
                });
            }

            res.status(201).json({
                status: 'success',
                message: 'Log created successfully',
                data: { log }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Get user's logs
    async get_user_logs(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const challenge = req.query.challenge;
            const action = req.query.action;
            const start_date = req.query.start_date;
            const end_date = req.query.end_date;

            let query = { user: req.user.user_id };

            if (challenge) query.challenge = challenge;
            if (action) query.action = action;
            if (start_date || end_date) {
                query.createdAt = {};
                if (start_date) query.createdAt.$gte = new Date(start_date);
                if (end_date) query.createdAt.$lte = new Date(end_date);
            }

            const total = await Log.countDocuments(query);
            const logs = await Log.find(query)
                .populate('challenge', 'title difficulty')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            res.json({
                status: 'success',
                data: {
                    logs,
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

    // Get single log
    async get_log(req, res) {
        try {
            const log = await Log.findOne({
                _id: req.params.id,
                user: req.user.user_id
            }).populate('challenge', 'title difficulty');

            if (!log) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Log not found'
                });
            }

            res.json({
                status: 'success',
                data: { log }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Update log
    async update_log(req, res) {
        try {
            const log = await Log.findOneAndUpdate(
                {
                    _id: req.params.id,
                    user: req.user.user_id
                },
                req.body,
                { new: true, runValidators: true }
            ).populate('challenge', 'title difficulty');

            if (!log) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Log not found'
                });
            }

            res.json({
                status: 'success',
                message: 'Log updated successfully',
                data: { log }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Delete log
    async delete_log(req, res) {
        try {
            const log = await Log.findOneAndDelete({
                _id: req.params.id,
                user: req.user.user_id
            });

            if (!log) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Log not found'
                });
            }

            res.json({
                status: 'success',
                message: 'Log deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Admin: Get all logs
    async get_all_logs(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const user = req.query.user;
            const challenge = req.query.challenge;
            const action = req.query.action;

            let query = {};
            if (user) query.user = user;
            if (challenge) query.challenge = challenge;
            if (action) query.action = action;

            const total = await Log.countDocuments(query);
            const logs = await Log.find(query)
                .populate('user', 'username')
                .populate('challenge', 'title')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            res.json({
                status: 'success',
                data: {
                    logs,
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

    // Admin: Get logs analytics
    async get_logs_analytics(req, res) {
        try {
            const timeframe = req.query.timeframe || 'week';
            const now = new Date();
            let start_date = new Date();

            switch (timeframe) {
                case 'day':
                    start_date.setDate(now.getDate() - 1);
                    break;
                case 'week':
                    start_date.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    start_date.setMonth(now.getMonth() - 1);
                    break;
                default:
                    start_date.setDate(now.getDate() - 7);
            }

            const analytics = await Log.aggregate([
                {
                    $match: {
                        createdAt: { $gte: start_date }
                    }
                },
                {
                    $group: {
                        _id: {
                            action: '$action',
                            day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                        },
                        count: { $sum: 1 },
                        avg_time_spent: { $avg: '$details.time_spent' },
                        avg_progress: { $avg: '$details.progress' }
                    }
                },
                {
                    $sort: { '_id.day': 1 }
                }
            ]);

            res.json({
                status: 'success',
                data: { analytics }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
};

module.exports = log_controller; 