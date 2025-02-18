const User = require('../models/User');
const Follow = require('../models/Follow');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

const social_controller = {
    // Follow functions
    async follow_user(req, res) {
        try {
            const follower_id = req.user.user_id;
            const following_id = req.params.user_id;

            // Check if user exists and allows follows
            const user_to_follow = await User.findById(following_id);
            if (!user_to_follow || !user_to_follow.social_settings.allow_follows) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cannot follow this user'
                });
            }

            // Create follow relationship
            const follow = new Follow({
                follower: follower_id,
                following: following_id
            });
            await follow.save();

            // Update user stats
            await User.findByIdAndUpdate(follower_id, {
                $inc: { 'social_stats.following_count': 1 }
            });
            await User.findByIdAndUpdate(following_id, {
                $inc: { 'social_stats.followers_count': 1 }
            });

            // Create notification
            await create_notification({
                recipient: following_id,
                sender: follower_id,
                type: 'follow'
            });

            res.json({
                status: 'success',
                message: 'Successfully followed user'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Activity feed
    async get_activity_feed(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const user_id = req.user.user_id;

            // Get user's following list
            const following = await Follow.find({ follower: user_id })
                .select('following');
            const following_ids = following.map(f => f.following);

            // Get activities from followed users and public activities
            const activities = await Activity.find({
                $or: [
                    { user: { $in: following_ids } },
                    { privacy: 'public' }
                ],
                is_hidden: false,
                'moderation.status': 'active'
            })
                .populate('user', 'username avatar')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            res.json({
                status: 'success',
                data: {
                    activities,
                    pagination: {
                        current_page: page,
                        has_more: activities.length === limit
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

    // Notifications
    async get_notifications(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            const notifications = await Notification.find({
                recipient: req.user.user_id
            })
                .populate('sender', 'username avatar')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            const unread_count = await Notification.countDocuments({
                recipient: req.user.user_id,
                is_read: false
            });

            res.json({
                status: 'success',
                data: {
                    notifications,
                    unread_count,
                    pagination: {
                        current_page: page,
                        has_more: notifications.length === limit
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

    // Add unfollow_user method
    async unfollow_user(req, res) {
        try {
            const follower_id = req.user.user_id;
            const following_id = req.params.user_id;

            await Follow.findOneAndDelete({
                follower: follower_id,
                following: following_id
            });

            // Update user stats
            await User.findByIdAndUpdate(follower_id, {
                $inc: { 'social_stats.following_count': -1 }
            });
            await User.findByIdAndUpdate(following_id, {
                $inc: { 'social_stats.followers_count': -1 }
            });

            res.json({
                status: 'success',
                message: 'Successfully unfollowed user'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Add delete_activity method
    async delete_activity(req, res) {
        try {
            const activity = await Activity.findById(req.params.id);
            
            if (!activity) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Activity not found'
                });
            }

            // Check ownership
            if (activity.user.toString() !== req.user.user_id) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Not authorized to delete this activity'
                });
            }

            await Activity.findByIdAndDelete(req.params.id);

            res.json({
                status: 'success',
                message: 'Activity deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    // ... other controller functions
};

module.exports = social_controller; 