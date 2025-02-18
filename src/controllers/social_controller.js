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
    },

    // Get user's followers
    async get_followers(req, res) {
        try {
            const user_id = req.user.user_id;
            const followers = await Follow.find({ following: user_id })
                .populate('follower', 'username avatar')
                .sort({ created_at: -1 });

            res.json({
                status: 'success',
                data: {
                    followers: followers.map(f => ({
                        user: f.follower,
                        followed_at: f.created_at
                    }))
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Get users being followed
    async get_following(req, res) {
        try {
            const user_id = req.user.user_id;
            const following = await Follow.find({ follower: user_id })
                .populate('following', 'username avatar')
                .sort({ created_at: -1 });

            res.json({
                status: 'success',
                data: {
                    following: following.map(f => ({
                        user: f.following,
                        followed_at: f.created_at
                    }))
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Create activity
    async create_activity(req, res) {
        try {
            const { type, content, privacy, reference } = req.body;
            
            const activity = new Activity({
                user: req.user.user_id,
                type,
                content,
                privacy,
                reference
            });

            await activity.save();

            res.status(201).json({
                status: 'success',
                data: { activity }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Update activity
    async update_activity(req, res) {
        try {
            const activity = await Activity.findById(req.params.id);
            
            if (!activity) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Activity not found'
                });
            }

            if (activity.user.toString() !== req.user.user_id) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Not authorized to update this activity'
                });
            }

            const updated_activity = await Activity.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },
                { new: true }
            );

            res.json({
                status: 'success',
                data: { activity: updated_activity }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Like activity
    async like_activity(req, res) {
        try {
            const activity = await Activity.findById(req.params.id);
            
            if (!activity) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Activity not found'
                });
            }

            // Check if already liked
            const already_liked = activity.interactions.likes
                .some(like => like.user.toString() === req.user.user_id);

            if (already_liked) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Activity already liked'
                });
            }

            activity.interactions.likes.push({
                user: req.user.user_id,
                created_at: new Date()
            });

            await activity.save();

            res.json({
                status: 'success',
                message: 'Activity liked successfully'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Add comment
    async add_comment(req, res) {
        try {
            const { content } = req.body;
            const activity = await Activity.findById(req.params.id);
            
            if (!activity) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Activity not found'
                });
            }

            activity.interactions.comments.push({
                user: req.user.user_id,
                content,
                created_at: new Date()
            });

            await activity.save();

            res.status(201).json({
                status: 'success',
                message: 'Comment added successfully'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Share activity
    async share_activity(req, res) {
        try {
            const activity = await Activity.findById(req.params.id);
            
            if (!activity) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Activity not found'
                });
            }

            activity.interactions.shares.push({
                user: req.user.user_id,
                created_at: new Date()
            });

            await activity.save();

            // Create new activity for the share
            const share_activity = new Activity({
                user: req.user.user_id,
                type: 'share',
                content: {
                    title: `Shared: ${activity.content.title}`,
                    description: req.body.comment || ''
                },
                reference: {
                    model: 'Activity',
                    id: activity._id
                }
            });

            await share_activity.save();

            res.status(201).json({
                status: 'success',
                message: 'Activity shared successfully'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Mark notification as read
    async mark_notification_read(req, res) {
        try {
            const notification = await Notification.findById(req.params.id);
            
            if (!notification) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Notification not found'
                });
            }

            if (notification.recipient.toString() !== req.user.user_id) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Not authorized to update this notification'
                });
            }

            notification.is_read = true;
            notification.read_at = new Date();
            await notification.save();

            res.json({
                status: 'success',
                message: 'Notification marked as read'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Mark all notifications as read
    async mark_all_notifications_read(req, res) {
        try {
            await Notification.updateMany(
                {
                    recipient: req.user.user_id,
                    is_read: false
                },
                {
                    $set: {
                        is_read: true,
                        read_at: new Date()
                    }
                }
            );

            res.json({
                status: 'success',
                message: 'All notifications marked as read'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Update privacy settings
    async update_privacy_settings(req, res) {
        try {
            const user = await User.findById(req.user.user_id);
            
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            // Update privacy settings
            user.social_settings.profile_visibility = req.body.profile_visibility || user.social_settings.profile_visibility;
            user.social_settings.activity_visibility = req.body.activity_visibility || user.social_settings.activity_visibility;
            user.social_settings.allow_follows = req.body.allow_follows !== undefined ? req.body.allow_follows : user.social_settings.allow_follows;

            await user.save();

            res.json({
                status: 'success',
                message: 'Privacy settings updated successfully',
                data: {
                    privacy_settings: user.social_settings
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Update notification preferences
    async update_notification_preferences(req, res) {
        try {
            const user = await User.findById(req.user.user_id);
            
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            // Update notification preferences
            user.social_settings.notification_preferences = {
                ...user.social_settings.notification_preferences,
                ...req.body
            };

            await user.save();

            res.json({
                status: 'success',
                message: 'Notification preferences updated successfully',
                data: {
                    notification_preferences: user.social_settings.notification_preferences
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Report activity
    async report_activity(req, res) {
        try {
            const activity = await Activity.findById(req.params.id);
            
            if (!activity) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Activity not found'
                });
            }

            // Check if user already reported this activity
            const already_reported = activity.moderation.reports
                .some(report => report.user.toString() === req.user.user_id);

            if (already_reported) {
                return res.status(400).json({
                    status: 'error',
                    message: 'You have already reported this activity'
                });
            }

            // Add report
            activity.moderation.reports.push({
                user: req.user.user_id,
                reason: req.body.reason,
                status: 'pending',
                created_at: new Date()
            });

            // Update moderation status if reports threshold reached
            const report_threshold = 3; // Configure this as needed
            if (activity.moderation.reports.length >= report_threshold) {
                activity.moderation.status = 'under_review';
            }

            await activity.save();

            // Notify moderators
            await notify_moderators_of_report(activity, req.body.reason);

            res.json({
                status: 'success',
                message: 'Activity reported successfully'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // Helper function to notify moderators
    async notify_moderators_of_report(activity, reason) {
        try {
            // Get all moderators
            const moderators = await User.find({ role: 'moderator' });

            // Create notification for each moderator
            const notifications = moderators.map(moderator => ({
                recipient: moderator._id,
                type: 'activity_report',
                content: {
                    title: 'New Activity Report',
                    body: `Activity ${activity._id} has been reported for: ${reason}`
                },
                reference: {
                    model: 'Activity',
                    id: activity._id
                }
            }));

            await Notification.insertMany(notifications);
        } catch (error) {
            console.error('Error notifying moderators:', error);
        }
    }
};

module.exports = social_controller; 