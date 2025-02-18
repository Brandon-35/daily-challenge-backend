const express = require('express');
const router = express.Router();
const social_controller = require('../controllers/social_controller');
const auth = require('../middlewares/auth');

// Follow routes
router.post('/follow/:user_id', auth, social_controller.follow_user);
router.delete('/follow/:user_id', auth, social_controller.unfollow_user);
router.get('/followers', auth, social_controller.get_followers);
router.get('/following', auth, social_controller.get_following);

// Activity routes
router.get('/feed', auth, social_controller.get_activity_feed);
router.post('/activities', auth, social_controller.create_activity);
router.put('/activities/:id', auth, social_controller.update_activity);
router.delete('/activities/:id', auth, social_controller.delete_activity);

// Interaction routes
router.post('/activities/:id/like', auth, social_controller.like_activity);
router.post('/activities/:id/comment', auth, social_controller.add_comment);
router.post('/activities/:id/share', auth, social_controller.share_activity);

// Notification routes
router.get('/notifications', auth, social_controller.get_notifications);
router.put('/notifications/:id/read', auth, social_controller.mark_notification_read);
router.put('/notifications/read-all', auth, social_controller.mark_all_notifications_read);

// Settings routes
router.put('/settings/privacy', auth, social_controller.update_privacy_settings);
router.put('/settings/notifications', auth, social_controller.update_notification_preferences);

// Moderation routes
router.post('/activities/:id/report', auth, social_controller.report_activity);
router.get(
    '/admin/reports',
    [auth, check_role(['admin', 'moderator'])],
    social_controller.get_reports
);
router.put(
    '/admin/reports/:id',
    [auth, check_role(['admin', 'moderator'])],
    social_controller.handle_report
);

module.exports = router; 